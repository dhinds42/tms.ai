/**
 * PayConfidence - Before Update Hook
 * Enforces state transition rules and RBAC
 */

export default async function beforeUpdate({ id, data, base44, user }) {
  const role = user?.role;

  // Fetch existing record
  const existing = await base44.entities.PayConfidence.filter({ id });
  if (existing.length === 0) {
    return { ok: false, error: 'PayConfidence record not found' };
  }
  const existingRecord = existing[0];

  // RULE: Only carrier/broker/admin can change state
  if (data.pay_confidence_state && data.pay_confidence_state !== existingRecord.pay_confidence_state) {
    if (role !== 'carrier' && role !== 'broker' && role !== 'admin') {
      return {
        ok: false,
        error: 'Unauthorized: only carrier/broker/admin can change pay confidence state'
      };
    }

    // RULE: Enforce allowed transitions
    const currentState = existingRecord.pay_confidence_state;
    const newState = data.pay_confidence_state;

    const allowedTransitions = {
      estimated: ['pending'],
      pending: ['approved'],
      approved: ['final'],
      final: [] // Cannot transition from final
    };

    if (!allowedTransitions[currentState].includes(newState)) {
      return {
        ok: false,
        error: `Invalid state transition: ${currentState} → ${newState}. Allowed: ${allowedTransitions[currentState].join(', ')}`
      };
    }

    // Record transition in audit trail
    const transition = {
      from_state: currentState,
      to_state: newState,
      transitioned_at: new Date().toISOString(),
      transitioned_by: user?.email,
      notes: data.variance_reason || ''
    };

    const stateTransitions = existingRecord.state_transitions || [];
    stateTransitions.push(transition);
    data.state_transitions = stateTransitions;

    // Calculate variance when moving to final
    if (newState === 'final' && data.final_pay_cents && existingRecord.estimated_pay_cents) {
      data.variance_cents = data.final_pay_cents - existingRecord.estimated_pay_cents;
    }

    // Audit log
    await base44.entities.AuditLog.create({
      entity_type: 'PayConfidence',
      entity_id: id,
      action: 'UPDATE',
      actor_user_id: user?.id,
      actor_email: user?.email,
      actor_role: role,
      before_values: { pay_confidence_state: currentState },
      after_values: { pay_confidence_state: newState },
      changed_fields: { pay_confidence_state: { from: currentState, to: newState } }
    });
  }

  data.updated_at = new Date().toISOString();
  data.updated_by = user?.email;

  return { ok: true, data };
}