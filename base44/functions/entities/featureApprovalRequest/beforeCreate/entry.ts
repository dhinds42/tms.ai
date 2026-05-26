/**
 * FeatureApprovalRequest - Before Create Hook
 * Validates request and logs creation
 */

export default async function beforeCreate({ data, base44, user }) {
  // Validate driver exists
  const drivers = await base44.entities.Driver.filter({ id: data.driver_id });
  if (drivers.length === 0) {
    return {
      ok: false,
      error: 'Driver not found'
    };
  }

  // Check for duplicate pending requests
  const existingPending = await base44.entities.FeatureApprovalRequest.filter({
    driver_id: data.driver_id,
    feature_key: data.feature_key,
    status: 'pending'
  });

  if (existingPending.length > 0) {
    return {
      ok: false,
      error: 'A pending approval request already exists for this feature'
    };
  }

  // Auto-set timestamps
  if (!data.auto_generated_at && data.request_type === 'auto_generated') {
    data.auto_generated_at = new Date().toISOString();
  }

  // Audit log
  await base44.entities.AuditLog.create({
    entity_type: 'FeatureApprovalRequest',
    entity_id: data.driver_id,
    action: 'CREATE',
    actor_email: user?.email || 'system',
    actor_role: user?.role || 'system',
    after_values: data,
    metadata: {
      feature_key: data.feature_key,
      request_type: data.request_type,
      eligibility_met: data.eligibility_met
    }
  });

  return { ok: true, data };
}