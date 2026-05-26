/**
 * Test: Driver Edit Rules
 * Verifies driver edits require notes and are audited
 */

describe('Driver Edit Tests', () => {
  test('Driver edit without notes is rejected', async () => {
    const session = await base44.entities.DetentionSession.create({
      load_id: 'test_load',
      stop_type: 'delivery',
      arrived_at: new Date().toISOString(),
      departed_at: new Date(Date.now() + 180 * 60000).toISOString(),
      computed_amount_cents: 7500,
      status: 'closed'
    });

    const result = await base44.entities.DetentionSession.update(
      session.id,
      { driver_edited_amount_cents: 10000 }, // No edit_notes
      { user: { role: 'driver', id: 'driver1', email: 'driver@test.com' } }
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('require edit_notes');
  });

  test('Driver edit with notes succeeds and creates audit log', async () => {
    const session = await base44.entities.DetentionSession.create({
      load_id: 'test_load',
      stop_type: 'delivery',
      arrived_at: new Date().toISOString(),
      departed_at: new Date(Date.now() + 180 * 60000).toISOString(),
      computed_amount_cents: 7500,
      status: 'closed'
    });

    const result = await base44.entities.DetentionSession.update(
      session.id,
      {
        driver_edited_amount_cents: 10000,
        edit_notes: 'Waited 4 hours, not 3. Have time-stamped photos.'
      },
      { user: { role: 'driver', id: 'driver1', email: 'driver@test.com' } }
    );

    expect(result.ok).toBe(true);
    expect(result.data.edited_by_driver).toBe(true);

    // Verify audit log created
    const auditLogs = await base44.entities.AuditLog.filter({
      entity_type: 'DetentionSession',
      entity_id: session.id,
      action: 'UPDATE'
    });

    expect(auditLogs.length).toBeGreaterThan(0);
    expect(auditLogs[0].actor_role).toBe('driver');
  });
});