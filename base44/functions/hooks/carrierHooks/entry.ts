/**
 * Carrier Entity Lifecycle Hooks
 * Server-side validation, RBAC, duplicate prevention
 */

import { base44 } from '@base44/sdk';

function getUserRole(context) {
  if (context.user?.role === 'admin') return 'admin';
  return context.operatingMode || 'broker';
}

/**
 * Validate Carrier before creation
 */
export async function beforeCreate(entity, context) {
  const errors = [];
  const role = getUserRole(context);

  // RBAC: Only brokers/admins can create carriers
  if (role !== 'broker' && role !== 'admin') {
    throw {
      statusCode: 403,
      message: 'Only brokers can create carriers'
    };
  }

  // 1. Validate MC number format (5-7 digits)
  if (entity.mc_number && !/^\d{5,7}$/.test(entity.mc_number.replace(/[^0-9]/g, ''))) {
    errors.push({
      field: 'mc_number',
      code: 'INVALID_FORMAT',
      message: 'MC number must be 5-7 digits'
    });
  }

  // 2. Validate DOT number format (5-8 digits)
  if (entity.dot_number && !/^\d{5,8}$/.test(entity.dot_number.replace(/[^0-9]/g, ''))) {
    errors.push({
      field: 'dot_number',
      code: 'INVALID_FORMAT',
      message: 'DOT number must be 5-8 digits'
    });
  }

  // 3. Check for duplicate MC number
  if (entity.mc_number) {
    const existing = await base44.asServiceRole.entities.Carrier.filter({
      mc_number: entity.mc_number.replace(/[^0-9]/g, '')
    });
    
    if (existing.length > 0) {
      throw {
        statusCode: 409,
        message: 'Duplicate carrier',
        errors: [{
          field: 'mc_number',
          code: 'DUPLICATE',
          message: `Carrier with MC# ${entity.mc_number} already exists`
        }]
      };
    }
  }

  // 4. Validate insurance expiration (must be future date)
  if (entity.insurance_expiration && new Date(entity.insurance_expiration) < new Date()) {
    errors.push({
      field: 'insurance_expiration',
      code: 'EXPIRED_INSURANCE',
      message: 'Insurance has expired - cannot activate carrier'
    });
  }

  if (errors.length > 0) {
    throw {
      statusCode: 400,
      message: 'Validation failed',
      errors
    };
  }

  entity._onboarded_by = context.user?.email;
  return entity;
}

/**
 * Validate Carrier before update
 */
export async function beforeUpdate(entity, existingEntity, context) {
  const role = getUserRole(context);

  // RBAC: Carriers can only update their own record
  if (role === 'carrier' && existingEntity.id !== context.user?.carrier_id) {
    throw {
      statusCode: 403,
      message: 'You can only update your own carrier profile'
    };
  }

  // RBAC: Carriers cannot modify certain fields
  const carrierReadOnlyFields = ['mc_number', 'dot_number', 'fmcsa_safety_rating', 'compliance_score'];
  if (role === 'carrier') {
    carrierReadOnlyFields.forEach(field => {
      if (entity[field] && entity[field] !== existingEntity[field]) {
        throw {
          statusCode: 403,
          message: `Carriers cannot modify ${field}`
        };
      }
    });
  }

  return entity;
}

/**
 * Audit after create
 */
export async function afterCreate(entity, context) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Carrier',
      entity_id: entity.id,
      action: 'CREATE',
      actor_user_id: context.user?.id,
      actor_email: context.user?.email,
      actor_role: getUserRole(context),
      after_values: entity
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
      entity_type: 'Carrier',
      entity_id: entity.id,
      action: 'UPDATE',
      actor_user_id: context.user?.id,
      actor_email: context.user?.email,
      actor_role: getUserRole(context),
      changed_fields: changedFields,
      before_values: existingEntity,
      after_values: entity
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
  
  if (role === 'admin' || role === 'broker') {
    return entity;
  }

  // RBAC: Carriers can only read their own data
  if (role === 'carrier' && entity.id !== context.user?.carrier_id) {
    throw {
      statusCode: 403,
      message: 'You can only access your own carrier profile'
    };
  }

  // Redact broker-only internal notes
  const redacted = { ...entity };
  delete redacted.notes; // Internal broker notes
  delete redacted.average_margin;
  
  return redacted;
}