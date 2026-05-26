/**
 * LaneRatePreference beforeUpdate Hook
 * Enforces financial locks and recomputes profitability
 */

import { calculateLaneProfitability, validateProfitability } from '../../shared/math/laneProfitability';
import { logAudit } from '../../shared/security/auditLogger';
import { diffFinancialFields } from '../../shared/math/auditMath';

export default async function beforeUpdate({ data, existingData, user, base44 }) {
  try {
    // Financial lock: if already approved and referenced, create new version instead
    if (existingData.approval_status === 'approved' && existingData.locked_until) {
      const lockDate = new Date(existingData.locked_until);
      if (lockDate > new Date()) {
        return {
          ok: false,
          errors: [{
            code: 'LOCKED',
            message: `Rate locked until ${existingData.locked_until}. Create new version instead.`
          }]
        };
      }
    }
    
    // If changing financial inputs, recompute profitability
    const financialFieldsChanged = 
      data.target_rpm_cents !== undefined ||
      data.target_flat_cents !== undefined ||
      data.rate_type !== undefined;
    
    if (financialFieldsChanged) {
      // Fetch related data (same as beforeCreate)
      const lanePrefs = await base44.asServiceRole.entities.LanePreference.filter({
        id: existingData.lane_preference_id
      });
      
      if (lanePrefs.length === 0) {
        return {
          ok: false,
          errors: [{ code: 'NOT_FOUND', message: 'Lane preference not found' }]
        };
      }
      
      const lanePref = lanePrefs[0];
      
      const assumptions = await base44.asServiceRole.entities.LaneAssumption.filter({
        lane_preference_id: existingData.lane_preference_id,
        is_active: true
      });
      
      const assumption = assumptions.length > 0 ? assumptions[0] : null;
      
      if (!assumption) {
        return {
          ok: false,
          errors: [{ code: 'NOT_FOUND', message: 'Lane assumption required' }]
        };
      }
      
      // Fetch cost profiles
      const costProfiles = await base44.asServiceRole.entities.CostProfile.filter({
        actor_type: lanePref.actor_type,
        actor_id: lanePref.actor_id,
        is_active: true
      });
      
      const costProfile = costProfiles.length > 0 ? costProfiles[0] : null;
      
      const brokerProfiles = await base44.asServiceRole.entities.CostProfile.filter({
        actor_type: 'broker',
        is_active: true
      });
      
      const brokerProfile = brokerProfiles.length > 0 ? brokerProfiles[0] : null;
      
      // Build input
      const profInput = {
        loaded_miles: assumption.estimated_loaded_miles,
        deadhead_miles: assumption.estimated_deadhead_miles,
        rate_type: data.rate_type || existingData.rate_type,
        customer_rpm_cents: data.target_rpm_cents || existingData.target_rpm_cents,
        customer_flat_cents: data.target_flat_cents || existingData.target_flat_cents,
        carrier_rpm_cents: data.target_rpm_cents || existingData.target_rpm_cents,
        carrier_flat_cents: data.target_flat_cents || existingData.target_flat_cents,
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
          factoring_fee_bps: brokerProfile.factoring_fee_bps,
          chargeback_reserve_bps: brokerProfile.chargeback_reserve_bps
        } : undefined
      };
      
      // Compute snapshot
      const snapshot = calculateLaneProfitability(profInput);
      
      // Update all computed fields
      Object.assign(data, {
        computed_loaded_miles: snapshot.computed_loaded_miles,
        computed_deadhead_miles: snapshot.computed_deadhead_miles,
        computed_total_miles: snapshot.computed_total_miles,
        computed_customer_revenue_cents: snapshot.computed_customer_revenue_cents,
        computed_carrier_pay_cents: snapshot.computed_carrier_pay_cents,
        computed_driver_pay_cents: snapshot.computed_driver_pay_cents,
        computed_operating_cost_cents: snapshot.computed_operating_cost_cents,
        computed_carrier_profit_cents: snapshot.computed_carrier_profit_cents,
        computed_ownerop_profit_cents: snapshot.computed_ownerop_profit_cents,
        computed_broker_margin_cents: snapshot.computed_broker_margin_cents,
        computed_broker_margin_bps: snapshot.computed_broker_margin_bps,
        computed_min_profitable_rpm_cents: snapshot.computed_min_profitable_rpm_cents,
        computed_min_profitable_flat_cents: snapshot.computed_min_profitable_flat_cents,
        driver_profitability_ok: snapshot.driver_profitability_ok,
        carrier_profitability_ok: snapshot.carrier_profitability_ok,
        ownerop_profitability_ok: snapshot.ownerop_profitability_ok,
        broker_profitability_ok: snapshot.broker_profitability_ok,
        explain_calculation_json: snapshot.explain_calculation_json,
        calculated_at: new Date().toISOString()
      });
      
      // Validate profitability
      const validation = validateProfitability(snapshot, {
        requireDriverOk: lanePref.actor_type === 'driver',
        requireCarrierOk: lanePref.actor_type === 'carrier',
        requireOwneopOk: lanePref.actor_type === 'owner_operator',
        requireBrokerOk: true
      });
      
      if (!validation.valid) {
        // Require approval if unprofitable
        data.approval_status = 'pending';
      }
    }
    
    // Audit log changes
    const diff = diffFinancialFields(existingData, data);
    await logAudit({
      entity_type: 'LaneRatePreference',
      entity_id: existingData.id,
      action: 'UPDATE',
      actor_email: user.email,
      actor_role: user.role,
      before_values: existingData,
      after_values: data,
      changed_fields: diff
    }, base44);
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{ code: 'ERROR', message: error.message }]
    };
  }
}