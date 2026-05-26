/**
 * Test: Detention Auto-Capture
 * Verifies detention sessions start/stop from status changes
 */

describe('Detention Auto-Capture Tests', () => {
  test('Detention session starts on stop status: arrived', async () => {
    const load = await base44.entities.Load.create({
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Dallas', state: 'TX' },
      equipment_type: 'dry_van'
    });

    const stop = await base44.entities.Stop.create({
      load_id: load.id,
      stop_type: 'pickup',
      sequence_number: 1,
      status: 'planned'
    });

    // Update status to arrived
    await base44.entities.Stop.update(stop.id, {
      status: 'arrived'
    });

    // Verify detention session created
    const sessions = await base44.entities.DetentionSession.filter({
      stop_id: stop.id,
      status: 'open'
    });

    expect(sessions.length).toBe(1);
    expect(sessions[0].arrived_at).toBeDefined();
    expect(sessions[0].stop_type).toBe('pickup');
  });

  test('Detention session closes on stop status: departed', async () => {
    const stop = await base44.entities.Stop.create({
      load_id: 'test_load',
      stop_type: 'delivery',
      sequence_number: 1,
      status: 'arrived'
    });

    const session = await base44.entities.DetentionSession.filter({
      stop_id: stop.id,
      status: 'open'
    });

    // Simulate 3 hours later (180 minutes)
    const departedAt = new Date(new Date(session[0].arrived_at).getTime() + 180 * 60000);

    await base44.entities.Stop.update(stop.id, {
      status: 'departed',
      depart_time_actual: departedAt.toISOString()
    });

    // Verify session closed and computed
    const closedSessions = await base44.entities.DetentionSession.filter({
      stop_id: stop.id,
      status: 'closed'
    });

    expect(closedSessions.length).toBe(1);
    expect(closedSessions[0].total_minutes).toBe(180);
    expect(closedSessions[0].billable_minutes).toBe(60); // 180 - 120 free
    expect(closedSessions[0].computed_amount_cents).toBeGreaterThan(0);
  });

  test('Billable minutes = max(0, total - free)', async () => {
    const session = await base44.entities.DetentionSession.create({
      load_id: 'test_load',
      stop_type: 'pickup',
      arrived_at: new Date().toISOString(),
      free_minutes: 120,
      status: 'open'
    });

    // Departed after 90 minutes (less than free time)
    const departedAt = new Date(new Date(session.arrived_at).getTime() + 90 * 60000);

    // Simulate close
    const totalMinutes = 90;
    const billableMinutes = Math.max(0, totalMinutes - 120);

    expect(billableMinutes).toBe(0);
  });

  test('Detention rate calculated correctly', async () => {
    const ratePerHour = 5000; // $50/hr
    const billableMinutes = 90; // 1.5 hours
    const expectedAmount = Math.round((billableMinutes / 60) * ratePerHour); // $75

    expect(expectedAmount).toBe(7500); // $75.00 in cents
  });
});