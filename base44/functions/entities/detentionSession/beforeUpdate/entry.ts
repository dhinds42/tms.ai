/**
 * DetentionSession - Before Update Hook
 * Enforces driver edit rules and audit logging
 */

export default async function beforeUpdate({ id, data, base44, user }) {
  const existing = await base44.entities.DetentionSession.filter({ id });
  if (existing.length === 0) {
    return { ok: false, error: 'Detention session not found' };
  }
  const existingSession = existing[0];

  // RULE: Driver edits require edit_notes
  if (data.driver_edited_amount_cents !== undefined) {
    if (user?.role === 'driver') {
      if (!data.edit_notes || data.edit_notes.trim() === '') {
        return {
          ok: false,
          error: 'Driver edits require edit_notes explaining the change'
        };
      }
      data.edited_by_driver = true;

      // Audit log for driver edit
      await base44.entities.AuditLog.create({
        entity_type: 'DetentionSession',
        entity_id: id,
        action: 'UPDATE',
        actor_user_id: user.id,
        actor_email: user.email,
        actor_role: 'driver',
        before_values: {
          computed_amount_cents: existingSession.computed_amount_cents,
          driver_edited_amount_cents: existingSession.driver_edited_amount_cents
        },
        after_values: {
          driver_edited_amount_cents: data.driver_edited_amount_cents,
          edit_notes: data.edit_notes
        },
        changed_fields: {
          driver_edited_amount_cents: {
            from: existingSession.driver_edited_amount_cents || null,
            to: data.driver_edited_amount_cents
          }
        }
      });
    }
  }

  return { ok: true, data };
}