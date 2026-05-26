/**
 * Test: Message Templates
 * Verifies template variable resolution is server-side
 */

describe('Message Template Tests', () => {
  test('Template variables resolved server-side', async () => {
    const load = await base44.entities.Load.create({
      load_number: 'LOAD-12345',
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Dallas', state: 'TX' },
      pickup_date: new Date('2026-01-15').toISOString(),
      equipment_type: 'dry_van'
    });

    const template = await base44.entities.MessageTemplate.create({
      role: 'driver',
      template_key: 'driver_arrived',
      title: 'Arrived at Pickup',
      template_text: 'I have arrived at {{pickup_city}}, {{pickup_state}} for load {{load_number}}',
      requires_load_context: true
    });

    const message = await base44.entities.LoadMessage.create({
      load_id: load.id,
      sender_id: 'driver1',
      template_key: 'driver_arrived'
    });

    expect(message.message_text).toContain('Chicago');
    expect(message.message_text).toContain('IL');
    expect(message.message_text).toContain('LOAD-12345');
    expect(message.message_text).not.toContain('{{');
  });

  test('Custom message without template works', async () => {
    const message = await base44.entities.LoadMessage.create({
      load_id: 'test_load',
      sender_id: 'driver1',
      message_text: 'Running 30 minutes late due to traffic'
    });

    expect(message.message_text).toBe('Running 30 minutes late due to traffic');
    expect(message.template_key).toBeNull();
  });

  test('Messages grouped by thread_id', async () => {
    await base44.entities.LoadMessage.create({
      load_id: 'test_load',
      sender_id: 'driver1',
      message_text: 'Message 1'
    });

    await base44.entities.LoadMessage.create({
      load_id: 'test_load',
      sender_id: 'broker1',
      message_text: 'Message 2'
    });

    const messages = await base44.entities.LoadMessage.filter({
      thread_id: 'load_test_load'
    });

    expect(messages.length).toBe(2);
  });
});