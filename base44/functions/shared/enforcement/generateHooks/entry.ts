/**
 * HOOK GENERATOR - Creates standardized entity hooks
 * P0 REMEDIATION: Ensures consistent enforcement across all entities
 */

import { enforceRead, enforceCreate, enforceUpdate } from './requestContext';

/**
 * Generate beforeRead hook for tenant-scoped entity
 */
export function generateBeforeReadHook(entityName, options = {}) {
  const { requireAudit = false } = options;
  
  return async function beforeRead({ query, user, base44 }) {
    const result = await enforceRead({
      base44,
      user,
      entityName,
      query
    });
    
    if (!result.ok) {
      return result;
    }
    
    return { ok: true, query: result.query };
  };
}

/**
 * Generate beforeCreate hook for tenant-scoped entity
 */
export function generateBeforeCreateHook(entityName, options = {}) {
  const { requireAudit = false } = options;
  
  return async function beforeCreate({ data, user, base44 }) {
    const result = await enforceCreate({
      base44,
      user,
      entityName,
      data,
      requireAudit
    });
    
    if (!result.ok) {
      return result;
    }
    
    return { ok: true, data: result.data };
  };
}

/**
 * Generate beforeUpdate hook for tenant-scoped entity
 */
export function generateBeforeUpdateHook(entityName, options = {}) {
  const { requireAudit = false } = options;
  
  return async function beforeUpdate({ id, data, existingData, user, base44 }) {
    const result = await enforceUpdate({
      base44,
      user,
      entityName,
      existingData,
      data,
      requireAudit
    });
    
    if (!result.ok) {
      return result;
    }
    
    return { ok: true, data: result.data };
  };
}

/**
 * Export standard hooks for an entity
 */
export function generateStandardHooks(entityName, options = {}) {
  return {
    beforeRead: generateBeforeReadHook(entityName, options),
    beforeCreate: generateBeforeCreateHook(entityName, options),
    beforeUpdate: generateBeforeUpdateHook(entityName, options)
  };
}