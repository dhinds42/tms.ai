/**
 * Load Workflow Integration Tests
 * End-to-end validation and calculation flow
 */

import beforeCreate from '../../entities/load/beforeCreate';
import beforeUpdate from '../../entities/load/beforeUpdate';
import afterRead from '../../entities/load/afterRead';

describe('Load Workflow Integration', () => {
  
  const mockBase44 = {
    asServiceRole: {
      entities: {
        Load: {
          filter: async () => []
        }
      }
    }
  };
  
  test('creates load with valid financials', async () => {
    const loadData = {
      customer_rate: 1000,
      carrier_pay: 800,
      fuel_surcharge_revenue: 100,
      accessorial_revenue_total: 50,
      pickup_date: '2025-01-01',
      delivery_date: '2025-01-02'
    };
    
    const result = await beforeCreate({
      data: loadData,
      user: { role: 'broker', id: 'user_1', email: 'broker@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.total_revenue).toBe(1150); // 1000 + 100 + 50
    expect(result.data.margin).toBe(350); // 1150 - 800
    expect(result.data.margin_percent).toBeCloseTo(30.43, 1);
    expect(result.data.calculated_by_server).toBe(true);
  });
  
  test('rejects negative margin without override', async () => {
    const loadData = {
      customer_rate: 800,
      carrier_pay: 1000
    };
    
    const result = await beforeCreate({
      data: loadData,
      user: { role: 'broker', id: 'user_1', email: 'broker@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(false);
    expect(result.errors[0].message).toContain('Negative margin');
  });
  
  test('allows negative margin with admin override', async () => {
    const loadData = {
      customer_rate: 800,
      carrier_pay: 1000,
      margin_override_approved: true
    };
    
    const result = await beforeCreate({
      data: loadData,
      user: { role: 'admin', id: 'admin_1', email: 'admin@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.margin).toBe(-200);
  });
  
  test('rejects pickup after delivery', async () => {
    const loadData = {
      customer_rate: 1000,
      carrier_pay: 800,
      pickup_date: '2025-01-05',
      delivery_date: '2025-01-01'
    };
    
    const result = await beforeCreate({
      data: loadData,
      user: { role: 'broker', id: 'user_1', email: 'broker@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(false);
    expect(result.errors[0].message).toContain('Pickup date cannot be after delivery');
  });
  
  test('carrier cannot see margin after read', async () => {
    const loadData = {
      id: 'load_1',
      customer_rate: 1000,
      carrier_pay: 800,
      margin: 200,
      margin_percent: 20,
      status: 'delivered'
    };
    
    const result = await afterRead({
      data: loadData,
      user: { role: 'carrier', id: 'carrier_1', email: 'carrier@test.com' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.customer_rate).toBeUndefined();
    expect(result.data.margin).toBeUndefined();
    expect(result.data.margin_percent).toBeUndefined();
    expect(result.data.carrier_pay).toBe(800); // Should see their pay
  });
  
  test('driver cannot see any financial data', async () => {
    const loadData = {
      id: 'load_1',
      customer_rate: 1000,
      carrier_pay: 800,
      margin: 200,
      status: 'delivered'
    };
    
    const result = await afterRead({
      data: loadData,
      user: { role: 'driver', id: 'driver_1', email: 'driver@test.com' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.customer_rate).toBeUndefined();
    expect(result.data.carrier_pay).toBeUndefined();
    expect(result.data.margin).toBeUndefined();
    expect(result.data.status).toBe('delivered'); // Operational data visible
  });
});