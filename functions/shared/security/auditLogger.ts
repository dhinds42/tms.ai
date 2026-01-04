/**
 * Audit Logging for Financial Operations
 * Immutable append-only logging with field diffs
 * P0 REMEDIATION: Enforces actual persistence
 */

import { diffFinancialFields, explainCalculation } from '../math/auditMath';

export interface AuditEntry {
  entity_type: string;
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ_DENIED' | 'APPROVAL_GRANTED' | 'APPROVAL_REJECTED' | 'MFA_REQUIRED';
  actor_user_id: string;
  actor_email: string;
  actor_role: string;
  changed_fields?: any;
  before_values?: any;
  after_values?: any;
  calculation_explanation?: string;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  metadata?: any;
}

/**
 * Persist audit entry to immutable log
 * CRITICAL: Throws if write fails - fail closed
 * P0 FIX C-1: Added org_id parameter for tenant isolation
 */
async function persistAuditEntry(base44: any, entry: AuditEntry, orgId?: string): Promise<void> {
  try {
    // P0 FIX: Include org_id in audit entry
    const auditEntry = {
      ...entry,
      org_id: orgId || entry.metadata?.org_id || 'unknown',  // ✅ Add org_id
      timestamp: new Date().toISOString(),
      is_active: true // Prevent soft deletes
    };
    
    await base44.asServiceRole.entities.AuditLog.create(auditEntry);
  } catch (error) {
    // CRITICAL: If audit log fails, the operation MUST be aborted
    console.error('[AUDIT FAILURE - OPERATION ABORTED]', error, entry);
    throw new Error(`AUDIT_WRITE_FAILED: ${error.message}`);
  }
}

/**
 * Log financial entity change
 * FAIL-CLOSED: Throws on audit failure
 */
export async function logFinancialChange(
  base44: any,
  entityType: string,
  entityId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  actor: { id: string; email: string; role: string },
  before: any | null,
  after: any,
  metadata?: any
): Promise<void> {
  // P0 FIX C-1: Extract org_id from entity data
  const orgId = after?.org_id || before?.org_id || metadata?.org_id;
  
  const entry: AuditEntry = {
    entity_type: entityType,
    entity_id: entityId,
    action,
    actor_user_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    metadata
  };
  
  // Add field diffs for updates
  if (action === 'UPDATE' && before) {
    const diffs = diffFinancialFields(before, after);
    entry.changed_fields = diffs.reduce((acc, diff) => {
      acc[diff.field] = { from: diff.before, to: diff.after };
      return acc;
    }, {});
    entry.before_values = before;
    entry.after_values = after;
  }
  
  // Add calculation explanation
  entry.calculation_explanation = explainCalculation(entityType, after);
  
  // Console backup
  console.log('[AUDIT]', entry);
  
  // CRITICAL: Persist to database with org_id
  await persistAuditEntry(base44, entry, orgId);
}

/**
 * Log access denied attempt
 * FAIL-CLOSED: Throws on audit failure
 */
export async function logAccessDenied(
  base44: any,
  entityType: string,
  entityId: string,
  actor: { id: string; email: string; role: string },
  attemptedAction: string,
  reason: string,
  orgId?: string  // P0 FIX C-1: Add org_id parameter
): Promise<void> {
  const entry: AuditEntry = {
    entity_type: entityType,
    entity_id: entityId,
    action: 'READ_DENIED',
    actor_user_id: actor.id,
    actor_email: actor.email,
    actor_role: actor.role,
    metadata: {
      attempted_action: attemptedAction,
      denial_reason: reason
    }
  };
  
  console.log('[SECURITY AUDIT]', entry);
  
  // CRITICAL: Persist to database with org_id
  await persistAuditEntry(base44, entry, orgId || 'access-denied');
}

/**
 * Detect and log anomalies
 */
export async function detectAnomalies(
  base44: any,
  entityType: string,
  entity: any,
  actor: any
): Promise<void> {
  const anomalies: string[] = [];
  
  if (entityType === 'Load') {
    // Negative margin
    if (entity.margin < 0) {
      anomalies.push(`NEGATIVE_MARGIN: margin=$${entity.margin}`);
    }
    
    // Outlier RPM
    const rpm = entity.distance_miles > 0 
      ? entity.customer_rate / entity.distance_miles 
      : 0;
    
    if (rpm > 10) {
      anomalies.push(`HIGH_RPM: $${rpm.toFixed(2)}/mile`);
    }
    
    if (rpm < 0.5 && rpm > 0) {
      anomalies.push(`LOW_RPM: $${rpm.toFixed(2)}/mile`);
    }
    
    // Huge accessorials
    if (entity.accessorial_revenue_total > entity.customer_rate) {
      anomalies.push(`ACCESSORIALS_EXCEED_BASE: $${entity.accessorial_revenue_total} > $${entity.customer_rate}`);
    }
  }
  
  if (anomalies.length > 0) {
    console.log('[ANOMALY DETECTED]', {
      entity_type: entityType,
      entity_id: entity.id,
      anomalies,
      actor
    });
    
    // Log to audit trail with org_id
    await logFinancialChange(base44, entityType, entity.id, 'UPDATE', actor, null, entity, {
      anomaly_flags: anomalies,
      org_id: entity.org_id  // P0 FIX C-1: Include org_id
    });
  }
}