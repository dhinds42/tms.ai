/**
 * Load Hooks Tests
 * Test server-side validation and RBAC enforcement
 */

import { beforeCreate, beforeUpdate, afterRead } from '../../hooks/loadHooks.js';

describe('Load Hooks - Validation', () => {
  test('rejects negative margin for broker', async () => {
    const entity = {
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'dry_van',
      customer_rate: 1000,
      carrier_pay: 1500 // NEGATIVE MARGIN
    };
    
    const context = {
      user: { email: 'broker@test.com', role: 'user' },
      operatingMode: 'broker'
    };

    await expect(beforeCreate(entity, context)).rejects.toMatchObject({
      statusCode: 400,
      errors: expect.arrayContaining([
        expect.objectContaining({ code: 'NEGATIVE_MARGIN' })
      ])
    });
  });

  test('allows negative margin for admin with override', async () => {
    const entity = {
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'dry_van',
      customer_rate: 1000,
      carrier_pay: 1500
    };
    
    const context = {
      user: { email: 'admin@test.com', role: 'admin' },
      operatingMode: 'broker'
    };

    const result = await beforeCreate(entity, context);
    expect(result).toBeDefined();
    expect(result.carrier_pay).toBe(1500);
  });

  test('rejects delivery before pickup', async () => {
    const entity = {
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'dry_van',
      pickup_date: '2025-12-20',
      delivery_date: '2025-12-19' // BEFORE PICKUP
    };
    
    const context = {
      user: { email: 'broker@test.com' },
      operatingMode: 'broker'
    };

    await expect(beforeCreate(entity, context)).rejects.toMatchObject({
      statusCode: 400,
      errors: expect.arrayContaining([
        expect.objectContaining({ code: 'INVALID_DATE_SEQUENCE' })
      ])
    });
  });

  test('requires temperature for reefer loads', async () => {
    const entity = {
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'reefer'
      // Missing temperature_min/max
    };
    
    const context = {
      user: { email: 'broker@test.com' },
      operatingMode: 'broker'
    };

    await expect(beforeCreate(entity, context)).rejects.toMatchObject({
      statusCode: 400,
      errors: expect.arrayContaining([
        expect.objectContaining({ code: 'MISSING_TEMPERATURE' })
      ])
    });
  });

  test('rejects invalid status transition', async () => {
    const existingEntity = {
      id: 'load-123',
      status: 'available'
    };
    
    const update = {
      status: 'delivered' // Cannot skip from available to delivered
    };
    
    const context = {
      user: { email: 'broker@test.com' },
      operatingMode: 'broker'
    };

    await expect(beforeUpdate(update, existingEntity, context)).rejects.toMatchObject({
      statusCode: 400,
      errors: expect.arrayContaining([
        expect.objectContaining({ code: 'INVALID_TRANSITION' })
      ])
    });
  });
});

describe('Load Hooks - RBAC', () => {
  test('carrier cannot see customer_rate', async () => {
    const entity = {
      id: 'load-123',
      carrier_id: 'carrier-456',
      customer_rate: 1500,
      carrier_pay: 1200,
      margin: 300
    };
    
    const context = {
      user: { email: 'carrier@test.com', carrier_id: 'carrier-456' },
      operatingMode: 'carrier'
    };

    const result = await afterRead(entity, context);
    
    expect(result.customer_rate).toBeUndefined();
    expect(result.margin).toBeUndefined();
    expect(result.carrier_pay).toBeUndefined(); // Also hidden from carrier
  });

  test('carrier cannot access another carriers load', async () => {
    const entity = {
      id: 'load-123',
      carrier_id: 'carrier-456'
    };
    
    const context = {
      user: { email: 'carrier@test.com', carrier_id: 'carrier-999' }, // Different carrier
      operatingMode: 'carrier'
    };

    await expect(afterRead(entity, context)).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('assigned to your carrier')
    });
  });

  test('driver cannot update rates', async () => {
    const existingEntity = {
      id: 'load-123',
      driver_id: 'driver-456',
      customer_rate: 1500
    };
    
    const update = {
      customer_rate: 1600 // Trying to change rate
    };
    
    const context = {
      user: { id: 'driver-456', email: 'driver@test.com' },
      operatingMode: 'driver'
    };

    await expect(beforeUpdate(update, existingEntity, context)).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('rate fields')
    });
  });

  test('broker can see all fields', async () => {
    const entity = {
      id: 'load-123',
      customer_rate: 1500,
      carrier_pay: 1200,
      margin: 300
    };
    
    const context = {
      user: { email: 'broker@test.com' },
      operatingMode: 'broker'
    };

    const result = await afterRead(entity, context);
    
    expect(result.customer_rate).toBe(1500);
    expect(result.carrier_pay).toBe(1200);
    expect(result.margin).toBe(300);
  });
});