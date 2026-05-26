/**
 * Load Entity Lifecycle Hooks
 * Server-side validation, RBAC, redaction, and audit logging
 */

import { base44 } from '@base44/sdk';

// Status transition state machine
const ALLOWED_TRANSITIONS = {
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

// Broker-only fields that must be redacted for other roles
const BROKER_ONLY_FIELDS = [
  'customer_rate',
  'margin',
  'margin_estimate',
  'margin_actual',
  'linehaul_revenue',
  'fuel_surcharge_revenue',
  'accessorial_revenue_total',
  'total_revenue'
];

/**
 * Get user role from context
 */
function getUserRole(context) {
  if (context.user?.role === 'admin') return 'admin';
  return context.operatingMode || 'broker';
}

/**
 * Validate Load before creation
 */
export async function beforeCreate(entity, context) {
  const errors = [];
  const role = getUserRole(context);

  // 1. BUSINESS RULE: customer_rate >= carrier_pay
  if (entity.customer_rate && entity.carrier_pay) {
    if (entity.carrier_pay > entity.customer_rate) {
      // Only admin can override negative margin
      if (role !== 'admin' && !entity._allow_negative_margin_override) {
        errors.push({
          field: 'carrier_pay',
          code: 'NEGATIVE_MARGIN',
          message: 'Carrier pay cannot exceed customer rate (negative margin). Contact admin for override.'
        });
      }
    }
  }

  // 2. BUSINESS RULE: pickup_date <= delivery_date
  if (entity.pickup_date && entity.delivery_date) {
    const pickup = new Date(entity.pickup_date);
    const delivery = new Date(entity.delivery_date);
    if (delivery < pickup) {
      errors.push({
        field: 'delivery_date',
        code: 'INVALID_DATE_SEQUENCE',
        message: 'Delivery date cannot be before pickup date'
      });
    }
  }

  // 3. REEFER VALIDATION: requires temperature
  if (entity.equipment_type === 'reefer' && !entity.temperature_min && !entity.temperature_max) {
    errors.push({
      field: 'temperature_min',
      code: 'MISSING_TEMPERATURE',
      message: 'Temperature range required for reefer loads'
    });
  }

  // 4. HAZMAT VALIDATION: requires class
  if ((entity.is_hazmat || entity.hazmat_flag) && !entity.hazmat_class) {
    errors.push({
      field: 'hazmat_class',
      code: 'MISSING_HAZMAT_CLASS',
      message: 'Hazmat class required when hazmat flag is set'
    });
  }

  // 5. RBAC: Carriers cannot create loads with customer_rate (broker-only field)
  if (role === 'carrier' && entity.customer_rate) {
    errors.push({
      field: 'customer_rate',
      code: 'FORBIDDEN',
      message: 'Carriers cannot set customer_rate'
    });
  }

  // Reject if validation errors
  if (errors.length > 0) {
    throw {
      statusCode: 400,
      message: 'Validation failed',
      errors
    };
  }

  // Add audit metadata
  entity._created_by_user = context.user?.email;
  entity._created_by_role = role;

  return entity;
}

/**
 * Validate Load before update
 */
export async function beforeUpdate(entity, existingEntity, context) {
  const errors = [];
  const role = getUserRole(context);

  // 1. RBAC: Check if user can update this load
  if (role === 'carrier' && existingEntity.carrier_id !== context.user?.carrier_id) {
    throw {
      statusCode: 403,
      message: 'You can only update loads assigned to your carrier'
    };
  }

  if (role === 'driver' && existingEntity.driver_id !== context.user?.id) {
    throw {
      statusCode: 403,
      message: 'You can only update loads assigned to you'
    };
  }

  // 2. RBAC: Carriers and drivers cannot update rate fields
  if ((role === 'carrier' || role === 'driver') && 
      (entity.customer_rate || entity.carrier_pay || entity.margin)) {
    throw {
      statusCode: 403,
      message: 'You do not have permission to update rate fields'
    };
  }

  // 3. STATUS TRANSITION VALIDATION
  if (entity.status && entity.status !== existingEntity.status) {
    const allowedTransitions = ALLOWED_TRANSITIONS[existingEntity.status] || [];
    if (!allowedTransitions.includes(entity.status) && role !== 'admin') {
      errors.push({
        field: 'status',
        code: 'INVALID_TRANSITION',
        message: `Cannot transition from ${existingEntity.status} to ${entity.status}`
      });
    }
  }

  // 4. BUSINESS RULE: Negative margin check
  const newCustomerRate = entity.customer_rate ?? existingEntity.customer_rate;
  const newCarrierPay = entity.carrier_pay ?? existingEntity.carrier_pay;
  
  if (newCustomerRate && newCarrierPay && newCarrierPay > newCustomerRate) {
    if (role !== 'admin' && !entity._allow_negative_margin_override) {
      errors.push({
        field: 'carrier_pay',
        code: 'NEGATIVE_MARGIN',
        message: 'Carrier pay cannot exceed customer rate'
      });
    }
  }

  // 5. BUSINESS RULE: Date sequence
  const newPickup = entity.pickup_date ?? existingEntity.pickup_date;
  const newDelivery = entity.delivery_date ?? existingEntity.delivery_date;
  
  if (newPickup && newDelivery && new Date(newDelivery) < new Date(newPickup)) {
    errors.push({
      field: 'delivery_date',
      code: 'INVALID_DATE_SEQUENCE',
      message: 'Delivery date cannot be before pickup date'
    });
  }

  // Reject if validation errors
  if (errors.length > 0) {
    throw {
      statusCode: 400,
      message: 'Validation failed',
      errors
    };
  }

  return entity;
}

/**
 * Audit logging after create
 */
export async function afterCreate(entity, context) {
  const role = getUserRole(context);
  
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Load',
      entity_id: entity.id,
      action: 'CREATE',
      actor_user_id: context.user?.id,
      actor_email: context.user?.email,
      actor_role: role,
      changed_fields: {},
      before_values: null,
      after_values: sanitizeForAudit(entity),
      metadata: {
        source: 'entity_hook',
        operating_mode: context.operatingMode
      }
    });
  } catch (error) {
    console.error('Audit log creation failed:', error);
  }

  return entity;
}

/**
 * Audit logging after update
 */
export async function afterUpdate(entity, existingEntity, context) {
  const role = getUserRole(context);
  const changedFields = getChangedFields(existingEntity, entity);
  
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Load',
      entity_id: entity.id,
      action: 'UPDATE',
      actor_user_id: context.user?.id,
      actor_email: context.user?.email,
      actor_role: role,
      changed_fields: changedFields,
      before_values: sanitizeForAudit(existingEntity),
      after_values: sanitizeForAudit(entity),
      metadata: {
        source: 'entity_hook',
        fields_modified: Object.keys(changedFields)
      }
    });
  } catch (error) {
    console.error('Audit log update failed:', error);
  }

  return entity;
}

/**
 * Redact sensitive fields after read
 */
export async function afterRead(entity, context) {
  const role = getUserRole(context);
  
  // Admin and broker see everything
  if (role === 'admin' || role === 'broker') {
    return entity;
  }

  // RBAC: Scope check - carriers can only see their loads
  if (role === 'carrier' && entity.carrier_id !== context.user?.carrier_id) {
    throw {
      statusCode: 403,
      message: 'You can only access loads assigned to your carrier'
    };
  }

  // RBAC: Scope check - drivers can only see their loads
  if (role === 'driver' && entity.driver_id !== context.user?.id) {
    throw {
      statusCode: 403,
      message: 'You can only access loads assigned to you'
    };
  }

  // REDACTION: Remove broker-only fields
  const redacted = { ...entity };
  BROKER_ONLY_FIELDS.forEach(field => {
    delete redacted[field];
  });

  return redacted;
}

/**
 * Audit log denied access attempts
 */
export async function onAccessDenied(entity, context, error) {
  const role = getUserRole(context);
  
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Load',
      entity_id: entity?.id || 'unknown',
      action: 'READ_DENIED',
      actor_user_id: context.user?.id,
      actor_email: context.user?.email,
      actor_role: role,
      changed_fields: {},
      before_values: null,
      after_values: null,
      metadata: {
        error: error.message,
        attempted_entity: entity?.id
      }
    });
  } catch (auditError) {
    console.error('Audit log failed:', auditError);
  }
}

/**
 * Helper: Get changed fields
 */
function getChangedFields(before, after) {
  const changes = {};
  Object.keys(after).forEach(key => {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changes[key] = {
        from: before[key],
        to: after[key]
      };
    }
  });
  return changes;
}

/**
 * Helper: Sanitize sensitive data for audit
 */
function sanitizeForAudit(data) {
  const sanitized = { ...data };
  // Keep all fields for audit (internal use only)
  return sanitized;
}