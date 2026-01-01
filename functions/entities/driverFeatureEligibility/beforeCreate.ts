/**
 * DriverFeatureEligibility - Before Create Hook
 * Evaluates eligibility using server-side engine
 */

import { evaluateDriverEligibility } from '../../shared/eligibility/featureEligibilityEngine.js';

export default async function beforeCreate({ data, base44, user }) {
  // If carrier override, allow manual grant
  if (data.carrier_override && (user?.role === 'carrier' || user?.role === 'admin')) {
    data.eligible = true;
    data.reason = data.override_reason || 'Carrier override granted';
    data.override_granted_by = user.email;
    data.evaluated_at = new Date().toISOString();

    await base44.entities.AuditLog.create({
      entity_type: 'DriverFeatureEligibility',
      entity_id: data.driver_id,
      action: 'CREATE',
      actor_email: user.email,
      actor_role: user.role,
      after_values: data,
      metadata: {
        feature_key: data.feature_key,
        carrier_override: true
      }
    });

    return { ok: true, data };
  }

  // Otherwise, compute eligibility
  const evaluation = await evaluateDriverEligibility(data.driver_id, data.feature_key, base44);
  
  data.eligible = evaluation.eligible;
  data.reason = evaluation.reason;
  data.metrics_snapshot = evaluation.metrics_snapshot;
  data.evaluated_at = evaluation.evaluated_at;
  data.tier = evaluation.tier;

  return { ok: true, data };
}