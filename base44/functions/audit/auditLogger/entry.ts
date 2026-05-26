/**
 * Audit Logging System
 * Tracks all data changes for compliance and forensics
 */

/**
 * Log entity action to AuditLog
 */
export async function logAudit(base44Client, params) {
  const {
    entityType,
    entityId,
    action, // CREATE, UPDATE, DELETE, READ
    userId,
    userEmail,
    userRole,
    changes = {},
    beforeSnapshot = null,
    afterSnapshot = null,
    ipAddress = null,
    userAgent = null,
    metadata = {}
  } = params;
  
  try {
    await base44Client.entities.AuditLog.create({
      entity_type: entityType,
      entity_id: entityId,
      action,
      user_id: userId,
      user_email: userEmail,
      user_role: userRole,
      changes_json: changes,
      before_snapshot: beforeSnapshot,
      after_snapshot: afterSnapshot,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata_json: metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Don't fail the request if audit logging fails, but log error
    console.error('Audit logging failed:', error);
  }
}

/**
 * Calculate changed fields between before/after
 */
export function getChangedFields(before, after) {
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
 * Determine if action should be audited
 */
export function shouldAudit(entityType, action) {
  // Always audit these entities
  const criticalEntities = [
    'Load', 'Carrier', 'Driver', 'Shipper', 'Invoice', 'Settlement',
    'ComplianceItem', 'Document', 'LaneRate', 'Payment'
  ];
  
  if (criticalEntities.includes(entityType)) {
    return true;
  }
  
  // Always audit deletes and sensitive updates
  if (action === 'DELETE') return true;
  if (action === 'UPDATE' && entityType.includes('Rate')) return true;
  
  return false;
}

/**
 * Sanitize data for audit (remove sensitive fields)
 */
export function sanitizeForAudit(data) {
  const sanitized = { ...data };
  
  // Remove sensitive fields that shouldn't be logged
  const sensitiveFields = ['password', 'api_key', 'secret', 'token', 'ssn'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}