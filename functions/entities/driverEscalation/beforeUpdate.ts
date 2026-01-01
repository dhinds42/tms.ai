/**
 * DriverEscalation - Before Update Hook
 * Tracks resolution timing and logs changes
 */

export default async function beforeUpdate({ id, data, base44, user }) {
  const existing = await base44.entities.DriverEscalation.filter({ id });
  if (existing.length === 0) {
    return { ok: false, error: 'Escalation not found' };
  }
  const existingEscalation = existing[0];

  // If status changed to resolved/closed, set resolved_at
  if ((data.status === 'resolved' || data.status === 'closed') && existingEscalation.status !== data.status) {
    data.resolved_at = new Date().toISOString();
    
    // Calculate resolution time
    const createdAt = new Date(existingEscalation.created_at);
    const resolvedAt = new Date(data.resolved_at);
    data.resolution_time_minutes = Math.round((resolvedAt - createdAt) / (1000 * 60));
  }

  // Audit log
  if (data.status && data.status !== existingEscalation.status) {
    await base44.entities.AuditLog.create({
      entity_type: 'DriverEscalation',
      entity_id: id,
      action: 'UPDATE',
      actor_user_id: user?.id,
      actor_email: user?.email,
      actor_role: user?.role,
      before_values: { status: existingEscalation.status },
      after_values: { status: data.status },
      changed_fields: { status: { from: existingEscalation.status, to: data.status } }
    });
  }

  return { ok: true, data };
}