/**
 * Test: Duplicate Accessorial Detection
 * Verifies duplicate requests are prevented
 */

describe('Duplicate Accessorial Detection Tests', () => {
  test('Duplicate detention request for same stop is flagged', async () => {
    const request1 = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      stop_id: 'stop1',
      requester_id: 'driver1',
      accessorial_type: 'detention',
      claimed_amount_cents: 10000,
      description: 'First request'
    });

    const request2 = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      stop_id: 'stop1',
      requester_id: 'driver1',
      accessorial_type: 'detention',
      claimed_amount_cents: 12000,
      description: 'Second request (duplicate)'
    });

    expect(request2.duplicate_of).toBe(request1.id);
    expect(request2.approval_status).toBe('denied');
    expect(request2.eligibility_reason).toContain('Duplicate');
  });

  test('Different accessorial types allowed for same stop', async () => {
    await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      stop_id: 'stop2',
      requester_id: 'driver1',
      accessorial_type: 'detention',
      claimed_amount_cents: 10000,
      description: 'Detention'
    });

    const lumperRequest = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      stop_id: 'stop2',
      requester_id: 'driver1',
      accessorial_type: 'lumper',
      claimed_amount_cents: 15000,
      description: 'Lumper fee'
    });

    expect(lumperRequest.duplicate_of).toBeUndefined();
    expect(lumperRequest.approval_status).not.toBe('denied');
  });
});