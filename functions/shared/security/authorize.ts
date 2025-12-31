/**
 * Authorization Utilities
 * For Base44 hook-compatible permission checks
 */

import { UserRole } from './financialRedaction';
import { logAccessDenied } from './auditLogger';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  condition?: (entity: any, user: any) => boolean;
}

/**
 * Check if user has permission
 */
export function hasPermission(
  user: { role: UserRole; id: string; email: string },
  permission: Permission,
  entity?: any
): boolean {
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check role-based permissions
  const rolePermissions = getRolePermissions(user.role);
  
  const hasBasePermission = rolePermissions.some(p => 
    p.resource === permission.resource && p.action === permission.action
  );
  
  if (!hasBasePermission) return false;
  
  // Check conditional permissions
  if (permission.condition && entity) {
    return permission.condition(entity, user);
  }
  
  return true;
}

/**
 * Get permissions for a role
 */
function getRolePermissions(role: UserRole): Permission[] {
  switch (role) {
    case 'admin':
      return []; // Admin has all, no need to enumerate
      
    case 'broker':
      return [
        { resource: 'load', action: 'create' },
        { resource: 'load', action: 'read' },
        { resource: 'load', action: 'update' },
        { resource: 'load', action: 'delete' },
        { resource: 'invoice', action: 'create' },
        { resource: 'invoice', action: 'read' },
        { resource: 'invoice', action: 'update' },
        { resource: 'settlement', action: 'create' },
        { resource: 'settlement', action: 'read' },
        { resource: 'carrier', action: 'read' }
      ];
      
    case 'carrier':
      return [
        { resource: 'load', action: 'read', condition: (entity, user) => {
          // Only their assigned loads
          return entity.carrier_id === user.id;
        }},
        { resource: 'settlement', action: 'read', condition: (entity, user) => {
          return entity.carrier_id === user.id;
        }}
      ];
      
    case 'driver':
      return [
        { resource: 'load', action: 'read', condition: (entity, user) => {
          return entity.driver_id === user.id;
        }}
      ];
      
    case 'customer':
      return [
        { resource: 'load', action: 'read', condition: (entity, user) => {
          return entity.customer_id === user.id;
        }},
        { resource: 'invoice', action: 'read', condition: (entity, user) => {
          return entity.customer_id === user.id;
        }}
      ];
      
    default:
      return [];
  }
}

/**
 * Authorize and log denied attempts
 */
export async function authorize(
  user: any,
  permission: Permission,
  entity?: any
): Promise<{ authorized: boolean; reason?: string }> {
  const authorized = hasPermission(user, permission, entity);
  
  if (!authorized && entity) {
    await logAccessDenied(
      permission.resource,
      entity.id,
      user,
      permission.action,
      'Insufficient permissions'
    );
  }
  
  return {
    authorized,
    reason: authorized ? undefined : 'Access denied'
  };
}