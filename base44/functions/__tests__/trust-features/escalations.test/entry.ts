/**
 * Test: Driver Escalations
 * Verifies escalation workflow and audit logging
 */

describe('Driver Escalation Tests', () => {
  test('Driver can create escalation', async () => {
    const escalation = await base44.entities.DriverEscalation.create({
      load_id: 'test_load_id',
      driver_id: 'driver1',
      escalation_type: 'detention',
      severity: 'high',
      title: 'Detained at facility for 4 hours',
      notes: 'Waiting at dock since 10am, no one has assisted'
    });

    expect(escalation.status).toBe('open');
    expect(escalation.created_at).toBeDefined();
  });

  test('Escalation creates audit log on create', async () => {
    const escalation = await base44.entities.DriverEscalation.create({
      driver_id: 'driver1',
      escalation_type: 'safety',
      severity: 'urgent',
      title: 'Unsafe loading condition'
    });

    const auditLogs = await base44.entities.AuditLog.filter({
      entity_type: 'DriverEscalation',
      action: 'CREATE'
    });

    expect(auditLogs.length).toBeGreaterThan(0);
    const log = auditLogs.find(l => l.metadata?.escalation_type === 'safety');
    expect(log).toBeDefined();
    expect(log.actor_role).toBe('driver');
  });

  test('Resolution time calculated when resolved', async () => {
    const escalation = await base44.entities.DriverEscalation.create({
      driver_id: 'driver1',
      escalation_type: 'breakdown',
      title: 'Vehicle breakdown',
      severity: 'high'
    });

    // Simulate 30 minutes passing
    await new Promise(resolve => setTimeout(resolve, 100));

    const resolved = await base44.entities.DriverEscalation.update(
      escalation.id,
      {
        status: 'resolved',
        resolution_notes: 'Tow truck dispatched, driver reassigned'
      }
    );

    expect(resolved.resolved_at).toBeDefined();
    expect(resolved.resolution_time_minutes).toBeGreaterThan(0);
  });

  test('Status change creates audit log', async () => {
    const escalation = await base44.entities.DriverEscalation.create({
      driver_id: 'driver1',
      escalation_type: 'pay_dispute',
      title: 'Detention pay not included',
      severity: 'medium'
    });

    await base44.entities.DriverEscalation.update(
      escalation.id,
      { status: 'in_progress', assigned_to: 'dispatcher@test.com' },
      { user: { role: 'admin', email: 'admin@test.com' } }
    );

    const auditLogs = await base44.entities.AuditLog.filter({
      entity_type: 'DriverEscalation',
      entity_id: escalation.id,
      action: 'UPDATE'
    });

    expect(auditLogs.length).toBeGreaterThan(0);
    const log = auditLogs[0];
    expect(log.changed_fields.status.from).toBe('open');
    expect(log.changed_fields.status.to).toBe('in_progress');
  });
});