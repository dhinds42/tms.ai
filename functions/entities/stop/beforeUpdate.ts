/**
 * Stop - Before Update Hook
 * Auto-captures detention sessions based on status changes
 */

export default async function beforeUpdate({ id, data, base44, user }) {
  const existing = await base44.entities.Stop.filter({ id });
  if (existing.length === 0) {
    return { ok: false, error: 'Stop not found' };
  }
  const existingStop = existing[0];

  // STATUS: planned → arrived (START detention timer)
  if (data.status === 'arrived' && existingStop.status !== 'arrived') {
    data.arrive_time_actual = data.arrive_time_actual || new Date().toISOString();
    
    // Create detention session
    await base44.entities.DetentionSession.create({
      load_id: existingStop.load_id,
      stop_id: id,
      stop_type: existingStop.stop_type,
      arrived_at: data.arrive_time_actual,
      scheduled_appt_start: existingStop.appt_start,
      status: 'open'
    });

    await base44.entities.AuditLog.create({
      entity_type: 'DetentionSession',
      entity_id: id,
      action: 'CREATE',
      actor_email: user?.email || 'system',
      actor_role: user?.role || 'system',
      metadata: {
        load_id: existingStop.load_id,
        stop_type: existingStop.stop_type,
        arrived_at: data.arrive_time_actual
      }
    });
  }

  // STATUS: arrived → departed (STOP detention timer)
  if (data.status === 'departed' && existingStop.status === 'arrived') {
    data.depart_time_actual = data.depart_time_actual || new Date().toISOString();
    
    // Find open detention session
    const sessions = await base44.entities.DetentionSession.filter({
      stop_id: id,
      status: 'open'
    });

    if (sessions.length > 0) {
      const session = sessions[0];
      const arrivedAt = new Date(session.arrived_at);
      const departedAt = new Date(data.depart_time_actual);
      const totalMinutes = Math.round((departedAt - arrivedAt) / (1000 * 60));
      const freeMinutes = session.free_minutes || 120;
      const billableMinutes = Math.max(0, totalMinutes - freeMinutes);
      
      // Calculate detention charge (rate per hour, prorated)
      const ratePerHour = session.detention_rate_per_hour_cents || 5000;
      const computedAmount = Math.round((billableMinutes / 60) * ratePerHour);

      await base44.entities.DetentionSession.update(session.id, {
        departed_at: data.depart_time_actual,
        total_minutes: totalMinutes,
        billable_minutes: billableMinutes,
        computed_amount_cents: computedAmount,
        status: 'closed',
        closed_at: new Date().toISOString()
      });

      await base44.entities.AuditLog.create({
        entity_type: 'DetentionSession',
        entity_id: session.id,
        action: 'UPDATE',
        actor_email: user?.email || 'system',
        actor_role: user?.role || 'system',
        after_values: {
          billable_minutes: billableMinutes,
          computed_amount_cents: computedAmount,
          status: 'closed'
        }
      });
    }
  }

  return { ok: true, data };
}