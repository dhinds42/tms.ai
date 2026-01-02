/**
 * Membership Resolution
 * Get user's active memberships and roles
 */

/**
 * Get active membership for user in current org context
 */
export async function getActiveMembership(base44, userId, orgId) {
  try {
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_id: userId,
      org_id: orgId,
      status: 'active',
      is_active: true
    });
    
    return memberships.length > 0 ? memberships[0] : null;
  } catch (error) {
    console.error('Error fetching membership:', error);
    return null;
  }
}

/**
 * Get all active memberships for user
 */
export async function getUserMemberships(base44, userId) {
  try {
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_id: userId,
      status: 'active',
      is_active: true
    });
    
    return memberships;
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return [];
  }
}

/**
 * Get roles for a membership
 */
export async function getMembershipRoles(base44, membershipId) {
  try {
    const userRoles = await base44.asServiceRole.entities.UserRole.filter({
      membership_id: membershipId,
      is_active: true
    });
    
    if (userRoles.length === 0) return [];
    
    const roleIds = userRoles.map(ur => ur.role_id);
    const roles = await base44.asServiceRole.entities.Role.filter({
      id: { $in: roleIds },
      is_active: true
    });
    
    return roles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

/**
 * Get all permissions for a membership
 */
export async function getMembershipPermissions(base44, membershipId) {
  try {
    const roles = await getMembershipRoles(base44, membershipId);
    
    if (roles.length === 0) return [];
    
    const roleIds = roles.map(r => r.id);
    const rolePermissions = await base44.asServiceRole.entities.RolePermission.filter({
      role_id: { $in: roleIds },
      is_active: true
    });
    
    if (rolePermissions.length === 0) return [];
    
    const permissionIds = rolePermissions.map(rp => rp.permission_id);
    const permissions = await base44.asServiceRole.entities.Permission.filter({
      id: { $in: permissionIds },
      is_active: true
    });
    
    return permissions;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
}

/**
 * Check if membership has specific permission
 */
export async function hasPermission(base44, membershipId, permissionCode) {
  try {
    const permissions = await getMembershipPermissions(base44, membershipId);
    return permissions.some(p => p.code === permissionCode);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get user context (membership + org + roles + permissions)
 */
export async function getUserContext(base44, userId, orgId) {
  try {
    const membership = await getActiveMembership(base44, userId, orgId);
    if (!membership) {
      return null;
    }
    
    const org = await base44.asServiceRole.entities.Organization.filter({
      id: orgId,
      is_active: true
    });
    
    const roles = await getMembershipRoles(base44, membership.id);
    const permissions = await getMembershipPermissions(base44, membership.id);
    
    return {
      membership,
      organization: org[0],
      roles,
      permissions,
      permissionCodes: permissions.map(p => p.code)
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
}