/**
 * Authorization Middleware
 * Enforces RBAC and data scoping server-side
 */

import { hasPermission, canAccessRecord, redactForRole, getUserRole } from '../auth/permissions.js';

/**
 * Authorize request
 */
export async function authorize(user, permission, options = {}) {
  if (!user) {
    throw {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication required'
    };
  }
  
  const operatingMode = options.operatingMode || 'broker';
  const context = { user, operatingMode };
  
  if (!hasPermission(user, permission, context)) {
    throw {
      statusCode: 403,
      error: 'Forbidden',
      message: `You do not have permission to ${permission}`
    };
  }
  
  return true;
}

/**
 * Authorize record access
 */
export async function authorizeRecordAccess(user, entityType, record, operatingMode) {
  const role = getUserRole(user, operatingMode);
  
  // Admin and broker have full access
  if (role === 'admin' || role === 'broker') {
    return true;
  }
  
  // Check record-level access
  if (!canAccessRecord(user, entityType, record, operatingMode)) {
    throw {
      statusCode: 403,
      error: 'Forbidden',
      message: `You cannot access this ${entityType}`
    };
  }
  
  return true;
}

/**
 * Redact response data based on role
 */
export function redactResponse(entityType, data, user, operatingMode) {
  const role = getUserRole(user, operatingMode);
  
  if (Array.isArray(data)) {
    return data.map(item => redactForRole(entityType, item, role));
  }
  
  return redactForRole(entityType, data, role);
}

/**
 * Scope query to user's accessible records
 */
export function scopeQuery(entityType, query, user, operatingMode) {
  const role = getUserRole(user, operatingMode);
  
  // Admin and broker see all
  if (role === 'admin' || role === 'broker') {
    return query;
  }
  
  // Carrier sees only their loads/drivers
  if (role === 'carrier' && entityType === 'Load') {
    return { ...query, carrier_id: user.carrier_id };
  }
  
  if (role === 'carrier' && entityType === 'Driver') {
    return { ...query, party_id: user.carrier_id };
  }
  
  // Driver sees only their loads
  if (role === 'driver' && entityType === 'Load') {
    return { ...query, driver_id: user.id };
  }
  
  // Customer sees only their loads
  if (role === 'customer' && entityType === 'Load') {
    return { ...query, customer_id: user.customer_id };
  }
  
  return query;
}