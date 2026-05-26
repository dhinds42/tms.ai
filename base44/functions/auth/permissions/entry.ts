/**
 * RBAC Permissions System
 * Defines what each role can access
 */

export const PERMISSIONS = {
  // Load permissions
  'load.create': ['admin', 'broker', 'carrier'],
  'load.read.all': ['admin', 'broker'],
  'load.read.assigned': ['carrier', 'driver', 'owner_operator'],
  'load.update.status': ['admin', 'broker', 'carrier', 'driver'],
  'load.update.rates': ['admin', 'broker'],
  'load.delete': ['admin', 'broker'],
  'load.read.customer_rate': ['admin', 'broker'],
  'load.read.margin': ['admin', 'broker'],
  'load.read.carrier_pay': ['admin', 'broker', 'carrier'],
  
  // Carrier permissions
  'carrier.create': ['admin', 'broker'],
  'carrier.read.all': ['admin', 'broker'],
  'carrier.read.own': ['carrier'],
  'carrier.update.own': ['admin', 'broker', 'carrier'],
  'carrier.delete': ['admin'],
  
  // Driver permissions
  'driver.create': ['admin', 'broker', 'carrier'],
  'driver.read.all': ['admin', 'broker', 'carrier'],
  'driver.read.own': ['driver'],
  'driver.update.own': ['admin', 'carrier', 'driver'],
  'driver.delete': ['admin', 'carrier'],
  
  // Customer/Shipper permissions
  'customer.create': ['admin', 'broker'],
  'customer.read.all': ['admin', 'broker'],
  'customer.read.own': ['customer'],
  'customer.update': ['admin', 'broker'],
  'customer.delete': ['admin'],
  
  // Invoice permissions
  'invoice.create': ['admin', 'broker', 'carrier'],
  'invoice.read.all': ['admin', 'broker'],
  'invoice.read.own': ['carrier', 'customer'],
  'invoice.update': ['admin', 'broker'],
  'invoice.delete': ['admin'],
  
  // Settlement permissions
  'settlement.create': ['admin', 'broker'],
  'settlement.read.all': ['admin', 'broker'],
  'settlement.read.own': ['carrier', 'driver', 'owner_operator'],
  'settlement.approve': ['admin', 'broker'],
  
  // Document permissions
  'document.upload': ['admin', 'broker', 'carrier', 'driver', 'owner_operator'],
  'document.read.all': ['admin', 'broker'],
  'document.read.assigned': ['carrier', 'driver', 'customer'],
  'document.delete': ['admin', 'broker'],
  
  // Compliance permissions
  'compliance.create': ['admin', 'broker', 'carrier'],
  'compliance.read.all': ['admin', 'broker'],
  'compliance.read.own': ['carrier', 'driver'],
  'compliance.update': ['admin', 'broker', 'carrier'],
  
  // Admin-only permissions
  'user.invite': ['admin'],
  'settings.update': ['admin'],
  'audit.read': ['admin'],
  'reports.financial': ['admin', 'broker']
};

/**
 * Check if user has permission
 */
export function hasPermission(user, permission, context = {}) {
  if (!user) return false;
  
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  // Admin always has access
  if (user.role === 'admin') return true;
  
  // Check role-based permission
  const userRole = context.operatingMode || user.role || 'user';
  
  if (allowedRoles.includes(userRole)) return true;
  if (allowedRoles.includes('broker') && userRole === 'broker') return true;
  if (allowedRoles.includes('carrier') && userRole === 'carrier') return true;
  if (allowedRoles.includes('driver') && userRole === 'driver') return true;
  if (allowedRoles.includes('customer') && userRole === 'customer') return true;
  if (allowedRoles.includes('owner_operator') && userRole === 'owner_operator') return true;
  
  return false;
}

/**
 * Get user role from context
 */
export function getUserRole(user, operatingMode) {
  if (!user) return null;
  if (user.role === 'admin') return 'admin';
  return operatingMode || 'broker';
}

/**
 * Scope check - can user access this specific record?
 */
export function canAccessRecord(user, entityType, record, operatingMode) {
  const role = getUserRole(user, operatingMode);
  
  if (role === 'admin' || role === 'broker') {
    return true; // Full access
  }
  
  if (entityType === 'Load') {
    if (role === 'carrier' && record.carrier_id === user.carrier_id) return true;
    if (role === 'driver' && record.driver_id === user.id) return true;
    if (role === 'customer' && record.customer_id === user.customer_id) return true;
    return false;
  }
  
  if (entityType === 'Driver') {
    if (role === 'carrier' && record.party_id === user.carrier_id) return true;
    if (role === 'driver' && record.id === user.id) return true;
    return false;
  }
  
  if (entityType === 'Carrier') {
    if (role === 'carrier' && record.id === user.carrier_id) return true;
    return false;
  }
  
  return false;
}

/**
 * Redact sensitive fields based on role
 */
export function redactForRole(entityType, data, role) {
  if (role === 'admin' || role === 'broker') {
    return data; // No redaction for admin/broker
  }
  
  const redacted = { ...data };
  
  if (entityType === 'Load') {
    // Carriers cannot see customer rate or margin
    if (role === 'carrier' || role === 'driver' || role === 'owner_operator') {
      delete redacted.customer_rate;
      delete redacted.margin;
      delete redacted.margin_estimate;
      delete redacted.margin_actual;
      delete redacted.linehaul_revenue;
      delete redacted.fuel_surcharge_revenue;
      delete redacted.accessorial_revenue_total;
      delete redacted.total_revenue;
    }
    
    // Customers cannot see carrier pay
    if (role === 'customer') {
      delete redacted.carrier_pay;
      delete redacted.margin;
      delete redacted.broker_fee_customer_side;
      delete redacted.broker_fee_carrier_side;
    }
  }
  
  if (entityType === 'Carrier') {
    // External users cannot see internal notes
    if (role === 'carrier' || role === 'customer') {
      delete redacted.internal_notes;
      delete redacted.broker_rating;
      delete redacted.margin_history;
    }
  }
  
  if (entityType === 'Invoice' || entityType === 'Settlement') {
    // Carriers see their pay, not customer billing
    if (role === 'carrier' || role === 'driver' || role === 'owner_operator') {
      delete redacted.customer_invoice_amount;
      delete redacted.customer_rate;
    }
  }
  
  return redacted;
}

/**
 * Load status state machine - allowed transitions
 */
export const LOAD_STATUS_TRANSITIONS = {
  'quote': ['available', 'cancelled'],
  'available': ['tendered', 'cancelled'],
  'tendered': ['assigned', 'available', 'cancelled'],
  'assigned': ['dispatched', 'cancelled'],
  'dispatched': ['picked_up', 'cancelled'],
  'picked_up': ['in_transit'],
  'in_transit': ['delivered'],
  'delivered': ['invoiced'],
  'invoiced': ['closed'],
  'closed': [],
  'cancelled': []
};

export function isValidStatusTransition(currentStatus, newStatus) {
  const allowed = LOAD_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}