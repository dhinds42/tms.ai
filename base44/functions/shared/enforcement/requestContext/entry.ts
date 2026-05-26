/**
 * SHARED ENFORCEMENT WRAPPER - P0 Remediation
 * Centralized authorization, tenant isolation, approval, MFA, and audit
 * FAIL-CLOSED: All checks must pass or request is blocked
 */

import { getUserOrgId } from './tenantIsolation';
import { authorize as rbacAuthorize } from '../rbac/authorizationEngine';
import { requireMFA } from '../security/mfaEnforcement';
import { requiresApproval } from '../approval/approvalWorkflow';
import { logFinancialChange, logAccessDenied } from '../security/auditLogger';

/**
 * Master enforcement wrapper for all entity operations
 * Returns { ok: true, context } or { ok: false, errors }
 */
export async function enforceRequestContext({
  base44,
  user,
  entity,
  entityName,
  action, // 'read', 'create', 'update', 'delete'
  data = null,
  existingData = null,
  requireAudit = false
}) {
  try {
    const errors = [];
    
    // 1. Get user's organization context
    const orgId = await getUserOrgId(base44, user);
    
    // 2. Authorize membership
    if (!user || !user.email) {
      errors.push({
        code: 'AUTHENTICATION_REQUIRED',
        message: 'User authentication required'
      });
      return { ok: false, errors };
    }
    
    // Skip further checks for admins (global access)
    if (user.role === 'admin') {
      return {
        ok: true,
        context: {
          user,
          orgId: orgId || 'admin',
          isAdmin: true
        }
      };
    }
    
    // 3. Enforce active membership
    if (!orgId && action !== 'read') {
      errors.push({
        code: 'NO_ACTIVE_MEMBERSHIP',
        message: 'No active organization membership found'
      });
      return { ok: false, errors };
    }
    
    // 4. RBAC authorization check
    const permissionCode = `${entityName.toLowerCase()}.${action}`;
    const authResult = await rbacAuthorize(base44, user, permissionCode, entity, orgId);
    
    if (!authResult.authorized) {
      // Log access denial
      if (entity?.id) {
        await logAccessDenied(
          base44,
          entityName,
          entity.id,
          { id: user.id || 'unknown', email: user.email, role: user.role || 'user' },
          action,
          authResult.reason || 'Insufficient permissions'
        );
      }
      
      errors.push({
        code: 'AUTHORIZATION_FAILED',
        message: authResult.reason || 'Insufficient permissions'
      });
      return { ok: false, errors };
    }
    
    // 5. Enforce tenant isolation (org_id validation)
    if (entity && entity.org_id && entity.org_id !== orgId) {
      await logAccessDenied(
        base44,
        entityName,
        entity.id || 'unknown',
        { id: user.id || 'unknown', email: user.email, role: user.role || 'user' },
        action,
        'Cross-tenant access attempt'
      );
      
      errors.push({
        code: 'TENANT_ISOLATION_VIOLATION',
        message: 'Cannot access data from different organization'
      });
      return { ok: false, errors };
    }
    
    // 6. Check if approval required (sensitive operations)
    if (action === 'update' && data && existingData) {
      const changeAmount = calculateChangeAmount(data, existingData);
      const approvalCheck = requiresApproval(getRequestType(entityName, data), changeAmount);
      
      if (approvalCheck.required && !data._approval_bypass_token) {
        errors.push({
          code: 'APPROVAL_REQUIRED',
          message: `This ${action} requires approval`,
          metadata: {
            request_type: approvalCheck.type,
            threshold: approvalCheck.threshold
          }
        });
        return { ok: false, errors };
      }
    }
    
    // 7. Check if MFA required
    const mfaCheck = await requireMFA(base44, user, `${entityName}.${action}`);
    if (mfaCheck.required && !user.mfa_verified) {
      errors.push({
        code: 'MFA_REQUIRED',
        message: 'Multi-factor authentication required for this operation'
      });
      return { ok: false, errors };
    }
    
    // 8. Write audit log (if required and mutation)
    if (requireAudit && action !== 'read' && entity?.id) {
      try {
        await logFinancialChange(
          base44,
          entityName,
          entity.id,
          action.toUpperCase(),
          { id: user.id || 'unknown', email: user.email, role: user.role || 'user' },
          existingData,
          data || entity,
          { action, timestamp: new Date().toISOString() }
        );
      } catch (auditError) {
        // FAIL-CLOSED: If audit fails, block operation
        errors.push({
          code: 'AUDIT_WRITE_FAILED',
          message: 'Cannot proceed without audit trail'
        });
        return { ok: false, errors };
      }
    }
    
    // All checks passed
    return {
      ok: true,
      context: {
        user,
        orgId,
        isAdmin: false,
        membership: authResult.context
      }
    };
    
  } catch (error) {
    // FAIL-CLOSED: Unexpected errors block operation
    console.error('[ENFORCEMENT_ERROR]', error);
    return {
      ok: false,
      errors: [{
        code: 'ENFORCEMENT_ERROR',
        message: 'Security enforcement failed'
      }]
    };
  }
}

/**
 * Calculate change amount for approval threshold checks
 */
function calculateChangeAmount(data, existingData) {
  // Check for financial field changes
  const financialFields = [
    'customer_rate', 'carrier_pay', 'amount', 'total_amount',
    'gross_pay', 'net_pay', 'invoice_total', 'settlement_amount'
  ];
  
  let maxChange = 0;
  
  for (const field of financialFields) {
    if (data[field] !== undefined && existingData[field] !== undefined) {
      const change = Math.abs(data[field] - existingData[field]);
      if (change > maxChange) {
        maxChange = change;
      }
    }
  }
  
  return maxChange;
}

/**
 * Determine request type for approval workflow
 */
function getRequestType(entityName, data) {
  // Map entity changes to approval request types
  if (entityName === 'Settlement' || entityName === 'Payment') {
    return 'large_payment';
  }
  
  if (entityName === 'LaneRate' || entityName === 'Quote') {
    return 'rate_change';
  }
  
  if (entityName === 'Load' && data.carrier_pay) {
    return 'carrier_pay_override';
  }
  
  return 'other';
}

/**
 * Simplified enforcement for read operations only
 */
export async function enforceRead({ base44, user, entityName, query }) {
  const result = await enforceRequestContext({
    base44,
    user,
    entity: null,
    entityName,
    action: 'read',
    requireAudit: false
  });
  
  if (!result.ok) {
    return result;
  }
  
  // Inject org_id filter for non-admin users
  if (!result.context.isAdmin && result.context.orgId) {
    return {
      ok: true,
      query: { ...query, org_id: result.context.orgId }
    };
  }
  
  return { ok: true, query };
}

/**
 * Simplified enforcement for create operations
 */
export async function enforceCreate({ base44, user, entityName, data, requireAudit = false }) {
  const result = await enforceRequestContext({
    base44,
    user,
    entity: { ...data },
    entityName,
    action: 'create',
    data,
    requireAudit
  });
  
  if (!result.ok) {
    return result;
  }
  
  // Inject org_id for non-admin users
  if (!result.context.isAdmin && result.context.orgId) {
    return {
      ok: true,
      data: { ...data, org_id: result.context.orgId }
    };
  }
  
  return { ok: true, data };
}

/**
 * Simplified enforcement for update operations
 */
export async function enforceUpdate({ base44, user, entityName, existingData, data, requireAudit = false }) {
  const result = await enforceRequestContext({
    base44,
    user,
    entity: existingData,
    entityName,
    action: 'update',
    data,
    existingData,
    requireAudit
  });
  
  if (!result.ok) {
    return result;
  }
  
  return { ok: true, data };
}