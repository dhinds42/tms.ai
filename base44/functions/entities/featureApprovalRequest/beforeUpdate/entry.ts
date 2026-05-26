/**
 * FeatureApprovalRequest - Before Update Hook
 * Handles approval/denial logic
 */

export default async function beforeUpdate({ id, data, existing, base44, user }) {
  // Only carrier/admin can approve/deny
  if (data.status && data.status !== existing.status) {
    if (user?.role !== 'carrier' && user?.role !== 'admin') {
      return {
        ok: false,
        error: 'Only carriers and admins can approve/deny feature requests'
      };
    }

    data.reviewed_by = user.email;
    data.reviewed_at = new Date().toISOString();

    // If approved, create/update DriverFeatureEligibility with override
    if (data.status === 'approved') {
      if (!data.approval_reason) {
        return {
          ok: false,
          error: 'Approval reason is required'
        };
      }

      // Grant feature access via carrier override
      const eligibilityRecords = await base44.entities.DriverFeatureEligibility.filter({
        driver_id: existing.driver_id,
        feature_key: existing.feature_key
      });

      if (eligibilityRecords.length > 0) {
        await base44.entities.DriverFeatureEligibility.update(eligibilityRecords[0].id, {
          carrier_override: true,
          override_granted_by: user.email,
          override_reason: data.approval_reason,
          override_expires_at: data.approval_expires_at,
          eligible: true,
          reason: `Approved by ${user.email}: ${data.approval_reason}`
        });
      } else {
        await base44.entities.DriverFeatureEligibility.create({
          driver_id: existing.driver_id,
          feature_key: existing.feature_key,
          carrier_override: true,
          override_granted_by: user.email,
          override_reason: data.approval_reason,
          override_expires_at: data.approval_expires_at,
          eligible: true,
          reason: `Approved by ${user.email}: ${data.approval_reason}`
        });
      }
    }

    // Audit log
    await base44.entities.AuditLog.create({
      entity_type: 'FeatureApprovalRequest',
      entity_id: existing.driver_id,
      action: 'UPDATE',
      actor_email: user.email,
      actor_role: user.role,
      changed_fields: {
        status: { from: existing.status, to: data.status }
      },
      metadata: {
        feature_key: existing.feature_key,
        approval_reason: data.approval_reason,
        denial_reason: data.denial_reason
      }
    });
  }

  return { ok: true, data };
}