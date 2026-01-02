/**
 * LaneRate - Before Update Hook
 * Enforce authorization and approval workflow
 */

import { authorize, enforceOrgIsolation } from '../../shared/rbac/authorizationEngine';
import { requiresApproval, createApprovalRequest } from '../../shared/approval/approvalWorkflow';

export default async function beforeUpdate({ id, data, user, base44 }) {
  try {
    // Get existing entity
    const existing = await base44.asServiceRole.entities.LaneRate.filter({ id });
    if (existing.length === 0) {
      return { ok: false, errors: [{ field: 'id', code: 'NOT_FOUND', message: 'Lane rate not found' }] };
    }
    
    const laneRate = existing[0];
    
    // Get user's membership
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_email: user?.email,
      status: 'active'
    }, undefined, 1);
    
    if (memberships.length === 0) {
      return { ok: false, errors: [{ field: 'user', code: 'NO_MEMBERSHIP' }] };
    }
    
    const membership = memberships[0];
    
    // Enforce tenant isolation
    if (!enforceOrgIsolation(laneRate, membership.org_id)) {
      await base44.asServiceRole.entities.AuditLog.create({
        entity_type: 'LaneRate',
        entity_id: id,
        action: 'ACCESS_DENIED',
        actor_email: user?.email,
        metadata: { reason: 'Cross-org access attempted' }
      });
      
      return { ok: false, errors: [{ field: 'laneRate', code: 'UNAUTHORIZED', message: 'Access denied' }] };
    }
    
    // Check permission
    const authResult = await authorize(base44, user, 'laneRate.update', laneRate, membership.org_id);
    if (!authResult.authorized) {
      return { ok: false, errors: [{ field: 'laneRate', code: 'UNAUTHORIZED', message: authResult.reason }] };
    }
    
    // Check if requires approval
    const oldRate = laneRate.customer_rate || 0;
    const newRate = data.customer_rate || oldRate;
    const rateDelta = Math.abs(newRate - oldRate);
    
    if (requiresApproval('rate_change', rateDelta)) {
      await createApprovalRequest(base44, {
        orgId: membership.org_id,
        requestType: 'rate_change',
        entityType: 'LaneRate',
        entityId: id,
        requestedBy: user.email,
        requestedChanges: data,
        beforeSnapshot: laneRate,
        justification: `Rate change from $${(oldRate / 100).toFixed(2)} to $${(newRate / 100).toFixed(2)}`
      });
      
      return {
        ok: false,
        errors: [{
          field: 'laneRate',
          code: 'APPROVAL_REQUIRED',
          message: 'Large rate change requires approval'
        }]
      };
    }
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'LaneRate',
      entity_id: id,
      action: 'LANE_RATE_UPDATE',
      actor_email: user?.email,
      before_values: laneRate,
      after_values: data
    });
    
    return { ok: true, data };
    
  } catch (error) {
    return { ok: false, errors: [{ field: 'system', code: 'ERROR', message: error.message }] };
  }
}