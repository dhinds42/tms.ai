/**
 * Load - After Read Hook
 * Apply field-level redaction based on user role
 */

import { applyFieldRedaction, applyBatchRedaction } from '../../shared/rbac/policyEngine';
import { getUserContext } from '../../shared/rbac/membershipResolver';

export default async function afterRead({ data, user, base44 }) {
  try {
    if (!user || user.role === 'admin') {
      return { ok: true, data }; // Admin sees all
    }
    
    // Get user context
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_email: user.email,
      status: 'active'
    }, undefined, 1);
    
    if (memberships.length === 0) {
      return { ok: true, data }; // Legacy mode
    }
    
    const membership = memberships[0];
    
    // Get roles
    const userRoles = await base44.asServiceRole.entities.UserRole.filter({
      membership_id: membership.id,
      is_active: true
    });
    
    if (userRoles.length === 0) {
      return { ok: true, data };
    }
    
    const roleIds = userRoles.map(ur => ur.role_id);
    const roles = await base44.asServiceRole.entities.Role.filter({
      id: { $in: roleIds }
    });
    
    const roleKeys = roles.map(r => r.role_key);
    
    // Get org
    const orgs = await base44.asServiceRole.entities.Organization.filter({
      id: membership.org_id
    });
    
    const orgType = orgs[0]?.org_type;
    
    // Apply redaction
    if (Array.isArray(data)) {
      const redacted = await applyBatchRedaction(base44, data, 'Load', roleKeys, orgType);
      return { ok: true, data: redacted };
    } else {
      const redacted = await applyFieldRedaction(base44, data, 'Load', roleKeys, orgType);
      return { ok: true, data: redacted };
    }
    
  } catch (error) {
    console.error('Load afterRead error:', error);
    return { ok: true, data }; // Fail open
  }
}