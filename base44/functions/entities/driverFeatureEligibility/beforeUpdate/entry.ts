/**
 * DriverFeatureEligibility - Before Update Hook
 * Re-evaluates or applies overrides/cooldowns
 */

import { evaluateDriverEligibility } from '../../shared/eligibility/featureEligibilityEngine.js';

export default async function beforeUpdate({ id, data, base44, user }) {
  const existing = await base44.entities.DriverFeatureEligibility.filter({ id });
  if (existing.length === 0) {
    return { ok: false, error: 'Feature eligibility record not found' };
  }
  const existingRecord = existing[0];

  // Carrier applying cooldown (privilege revocation)
  if (data.cooldown_until && (user?.role === 'carrier' || user?.role === 'admin')) {
    data.eligible = false;
    data.reason = data.cooldown_reason || 'Privileges temporarily revoked';

    await base44.entities.AuditLog.create({
      entity_type: 'DriverFeatureEligibility',
      entity_id: id,
      action: 'UPDATE',
      actor_email: user.email,
      actor_role: user.role,
      before_values: { eligible: existingRecord.eligible },
      after_values: { eligible: false, cooldown_until: data.cooldown_until },
      metadata: { cooldown_reason: data.cooldown_reason }
    });

    return { ok: true, data };
  }

  // Carrier override
  if (data.carrier_override !== undefined && (user?.role === 'carrier' || user?.role === 'admin')) {
    if (data.carrier_override) {
      data.eligible = true;
      data.override_granted_by = user.email;
      data.override_reason = data.override_reason || 'Manual grant';
    }

    await base44.entities.AuditLog.create({
      entity_type: 'DriverFeatureEligibility',
      entity_id: id,
      action: 'UPDATE',
      actor_email: user.email,
      actor_role: user.role,
      changed_fields: {
        carrier_override: { from: existingRecord.carrier_override, to: data.carrier_override }
      }
    });

    return { ok: true, data };
  }

  // Re-evaluate eligibility (can be triggered periodically or on-demand)
  if (data.re_evaluate === true) {
    const evaluation = await evaluateDriverEligibility(existingRecord.driver_id, existingRecord.feature_key, base44);
    
    data.eligible = evaluation.eligible;
    data.reason = evaluation.reason;
    data.metrics_snapshot = evaluation.metrics_snapshot;
    data.evaluated_at = evaluation.evaluated_at;
    data.tier = evaluation.tier;

    // Clear cooldown if now eligible
    if (data.eligible && existingRecord.cooldown_until) {
      data.cooldown_until = null;
      data.cooldown_reason = null;
    }

    delete data.re_evaluate;
  }

  return { ok: true, data };
}