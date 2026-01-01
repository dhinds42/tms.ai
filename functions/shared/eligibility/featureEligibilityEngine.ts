/**
 * Feature Eligibility Engine
 * Server-side computation of driver feature access based on performance
 */

export async function evaluateDriverEligibility(driverId, featureKey, base44) {
  // Fetch driver
  const drivers = await base44.entities.Driver.filter({ id: driverId });
  if (drivers.length === 0) {
    return { eligible: false, reason: 'Driver not found' };
  }
  const driver = drivers[0];

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
    status: { $in: ['open', 'in_progress'] }
  });
  const disputeRate = completedLoads.length > 0 ? (disputes.length / completedLoads.length) * 100 : 0;

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
    compliance_status: complianceStatus
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
      if (completedLoads.length < 20) return { eligible: false, reason: 'Minimum 20 completed loads required' };
      if (disputeRate > 10) return { eligible: false, reason: `Dispute rate too high (${disputeRate}%, max 10%)` };
      if (docOnTimePct < 95) return { eligible: false, reason: `Document submission rate too low (${docOnTimePct}%, need 95%)` };
      return { eligible: true, reason: 'Eligible for auto-approved accessorials up to $200', tier: 'platinum' };
    },

    advance_request: () => {
      if (completedLoads.length < 15) return { eligible: false, reason: 'Minimum 15 completed loads required' };
      if (onTimePct < 85) return { eligible: false, reason: `On-time rate too low (${onTimePct}%, need 85%)` };
      if (complianceStatus !== 'compliant') return { eligible: false, reason: 'Compliance issues' };
      return { eligible: true, reason: 'Eligible for pay advances', tier: 'gold' };
    },

    detention_self_edit: () => {
      if (completedLoads.length < 30) return { eligible: false, reason: 'Minimum 30 completed loads required' };
      if (disputeRate > 5) return { eligible: false, reason: `Dispute rate too high (${disputeRate}%, max 5%)` };
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
    'flexible_home_time'
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