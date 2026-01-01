/**
 * Test: Accessorial Approval Workflow
 * Verifies RBAC and approval process
 */

describe('Accessorial Approval Tests', () => {
  test('Driver cannot approve own accessorial request', async () => {
    const request = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      requester_id: 'driver1',
      accessorial_type: 'detention',
      claimed_amount_cents: 10000,
      description: 'Detention claim'
    });

    const result = await base44.entities.AccessorialRequest.update(
      request.id,
      { approval_status: 'approved' },
      { user: { role: 'driver', id: 'driver1', email: 'driver@test.com' } }
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Unauthorized');
  });

  test('Carrier can approve accessorial request', async () => {
    const request = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      requester_id: 'driver1',
      accessorial_type: 'lumper',
      claimed_amount_cents: 15000,
      computed_eligible_amount_cents: 15000,
      description: 'Lumper fee'
    });

    const result = await base44.entities.AccessorialRequest.update(
      request.id,
      { approval_status: 'approved' },
      { user: { role: 'carrier', id: 'carrier1', email: 'carrier@test.com' } }
    );

    expect(result.ok).toBe(true);
    expect(result.data.approved_by).toBe('carrier@test.com');
    expect(result.data.approved_at).toBeDefined();
    expect(result.data.applied_to_pay).toBe(true);
  });

  test('Denial requires reason and creates audit log', async () => {
    const request = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      requester_id: 'driver1',
      accessorial_type: 'detention',
      claimed_amount_cents: 10000,
      description: 'Claim'
    });

    await base44.entities.AccessorialRequest.update(
      request.id,
      {
        approval_status: 'denied',
        denial_reason: 'No supporting documentation'
      },
      { user: { role: 'admin', email: 'admin@test.com' } }
    );

    const auditLogs = await base44.entities.AuditLog.filter({
      entity_type: 'AccessorialRequest',
      entity_id: request.id,
      action: 'UPDATE'
    });

    expect(auditLogs.length).toBeGreaterThan(0);
    expect(auditLogs[0].changed_fields.approval_status.to).toBe('denied');
  });

  test('Approved amount applied to pay', async () => {
    const request = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      requester_id: 'driver1',
      accessorial_type: 'detention',
      claimed_amount_cents: 10000,
      computed_eligible_amount_cents: 8000,
      description: 'Detention'
    });

    const updated = await base44.entities.AccessorialRequest.update(
      request.id,
      {
        approval_status: 'approved',
        approved_amount_cents: 9000 // Carrier approves $90 (between claimed and computed)
      },
      { user: { role: 'carrier', email: 'carrier@test.com' } }
    );

    expect(updated.approved_amount_cents).toBe(9000);
    expect(updated.applied_to_pay).toBe(true);
  });
});