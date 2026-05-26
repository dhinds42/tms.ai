/**
 * Test: Variance Alerts
 * Verifies alerts fire when variance exceeds tolerance
 */

describe('Variance Alert Tests', () => {
  test('Variance alert created when exceeds tolerance', async () => {
    const payConf = await base44.entities.PayConfidence.create({
      load_id: 'test_load',
      driver_id: 'driver1',
      pay_confidence_state: 'approved',
      estimated_pay_cents: 150000, // $1500
      approved_pay_cents: 148000
    });

    // Transition to final with significant variance
    await base44.entities.PayConfidence.update(
      payConf.id,
      {
        pay_confidence_state: 'final',
        final_pay_cents: 140000, // $1400 (-$100 variance)
        variance_reason: 'Detention not approved'
      },
      { user: { role: 'broker', email: 'broker@test.com' } }
    );

    // Verify alert created (variance = -10000 cents = -$100, tolerance = $50)
    const alerts = await base44.entities.VarianceAlert.filter({
      load_id: 'test_load',
      driver_id: 'driver1'
    });

    expect(alerts.length).toBe(1);
    expect(alerts[0].variance_cents).toBe(-10000);
    expect(alerts[0].variance_direction).toBe('negative');
    expect(alerts[0].status).toBe('open');
  });

  test('No alert if variance within tolerance', async () => {
    const payConf = await base44.entities.PayConfidence.create({
      load_id: 'test_load2',
      driver_id: 'driver2',
      pay_confidence_state: 'approved',
      estimated_pay_cents: 150000,
      approved_pay_cents: 148000
    });

    // Small variance ($30)
    await base44.entities.PayConfidence.update(
      payConf.id,
      {
        pay_confidence_state: 'final',
        final_pay_cents: 153000 // +$30
      },
      { user: { role: 'broker', email: 'broker@test.com' } }
    );

    const alerts = await base44.entities.VarianceAlert.filter({
      load_id: 'test_load2'
    });

    expect(alerts.length).toBe(0); // No alert for $30 variance
  });

  test('Notification sent with variance alert', async () => {
    const payConf = await base44.entities.PayConfidence.create({
      load_id: 'test_load3',
      driver_id: 'driver3',
      pay_confidence_state: 'approved',
      estimated_pay_cents: 100000,
      approved_pay_cents: 100000
    });

    await base44.entities.PayConfidence.update(
      payConf.id,
      {
        pay_confidence_state: 'final',
        final_pay_cents: 85000 // -$150 variance
      },
      { user: { role: 'broker', email: 'broker@test.com' } }
    );

    // Verify notification created
    const notifications = await base44.entities.Notification.filter({
      user_id: 'driver3',
      notification_type: 'payment_processed'
    });

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].title).toContain('Variance');
  });
});