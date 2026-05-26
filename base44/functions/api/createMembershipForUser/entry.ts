/**
 * Create Membership for User
 * Called when user first accesses system after multi-tenant migration
 */

export default async function createMembershipForUser({ base44, user, org_id }) {
  try {
    // Check if membership already exists
    const existing = await base44.asServiceRole.entities.Membership.filter({
      user_id: user.id,
      org_id: org_id
    });
    
    if (existing.length > 0) {
      return { ok: true, membership: existing[0] };
    }
    
    // Create membership
    const membership = await base44.asServiceRole.entities.Membership.create({
      user_id: user.id,
      user_email: user.email,
      org_id: org_id,
      status: 'active',
      accepted_at: new Date().toISOString(),
      is_primary: true
    });
    
    // Assign default role based on user.role
    const roleMapping = {
      'admin': 'broker_admin',
      'user': 'broker_ops'
    };
    
    const roleKey = roleMapping[user.role] || 'broker_ops';
    const roles = await base44.asServiceRole.entities.Role.filter({
      role_key: roleKey
    });
    
    if (roles.length > 0) {
      await base44.asServiceRole.entities.UserRole.create({
        membership_id: membership.id,
        role_id: roles[0].id,
        granted_by: 'system_migration',
        granted_at: new Date().toISOString()
      });
    }
    
    return { ok: true, membership };
    
  } catch (error) {
    return { ok: false, error: error.message };
  }
}