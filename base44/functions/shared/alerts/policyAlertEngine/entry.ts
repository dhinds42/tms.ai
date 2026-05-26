/**
 * Policy Alert Engine
 * Generates alerts when KPIs indicate policy adjustments needed
 */

/**
 * Generate policy alerts for a carrier based on recent KPIs
 */
export async function generatePolicyAlerts(carrierId, base44) {
  const alerts = [];

  // Fetch recent data (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const loads = await base44.entities.Load.filter({
    carrier_id: carrierId,
    created_date: { $gte: thirtyDaysAgo.toISOString() }
  });

  const accessorialRequests = await base44.entities.AccessorialRequest.filter({
    created_date: { $gte: thirtyDaysAgo.toISOString() }
  });

  const disputes = await base44.entities.DriverEscalation.filter({
    created_date: { $gte: thirtyDaysAgo.toISOString() }
  });

  // Get driver IDs for this carrier
  const drivers = await base44.entities.Driver.filter({ party_id: carrierId });
  const driverIds = drivers.map(d => d.id);

  // Filter to this carrier's data
  const carrierAccessorials = accessorialRequests.filter(a => 
    driverIds.includes(a.requester_id)
  );
  const carrierDisputes = disputes.filter(d => 
    driverIds.includes(d.driver_id)
  );

  // A) DISPUTE SPIKE ALERT
  const ineligibleAccessorials = carrierAccessorials.filter(a => 
    a.eligibility_status === 'ineligible'
  );
  const ineligibleRate = carrierAccessorials.length > 0 
    ? (ineligibleAccessorials.length / carrierAccessorials.length) * 100 
    : 0;

  if (ineligibleRate > 25) {
    alerts.push({
      carrier_id: carrierId,
      alert_type: 'dispute_spike',
      severity: 'warning',
      feature_key: 'accessorial_requests',
      trigger_metric: 'accessorial_ineligible_rate',
      current_value: Math.round(ineligibleRate),
      threshold_value: 25,
      recommendation: `${Math.round(ineligibleRate)}% of accessorial requests are ineligible. Consider tightening accessorial_requests eligibility or adding cooldowns.`,
      recommended_changes: {
        suggested_updates: {
          min_completed_loads: 7,
          cooldown_days: 45
        }
      },
      time_window: 'last 30 days'
    });
  }

  const disputesPer100 = loads.length > 0 
    ? (carrierDisputes.length / loads.length) * 100 
    : 0;

  if (disputesPer100 > 8) {
    alerts.push({
      carrier_id: carrierId,
      alert_type: 'dispute_spike',
      severity: 'critical',
      trigger_metric: 'disputes_per_100_loads',
      current_value: Math.round(disputesPer100 * 10) / 10,
      threshold_value: 8,
      baseline_value: 5,
      recommendation: `Dispute rate is ${Math.round(disputesPer100)}% (baseline 5%). Consider raising P1 thresholds and extending cooldown periods.`,
      recommended_changes: {
        suggested_updates: {
          min_completed_loads: 7,
          min_on_time_pct: 92,
          cooldown_days: 45
        }
      },
      time_window: 'last 30 days'
    });
  }

  // B) MARGIN DEGRADATION ALERT
  const completedLoads = loads.filter(l => l.status === 'delivered');
  const avgMargin = completedLoads.reduce((sum, l) => sum + (l.margin_cents || 0), 0) / (completedLoads.length || 1);
  const targetMargin = 14; // 14% target in cents basis
  const marginDrop = targetMargin - (avgMargin / 100);

  if (marginDrop > 2) {
    alerts.push({
      carrier_id: carrierId,
      alert_type: 'margin_degradation',
      severity: 'critical',
      feature_key: 'counteroffers',
      trigger_metric: 'avg_broker_margin_drop',
      current_value: Math.round((avgMargin / 100) * 10) / 10,
      threshold_value: targetMargin,
      baseline_value: targetMargin,
      recommendation: `Broker margin dropped by ${Math.round(marginDrop * 10) / 10}%. Consider disabling COUNTEROFFERS or reducing counteroffer_range_pct.`,
      recommended_changes: {
        suggested_updates: {
          enabled: false,
          counteroffer_range_pct: 5
        }
      },
      time_window: 'last 30 days'
    });
  }

  // C) HIGH-TRUST UNDERUTILIZATION
  const eligibleDrivers = await base44.entities.DriverFeatureEligibility.filter({
    driver_id: { $in: driverIds },
    eligible: true,
    tier: { $in: ['gold', 'platinum'] }
  });

  const p2EligibleCount = new Set(eligibleDrivers.map(e => e.driver_id)).size;
  const p2EligiblePct = drivers.length > 0 ? (p2EligibleCount / drivers.length) * 100 : 0;

  if (p2EligiblePct > 30) {
    // Check if P2 features are mostly disabled
    const p2Policies = await base44.entities.CarrierDriverPolicy.filter({
      carrier_id: carrierId,
      feature_key: { $in: ['counteroffers', 'what_if_pricing', 'instant_pay'] },
      enabled: true
    });

    if (p2Policies.length === 0) {
      alerts.push({
        carrier_id: carrierId,
        alert_type: 'high_trust_underutilization',
        severity: 'info',
        trigger_metric: 'drivers_meeting_P2_criteria',
        current_value: Math.round(p2EligiblePct),
        threshold_value: 30,
        recommendation: `${Math.round(p2EligiblePct)}% of drivers meet P2 criteria but P2 features are disabled. Consider selective unlock to improve retention.`,
        recommended_changes: {
          suggested_updates: {
            feature_key: 'facility_intel',
            enabled: true
          }
        },
        time_window: 'current'
      });
    }
  }

  // D) STABILITY ALERT (Safe to Loosen)
  if (disputesPer100 < 3 && ineligibleRate < 10) {
    alerts.push({
      carrier_id: carrierId,
      alert_type: 'stability_good',
      severity: 'info',
      trigger_metric: 'dispute_rate_low',
      current_value: Math.round(disputesPer100 * 10) / 10,
      threshold_value: 3,
      recommendation: `Dispute rate is low (${Math.round(disputesPer100 * 10) / 10}%) and stable. Safe to lower min_completed_loads by 1-2 loads.`,
      recommended_changes: {
        suggested_updates: {
          min_completed_loads: 3,
          cooldown_days: 21
        }
      },
      time_window: 'last 30 days'
    });
  }

  // Write alerts to database
  for (const alert of alerts) {
    // Check if similar alert already exists
    const existing = await base44.entities.PolicyAlert.filter({
      carrier_id: carrierId,
      alert_type: alert.alert_type,
      status: 'new'
    });

    if (existing.length === 0) {
      await base44.entities.PolicyAlert.create(alert);
    }
  }

  return alerts;
}

/**
 * Check if ops load is too high
 */
export async function checkOpsLoadAlert(carrierId, base44) {
  // This would integrate with support ticket system
  // For now, placeholder logic
  const manualOverrides = await base44.entities.DriverFeatureEligibility.filter({
    carrier_override: true,
    created_date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
  });

  const overrideRate = manualOverrides.length;

  if (overrideRate > 10) {
    await base44.entities.PolicyAlert.create({
      carrier_id: carrierId,
      alert_type: 'ops_load_high',
      severity: 'warning',
      trigger_metric: 'manual_override_count',
      current_value: overrideRate,
      threshold_value: 10,
      recommendation: `${overrideRate} manual overrides in last 7 days. Policies may be too strict or drivers need better education.`,
      time_window: 'last 7 days'
    });
  }
}