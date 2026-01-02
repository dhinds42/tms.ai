/**
 * Multi-Tenant Authorization Engine
 * Server-side permission checks with org isolation
 */

import { getUserContext } from './membershipResolver';
import { logAccessDenied } from '../security/auditLogger';

/**
 * Authorize user action on resource
 */
export async function authorize(base44, user, permissionCode, entity, orgId) {
  try {
    // Admin bypass (global admin)
    if (user.role === 'admin') {
      return { authorized: true };
    }
    
    // Get user context for org
    const context = await getUserContext(base44, user.id, orgId);
    
    if (!context) {
      await logAccessDenied('unknown', entity?.id || 'unknown', user, 'access', 'No active membership');
      return {
        authorized: false,
        reason: 'No active membership in organization'
      };
    }
    
    // Check membership status
    if (context.membership.status !== 'active') {
      await logAccessDenied('unknown', entity?.id || 'unknown', user, 'access', `Membership status: ${context.membership.status}`);
      return {
        authorized: false,
        reason: `Membership ${context.membership.status}`
      };
    }
    
    // Check permission
    const hasPermission = context.permissionCodes.includes(permissionCode);
    
    if (!hasPermission) {
      await logAccessDenied(
        entity?.constructor?.name || 'unknown',
        entity?.id || 'unknown',
        user,
        permissionCode,
        'Insufficient permissions'
      );
      
      return {
        authorized: false,
        reason: `Missing permission: ${permissionCode}`
      };
    }
    
    return { authorized: true, context };
    
  } catch (error) {
    console.error('Authorization error:', error);
    return {
      authorized: false,
      reason: 'Authorization system error'
    };
  }
}

/**
 * Enforce tenant isolation - verify entity belongs to user's org
 */
export function enforceOrgIsolation(entity, orgId) {
  if (!entity) return true;
  
  if (entity.org_id && entity.org_id !== orgId) {
    return false; // Entity belongs to different org
  }
  
  return true;
}

/**
 * Filter entities by org_id
 */
export function filterByOrg(entities, orgId) {
  if (!Array.isArray(entities)) return entities;
  return entities.filter(e => !e.org_id || e.org_id === orgId);
}

/**
 * Get current org from context (helper)
 */
export function getCurrentOrg(user, context) {
  // Priority: context.org_id > user.primary_org_id > first membership
  return context?.org_id || user?.primary_org_id || null;
}