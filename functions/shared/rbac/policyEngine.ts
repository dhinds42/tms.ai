/**
 * Field Redaction Policy Engine
 * Data-driven field hiding based on FieldRedactionPolicy
 */

/**
 * Apply field redaction policies to entity
 */
export async function applyFieldRedaction(base44, entity, entityName, roleKeys, orgType) {
  try {
    if (!entity) return entity;
    
    // Query applicable policies
    const policies = await base44.asServiceRole.entities.FieldRedactionPolicy.filter({
      entity_name: entityName,
      is_active: true,
      $or: [
        { org_type: orgType },
        { org_type: null } // Global policies
      ]
    });
    
    // Filter policies matching user's roles
    const applicablePolicies = policies.filter(p => 
      roleKeys.includes(p.role_key)
    ).sort((a, b) => (a.priority || 100) - (b.priority || 100)); // Lower priority = higher precedence
    
    if (applicablePolicies.length === 0) {
      return entity; // No redaction needed
    }
    
    const redacted = { ...entity };
    
    // Collect all fields to hide
    const fieldsToHide = new Set();
    const fieldsToMask = new Set();
    
    for (const policy of applicablePolicies) {
      if (policy.hidden_fields) {
        policy.hidden_fields.forEach(f => fieldsToHide.add(f));
      }
      if (policy.masked_fields) {
        policy.masked_fields.forEach(f => fieldsToMask.add(f));
      }
    }
    
    // Remove hidden fields
    for (const field of fieldsToHide) {
      delete redacted[field];
    }
    
    // Mask fields (partial redaction)
    for (const field of fieldsToMask) {
      if (redacted[field]) {
        redacted[field] = maskValue(redacted[field]);
      }
    }
    
    return redacted;
    
  } catch (error) {
    console.error('Error applying field redaction:', error);
    return entity; // Fail open to avoid breaking app
  }
}

/**
 * Mask sensitive value
 */
function maskValue(value) {
  if (typeof value === 'string') {
    if (value.length <= 4) return '***';
    return '***' + value.slice(-4);
  }
  if (typeof value === 'number') {
    return '***';
  }
  return '***';
}

/**
 * Get redaction policies for role
 */
export async function getRedactionPolicies(base44, roleKey, entityName, orgType) {
  try {
    const policies = await base44.asServiceRole.entities.FieldRedactionPolicy.filter({
      role_key: roleKey,
      entity_name: entityName,
      is_active: true,
      $or: [
        { org_type: orgType },
        { org_type: null }
      ]
    });
    
    return policies.sort((a, b) => (a.priority || 100) - (b.priority || 100));
  } catch (error) {
    console.error('Error fetching redaction policies:', error);
    return [];
  }
}

/**
 * Batch apply redaction to array of entities
 */
export async function applyBatchRedaction(base44, entities, entityName, roleKeys, orgType) {
  if (!Array.isArray(entities)) return entities;
  
  const redacted = [];
  for (const entity of entities) {
    const redactedEntity = await applyFieldRedaction(base44, entity, entityName, roleKeys, orgType);
    redacted.push(redactedEntity);
  }
  
  return redacted;
}