/**
 * AccessorialRequest - Before Update Hook
 * Handles approval workflow and applies to pay
 */

export default async function beforeUpdate({ id, data, base44, user }) {
  const existing = await base44.entities.AccessorialRequest.filter({ id });
  if (existing.length === 0) {
    return { ok: false, error: 'Accessorial request not found' };
  }
  const existingRequest = existing[0];

  // APPROVAL WORKFLOW
  if (data.approval_status && data.approval_status !== existingRequest.approval_status) {
    const role = user?.role;
    
    // Only carrier/broker/admin can approve
    if (role !== 'carrier' && role !== 'broker' && role !== 'admin') {
      return {
        ok: false,
        error: 'Unauthorized: only carrier/broker/admin can approve accessorials'
      };
    }

    if (data.approval_status === 'approved') {
      data.approved_by = user?.email;
      data.approved_at = new Date().toISOString();
      data.approved_amount_cents = data.approved_amount_cents || existingRequest.computed_eligible_amount_cents;
      
      // Mark as applied to pay (actual settlement linking would happen in settlement creation)
      data.applied_to_pay = true;

    } else if (data.approval_status === 'denied') {
      data.approved_by = user?.email;
      data.approved_at = new Date().toISOString();
      // denial_reason should be provided
    }

    // Audit log
    await base44.entities.AuditLog.create({
      entity_type: 'AccessorialRequest',
      entity_id: id,
      action: 'UPDATE',
      actor_user_id: user?.id,
      actor_email: user?.email,
      actor_role: role,
      before_values: { approval_status: existingRequest.approval_status },
      after_values: { 
        approval_status: data.approval_status,
        approved_amount_cents: data.approved_amount_cents
      },
      changed_fields: {
        approval_status: {
          from: existingRequest.approval_status,
          to: data.approval_status
        }
      }
    });
  }

  return { ok: true, data };
}