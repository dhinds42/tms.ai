/**
 * DriverEscalation - Before Create Hook
 * Sets defaults and creates audit log
 */

export default async function beforeCreate({ data, base44, user }) {
  data.status = data.status || 'open';
  data.severity = data.severity || 'medium';
  data.created_at = new Date().toISOString();

  // Audit log
  await base44.entities.AuditLog.create({
    entity_type: 'DriverEscalation',
    entity_id: data.load_id || 'general',
    action: 'CREATE',
    actor_user_id: user?.id,
    actor_email: user?.email,
    actor_role: user?.role || 'driver',
    after_values: data,
    metadata: {
      escalation_type: data.escalation_type,
      severity: data.severity
    }
  });

  return { ok: true, data };
}