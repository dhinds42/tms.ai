/**
 * Automated KPI Threshold Tuning
 * Adjusts policy thresholds based on rolling performance data
 */

/**
 * Auto-tune thresholds for a carrier based on 90-day performance
 */
export async function autoTuneCarrierThresholds(carrierId, base44) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  // Fetch performance data
  const drivers = await base44.entities.Driver.filter({ party_id: carrierId });
  const driverIds = drivers.map(d => d.id);

  const loads = await base44.entities.Load.filter({
    created_date: { $gte: ninetyDaysAgo.toISOString() }
  });
  const carrierLoads = loads.filter(l => 
    l.carrier_id === carrierId || driverIds.includes(l.driver_id)
  );

  const escalations = await base44.entities.DriverEscalation.filter({
    created_date: { $gte: ninetyDaysAgo.toISOString() }
  });
  const carrierEscalations = escalations.filter(e => driverIds.includes(e.driver_id));

  const accessorials = await base44.entities.AccessorialRequest.filter({
    created_date: { $gte: ninetyDaysAgo.toISOString() }
  });
  const carrierAccessorials = accessorials.filter(a => driverIds.includes(a.requester_id));

  // Calculate fleet-wide KPIs
  const kpis = calculateFleetKPIs(carrierLoads, carrierEscalations, carrierAccessorials);

  // Get current policies
  const policies = await base44.entities.CarrierDriverPolicy.filter({
    carrier_id: carrierId
  });

  const tuningResults = [];

  // For each policy, suggest optimal thresholds
  for (const policy of policies) {
    const optimalThresholds = calculateOptimalThresholds(policy.feature_key, kpis);
    
    if (!optimalThresholds) continue;

    const changes = {};
    let shouldUpdate = false;

    // Compare current vs optimal
    if (optimalThresholds.min_completed_loads && 
        Math.abs(policy.min_completed_loads - optimalThresholds.min_completed_loads) >= 2) {
      changes.min_completed_loads = optimalThresholds.min_completed_loads;
      shouldUpdate = true;
    }

    if (optimalThresholds.min_on_time_pct &&
        Math.abs(policy.min_on_time_pct - optimalThresholds.min_on_time_pct) >= 3) {
      changes.min_on_time_pct = optimalThresholds.min_on_time_pct;
      shouldUpdate = true;
    }

    if (optimalThresholds.cooldown_days &&
        Math.abs(policy.cooldown_days - optimalThresholds.cooldown_days) >= 7) {
      changes.cooldown_days = optimalThresholds.cooldown_days;
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      tuningResults.push({
        policy_id: policy.id,
        feature_key: policy.feature_key,
        current_thresholds: {
          min_completed_loads: policy.min_completed_loads,
          min_on_time_pct: policy.min_on_time_pct,
          cooldown_days: policy.cooldown_days
        },
        suggested_thresholds: optimalThresholds,
        changes,
        confidence: optimalThresholds.confidence
      });
    }
  }

  return {
    carrier_id: carrierId,
    fleet_kpis: kpis,
    tuning_results: tuningResults,
    auto_apply_recommended: tuningResults.filter(t => t.confidence >= 0.8).length,
    review_required: tuningResults.filter(t => t.confidence < 0.8).length
  };
}

/**
 * Calculate fleet-wide KPIs
 */
function calculateFleetKPIs(loads, escalations, accessorials) {
  const completedLoads = loads.filter(l => l.status === 'delivered');
  
  const onTimeLoads = completedLoads.filter(l => 
    l.actual_delivery_datetime && l.planned_delivery_datetime &&
    new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime)
  );

  const disputeRate = completedLoads.length > 0 
    ? (escalations.length / completedLoads.length) * 100 
    : 0;

  const ineligibleAccessorials = accessorials.filter(a => a.eligibility_status === 'ineligible');
  const ineligibleRate = accessorials.length > 0
    ? (ineligibleAccessorials.length / accessorials.length) * 100
    : 0;

  const onTimePct = completedLoads.length > 0
    ? (onTimeLoads.length / completedLoads.length) * 100
    : 0;

  return {
    total_loads: loads.length,
    completed_loads: completedLoads.length,
    on_time_pct: Math.round(onTimePct),
    dispute_rate_pct: Math.round(disputeRate * 10) / 10,
    ineligible_accessorial_rate_pct: Math.round(ineligibleRate)
  };
}

/**
 * Calculate optimal thresholds using data-driven approach
 */
function calculateOptimalThresholds(featureKey, kpis) {
  const baselines = {
    // P1 Features (Basic Trust)
    profit_explain: {
      min_completed_loads: Math.max(3, Math.floor(kpis.total_loads * 0.05)), // 5% of fleet avg
      min_on_time_pct: Math.max(90, kpis.on_time_pct - 5), // Fleet avg - 5%
      cooldown_days: kpis.dispute_rate_pct > 8 ? 45 : 30,
      confidence: kpis.completed_loads >= 50 ? 0.9 : 0.6
    },
    detention_timer: {
      min_completed_loads: Math.max(3, Math.floor(kpis.total_loads * 0.05)),
      min_on_time_pct: Math.max(90, kpis.on_time_pct - 5),
      cooldown_days: kpis.ineligible_accessorial_rate_pct > 20 ? 45 : 30,
      confidence: kpis.completed_loads >= 50 ? 0.9 : 0.6
    },
    accessorial_requests: {
      min_completed_loads: kpis.ineligible_accessorial_rate_pct > 25 ? 7 : 3,
      min_on_time_pct: Math.max(90, kpis.on_time_pct - 3),
      max_dispute_rate: kpis.dispute_rate_pct < 5 ? 12 : 8,
      cooldown_days: kpis.ineligible_accessorial_rate_pct > 25 ? 60 : 30,
      confidence: kpis.completed_loads >= 100 ? 0.95 : 0.7
    },

    // P2 Features (High Trust)
    counteroffers: {
      min_completed_loads: kpis.dispute_rate_pct < 5 ? 5 : 10,
      min_on_time_pct: Math.max(92, kpis.on_time_pct),
      cooldown_days: kpis.dispute_rate_pct > 5 ? 60 : 45,
      confidence: kpis.completed_loads >= 100 ? 0.85 : 0.5
    },
    instant_pay: {
      min_completed_loads: Math.max(10, Math.floor(kpis.total_loads * 0.1)),
      min_on_time_pct: 90,
      cooldown_days: 90,
      confidence: kpis.completed_loads >= 200 ? 0.9 : 0.6
    }
  };

  return baselines[featureKey] || null;
}

/**
 * Auto-apply high-confidence tuning suggestions
 */
export async function applyHighConfidenceTuning(carrierId, base44) {
  const tuningResults = await autoTuneCarrierThresholds(carrierId, base44);
  
  const applied = [];
  
  for (const result of tuningResults.tuning_results) {
    if (result.confidence >= 0.8) {
      await base44.entities.CarrierDriverPolicy.update(result.policy_id, result.changes);
      
      await base44.entities.AuditLog.create({
        entity_type: 'CarrierDriverPolicy',
        entity_id: result.policy_id,
        action: 'AUTO_TUNED',
        actor_email: 'system',
        actor_role: 'system',
        metadata: {
          feature_key: result.feature_key,
          confidence: result.confidence,
          before: result.current_thresholds,
          after: result.suggested_thresholds,
          fleet_kpis: tuningResults.fleet_kpis
        }
      });

      applied.push(result);
    }
  }

  return {
    carrier_id: carrierId,
    auto_applied: applied.length,
    review_queue: tuningResults.review_required,
    applied_policies: applied
  };
}