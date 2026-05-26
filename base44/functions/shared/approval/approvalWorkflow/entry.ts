/**
 * Dual-Control Approval Workflow
 * Maker/Checker pattern for sensitive operations
 */

import { requireMFA } from '../security/mfaEnforcement';

/**
 * Operations that require dual approval
 */
const REQUIRES_APPROVAL = {
  bank_account_change: { threshold: 0, mfa: true },
  instant_pay_enable: { threshold: 0, mfa: true },
  negative_margin_override: { threshold: -100, mfa: true },
  carrier_pay_override: { threshold: 1000000, mfa: true }, // $10k in cents
  rate_change: { threshold: 500000, mfa: false }, // $5k
  large_payment: { threshold: 10000000, mfa: true }, // $100k
  user_role_change: { threshold: 0, mfa: true }
};

/**
 * Check if change requires approval
 */
export function requiresApproval(requestType, changeAmount = 0) {
  const rule = REQUIRES_APPROVAL[requestType];
  if (!rule) return false;
  
  return Math.abs(changeAmount) >= Math.abs(rule.threshold);
}

/**
 * Create approval request
 */
export async function createApprovalRequest(base44, {
  orgId,
  requestType,
  entityType,
  entityId,
  requestedBy,
  requestedChanges,
  beforeSnapshot,
  justification
}) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // 72 hour expiry
    
    const request = await base44.asServiceRole.entities.ApprovalRequest.create({
      org_id: orgId,
      request_type: requestType,
      entity_type: entityType,
      entity_id: entityId,
      requested_by: requestedBy,
      requested_at: new Date().toISOString(),
      requested_changes: requestedChanges,
      before_snapshot: beforeSnapshot,
      justification,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      requires_mfa: REQUIRES_APPROVAL[requestType]?.mfa || false
    });
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: entityType,
      entity_id: entityId,
      action: 'APPROVAL_REQUESTED',
      actor_email: requestedBy,
      metadata: {
        approval_request_id: request.id,
        request_type: requestType,
        changes: requestedChanges
      }
    });
    
    return { ok: true, request };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Approve request (with maker/checker enforcement)
 */
export async function approveRequest(base44, requestId, approver, user) {
  try {
    const requests = await base44.asServiceRole.entities.ApprovalRequest.filter({
      id: requestId
    });
    
    if (requests.length === 0) {
      return { ok: false, error: 'Request not found' };
    }
    
    const request = requests[0];
    
    // Maker cannot approve own request
    if (request.requested_by === approver) {
      return {
        ok: false,
        error: 'SELF_APPROVAL_DENIED',
        message: 'You cannot approve your own request. Dual control required.'
      };
    }
    
    // Check if expired
    if (new Date(request.expires_at) < new Date()) {
      await base44.asServiceRole.entities.ApprovalRequest.update(requestId, {
        status: 'rejected',
        rejected_by: 'system',
        rejected_at: new Date().toISOString(),
        rejection_reason: 'Expired'
      });
      return { ok: false, error: 'Request expired' };
    }
    
    // Check MFA if required
    if (request.requires_mfa) {
      const mfaCheck = await requireMFA(base44, user, 'approve_request');
      if (!mfaCheck.ok) {
        return mfaCheck;
      }
    }
    
    // Approve
    await base44.asServiceRole.entities.ApprovalRequest.update(requestId, {
      status: 'approved',
      approved_by: approver,
      approved_at: new Date().toISOString()
    });
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: request.entity_type,
      entity_id: request.entity_id,
      action: 'APPROVAL_GRANTED',
      actor_email: approver,
      metadata: {
        approval_request_id: requestId,
        requested_by: request.requested_by
      }
    });
    
    return { ok: true, request: { ...request, status: 'approved' } };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Apply approved changes
 */
export async function applyApprovedChanges(base44, requestId, appliedBy) {
  try {
    const requests = await base44.asServiceRole.entities.ApprovalRequest.filter({
      id: requestId,
      status: 'approved'
    });
    
    if (requests.length === 0) {
      return { ok: false, error: 'No approved request found' };
    }
    
    const request = requests[0];
    
    // Apply changes to entity
    await base44.asServiceRole.entities[request.entity_type].update(
      request.entity_id,
      request.requested_changes
    );
    
    // Mark as applied
    await base44.asServiceRole.entities.ApprovalRequest.update(requestId, {
      status: 'applied',
      applied_by: appliedBy,
      applied_at: new Date().toISOString()
    });
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: request.entity_type,
      entity_id: request.entity_id,
      action: 'APPROVED_CHANGES_APPLIED',
      actor_email: appliedBy,
      before_values: request.before_snapshot,
      after_values: request.requested_changes,
      metadata: {
        approval_request_id: requestId,
        requested_by: request.requested_by,
        approved_by: request.approved_by
      }
    });
    
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

/**
 * Reject request
 */
export async function rejectRequest(base44, requestId, rejectedBy, reason) {
  try {
    await base44.asServiceRole.entities.ApprovalRequest.update(requestId, {
      status: 'rejected',
      rejected_by: rejectedBy,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason
    });
    
    const requests = await base44.asServiceRole.entities.ApprovalRequest.filter({ id: requestId });
    const request = requests[0];
    
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: request.entity_type,
      entity_id: request.entity_id,
      action: 'APPROVAL_REJECTED',
      actor_email: rejectedBy,
      metadata: {
        approval_request_id: requestId,
        reason
      }
    });
    
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}