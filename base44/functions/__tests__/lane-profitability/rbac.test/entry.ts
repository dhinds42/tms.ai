/**
 * Lane Profitability RBAC Tests
 */

import afterRead from '../../entities/laneRatePreference/afterRead';

describe('Lane Profitability RBAC', () => {
  
  const mockData = {
    id: 'rate_1',
    lane_preference_id: 'lane_1',
    computed_customer_revenue_cents: 100000,
    computed_carrier_pay_cents: 75000,
    computed_driver_pay_cents: 25000,
    computed_broker_margin_cents: 25000,
    computed_broker_margin_bps: 2500,
    computed_carrier_profit_cents: 5000,
    computed_ownerop_profit_cents: 20000,
    driver_profitability_ok: true,
    carrier_profitability_ok: true,
    ownerop_profitability_ok: true,
    broker_profitability_ok: true
  };
  
  test('driver cannot see broker margin', async () => {
    const result = await afterRead({
      data: { ...mockData },
      user: { role: 'driver', id: 'driver_1', email: 'driver@test.com' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.computed_driver_pay_cents).toBe(25000); // Can see own pay
    expect(result.data.computed_broker_margin_cents).toBeUndefined(); // Cannot see
    expect(result.data.computed_broker_margin_bps).toBeUndefined();
    expect(result.data.broker_profitability_ok).toBeUndefined();
  });
  
  test('carrier cannot see broker margin or driver pay', async () => {
    const result = await afterRead({
      data: { ...mockData },
      user: { role: 'carrier', id: 'carrier_1', email: 'carrier@test.com' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.computed_carrier_profit_cents).toBe(5000); // Can see own profit
    expect(result.data.computed_broker_margin_cents).toBeUndefined();
    expect(result.data.computed_driver_pay_cents).toBeUndefined();
  });
  
  test('owner-operator sees only OO profitability', async () => {
    const result = await afterRead({
      data: { ...mockData },
      user: { role: 'owner_operator', id: 'oo_1', email: 'oo@test.com' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.computed_ownerop_profit_cents).toBe(20000); // Can see
    expect(result.data.computed_broker_margin_cents).toBeUndefined();
    expect(result.data.computed_carrier_profit_cents).toBeUndefined();
    expect(result.data.computed_driver_pay_cents).toBeUndefined();
  });
  
  test('broker sees everything', async () => {
    const result = await afterRead({
      data: { ...mockData },
      user: { role: 'broker', id: 'broker_1', email: 'broker@test.com' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.computed_broker_margin_cents).toBe(25000);
    expect(result.data.computed_carrier_profit_cents).toBe(5000);
    expect(result.data.computed_driver_pay_cents).toBe(25000);
  });
  
  test('customer is denied access', async () => {
    const result = await afterRead({
      data: { ...mockData },
      user: { role: 'customer', id: 'cust_1', email: 'customer@test.com' }
    });
    
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe('FORBIDDEN');
  });
});