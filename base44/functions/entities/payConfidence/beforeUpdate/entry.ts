/**
 * PayConfidence - Before Update Hook
 * Enforces state transition rules, RBAC, and creates variance alerts
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
      const varianceCents = data.final_pay_cents - existingRecord.estimated_pay_cents;
      data.variance_cents = varianceCents;

      // VARIANCE ALERT: Create alert if variance exceeds tolerance
      const toleranceCents = 5000; // $50 default
      if (Math.abs(varianceCents) > toleranceCents) {
        await base44.entities.VarianceAlert.create({
          load_id: existingRecord.load_id,
          driver_id: existingRecord.driver_id,
          pay_confidence_id: id,
          estimated_pay_cents: existingRecord.estimated_pay_cents,
          final_pay_cents: data.final_pay_cents,
          variance_cents: varianceCents,
          variance_percent: Math.round((varianceCents / existingRecord.estimated_pay_cents) * 100),
          tolerance_cents: toleranceCents,
          variance_direction: varianceCents > 0 ? 'positive' : 'negative',
          reason_details: data.variance_reason || 'Pay variance exceeds tolerance',
          status: 'open'
        });

        // Create notification for driver
        await base44.entities.Notification.create({
          user_id: existingRecord.driver_id,
          notification_type: 'payment_processed',
          channel: 'in_app',
          title: 'Pay Variance Alert',
          message: `Your final pay differs from estimate by ${Math.abs(varianceCents / 100).toFixed(2)}. Click to review.`,
          entity_type: 'VarianceAlert',
          entity_id: existingRecord.load_id,
          priority: Math.abs(varianceCents) > 10000 ? 'high' : 'medium'
        });
      }
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