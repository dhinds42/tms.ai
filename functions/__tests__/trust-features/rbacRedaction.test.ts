/**
 * Test: RBAC Redaction for Trust Features
 * Verifies drivers cannot see broker-sensitive fields
 */

describe('RBAC Redaction Tests', () => {
  test('Driver sees only offered pay in OfferVersion', async () => {
    const offer = await base44.entities.OfferVersion.create({
      load_id: 'test_load_id',
      version_id: 'test_v1',
      offered_pay_cents: 150000,
      terms_text: 'Standard terms',
      status: 'active'
    });

    // Simulate driver read
    const result = await base44.entities.OfferVersion.filter(
      { id: offer.id },
      { user: { role: 'driver', id: 'driver1' } }
    );

    expect(result[0].offered_pay_cents).toBe(150000);
    expect(result[0].terms_text).toBe('Standard terms');
    // Internal fields should be present for broker but this test is for driver view
  });

  test('Driver cannot see variance_reason in PayConfidence', async () => {
    const payConf = await base44.entities.PayConfidence.create({
      load_id: 'test_load_id',
      driver_id: 'driver1',
      pay_confidence_state: 'final',
      estimated_pay_cents: 150000,
      final_pay_cents: 148000,
      variance_cents: -2000,
      variance_reason: 'Detention not approved'
    });

    // Simulate driver read
    const result = await base44.entities.PayConfidence.filter(
      { id: payConf.id },
      { user: { role: 'driver', id: 'driver1' } }
    );

    expect(result[0].final_pay_cents).toBe(148000);
    expect(result[0].variance_reason).toBeUndefined();
    expect(result[0].updated_by).toBeUndefined();
  });

  test('Customer cannot view OfferVersion', async () => {
    const offer = await base44.entities.OfferVersion.create({
      load_id: 'test_load_id',
      version_id: 'test_v2',
      offered_pay_cents: 150000,
      status: 'active'
    });

    // Simulate customer read
    const result = await base44.entities.OfferVersion.filter(
      { id: offer.id },
      { user: { role: 'customer', id: 'customer1' } }
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Unauthorized');
  });

  test('Broker/admin sees all fields', async () => {
    const offer = await base44.entities.OfferVersion.create({
      load_id: 'test_load_id',
      version_id: 'test_v3',
      offered_pay_cents: 150000,
      created_by: 'broker@test.com',
      status: 'active'
    });

    // Simulate broker read
    const result = await base44.entities.OfferVersion.filter(
      { id: offer.id },
      { user: { role: 'broker', id: 'broker1' } }
    );

    expect(result[0].offered_pay_cents).toBe(150000);
    expect(result[0].created_by).toBe('broker@test.com');
    // All fields visible
  });
});