/**
 * Test: Offer Acknowledgement Enforcement
 * Verifies drivers cannot accept loads without acknowledging current offer
 */

describe('Offer Acknowledgement Tests', () => {
  test('Driver cannot accept load without acknowledgement', async () => {
    // Create load with active offer
    const load = await base44.entities.Load.create({
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Dallas', state: 'TX' },
      equipment_type: 'dry_van',
      status: 'available'
    });

    const offer = await base44.entities.OfferVersion.create({
      load_id: load.id,
      version_id: `test_v1_${Date.now()}`,
      offered_pay_cents: 150000, // $1500
      status: 'active'
    });

    // Attempt to assign load without acknowledgement (should fail)
    const result = await base44.entities.Load.update(load.id, {
      status: 'assigned',
      driver_id: 'test_driver_id'
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain('must acknowledge current offer');
  });

  test('Driver can accept after valid acknowledgement', async () => {
    const load = await base44.entities.Load.create({
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Dallas', state: 'TX' },
      equipment_type: 'dry_van',
      status: 'available'
    });

    const offer = await base44.entities.OfferVersion.create({
      load_id: load.id,
      version_id: `test_v2_${Date.now()}`,
      offered_pay_cents: 150000,
      status: 'active'
    });

    // Create acknowledgement
    await base44.entities.DriverAcknowledgement.create({
      load_id: load.id,
      offer_version_id: offer.version_id,
      driver_id: 'test_driver_id',
      acknowledgement_type: 'offer_terms'
    });

    // Now assignment should succeed
    const result = await base44.entities.Load.update(load.id, {
      status: 'assigned',
      driver_id: 'test_driver_id'
    });

    expect(result.ok).toBe(true);
    expect(result.data.status).toBe('assigned');
  });

  test('Superseded offer acknowledgement is invalid', async () => {
    const load = await base44.entities.Load.create({
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Dallas', state: 'TX' },
      equipment_type: 'dry_van',
      status: 'available'
    });

    const offer1 = await base44.entities.OfferVersion.create({
      load_id: load.id,
      version_id: `test_v3_${Date.now()}`,
      offered_pay_cents: 150000,
      status: 'active'
    });

    // Acknowledge first offer
    await base44.entities.DriverAcknowledgement.create({
      load_id: load.id,
      offer_version_id: offer1.version_id,
      driver_id: 'test_driver_id',
      acknowledgement_type: 'offer_terms'
    });

    // Create new offer (supersedes first)
    const offer2 = await base44.entities.OfferVersion.create({
      load_id: load.id,
      version_id: `test_v4_${Date.now()}`,
      offered_pay_cents: 160000, // $1600 - updated
      status: 'active'
    });

    // Old acknowledgement should be invalid, assignment should fail
    const result = await base44.entities.Load.update(load.id, {
      status: 'assigned',
      driver_id: 'test_driver_id'
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain('must acknowledge current offer');
  });
});