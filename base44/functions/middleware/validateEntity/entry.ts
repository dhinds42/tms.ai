/**
 * Entity Validation Middleware
 * Validates all entity create/update operations server-side
 */

import { validate } from '../validation/schemas.js';
import { getUserRole, hasPermission } from '../auth/permissions.js';

/**
 * Validate entity before create
 */
export async function validateCreate(entityType, data, user, operatingMode) {
  const context = {
    user,
    role: getUserRole(user, operatingMode),
    operatingMode,
    allowNegativeMargin: user?.role === 'admin' // Only admin can override
  };
  
  // Run validation
  const result = validate(entityType, data, context);
  
  if (!result.valid) {
    throw {
      statusCode: 400,
      error: 'Validation Failed',
      errors: result.errors
    };
  }
  
  return data;
}

/**
 * Validate entity before update
 */
export async function validateUpdate(entityType, entityId, data, existingData, user, operatingMode) {
  const context = {
    user,
    role: getUserRole(user, operatingMode),
    operatingMode,
    allowNegativeMargin: user?.role === 'admin'
  };
  
  // Merge with existing for validation
  const mergedData = { ...existingData, ...data };
  
  // Run validation
  const result = validate(entityType, mergedData, context);
  
  if (!result.valid) {
    throw {
      statusCode: 400,
      error: 'Validation Failed',
      errors: result.errors
    };
  }
  
  // Special validation: status transitions
  if (entityType === 'Load' && data.status && existingData.status) {
    const { isValidStatusTransition } = await import('../auth/permissions.js');
    if (!isValidStatusTransition(existingData.status, data.status)) {
      throw {
        statusCode: 400,
        error: 'Invalid Status Transition',
        errors: [{
          field: 'status',
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from ${existingData.status} to ${data.status}`
        }]
      };
    }
  }
  
  return data;
}

/**
 * Check for duplicates before create
 */
export async function checkDuplicates(entityType, data, base44Client) {
  const duplicateChecks = {
    'Carrier': { field: 'mc_number', value: data.mc_number },
    'Driver': { field: 'cdl_number', value: data.cdl_number },
    'Shipper': { field: 'customer_code', value: data.customer_code },
    'Invoice': { field: 'invoice_number', value: data.invoice_number },
    'Load': { field: 'load_number', value: data.load_number }
  };
  
  const check = duplicateChecks[entityType];
  if (!check || !check.value) return; // No duplicate check needed
  
  const existing = await base44Client.entities[entityType].filter({
    [check.field]: check.value
  });
  
  if (existing.length > 0) {
    throw {
      statusCode: 409,
      error: 'Duplicate Record',
      errors: [{
        field: check.field,
        code: 'DUPLICATE',
        message: `${entityType} with ${check.field} '${check.value}' already exists`
      }]
    };
  }
}