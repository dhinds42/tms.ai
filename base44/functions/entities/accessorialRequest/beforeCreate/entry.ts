/**
 * AccessorialRequest - Before Create Hook
 * Computes eligible amount, detects duplicates
 */

export default async function beforeCreate({ data, base44, user }) {
  // Set defaults
  data.requester_role = user?.role || 'driver';
  data.approval_status = 'pending';
  data.eligibility_status = 'pending_review';

  // DUPLICATE DETECTION: Check for similar requests
  const existingRequests = await base44.entities.AccessorialRequest.filter({
    load_id: data.load_id,
    accessorial_type: data.accessorial_type,
    approval_status: { $in: ['pending', 'approved'] }
  });

  // If stop_id provided, check for exact duplicate
  if (data.stop_id && existingRequests.length > 0) {
    const duplicate = existingRequests.find(r => r.stop_id === data.stop_id);
    if (duplicate) {
      data.duplicate_of = duplicate.id;
      data.approval_status = 'denied';
      data.eligibility_status = 'ineligible';
      data.eligibility_reason = `Duplicate of existing request ${duplicate.id.slice(0, 8)}`;
    }
  }

  // ELIGIBILITY COMPUTATION (server-authoritative)
  if (!data.duplicate_of) {
    if (data.accessorial_type === 'detention' || data.accessorial_type.includes('detention')) {
      // Check if detention session exists
      const sessions = await base44.entities.DetentionSession.filter({
        load_id: data.load_id,
        stop_id: data.stop_id || { $exists: false }
      });

      if (sessions.length > 0 && sessions[0].billable_minutes > 0) {
        const session = sessions[0];
        data.computed_eligible_amount_cents = session.computed_amount_cents;
        data.eligibility_status = 'eligible';
        data.eligibility_reason = `Detention: ${session.billable_minutes} billable minutes`;
      } else {
        data.computed_eligible_amount_cents = 0;
        data.eligibility_status = 'ineligible';
        data.eligibility_reason = 'No billable detention time recorded';
      }
    } else if (data.accessorial_type === 'lumper') {
      // Lumper requires receipt evidence
      if (data.evidence_attachments && data.evidence_attachments.length > 0) {
        data.computed_eligible_amount_cents = data.claimed_amount_cents || 0;
        data.eligibility_status = 'eligible';
        data.eligibility_reason = 'Lumper receipt provided';
      } else {
        data.computed_eligible_amount_cents = 0;
        data.eligibility_status = 'pending_review';
        data.eligibility_reason = 'Awaiting lumper receipt';
      }
    } else if (data.accessorial_type === 'tonu') {
      // TONU: full load offer amount if within time window
      data.computed_eligible_amount_cents = data.claimed_amount_cents || 0;
      data.eligibility_status = 'pending_review';
      data.eligibility_reason = 'TONU claim under review';
    } else {
      // Other types: default to claimed with review
      data.computed_eligible_amount_cents = data.claimed_amount_cents || 0;
      data.eligibility_status = 'pending_review';
      data.eligibility_reason = 'Awaiting approval';
    }
  }

  // Audit log
  await base44.entities.AuditLog.create({
    entity_type: 'AccessorialRequest',
    entity_id: data.load_id,
    action: 'CREATE',
    actor_user_id: user?.id,
    actor_email: user?.email,
    actor_role: user?.role || 'driver',
    after_values: data,
    metadata: {
      accessorial_type: data.accessorial_type,
      computed_eligible_amount_cents: data.computed_eligible_amount_cents
    }
  });

  return { ok: true, data };
}