/**
 * RBAC Load Field Redaction Tests
 */

import afterRead from '../../../entities/load/afterRead';

describe('Load RBAC Redaction', () => {
  
  const mockLoad = {
    id: 'load_123',
    load_number: 'L-001',
    customer_rate: 1000,
    carrier_pay: 800,
    fuel_surcharge_revenue: 100,
    accessorial_revenue_total: 50,
    total_revenue: 1150,
    total_carrier_cost: 820,
    margin: 330,
    margin_percent: 28.7,
    internal_notes: 'Confidential broker notes',
    status: 'delivered'
  };
  
  test('broker/admin sees all fields', async () => {
    const result = await afterRead({
      data: { ...mockLoad },
      user: { role: 'admin' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.customer_rate).toBe(1000);
    expect(result.data.carrier_pay).toBe(800);
    expect(result.data.margin).toBe(330);
    expect(result.data.margin_percent).toBe(28.7);
  });
  
  test('carrier cannot see customer_rate or margin', async () => {
    const result = await afterRead({
      data: { ...mockLoad },
      user: { role: 'carrier' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.customer_rate).toBeUndefined();
    expect(result.data.margin).toBeUndefined();
    expect(result.data.margin_percent).toBeUndefined();
    expect(result.data.internal_notes).toBeUndefined();
    
    // Carrier should see their pay
    expect(result.data.carrier_pay).toBe(800);
  });
  
  test('driver cannot see any financial fields', async () => {
    const result = await afterRead({
      data: { ...mockLoad },
      user: { role: 'driver' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.customer_rate).toBeUndefined();
    expect(result.data.carrier_pay).toBeUndefined();
    expect(result.data.margin).toBeUndefined();
    expect(result.data.margin_percent).toBeUndefined();
    
    // Driver should see operational fields
    expect(result.data.status).toBe('delivered');
    expect(result.data.load_number).toBe('L-001');
  });
  
  test('customer sees invoice info but not carrier pay or margin', async () => {
    const result = await afterRead({
      data: { ...mockLoad },
      user: { role: 'customer' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.customer_rate).toBe(1000);
    expect(result.data.carrier_pay).toBeUndefined();
    expect(result.data.margin).toBeUndefined();
    expect(result.data.margin_percent).toBeUndefined();
    expect(result.data.internal_notes).toBeUndefined();
  });
});