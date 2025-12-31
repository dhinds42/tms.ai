/**
 * Business Rules Validation Tests
 */

import beforeCreate from '../../entities/load/beforeCreate';
import beforeUpdate from '../../entities/load/beforeUpdate';

describe('Business Rules Enforcement', () => {
  
  const mockBase44 = {
    asServiceRole: {
      entities: {
        Load: { filter: async () => [] }
      }
    }
  };
  
  test('enforces 5% minimum margin', async () => {
    const result = await beforeCreate({
      data: {
        customer_rate: 1000,
        carrier_pay: 980 // Only 2% margin
      },
      user: { role: 'broker', id: 'user_1', email: 'test@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(false);
    expect(result.errors[0].message).toContain('below minimum');
  });
  
  test('enforces non-negative rates', async () => {
    const result = await beforeCreate({
      data: {
        customer_rate: -100,
        carrier_pay: 800
      },
      user: { role: 'broker', id: 'user_1', email: 'test@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(false);
  });
  
  test('enforces pickup before delivery date', async () => {
    const result = await beforeCreate({
      data: {
        customer_rate: 1000,
        carrier_pay: 800,
        pickup_date: '2025-01-10',
        delivery_date: '2025-01-05'
      },
      user: { role: 'broker', id: 'user_1', email: 'test@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(false);
    expect(result.errors[0].message).toContain('Pickup date cannot be after');
  });
  
  test('prevents editing locked load', async () => {
    const lockedLoad = {
      id: 'load_1',
      invoice_status: 'paid',
      customer_rate: 1000
    };
    
    const result = await beforeUpdate({
      data: { customer_rate: 1100 },
      user: { role: 'broker', id: 'user_1', email: 'test@test.com' },
      existingData: lockedLoad,
      base44: mockBase44
    });
    
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe('LOCKED');
  });
  
  test('allows admin to edit locked load', async () => {
    const lockedLoad = {
      id: 'load_1',
      invoice_status: 'paid',
      customer_rate: 1000
    };
    
    const result = await beforeUpdate({
      data: { customer_rate: 1100, carrier_pay: 850 },
      user: { role: 'admin', id: 'admin_1', email: 'admin@test.com' },
      existingData: lockedLoad,
      base44: mockBase44
    });
    
    expect(result.ok).toBe(true);
  });
});