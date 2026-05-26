/**
 * Shipper/Customer Entity Lifecycle Hooks
 * Credit validation, RBAC enforcement
 */

import { base44 } from '@base44/sdk';

function getUserRole(context) {
  if (context.user?.role === 'admin') return 'admin';
  return context.operatingMode || 'broker';
}

/**
 * Validate Shipper before creation
 */
export async function beforeCreate(entity, context) {
  const role = getUserRole(context);

  // RBAC: Only brokers/admins can create shippers
  if (role !== 'broker' && role !== 'admin') {
    throw {
      statusCode: 403,
      message: 'Only brokers can create customers'
    };
  }

  // Validate credit limit is positive
  if (entity.credit_limit && entity.credit_limit < 0) {
    throw {
      statusCode: 400,
      message: 'Validation failed',
      errors: [{
        field: 'credit_limit',
        code: 'INVALID_VALUE',
        message: 'Credit limit must be positive'
      }]
    };
  }

  return entity;
}

/**
 * Validate Shipper before update
 */
export async function beforeUpdate(entity, existingEntity, context) {
  const role = getUserRole(context);

  // RBAC: Customers cannot update their own records (read-only)
  if (role === 'customer') {
    throw {
      statusCode: 403,
      message: 'Customers cannot modify their own profile. Contact your broker.'
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
      entity_type: 'Shipper',
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
 * Redact after read
 */
export async function afterRead(entity, context) {
  const role = getUserRole(context);
  
  if (role === 'admin' || role === 'broker') {
    return entity;
  }

  // RBAC: Customers can only read their own data
  if (role === 'customer' && entity.id !== context.user?.customer_id) {
    throw {
      statusCode: 403,
      message: 'You can only access your own customer profile'
    };
  }

  // Redact broker-only financial data
  const redacted = { ...entity };
  delete redacted.credit_score;
  delete redacted.credit_limit;
  delete redacted.total_revenue;
  delete redacted.notes;
  
  return redacted;
}