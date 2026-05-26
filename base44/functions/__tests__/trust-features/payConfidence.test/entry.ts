/**
 * Test: Pay Confidence State Transitions
 * Verifies state transitions are enforced by role and follow allowed paths
 */

describe('Pay Confidence State Transition Tests', () => {
  test('Driver cannot change pay confidence state', async () => {
    const payConfidence = await base44.entities.PayConfidence.create({
      load_id: 'test_load_id',
      driver_id: 'test_driver_id',
      pay_confidence_state: 'estimated',
      estimated_pay_cents: 150000
    });

    // Simulate driver role
    const result = await base44.entities.PayConfidence.update(
      payConfidence.id,
      { pay_confidence_state: 'pending' },
      { user: { role: 'driver', id: 'test_driver_id' } }
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Unauthorized');
  });

  test('Carrier can transition estimated → pending', async () => {
    const payConfidence = await base44.entities.PayConfidence.create({
      load_id: 'test_load_id',
      driver_id: 'test_driver_id',
      pay_confidence_state: 'estimated',
      estimated_pay_cents: 150000
    });

    const result = await base44.entities.PayConfidence.update(
      payConfidence.id,
      { 
        pay_confidence_state: 'pending',
        pending_pay_cents: 148000 // Slight adjustment
      },
      { user: { role: 'carrier', email: 'carrier@test.com' } }
    );

    expect(result.ok).toBe(true);
    expect(result.data.pay_confidence_state).toBe('pending');
    expect(result.data.state_transitions).toHaveLength(1);
  });

  test('Invalid state transition is rejected', async () => {
    const payConfidence = await base44.entities.PayConfidence.create({
      load_id: 'test_load_id',
      driver_id: 'test_driver_id',
      pay_confidence_state: 'estimated',
      estimated_pay_cents: 150000
    });

    // Attempt to skip pending state
    const result = await base44.entities.PayConfidence.update(
      payConfidence.id,
      { pay_confidence_state: 'approved' },
      { user: { role: 'broker', email: 'broker@test.com' } }
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Invalid state transition');
  });

  test('Final state cannot be changed', async () => {
    const payConfidence = await base44.entities.PayConfidence.create({
      load_id: 'test_load_id',
      driver_id: 'test_driver_id',
      pay_confidence_state: 'final',
      final_pay_cents: 150000
    });

    const result = await base44.entities.PayConfidence.update(
      payConfidence.id,
      { pay_confidence_state: 'approved' },
      { user: { role: 'admin', email: 'admin@test.com' } }
    );

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Invalid state transition');
  });

  test('Variance is calculated when reaching final state', async () => {
    const payConfidence = await base44.entities.PayConfidence.create({
      load_id: 'test_load_id',
      driver_id: 'test_driver_id',
      pay_confidence_state: 'approved',
      estimated_pay_cents: 150000,
      approved_pay_cents: 148000
    });

    const result = await base44.entities.PayConfidence.update(
      payConfidence.id,
      { 
        pay_confidence_state: 'final',
        final_pay_cents: 152000 // $20 more than estimated
      },
      { user: { role: 'broker', email: 'broker@test.com' } }
    );

    expect(result.ok).toBe(true);
    expect(result.data.variance_cents).toBe(2000); // +$20
  });
});