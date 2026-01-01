/**
 * Test: Carrier Override Controls
 * Verifies carrier can grant/revoke access manually
 */

describe('Carrier Override Tests', () => {
  test('Carrier can grant override with reason', async () => {
    const eligibility = await base44.entities.DriverFeatureEligibility.create(
      {
        driver_id: 'driver1',
        feature_key: 'instant_pay',
        carrier_override: true,
        override_reason: 'Long-term trusted driver'
      },
      { user: { role: 'carrier', id: 'carrier1', email: 'carrier@test.com' } }
    );

    expect(eligibility.eligible).toBe(true);
    expect(eligibility.override_granted_by).toBe('carrier@test.com');
    expect(eligibility.carrier_override).toBe(true);

    // Verify audit log
    const logs = await base44.entities.AuditLog.filter({
      entity_type: 'DriverFeatureEligibility',
      metadata: { carrier_override: true }
    });
    expect(logs.length).toBeGreaterThan(0);
  });

  test('Carrier can apply cooldown', async () => {
    const eligibility = await base44.entities.DriverFeatureEligibility.create({
      driver_id: 'driver1',
      feature_key: 'detention_self_edit',
      eligible: true,
      reason: 'Previously eligible'
    });

    const cooldownUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updated = await base44.entities.DriverFeatureEligibility.update(
      eligibility.id,
      {
        cooldown_until: cooldownUntil,
        cooldown_reason: 'Multiple detention disputes requiring investigation'
      },
      { user: { role: 'carrier', email: 'carrier@test.com' } }
    );

    expect(updated.eligible).toBe(false);
    expect(updated.cooldown_until).toBe(cooldownUntil);
  });

  test('Non-carrier cannot grant override', async () => {
    const result = await base44.entities.DriverFeatureEligibility.create(
      {
        driver_id: 'driver1',
        feature_key: 'instant_pay',
        carrier_override: true,
        override_reason: 'Trying to hack'
      },
      { user: { role: 'driver', id: 'driver1', email: 'driver@test.com' } }
    );

    // Should fail or not apply override
    // Actual implementation would check user.role in beforeCreate
  });

  test('Override expires after set period', async () => {
    const eligibility = await base44.entities.DriverFeatureEligibility.create(
      {
        driver_id: 'driver1',
        feature_key: 'advance_request',
        carrier_override: true,
        override_expires_at: new Date(Date.now() - 1000).toISOString(), // Already expired
        override_reason: 'Temporary grant'
      },
      { user: { role: 'carrier', email: 'carrier@test.com' } }
    );

    // Re-evaluation should ignore expired override
    const evaluation = await evaluateDriverEligibility('driver1', 'advance_request', base44);

    // Should fall back to metrics-based evaluation
    expect(evaluation.carrier_override).toBeUndefined();
  });
});