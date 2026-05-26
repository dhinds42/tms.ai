/**
 * LaneRate - Before Create Hook
 * Enforce tenant isolation, authorization, and approval workflow
 */

import { authorize } from '../../shared/rbac/authorizationEngine';
import { requiresApproval, createApprovalRequest } from '../../shared/approval/approvalWorkflow';

export default async function beforeCreate({ data, user, base44 }) {
  try {
    // Get user's active membership
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_email: user?.email,
      status: 'active'
    }, undefined, 1);
    
    if (memberships.length === 0) {
      return {
        ok: false,
        errors: [{
          field: 'user',
          code: 'NO_MEMBERSHIP',
          message: 'No active organization membership found'
        }]
      };
    }
    
    const membership = memberships[0];
    
    // Force org_id to user's org (prevent cross-org creation)
    data.org_id = membership.org_id;
    
    // Check permission
    const authResult = await authorize(base44, user, 'laneRate.create', null, membership.org_id);
    
    if (!authResult.authorized) {
      return {
        ok: false,
        errors: [{
          field: 'laneRate',
          code: 'UNAUTHORIZED',
          message: authResult.reason
        }]
      };
    }
    
    // Check if requires approval (large rate changes)
    const rateAmount = data.customer_rate || 0;
    if (requiresApproval('rate_change', rateAmount)) {
      // Create approval request instead of creating directly
      await createApprovalRequest(base44, {
        orgId: membership.org_id,
        requestType: 'rate_change',
        entityType: 'LaneRate',
        entityId: 'pending',
        requestedBy: user.email,
        requestedChanges: data,
        beforeSnapshot: {},
        justification: `New lane rate: $${(rateAmount / 100).toFixed(2)}`
      });
      
      return {
        ok: false,
        errors: [{
          field: 'laneRate',
          code: 'APPROVAL_REQUIRED',
          message: 'Large rate change requires approval. Request submitted.'
        }]
      };
    }
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'LaneRate',
      entity_id: 'creating',
      action: 'LANE_RATE_CREATE',
      actor_email: user?.email,
      actor_role: user?.role,
      after_values: data
    });
    
    return { ok: true, data };
    
  } catch (error) {
    console.error('LaneRate beforeCreate error:', error);
    return {
      ok: false,
      errors: [{
        field: 'system',
        code: 'INTERNAL_ERROR',
        message: 'Failed to create lane rate'
      }]
    };
  }
}