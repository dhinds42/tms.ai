/**
 * CarrierDriverPolicy - Before Create Hook
 * Validates against system minimums
 */

import { validateCarrierPolicy } from '../../shared/eligibility/systemMinimums.js';

export default async function beforeCreate({ data, base44, user }) {
  // Only carrier/admin can create policies
  if (user?.role !== 'carrier' && user?.role !== 'admin') {
    return {
      ok: false,
      error: 'Only carriers and admins can create driver policies'
    };
  }

  // Validate against system minimums
  const validation = validateCarrierPolicy(data.feature_key, data);
  if (!validation.valid) {
    return {
      ok: false,
      error: `Policy violates system minimums: ${validation.reason}`
    };
  }

  // Create audit log
  await base44.entities.AuditLog.create({
    entity_type: 'CarrierDriverPolicy',
    entity_id: data.carrier_id,
    action: 'CREATE',
    actor_email: user.email,
    actor_role: user.role,
    after_values: data,
    metadata: {
      feature_key: data.feature_key,
      policy_created: true
    }
  });

  return { ok: true, data };
}