/**
 * Test: Accessorial Eligibility Math
 * Verifies server-computed eligible amounts are authoritative
 */

describe('Accessorial Eligibility Tests', () => {
  test('Detention eligible amount computed from session', async () => {
    // Create detention session with billable time
    const session = await base44.entities.DetentionSession.create({
      load_id: 'test_load',
      stop_type: 'pickup',
      arrived_at: new Date().toISOString(),
      departed_at: new Date(Date.now() + 240 * 60000).toISOString(),
      total_minutes: 240,
      billable_minutes: 120, // 2 hours billable
      computed_amount_cents: 10000, // $100
      status: 'closed'
    });

    // Driver submits accessorial request
    const request = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      requester_id: 'driver1',
      accessorial_type: 'detention',
      claimed_amount_cents: 15000, // Driver claims $150
      description: 'Detained for 4 hours'
    });

    // Server should compute $100 (from session), not $150 (claimed)
    expect(request.computed_eligible_amount_cents).toBe(10000);
    expect(request.eligibility_status).toBe('eligible');
  });

  test('Lumper eligible if receipt provided', async () => {
    const request = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      requester_id: 'driver1',
      accessorial_type: 'lumper',
      claimed_amount_cents: 20000,
      evidence_attachments: [
        { file_url: 'https://example.com/receipt.jpg', file_name: 'receipt.jpg' }
      ],
      description: 'Lumper service at warehouse'
    });

    expect(request.eligibility_status).toBe('eligible');
    expect(request.computed_eligible_amount_cents).toBe(20000);
  });

  test('Lumper pending review if no receipt', async () => {
    const request = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load',
      requester_id: 'driver1',
      accessorial_type: 'lumper',
      claimed_amount_cents: 20000,
      evidence_attachments: [],
      description: 'Lumper service'
    });

    expect(request.eligibility_status).toBe('pending_review');
    expect(request.eligibility_reason).toContain('receipt');
  });

  test('Ineligible if no billable detention time', async () => {
    // Create session with no billable time
    await base44.entities.DetentionSession.create({
      load_id: 'test_load2',
      stop_type: 'pickup',
      arrived_at: new Date().toISOString(),
      departed_at: new Date(Date.now() + 60 * 60000).toISOString(),
      total_minutes: 60,
      billable_minutes: 0, // Within free time
      computed_amount_cents: 0,
      status: 'closed'
    });

    const request = await base44.entities.AccessorialRequest.create({
      load_id: 'test_load2',
      requester_id: 'driver1',
      accessorial_type: 'detention',
      claimed_amount_cents: 5000,
      description: 'Claim detention'
    });

    expect(request.computed_eligible_amount_cents).toBe(0);
    expect(request.eligibility_status).toBe('ineligible');
  });
});