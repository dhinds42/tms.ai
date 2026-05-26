/**
 * LaneRatePreference beforeCreate Hook
 * Computes profitability snapshot server-side and enforces approval policy
 */

import { calculateLaneProfitability, validateProfitability } from '../../shared/math/laneProfitability';
import { logAudit } from '../../shared/security/auditLogger';

export default async function beforeCreate({ data, user, base44 }) {
  try {
    // Fetch related LanePreference
    const lanePrefs = await base44.asServiceRole.entities.LanePreference.filter({
      id: data.lane_preference_id
    });
    
    if (lanePrefs.length === 0) {
      return {
        ok: false,
        errors: [{ code: 'NOT_FOUND', message: 'Lane preference not found' }]
      };
    }
    
    const lanePref = lanePrefs[0];
    
    // Fetch related LaneAssumption
    const assumptions = await base44.asServiceRole.entities.LaneAssumption.filter({
      lane_preference_id: data.lane_preference_id,
      is_active: true
    });
    
    const assumption = assumptions.length > 0 ? assumptions[0] : null;
    
    if (!assumption) {
      return {
        ok: false,
        errors: [{ code: 'NOT_FOUND', message: 'Lane assumption required for profitability calculation' }]
      };
    }
    
    // Fetch applicable CostProfiles
    const costProfiles = await base44.asServiceRole.entities.CostProfile.filter({
      actor_type: lanePref.actor_type,
      actor_id: lanePref.actor_id,
      is_active: true
    });
    
    const costProfile = costProfiles.length > 0 ? costProfiles[0] : null;
    
    // Fetch broker cost profile (if needed)
    const brokerProfiles = await base44.asServiceRole.entities.CostProfile.filter({
      actor_type: 'broker',
      is_active: true
    });
    
    const brokerProfile = brokerProfiles.length > 0 ? brokerProfiles[0] : null;
    
    // Validate rate inputs
    if (data.rate_type === 'per_mile' && !data.target_rpm_cents) {
      return {
        ok: false,
        errors: [{ code: 'VALIDATION', message: 'target_rpm_cents required for per_mile rate type' }]
      };
    }
    
    if (data.rate_type === 'flat' && !data.target_flat_cents) {
      return {
        ok: false,
        errors: [{ code: 'VALIDATION', message: 'target_flat_cents required for flat rate type' }]
      };
    }
    
    // Ensure non-negative
    if ((data.target_rpm_cents || 0) < 0 || (data.target_flat_cents || 0) < 0) {
      return {
        ok: false,
        errors: [{ code: 'VALIDATION', message: 'Rates cannot be negative' }]
      };
    }
    
    // Build profitability input
    const profInput = {
      loaded_miles: assumption.estimated_loaded_miles,
      deadhead_miles: assumption.estimated_deadhead_miles,
      rate_type: data.rate_type,
      customer_rpm_cents: data.target_rpm_cents,
      customer_flat_cents: data.target_flat_cents,
      carrier_rpm_cents: data.target_rpm_cents, // Assume same for now
      carrier_flat_cents: data.target_flat_cents,
      driver_cost_profile: costProfile && lanePref.actor_type === 'driver' ? {
        pay_type: costProfile.driver_pay_type,
        pay_cpm_cents: costProfile.driver_pay_cpm_cents,
        pay_percent_bps: costProfile.driver_pay_percent_bps,
        pay_flat_cents: costProfile.driver_pay_flat_cents,
        per_diem_cents: costProfile.per_diem_cents
      } : undefined,
      carrier_or_oo_cost_profile: costProfile ? {
        fuel_cost_per_mile_cents: costProfile.fuel_cost_per_mile_cents || 0,
        maintenance_cost_per_mile_cents: costProfile.maintenance_cost_per_mile_cents || 0,
        insurance_cost_per_mile_cents: costProfile.insurance_cost_per_mile_cents || 0,
        overhead_cost_per_mile_cents: costProfile.overhead_cost_per_mile_cents || 0,
        tolls_cost_per_mile_cents: costProfile.tolls_cost_per_mile_cents || 0,
        desired_profit_per_mile_cents: costProfile.desired_profit_per_mile_cents,
        desired_margin_bps: costProfile.desired_margin_bps
      } : undefined,
      broker_cost_profile: brokerProfile ? {
        overhead_per_load_cents: brokerProfile.broker_overhead_per_load_cents,
        desired_margin_bps: brokerProfile.desired_margin_bps,
        desired_margin_cents_min: brokerProfile.desired_margin_bps,
        factoring_fee_bps: brokerProfile.factoring_fee_bps,
        chargeback_reserve_bps: brokerProfile.chargeback_reserve_bps
      } : undefined
    };
    
    // Compute profitability snapshot
    const snapshot = calculateLaneProfitability(profInput);
    
    // Persist computed fields
    data.computed_loaded_miles = snapshot.computed_loaded_miles;
    data.computed_deadhead_miles = snapshot.computed_deadhead_miles;
    data.computed_total_miles = snapshot.computed_total_miles;
    data.computed_customer_revenue_cents = snapshot.computed_customer_revenue_cents;
    data.computed_carrier_pay_cents = snapshot.computed_carrier_pay_cents;
    data.computed_driver_pay_cents = snapshot.computed_driver_pay_cents;
    data.computed_operating_cost_cents = snapshot.computed_operating_cost_cents;
    data.computed_carrier_profit_cents = snapshot.computed_carrier_profit_cents;
    data.computed_ownerop_profit_cents = snapshot.computed_ownerop_profit_cents;
    data.computed_broker_margin_cents = snapshot.computed_broker_margin_cents;
    data.computed_broker_margin_bps = snapshot.computed_broker_margin_bps;
    data.computed_min_profitable_rpm_cents = snapshot.computed_min_profitable_rpm_cents;
    data.computed_min_profitable_flat_cents = snapshot.computed_min_profitable_flat_cents;
    data.driver_profitability_ok = snapshot.driver_profitability_ok;
    data.carrier_profitability_ok = snapshot.carrier_profitability_ok;
    data.ownerop_profitability_ok = snapshot.ownerop_profitability_ok;
    data.broker_profitability_ok = snapshot.broker_profitability_ok;
    data.explain_calculation_json = snapshot.explain_calculation_json;
    data.calculated_at = new Date().toISOString();
    
    // Validation & approval policy
    const validation = validateProfitability(snapshot, {
      requireDriverOk: lanePref.actor_type === 'driver',
      requireCarrierOk: lanePref.actor_type === 'carrier',
      requireOwneopOk: lanePref.actor_type === 'owner_operator',
      requireBrokerOk: true
    });
    
    if (!validation.valid) {
      // Soft policy: set pending approval rather than blocking
      data.approval_status = 'pending';
      data.flagged = true;
      data.flagged_reason = validation.errors.join('; ');
    } else {
      data.approval_status = 'approved';
    }
    
    // Version tracking
    if (!data.version) {
      data.version = 1;
    }
    
    // Audit log
    await logAudit({
      entity_type: 'LaneRatePreference',
      entity_id: 'new',
      action: 'CREATE',
      actor_email: user.email,
      actor_role: user.role,
      after_values: data
    }, base44);
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{ code: 'CALCULATION_ERROR', message: error.message }]
    };
  }
}