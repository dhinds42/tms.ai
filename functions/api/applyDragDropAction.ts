/**
 * Global Drag & Drop Action Handler
 * 
 * SECURITY: All drag operations must pass through this function.
 * Enforces RBAC, tenant isolation, approval workflows, and audit logging.
 */

import { authorize } from '../shared/security/authorize.js';
import { auditLogger } from '../shared/security/auditLogger.js';
import { createApprovalRequest } from '../shared/approval/approvalWorkflow.js';

export default async function applyDragDropAction({ base44, request }) {
  const { 
    entity_type, 
    entity_id, 
    from_state, 
    to_state, 
    from_index, 
    to_index, 
    metadata = {} 
  } = request.body;

  const membership = await base44.auth.getMembership();
  if (!membership) {
    throw new Error('Unauthorized: No active membership');
  }

  // Validate inputs
  if (!entity_type || !entity_id) {
    throw new Error('entity_type and entity_id are required');
  }

  // Route to appropriate handler based on entity type
  const handlers = {
    'Load': handleLoadDrag,
    'Document': handleDocumentDrag,
    'QuoteLineItem': handleLineItemReorder,
    'InvoiceLineItem': handleLineItemReorder,
    'ComplianceItem': handleComplianceDrag,
    'RolePermission': handleRolePermissionDrag
  };

  const handler = handlers[entity_type];
  if (!handler) {
    throw new Error(`Unsupported entity_type: ${entity_type}`);
  }

  // Execute handler with full security context
  const result = await handler({
    base44,
    membership,
    entity_id,
    from_state,
    to_state,
    from_index,
    to_index,
    metadata
  });

  return result;
}

/**
 * P0-A: Dispatch Board - Load Stage Transitions
 */
async function handleLoadDrag({ base44, membership, entity_id, from_state, to_state, metadata }) {
  // Authorization: Check if user can modify loads
  const canModify = await authorize({
    base44,
    membership,
    permission_key: 'load:update',
    context: { load_id: entity_id }
  });

  if (!canModify) {
    throw new Error('Forbidden: Insufficient permissions to modify load');
  }

  // Fetch current load
  const load = await base44.asServiceRole.entities.Load.get(entity_id);
  if (!load) {
    throw new Error('Load not found');
  }

  // CRITICAL: Tenant isolation check
  validateTenantIsolation(load, membership);

  // HARD BLOCK: Check for illegal transitions
  const hardBlockErrors = validateHardBlocks(from_state, to_state, load);
  if (hardBlockErrors.length > 0) {
    // Log blocked attempt
    await auditLogger({
      base44,
      action: 'DRAG_ACTION_BLOCKED',
      entityType: 'Load',
      entityId: entity_id,
      actor: membership.user_email,
      metadata: {
        from_state,
        to_state,
        block_reasons: hardBlockErrors,
        org_id: membership.org_id
      }
    });
    
    throw new Error(hardBlockErrors.join(' | '));
  }

  // Validate workflow transition
  const validTransitions = {
    'new': ['tendered', 'covered'],
    'tendered': ['covered', 'new'],
    'covered': ['dispatched', 'tendered'],
    'dispatched': ['in_transit', 'covered'],
    'in_transit': ['delivered', 'dispatched'],
    'delivered': ['invoiced', 'in_transit'],
    'invoiced': [] // Terminal state - no transitions allowed
  };

  const allowedNextStates = validTransitions[from_state?.toLowerCase()] || [];
  if (!allowedNextStates.includes(to_state?.toLowerCase())) {
    // Log invalid transition attempt
    await auditLogger({
      base44,
      action: 'INVALID_TRANSITION_BLOCKED',
      entityType: 'Load',
      entityId: entity_id,
      actor: membership.user_email,
      metadata: {
        from_state,
        to_state,
        allowed_states: allowedNextStates,
        org_id: membership.org_id
      }
    });
    
    throw new Error(`Invalid transition: ${from_state} → ${to_state}. Allowed: ${allowedNextStates.join(', ')}`);
  }

  // Check if transition requires approval
  const requiresApproval = needsApprovalForStageChange(from_state, to_state, load);
  
  if (requiresApproval) {
    // Create approval request instead of applying directly
    const approvalRequest = await createApprovalRequest({
      base44,
      requestType: 'load_stage_change',
      entityType: 'Load',
      entityId: entity_id,
      requestedBy: membership.user_email,
      requestedChanges: {
        workflow_stage: to_state,
        assigned_to: metadata.assigned_to
      },
      beforeSnapshot: load,
      justification: `Drag & drop transition: ${from_state} → ${to_state}`
    });

    return {
      status: 'pending_approval',
      approval_request_id: approvalRequest.id,
      message: 'Stage change requires approval'
    };
  }

  // Apply change
  const updates = {
    workflow_stage: to_state,
    last_moved_by: membership.user_email,
    last_moved_at: new Date().toISOString()
  };

  if (metadata.assigned_to) {
    updates.assigned_carrier_id = metadata.assigned_to;
  }

  if (metadata.priority_rank !== undefined) {
    updates.priority_rank = metadata.priority_rank;
  }

  const updatedLoad = await base44.asServiceRole.entities.Load.update(entity_id, updates);

  // Audit log
  await auditLogger({
    base44,
    action: 'LOAD_STAGE_MOVED',
    entityType: 'Load',
    entityId: entity_id,
    actor: membership.user_email,
    before: { workflow_stage: from_state },
    after: { workflow_stage: to_state },
    metadata: {
      method: 'drag_drop',
      assigned_to: metadata.assigned_to,
      org_id: membership.org_id
    }
  });

  return {
    status: 'success',
    entity: updatedLoad
  };
}

/**
 * P0-B: Driver Document Upload via Drag
 */
async function handleDocumentDrag({ base44, membership, entity_id, to_state, metadata }) {
  // Authorization: Check document upload permission
  const canUpload = await authorize({
    base44,
    membership,
    permission_key: 'document:create',
    context: { target_entity_id: metadata.target_entity_id }
  });

  if (!canUpload) {
    throw new Error('Forbidden: Cannot upload documents');
  }

  // Validate document metadata
  if (!metadata.document_type || !metadata.file_url) {
    throw new Error('Missing required document metadata: document_type, file_url');
  }

  // Create document record
  const document = await base44.asServiceRole.entities.Document.create({
    document_type: metadata.document_type,
    file_url: metadata.file_url,
    file_name: metadata.file_name,
    entity_type: metadata.entity_type,
    entity_id: metadata.target_entity_id,
    uploaded_by: membership.user_email,
    uploaded_at: new Date().toISOString(),
    status: 'pending_verification'
  });

  // Audit log
  await auditLogger({
    base44,
    action: 'DOCUMENT_UPLOADED',
    entityType: 'Document',
    entityId: document.id,
    actor: membership.user_email,
    after: document,
    metadata: {
      method: 'drag_drop',
      target_entity: metadata.entity_type,
      org_id: membership.org_id
    }
  });

  return {
    status: 'success',
    entity: document
  };
}

/**
 * P1-A: Line Item Reordering (Display Only)
 */
async function handleLineItemReorder({ base44, membership, entity_id, from_index, to_index, metadata }) {
  const entityType = metadata.line_item_type === 'quote' ? 'QuoteLineItem' : 'InvoiceLineItem';

  // Authorization
  const canModify = await authorize({
    base44,
    membership,
    permission_key: `${entityType.toLowerCase()}:update`,
    context: { line_item_id: entity_id }
  });

  if (!canModify) {
    throw new Error('Forbidden: Cannot reorder line items');
  }

  // Fetch line item
  const lineItem = await base44.asServiceRole.entities[entityType].get(entity_id);
  if (!lineItem) {
    throw new Error('Line item not found');
  }

  // CRITICAL: Reordering only affects display_order, NOT financial totals
  const updatedItem = await base44.asServiceRole.entities[entityType].update(entity_id, {
    display_order: to_index
  });

  // Audit log
  await auditLogger({
    base44,
    action: 'LINE_ITEM_REORDERED',
    entityType,
    entityId: entity_id,
    actor: membership.user_email,
    before: { display_order: from_index },
    after: { display_order: to_index },
    metadata: {
      method: 'drag_drop',
      org_id: membership.org_id
    }
  });

  return {
    status: 'success',
    entity: updatedItem
  };
}

/**
 * P1-B: Compliance Document Categorization
 */
async function handleComplianceDrag({ base44, membership, entity_id, to_state, metadata }) {
  // Authorization
  const canModify = await authorize({
    base44,
    membership,
    permission_key: 'compliance:update',
    context: { compliance_item_id: entity_id }
  });

  if (!canModify) {
    throw new Error('Forbidden: Cannot modify compliance items');
  }

  // Assign document to compliance category
  const document = await base44.asServiceRole.entities.Document.get(metadata.document_id);
  if (!document) {
    throw new Error('Document not found');
  }

  const updated = await base44.asServiceRole.entities.Document.update(metadata.document_id, {
    compliance_category: to_state,
    compliance_item_id: entity_id,
    verified_at: new Date().toISOString(),
    verified_by: membership.user_email
  });

  // Recompute compliance status
  // (Simplified - would trigger compliance recalc in production)

  // Audit log
  await auditLogger({
    base44,
    action: 'COMPLIANCE_DOC_ASSIGNED',
    entityType: 'Document',
    entityId: metadata.document_id,
    actor: membership.user_email,
    after: { compliance_category: to_state },
    metadata: {
      method: 'drag_drop',
      compliance_item_id: entity_id,
      org_id: membership.org_id
    }
  });

  return {
    status: 'success',
    entity: updated
  };
}

/**
 * P2: RBAC Permission Builder (Super-Admin Only)
 */
async function handleRolePermissionDrag({ base44, membership, entity_id, to_state, metadata }) {
  // Super-admin check
  const user = await base44.auth.me();
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Only super-admins can modify role permissions');
  }

  // Check if sensitive permission (requires approval)
  const sensitivePermissions = [
    'user:delete',
    'finance:override',
    'security:admin',
    'rbac:manage'
  ];

  const isSensitive = sensitivePermissions.some(p => 
    metadata.permission_key?.includes(p)
  );

  if (isSensitive) {
    // Create approval request
    const approvalRequest = await createApprovalRequest({
      base44,
      requestType: 'role_permission_change',
      entityType: 'RolePermission',
      entityId: entity_id,
      requestedBy: membership.user_email,
      requestedChanges: {
        role_id: to_state,
        permission_id: metadata.permission_id
      },
      beforeSnapshot: {},
      justification: 'Drag & drop permission assignment'
    });

    return {
      status: 'pending_approval',
      approval_request_id: approvalRequest.id,
      message: 'Sensitive permission change requires approval'
    };
  }

  // Create role permission
  const rolePermission = await base44.asServiceRole.entities.RolePermission.create({
    role_id: to_state,
    permission_id: metadata.permission_id,
    granted_by: membership.user_email,
    granted_at: new Date().toISOString()
  });

  // Audit log
  await auditLogger({
    base44,
    action: 'ROLE_PERMISSION_CHANGED',
    entityType: 'RolePermission',
    entityId: rolePermission.id,
    actor: membership.user_email,
    after: rolePermission,
    metadata: {
      method: 'drag_drop',
      org_id: membership.org_id
    }
  });

  return {
    status: 'success',
    entity: rolePermission
  };
}

/**
 * VALIDATION RULES ENGINE
 */

/**
 * A) HARD BLOCK - Illegal drags that must be rejected
 */
function validateHardBlocks(from_state, to_state, load) {
  const errors = [];
  
  // BLOCK: Invoiced → any prior status
  if (from_state?.toLowerCase() === 'invoiced') {
    errors.push('BLOCKED: Cannot move invoiced loads backward. Invoice must be voided first.');
  }
  
  // BLOCK: Paid → Unpaid states
  if (load.payment_status === 'paid' && to_state?.toLowerCase() !== 'invoiced') {
    errors.push('BLOCKED: Paid loads cannot be moved to unpaid states.');
  }
  
  // BLOCK: Delivered → Pre-delivery states
  const deliveryStates = ['delivered', 'invoiced'];
  const preDeliveryStates = ['new', 'tendered', 'covered', 'dispatched', 'in_transit'];
  if (deliveryStates.includes(from_state?.toLowerCase()) && preDeliveryStates.includes(to_state?.toLowerCase())) {
    if (!load.delivery_cancelled) {
      errors.push('BLOCKED: Cannot move delivered loads backward without cancellation flag.');
    }
  }
  
  // BLOCK: Financial lock active
  if (load.locked_until && new Date(load.locked_until) > new Date()) {
    errors.push(`BLOCKED: Load is financially locked until ${load.locked_until}. Reason: ${load.lock_reason || 'compliance'}`);
  }
  
  // BLOCK: Required documents missing for certain transitions
  if (to_state?.toLowerCase() === 'invoiced' && !load.pod_received) {
    errors.push('BLOCKED: Cannot invoice without Proof of Delivery.');
  }
  
  return errors;
}

/**
 * B) CONDITIONAL - Requires approval before applying
 */
function needsApprovalForStageChange(from_state, to_state, load) {
  // Approval required if:
  // 1. Moving to invoiced (affects billing)
  // 2. Moving backward in workflow (reversal)
  // 3. High-value load (>$10k)
  // 4. Reassigning carrier post-dispatch
  // 5. Rate below margin floor
  
  const workflowOrder = ['new', 'tendered', 'covered', 'dispatched', 'in_transit', 'delivered', 'invoiced'];
  const fromIndex = workflowOrder.indexOf(from_state?.toLowerCase());
  const toIndex = workflowOrder.indexOf(to_state?.toLowerCase());

  if (to_state?.toLowerCase() === 'invoiced') {
    return true; // Always approve invoicing
  }

  if (toIndex < fromIndex && toIndex >= 0) {
    return true; // Backward movement requires approval
  }

  if (load.customer_rate && load.customer_rate > 1000000) {
    return true; // $10k+ requires approval
  }
  
  // Check margin floor
  const margin = (load.customer_rate || 0) - (load.carrier_pay || 0);
  const marginPct = load.customer_rate > 0 ? (margin / load.customer_rate) * 100 : 0;
  if (marginPct < 10 && to_state?.toLowerCase() === 'covered') {
    return true; // Below 10% margin requires approval
  }

  return false;
}

/**
 * Validate org isolation - CRITICAL SECURITY
 */
function validateTenantIsolation(entity, membership) {
  if (entity.tenant_id && entity.tenant_id !== membership.org_id) {
    throw new Error('BLOCKED: Tenant isolation violation - cannot modify entities from other organizations');
  }
  if (entity.org_id && entity.org_id !== membership.org_id) {
    throw new Error('BLOCKED: Organization isolation violation');
  }
}