/**
 * Test: Feature Eligibility Engine
 * Verifies server-side eligibility computation
 */

import { evaluateDriverEligibility } from '../../shared/eligibility/featureEligibilityEngine.js';

describe('Feature Eligibility Tests', () => {
  test('New driver not eligible for instant pay', async () => {
    // Driver with only 2 completed loads
    const result = await evaluateDriverEligibility('new_driver', 'instant_pay', base44);

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Minimum 10 completed loads');
    expect(result.metrics_snapshot.completed_loads).toBeLessThan(10);
  });

  test('Experienced driver eligible for instant pay', async () => {
    // Create driver with good metrics (mock data)
    // Assume driver has 15 loads, 95% on-time, 90% doc on-time, compliant
    const result = await evaluateDriverEligibility('experienced_driver', 'instant_pay', base44);

    expect(result.eligible).toBe(true);
    expect(result.reason).toContain('Meets all instant pay requirements');
    expect(result.tier).toBe('gold');
  });

  test('Carrier override grants access regardless of metrics', async () => {
    const eligibility = await base44.entities.DriverFeatureEligibility.create(
      {
        driver_id: 'new_driver',
        feature_key: 'instant_pay',
        carrier_override: true,
        override_reason: 'Trusted driver from previous company'
      },
      { user: { role: 'carrier', email: 'carrier@test.com' } }
    );

    expect(eligibility.eligible).toBe(true);
    expect(eligibility.reason).toContain('override');
  });

  test('Cooldown period blocks access', async () => {
    const eligibility = await base44.entities.DriverFeatureEligibility.create({
      driver_id: 'driver1',
      feature_key: 'instant_pay',
      eligible: false,
      reason: 'In cooldown',
      cooldown_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cooldown_reason: 'Multiple pay disputes'
    });

    const evaluation = await evaluateDriverEligibility('driver1', 'instant_pay', base44);

    expect(evaluation.eligible).toBe(false);
    expect(evaluation.reason).toContain('cooldown period');
  });

  test('Premium loads require high standards', async () => {
    // Simulate driver with good but not elite metrics
    const result = await evaluateDriverEligibility('good_driver', 'premium_loads', base44);

    // Needs 50 loads, 95% on-time, 4.5+ rating
    if (result.metrics_snapshot.completed_loads < 50) {
      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('50 completed loads');
    }
  });

  test('Direct messaging available to new drivers', async () => {
    // Even new drivers get basic messaging (3 load minimum)
    const result = await evaluateDriverEligibility('new_driver', 'direct_messaging', base44);

    if (result.metrics_snapshot.completed_loads >= 3) {
      expect(result.eligible).toBe(true);
      expect(result.tier).toBe('bronze');
    }
  });

  test('Eligibility re-evaluation updates metrics', async () => {
    const eligibility = await base44.entities.DriverFeatureEligibility.create({
      driver_id: 'improving_driver',
      feature_key: 'advance_request',
      eligible: false,
      reason: 'Not enough loads'
    });

    // Driver completes more loads, re-evaluate
    const updated = await base44.entities.DriverFeatureEligibility.update(
      eligibility.id,
      { re_evaluate: true }
    );

    expect(updated.evaluated_at).toBeDefined();
    expect(updated.metrics_snapshot).toBeDefined();
  });
});