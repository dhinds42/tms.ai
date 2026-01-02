/**
 * Membership - Before Update Hook
 * Audit status changes
 */

export default async function beforeUpdate({ data, existingData, user, base44 }) {
  try {
    // Track status changes
    if (data.status && data.status !== existingData.status) {
      // Set timestamp fields
      if (data.status === 'active' && !data.accepted_at) {
        data.accepted_at = new Date().toISOString();
      }
      if (data.status === 'locked') {
        data.locked_at = new Date().toISOString();
        data.locked_by = user?.email;
      }
      if (data.status === 'offboarded') {
        data.offboarded_at = new Date().toISOString();
        data.offboarded_by = user?.email;
      }
      
      // Audit log
      await base44.asServiceRole.entities.AuditLog.create({
        entity_type: 'Membership',
        entity_id: existingData.id,
        action: 'STATUS_CHANGE',
        actor_email: user?.email || 'system',
        actor_role: user?.role || 'system',
        metadata: {
          from_status: existingData.status,
          to_status: data.status,
          org_id: existingData.org_id,
          user_email: existingData.user_email,
          reason: data.lock_reason || data.offboard_reason
        },
        before_values: { status: existingData.status },
        after_values: { status: data.status }
      });
    }
    
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      errors: [{ field: 'membership', code: 'HOOK_ERROR', message: error.message }]
    };
  }
}