/**
 * Driver Entity Lifecycle Hooks
 * CDL/medical validation, RBAC enforcement
 */

import { base44 } from '@base44/sdk';

function getUserRole(context) {
  if (context.user?.role === 'admin') return 'admin';
  return context.operatingMode || 'broker';
}

/**
 * Validate Driver before creation
 */
export async function beforeCreate(entity, context) {
  const errors = [];
  const role = getUserRole(context);

  // RBAC: Only carriers/brokers/admins can create drivers
  if (role === 'driver') {
    throw {
      statusCode: 403,
      message: 'Drivers cannot create other driver records'
    };
  }

  // 1. Validate CDL expiration (must be future date)
  if (entity.cdl_expiration && new Date(entity.cdl_expiration) < new Date()) {
    errors.push({
      field: 'cdl_expiration',
      code: 'EXPIRED_CDL',
      message: 'CDL has expired - driver cannot be activated'
    });
  }

  // 2. Validate medical card expiration
  if (entity.medical_card_expiry && new Date(entity.medical_card_expiry) < new Date()) {
    errors.push({
      field: 'medical_card_expiry',
      code: 'EXPIRED_MEDICAL',
      message: 'Medical card has expired - driver cannot be activated'
    });
  }

  // 3. Check for duplicate CDL number
  if (entity.cdl_number) {
    const existing = await base44.asServiceRole.entities.Driver.filter({
      cdl_number: entity.cdl_number.toUpperCase()
    });
    
    if (existing.length > 0) {
      throw {
        statusCode: 409,
        message: 'Duplicate driver',
        errors: [{
          field: 'cdl_number',
          code: 'DUPLICATE',
          message: `Driver with CDL# ${entity.cdl_number} already exists`
        }]
      };
    }
  }

  // 4. Validate payment rate > 0
  if (entity.payment_rate && entity.payment_rate <= 0) {
    errors.push({
      field: 'payment_rate',
      code: 'INVALID_RATE',
      message: 'Payment rate must be greater than 0'
    });
  }

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
 * Validate Driver before update
 */
export async function beforeUpdate(entity, existingEntity, context) {
  const role = getUserRole(context);

  // RBAC: Drivers can only update their own record
  if (role === 'driver' && existingEntity.id !== context.user?.id) {
    throw {
      statusCode: 403,
      message: 'You can only update your own driver profile'
    };
  }

  // RBAC: Drivers cannot modify payment rates
  if (role === 'driver' && entity.payment_rate && entity.payment_rate !== existingEntity.payment_rate) {
    throw {
      statusCode: 403,
      message: 'Drivers cannot modify their own payment rate'
    };
  }

  return entity;
}

/**
 * Audit after create
 */
export async function afterCreate(entity, context) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Driver',
      entity_id: entity.id,
      action: 'CREATE',
      actor_user_id: context.user?.id,
      actor_email: context.user?.email,
      actor_role: getUserRole(context),
      after_values: { ...entity, payment_rate: '[REDACTED]' }
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
  return entity;
}

/**
 * Audit after update
 */
export async function afterUpdate(entity, existingEntity, context) {
  const changedFields = {};
  Object.keys(entity).forEach(key => {
    if (JSON.stringify(existingEntity[key]) !== JSON.stringify(entity[key])) {
      changedFields[key] = { from: existingEntity[key], to: entity[key] };
    }
  });

  try {
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Driver',
      entity_id: entity.id,
      action: 'UPDATE',
      actor_user_id: context.user?.id,
      actor_email: context.user?.email,
      actor_role: getUserRole(context),
      changed_fields: changedFields
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
  return entity;
}

/**
 * Redact after read
 */
export async function afterRead(entity, context) {
  const role = getUserRole(context);
  
  if (role === 'admin' || role === 'broker' || role === 'carrier') {
    return entity;
  }

  // RBAC: Drivers can only read their own data
  if (role === 'driver' && entity.id !== context.user?.id) {
    throw {
      statusCode: 403,
      message: 'You can only access your own driver profile'
    };
  }

  return entity;
}