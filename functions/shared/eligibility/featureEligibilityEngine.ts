/**
 * Feature Eligibility Engine
 * Server-side computation of driver feature access based on performance
 */

import { SYSTEM_MINIMUMS } from './systemMinimums.js';

export async function evaluateDriverEligibility(driverId, featureKey, base44) {
  // Fetch driver
  const drivers = await base44.entities.Driver.filter({ id: driverId });
  if (drivers.length === 0) {
    return { eligible: false, reason: 'Driver not found' };
  }
  const driver = drivers[0];

  // Fetch carrier policy (if exists)
  let carrierPolicy = null;
  if (driver.party_id) {
    const policies = await base44.entities.CarrierDriverPolicy.filter({
      carrier_id: driver.party_id,
      feature_key: featureKey,
      enabled: true
    });
    if (policies.length > 0) {
      carrierPolicy = policies[0];
    }
  }

  // Fetch driver's loads
  const loads = await base44.entities.Load.filter({ driver_id: driverId });
  const completedLoads = loads.filter(l => l.status === 'delivered' || l.status === 'closed');
  
  // Calculate metrics
  const onTimeLoads = loads.filter(l => {
    if (!l.actual_delivery || !l.planned_delivery_datetime) return false;
    return new Date(l.actual_delivery) <= new Date(l.planned_delivery_datetime);
  });
  const onTimePct = loads.length > 0 ? (onTimeLoads.length / loads.length) * 100 : 0;

  // Document timeliness
  const loadsWithDocs = await base44.entities.LoadDocumentChecklist.filter({
    load_id: { $in: loads.map(l => l.id) }
  });
  const onTimeDocSubmissions = loadsWithDocs.filter(d => d.billing_ready);
  const docOnTimePct = loadsWithDocs.length > 0 ? (onTimeDocSubmissions.length / loadsWithDocs.length) * 100 : 0;

  // Dispute rate
  const disputes = await base44.entities.DriverEscalation.filter({
    driver_id: driverId,
    status: { $in: ['open', 'in_progress', 'resolved'] }
  });
  const disputeRate = completedLoads.length > 0 ? (disputes.length / completedLoads.length) * 100 : 0;

  // Days since last dispute
  let daysSinceLastDispute = Infinity;
  if (disputes.length > 0) {
    const sortedDisputes = disputes.sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    );
    const lastDispute = sortedDisputes[0];
    const daysSince = Math.floor((Date.now() - new Date(lastDispute.created_date)) / (1000 * 60 * 60 * 24));
    daysSinceLastDispute = daysSince;
  }

  // Compliance status
  const complianceItems = await base44.entities.ComplianceItem.filter({
    entity_type: 'driver',
    entity_id: driverId,
    status: 'expired'
  });
  const complianceStatus = complianceItems.length === 0 ? 'compliant' : 'non_compliant';

  // Metrics snapshot
  const metricsSnapshot = {
    completed_loads: completedLoads.length,
    on_time_pct: Math.round(onTimePct),
    doc_on_time_pct: Math.round(docOnTimePct),
    dispute_rate: Math.round(disputeRate * 10) / 10,
    compliance_status: complianceStatus,
    days_since_last_dispute: daysSinceLastDispute
  };

  // Check carrier override
  const existingEligibility = await base44.entities.DriverFeatureEligibility.filter({
    driver_id: driverId,
    feature_key: featureKey
  });

  if (existingEligibility.length > 0 && existingEligibility[0].carrier_override) {
    const override = existingEligibility[0];
    if (!override.override_expires_at || new Date(override.override_expires_at) > new Date()) {
      return {
        eligible: true,
        reason: `Carrier override granted: ${override.override_reason}`,
        metrics_snapshot: metricsSnapshot,
        carrier_override: true
      };
    }
  }

  // Check cooldown
  if (existingEligibility.length > 0 && existingEligibility[0].cooldown_until) {
    if (new Date(existingEligibility[0].cooldown_until) > new Date()) {
      return {
        eligible: false,
        reason: `In cooldown period until ${new Date(existingEligibility[0].cooldown_until).toLocaleDateString()}: ${existingEligibility[0].cooldown_reason}`,
        metrics_snapshot: metricsSnapshot,
        cooldown_until: existingEligibility[0].cooldown_until
      };
    }
  }

  // Get thresholds (system minimum OR carrier policy, whichever is stricter)
  const getThreshold = (field) => {
    const systemMin = SYSTEM_MINIMUMS[featureKey];
    if (!systemMin) return null;
    
    if (!carrierPolicy) return systemMin[field];
    
    const carrierValue = carrierPolicy[field];
    if (carrierValue === undefined || carrierValue === null) return systemMin[field];
    
    // Return stricter threshold
    if (field.startsWith('min_') || field.startsWith('max_')) {
      if (field.startsWith('min_')) {
        return Math.max(systemMin[field] || 0, carrierValue);
      } else {
        return Math.min(systemMin[field] || 100, carrierValue);
      }
    }
    
    return carrierValue;
  };

  // Feature-specific eligibility rules
  const eligibilityRules = {
    instant_pay: () => {
      if (completedLoads.length < 10) return { eligible: false, reason: 'Minimum 10 completed loads required' };
      if (onTimePct < 90) return { eligible: false, reason: `On-time delivery rate too low (${onTimePct}%, need 90%)` };
      if (docOnTimePct < 85) return { eligible: false, reason: `Document submission rate too low (${docOnTimePct}%, need 85%)` };
      if (complianceStatus !== 'compliant') return { eligible: false, reason: 'Compliance documents expired' };
      return { eligible: true, reason: 'Meets all instant pay requirements', tier: 'gold' };
    },
    
    load_selection_priority: () => {
      if (completedLoads.length < 5) return { eligible: false, reason: 'Minimum 5 completed loads required' };
      if (onTimePct < 80) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need 80%)` };
      return { eligible: true, reason: 'Eligible for priority load selection', tier: 'silver' };
    },

    accessorial_auto_approval: () => {
      const reqLoads = getThreshold('min_completed_loads') || 20;
      const reqOnTime = getThreshold('min_on_time_pct') || 95;
      const reqDocOnTime = getThreshold('min_doc_on_time_pct') || 95;
      const maxDispute = getThreshold('max_dispute_rate') || 5;
      const minDaysSinceDispute = getThreshold('min_days_since_dispute') || 30;
      
      if (completedLoads.length < reqLoads) return { eligible: false, reason: `Minimum ${reqLoads} completed loads required` };
      if (onTimePct < reqOnTime) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need ${reqOnTime}%)` };
      if (docOnTimePct < reqDocOnTime) return { eligible: false, reason: `Document submission rate too low (${docOnTimePct}%, need ${reqDocOnTime}%)` };
      if (disputeRate > maxDispute) return { eligible: false, reason: `Dispute rate too high (${disputeRate}%, max ${maxDispute}%)` };
      if (daysSinceLastDispute < minDaysSinceDispute) return { eligible: false, reason: `Recent dispute within last ${minDaysSinceDispute} days` };
      return { eligible: true, reason: 'Eligible for auto-approved accessorials up to $200', tier: 'platinum' };
    },

    advance_request: () => {
      if (completedLoads.length < 15) return { eligible: false, reason: 'Minimum 15 completed loads required' };
      if (onTimePct < 85) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need 85%)` };
      if (complianceStatus !== 'compliant') return { eligible: false, reason: 'Compliance issues' };
      return { eligible: true, reason: 'Eligible for pay advances', tier: 'gold' };
    },

    detention_self_edit: () => {
      const reqLoads = getThreshold('min_completed_loads') || 30;
      const reqOnTime = getThreshold('min_on_time_pct') || 95;
      const reqDocOnTime = getThreshold('min_doc_on_time_pct') || 95;
      const maxDispute = getThreshold('max_dispute_rate') || 5;
      const minDaysSinceDispute = getThreshold('min_days_since_dispute') || 30;
      
      if (completedLoads.length < reqLoads) return { eligible: false, reason: `Minimum ${reqLoads} completed loads required` };
      if (onTimePct < reqOnTime) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need ${reqOnTime}%)` };
      if (docOnTimePct < reqDocOnTime) return { eligible: false, reason: `Document submission rate too low (${docOnTimePct}%, need ${reqDocOnTime}%)` };
      if (disputeRate > maxDispute) return { eligible: false, reason: `Dispute rate too high (${disputeRate}%, max ${maxDispute}%)` };
      if (daysSinceLastDispute < minDaysSinceDispute) return { eligible: false, reason: `Recent dispute within last ${minDaysSinceDispute} days` };
      return { eligible: true, reason: 'Trusted driver - can self-edit detention', tier: 'platinum' };
    },

    direct_messaging: () => {
      if (completedLoads.length < 3) return { eligible: false, reason: 'Minimum 3 completed loads required' };
      return { eligible: true, reason: 'Basic access granted', tier: 'bronze' };
    },

    premium_loads: () => {
      if (completedLoads.length < 50) return { eligible: false, reason: 'Minimum 50 completed loads required' };
      if (onTimePct < 95) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need 95%)` };
      if (driver.rating < 4.5) return { eligible: false, reason: 'Rating too low (need 4.5+)' };
      return { eligible: true, reason: 'Elite driver - access to premium loads', tier: 'platinum' };
    },

    flexible_home_time: () => {
      if (completedLoads.length < 25) return { eligible: false, reason: 'Minimum 25 completed loads required' };
      if (onTimePct < 88) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need 88%)` };
      return { eligible: true, reason: 'Eligible for flexible scheduling', tier: 'gold' };
    },

    profit_explain: () => {
      if (completedLoads.length < 5) return { eligible: false, reason: 'Minimum 5 completed loads required' };
      if (onTimePct < 90) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need 90%)` };
      if (docOnTimePct < 90) return { eligible: false, reason: `Document submission rate too low (${docOnTimePct}%, need 90%)` };
      if (disputeRate > 10) return { eligible: false, reason: `Dispute rate too high (${disputeRate}%, max 10%)` };
      return { eligible: true, reason: 'Can view detailed profit breakdowns', tier: 'silver' };
    },

    detention_timer: () => {
      if (completedLoads.length < 1) return { eligible: false, reason: 'Minimum 1 completed load required' };
      return { eligible: true, reason: 'Basic detention tracking available', tier: 'bronze' };
    },

    accessorial_requests: () => {
      if (completedLoads.length < 3) return { eligible: false, reason: 'Minimum 3 completed loads required' };
      if (complianceStatus !== 'compliant') return { eligible: false, reason: 'Compliance issues' };
      return { eligible: true, reason: 'Can submit accessorial requests', tier: 'bronze' };
    },

    counteroffers: () => {
      if (completedLoads.length < 5) return { eligible: false, reason: 'Minimum 5 completed loads required' };
      if (onTimePct < 90) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need 90%)` };
      if (docOnTimePct < 90) return { eligible: false, reason: `Document submission rate too low (${docOnTimePct}%, need 90%)` };
      if (disputeRate > 10) return { eligible: false, reason: `Dispute rate too high (${disputeRate}%, max 10%)` };
      return { eligible: true, reason: 'Can negotiate rates on loads', tier: 'silver' };
    },

    what_if_pricing: () => {
      if (completedLoads.length < 5) return { eligible: false, reason: 'Minimum 5 completed loads required' };
      if (onTimePct < 90) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need 90%)` };
      if (docOnTimePct < 90) return { eligible: false, reason: `Document submission rate too low (${docOnTimePct}%, need 90%)` };
      if (disputeRate > 10) return { eligible: false, reason: `Dispute rate too high (${disputeRate}%, max 10%)` };
      return { eligible: true, reason: 'Can view what-if pricing scenarios', tier: 'silver' };
    },

    facility_intel: () => {
      if (completedLoads.length < 5) return { eligible: false, reason: 'Minimum 5 completed loads required' };
      if (onTimePct < 90) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need 90%)` };
      if (docOnTimePct < 90) return { eligible: false, reason: `Document submission rate too low (${docOnTimePct}%, need 90%)` };
      if (disputeRate > 10) return { eligible: false, reason: `Dispute rate too high (${disputeRate}%, max 10%)` };
      return { eligible: true, reason: 'Access to facility ratings and wait times', tier: 'silver' };
    }
  };

  const evaluationResult = eligibilityRules[featureKey] 
    ? eligibilityRules[featureKey]()
    : { eligible: false, reason: 'Unknown feature key' };

  return {
    ...evaluationResult,
    metrics_snapshot: metricsSnapshot,
    evaluated_at: new Date().toISOString()
  };
}

export async function evaluateAllFeatures(driverId, base44) {
  const features = [
    'instant_pay',
    'load_selection_priority',
    'accessorial_auto_approval',
    'advance_request',
    'detention_self_edit',
    'direct_messaging',
    'premium_loads',
    'flexible_home_time',
    'profit_explain',
    'detention_timer',
    'accessorial_requests',
    'counteroffers',
    'what_if_pricing',
    'facility_intel'
  ];

  const results = [];
  for (const featureKey of features) {
    const evaluation = await evaluateDriverEligibility(driverId, featureKey, base44);
    results.push({
      feature_key: featureKey,
      ...evaluation
    });
  }

  return results;
}