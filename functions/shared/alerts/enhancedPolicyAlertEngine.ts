/**
 * Enhanced Policy Alert Engine
 * Generates KPI-driven alerts with de-duplication and 7d/30d windows
 */

/**
 * Generate all policy alerts for all carriers
 * Called by daily scheduled job
 */
export async function generateAllPolicyAlerts(base44) {
  const carriers = await base44.entities.Carrier.list('-created_date', 1000);
  
  const summary = {
    created_count: 0,
    skipped_count: 0,
    updated_count: 0,
    carriers_evaluated: carriers.length,
    alerts_by_type: {}
  };

  for (const carrier of carriers) {
    const carrierAlerts = await generatePolicyAlertsForCarrier(carrier.id, base44);
    summary.created_count += carrierAlerts.created;
    summary.skipped_count += carrierAlerts.skipped;
    
    for (const alert of carrierAlerts.alerts) {
      summary.alerts_by_type[alert.alert_type] = (summary.alerts_by_type[alert.alert_type] || 0) + 1;
    }
  }

  // Write summary to audit log
  await base44.entities.AuditLog.create({
    entity_type: 'PolicyAlert',
    entity_id: 'system',
    action: 'POLICY_ALERT_BATCH_GENERATED',
    actor_email: 'system',
    actor_role: 'system',
    metadata: summary
  });

  return summary;
}

/**
 * Generate policy alerts for a single carrier
 */
export async function generatePolicyAlertsForCarrier(carrierId, base44) {
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const alerts = [];
  let created = 0;
  let skipped = 0;

  // Get carrier and drivers
  const carriers = await base44.entities.Carrier.filter({ id: carrierId });
  if (carriers.length === 0) return { created: 0, skipped: 0, alerts: [] };
  
  const carrier = carriers[0];
  const drivers = await base44.entities.Driver.filter({ party_id: carrierId });
  const driverIds = drivers.map(d => d.id);

  if (driverIds.length === 0) return { created: 0, skipped: 0, alerts: [] };

  // Fetch 7-day and 30-day data
  const loads30d = await base44.entities.Load.filter({
    created_date: { $gte: thirtyDaysAgo.toISOString() }
  });
  const carrierLoads30d = loads30d.filter(l => 
    l.carrier_id === carrierId || driverIds.includes(l.driver_id)
  );

  const loads7d = carrierLoads30d.filter(l => 
    new Date(l.created_date) >= sevenDaysAgo
  );

  const accessorials30d = await base44.entities.AccessorialRequest.filter({
    created_date: { $gte: thirtyDaysAgo.toISOString() }
  });
  const carrierAccessorials30d = accessorials30d.filter(a => 
    driverIds.includes(a.requester_id)
  );
  const carrierAccessorials7d = carrierAccessorials30d.filter(a =>
    new Date(a.created_date) >= sevenDaysAgo
  );

  const disputes30d = await base44.entities.DriverEscalation.filter({
    created_date: { $gte: thirtyDaysAgo.toISOString() }
  });
  const carrierDisputes30d = disputes30d.filter(d => 
    driverIds.includes(d.driver_id)
  );
  const carrierDisputes7d = carrierDisputes30d.filter(d =>
    new Date(d.created_date) >= sevenDaysAgo
  );

  // === A) DISPUTE SPIKE ALERT ===
  
  // Ineligible accessorial rate (7d)
  const ineligible7d = carrierAccessorials7d.filter(a => a.eligibility_status === 'ineligible');
  const ineligibleRate7d = carrierAccessorials7d.length > 0 
    ? (ineligible7d.length / carrierAccessorials7d.length) * 100 
    : 0;

  // Disputes per 100 loads (7d vs 30d)
  const disputesPer100_7d = loads7d.length > 0 
    ? (carrierDisputes7d.length / loads7d.length) * 100 
    : 0;
  const disputesPer100_30d = carrierLoads30d.length > 0 
    ? (carrierDisputes30d.length / carrierLoads30d.length) * 100 
    : 0;

  // Warning: 7d rate > 30d rate * 1.3 OR ineligible rate > 25%
  if (disputesPer100_7d > disputesPer100_30d * 1.3 || ineligibleRate7d > 25) {
    const alertData = {
      carrier_id: carrierId,
      carrier_type: carrier.carrier_type || 'asset',
      alert_type: 'dispute_spike',
      severity: 'warning',
      feature_key: 'accessorial_requests',
      metric_window: '7d',
      trigger_metric: ineligibleRate7d > 25 ? 'accessorial_ineligible_rate_7d' : 'disputes_per_100_loads_7d',
      current_value: Math.round(ineligibleRate7d > 25 ? ineligibleRate7d : disputesPer100_7d),
      threshold_value: ineligibleRate7d > 25 ? 25 : Math.round(disputesPer100_30d * 1.3),
      baseline_value: Math.round(disputesPer100_30d),
      recommendation: `Dispute activity increased. Ineligible accessorials: ${Math.round(ineligibleRate7d)}%. Consider tightening eligibility thresholds.`,
      recommended_changes: {
        feature_key: 'accessorial_requests',
        suggested_updates: {
          min_completed_loads: 7,
          cooldown_days: 45
        }
      },
      time_window: 'last 7 days'
    };

    const shouldCreate = await checkDuplicateAlert(alertData, base44);
    if (shouldCreate) {
      await createAlert(alertData, base44);
      alerts.push(alertData);
      created++;
    } else {
      skipped++;
    }
  }

  // Critical: 7d rate > 30d rate * 1.6 OR ineligible rate > 40%
  if (disputesPer100_7d > disputesPer100_30d * 1.6 || ineligibleRate7d > 40) {
    const alertData = {
      carrier_id: carrierId,
      carrier_type: carrier.carrier_type || 'asset',
      alert_type: 'dispute_spike',
      severity: 'critical',
      feature_key: 'accessorial_requests',
      metric_window: '7d',
      trigger_metric: 'disputes_per_100_loads_7d',
      current_value: Math.round(disputesPer100_7d * 10) / 10,
      threshold_value: Math.round(disputesPer100_30d * 1.6),
      baseline_value: Math.round(disputesPer100_30d),
      recommendation: `CRITICAL: Dispute rate spiked to ${Math.round(disputesPer100_7d)}% (baseline ${Math.round(disputesPer100_30d)}%). Immediate action required.`,
      recommended_changes: {
        feature_key: 'accessorial_requests',
        suggested_updates: {
          enabled: false,
          min_completed_loads: 10,
          cooldown_days: 60
        }
      },
      time_window: 'last 7 days'
    };

    const shouldCreate = await checkDuplicateAlert(alertData, base44);
    if (shouldCreate) {
      await createAlert(alertData, base44);
      alerts.push(alertData);
      created++;
    } else {
      skipped++;
    }
  }

  // === B) OPS LOAD ALERT ===
  
  const overrides7d = await base44.entities.DriverFeatureEligibility.filter({
    carrier_override: true,
    created_date: { $gte: sevenDaysAgo.toISOString() }
  });
  const carrierOverrides7d = overrides7d.filter(o => driverIds.includes(o.driver_id));

  const overrides30d = await base44.entities.DriverFeatureEligibility.filter({
    carrier_override: true,
    created_date: { $gte: thirtyDaysAgo.toISOString() }
  });
  const carrierOverrides30d = overrides30d.filter(o => driverIds.includes(o.driver_id));

  const overrideRate7d = carrierOverrides7d.length;
  const overrideRate30d = carrierOverrides30d.length;

  if (overrideRate7d > overrideRate30d * 0.3) {
    const alertData = {
      carrier_id: carrierId,
      carrier_type: carrier.carrier_type || 'asset',
      alert_type: 'ops_load_high',
      severity: 'warning',
      metric_window: '7d',
      trigger_metric: 'manual_override_count_7d',
      current_value: overrideRate7d,
      threshold_value: Math.round(overrideRate30d * 0.3),
      baseline_value: overrideRate30d,
      recommendation: `${overrideRate7d} manual overrides in last 7 days (30d avg: ${overrideRate30d}). Policies may be too strict or drivers need education.`,
      recommended_changes: {
        suggested_updates: {
          review_required: true
        }
      },
      time_window: 'last 7 days'
    };

    const shouldCreate = await checkDuplicateAlert(alertData, base44);
    if (shouldCreate) {
      await createAlert(alertData, base44);
      alerts.push(alertData);
      created++;
    } else {
      skipped++;
    }
  }

  // === C) MARGIN DEGRADATION (Broker Only) ===
  
  if (carrier.carrier_type === 'brokerage') {
    const completedLoads7d = loads7d.filter(l => l.status === 'delivered');
    const completedLoads30d = carrierLoads30d.filter(l => l.status === 'delivered');

    const avgMargin7d = completedLoads7d.length > 0
      ? completedLoads7d.reduce((sum, l) => sum + (l.margin_cents || 0), 0) / completedLoads7d.length
      : 0;
    const avgMargin30d = completedLoads30d.length > 0
      ? completedLoads30d.reduce((sum, l) => sum + (l.margin_cents || 0), 0) / completedLoads30d.length
      : 0;

    const marginDrop = avgMargin30d - avgMargin7d;
    const marginDropPct = avgMargin30d > 0 ? (marginDrop / avgMargin30d) * 100 : 0;

    if (marginDropPct > 2) {
      const alertData = {
        carrier_id: carrierId,
        carrier_type: carrier.carrier_type,
        alert_type: 'margin_degradation',
        severity: 'critical',
        feature_key: 'counteroffers',
        metric_window: '7d',
        trigger_metric: 'avg_margin_drop_pct_7d',
        current_value: Math.round(marginDropPct * 10) / 10,
        threshold_value: 2,
        baseline_value: Math.round((avgMargin30d / 100) * 10) / 10,
        recommendation: `Margin dropped ${Math.round(marginDropPct)}% in last 7 days. Consider disabling COUNTEROFFERS or restricting range.`,
        recommended_changes: {
          feature_key: 'counteroffers',
          suggested_updates: {
            enabled: false,
            counteroffer_range_pct: 5
          }
        },
        time_window: 'last 7 days'
      };

      const shouldCreate = await checkDuplicateAlert(alertData, base44);
      if (shouldCreate) {
        await createAlert(alertData, base44);
        alerts.push(alertData);
        created++;
      } else {
        skipped++;
      }
    }
  }

  // === D) HIGH-TRUST UNDERUTILIZATION ===
  
  const eligibleDrivers = await base44.entities.DriverFeatureEligibility.filter({
    driver_id: { $in: driverIds },
    eligible: true,
    tier: { $in: ['gold', 'platinum'] }
  });

  const p2EligibleCount = new Set(eligibleDrivers.map(e => e.driver_id)).size;
  const p2EligiblePct = drivers.length > 0 ? (p2EligibleCount / drivers.length) * 100 : 0;

  if (p2EligiblePct >= 30) {
    const p2Policies = await base44.entities.CarrierDriverPolicy.filter({
      carrier_id: carrierId,
      feature_key: { $in: ['counteroffers', 'what_if_pricing', 'instant_pay'] },
      enabled: true
    });

    if (p2Policies.length === 0) {
      const alertData = {
        carrier_id: carrierId,
        carrier_type: carrier.carrier_type || 'asset',
        alert_type: 'high_trust_underutilization',
        severity: 'info',
        metric_window: '30d',
        trigger_metric: 'drivers_meeting_P2_criteria_pct',
        current_value: Math.round(p2EligiblePct),
        threshold_value: 30,
        recommendation: `${Math.round(p2EligiblePct)}% of drivers meet P2 criteria but P2 features disabled. Consider selective pilot to improve retention.`,
        recommended_changes: {
          feature_key: 'facility_intel',
          suggested_updates: {
            enabled: true
          }
        },
        time_window: 'last 30 days'
      };

      const shouldCreate = await checkDuplicateAlert(alertData, base44);
      if (shouldCreate) {
        await createAlert(alertData, base44);
        alerts.push(alertData);
        created++;
      } else {
        skipped++;
      }
    }
  }

  // === E) STABILITY GOOD ===
  
  if (disputesPer100_30d < 3 && ineligibleRate7d < 10) {
    const alertData = {
      carrier_id: carrierId,
      carrier_type: carrier.carrier_type || 'asset',
      alert_type: 'stability_good',
      severity: 'info',
      metric_window: '30d',
      trigger_metric: 'dispute_rate_low_30d',
      current_value: Math.round(disputesPer100_30d * 10) / 10,
      threshold_value: 3,
      recommendation: `Excellent stability. Dispute rate: ${Math.round(disputesPer100_30d * 10) / 10}%, ineligible accessorials: ${Math.round(ineligibleRate7d)}%. Safe to lower min_loads by 1-2.`,
      recommended_changes: {
        suggested_updates: {
          min_completed_loads: 3,
          cooldown_days: 21
        }
      },
      time_window: 'last 30 days'
    };

    const shouldCreate = await checkDuplicateAlert(alertData, base44);
    if (shouldCreate) {
      await createAlert(alertData, base44);
      alerts.push(alertData);
      created++;
    } else {
      skipped++;
    }
  }

  return { created, skipped, alerts };
}

/**
 * Check if duplicate alert exists
 * Returns true if should create, false if duplicate exists
 */
async function checkDuplicateAlert(alertData, base44) {
  const signature = {
    carrier_id: alertData.carrier_id,
    alert_type: alertData.alert_type,
    metric_window: alertData.metric_window,
    status: 'new'
  };

  if (alertData.feature_key) {
    signature.feature_key = alertData.feature_key;
  }

  const existing = await base44.entities.PolicyAlert.filter(signature);
  
  // If similar alert exists from last 7 days, skip
  if (existing.length > 0) {
    const recentAlert = existing.find(a => 
      new Date(a.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    if (recentAlert) {
      // Update existing alert with new values
      await base44.entities.PolicyAlert.update(recentAlert.id, {
        current_value: alertData.current_value,
        notes: `Updated ${new Date().toISOString()}: ${alertData.recommendation}`
      });
      return false; // Skip creation
    }
  }

  return true; // Create new alert
}

/**
 * Create alert and audit log
 */
async function createAlert(alertData, base44) {
  const created = await base44.entities.PolicyAlert.create(alertData);

  await base44.entities.AuditLog.create({
    entity_type: 'PolicyAlert',
    entity_id: created.id,
    action: 'POLICY_ALERT_CREATED',
    actor_email: 'system',
    actor_role: 'system',
    metadata: {
      carrier_id: alertData.carrier_id,
      alert_type: alertData.alert_type,
      severity: alertData.severity,
      trigger_metric: alertData.trigger_metric,
      current_value: alertData.current_value,
      threshold_value: alertData.threshold_value
    }
  });

  return created;
}