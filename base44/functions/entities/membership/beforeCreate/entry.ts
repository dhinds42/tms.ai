/**
 * Membership - Before Create Hook
 * Validation and defaults
 */

export default async function beforeCreate({ data, user, base44 }) {
  try {
    // Set invited_by if not present
    if (!data.invited_by && user) {
      data.invited_by = user.email;
    }
    
    // Set invited_at
    if (!data.invited_at) {
      data.invited_at = new Date().toISOString();
    }
    
    // Default status
    if (!data.status) {
      data.status = 'invited';
    }
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Membership',
      entity_id: data.id || 'new',
      action: 'CREATE',
      actor_email: user?.email || 'system',
      actor_role: user?.role || 'system',
      metadata: {
        org_id: data.org_id,
        user_email: data.user_email,
        status: data.status
      }
    });
    
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      errors: [{ field: 'membership', code: 'HOOK_ERROR', message: error.message }]
    };
  }
}