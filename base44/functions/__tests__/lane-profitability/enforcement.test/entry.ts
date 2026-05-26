/**
 * Lane Profitability Enforcement Tests
 */

import beforeCreate from '../../entities/laneRatePreference/beforeCreate';

describe('Lane Profitability Enforcement', () => {
  
  const mockBase44 = {
    asServiceRole: {
      entities: {
        LanePreference: {
          filter: async () => [{
            id: 'lane_1',
            actor_type: 'carrier',
            actor_id: 'carrier_1'
          }]
        },
        LaneAssumption: {
          filter: async () => [{
            lane_preference_id: 'lane_1',
            estimated_loaded_miles: 500,
            estimated_deadhead_miles: 50
          }]
        },
        CostProfile: {
          filter: async (query) => {
            if (query.actor_type === 'carrier') {
              return [{
                actor_type: 'carrier',
                actor_id: 'carrier_1',
                fuel_cost_per_mile_cents: 50,
                maintenance_cost_per_mile_cents: 20,
                insurance_cost_per_mile_cents: 10,
                overhead_cost_per_mile_cents: 10,
                desired_profit_per_mile_cents: 30
              }];
            }
            if (query.actor_type === 'broker') {
              return [{
                actor_type: 'broker',
                desired_margin_bps: 1500
              }];
            }
            return [];
          }
        }
      }
    }
  };
  
  test('rejects negative rates', async () => {
    const result = await beforeCreate({
      data: {
        lane_preference_id: 'lane_1',
        rate_type: 'per_mile',
        target_rpm_cents: -100
      },
      user: { role: 'carrier', id: 'carrier_1', email: 'test@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe('VALIDATION');
  });
  
  test('requires rpm for per_mile rate type', async () => {
    const result = await beforeCreate({
      data: {
        lane_preference_id: 'lane_1',
        rate_type: 'per_mile'
        // Missing target_rpm_cents
      },
      user: { role: 'carrier', id: 'carrier_1', email: 'test@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(false);
    expect(result.errors[0].message).toContain('required');
  });
  
  test('computes profitability snapshot server-side', async () => {
    const result = await beforeCreate({
      data: {
        lane_preference_id: 'lane_1',
        rate_type: 'per_mile',
        target_rpm_cents: 200
      },
      user: { role: 'carrier', id: 'carrier_1', email: 'test@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.computed_loaded_miles).toBe(500);
    expect(result.data.computed_total_miles).toBe(550);
    expect(result.data.computed_customer_revenue_cents).toBeGreaterThan(0);
    expect(result.data.explain_calculation_json).toBeDefined();
    expect(result.data.calculated_at).toBeDefined();
  });
  
  test('sets pending approval for unprofitable rates', async () => {
    const result = await beforeCreate({
      data: {
        lane_preference_id: 'lane_1',
        rate_type: 'per_mile',
        target_rpm_cents: 50 // Too low to be profitable
      },
      user: { role: 'carrier', id: 'carrier_1', email: 'test@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.approval_status).toBe('pending');
  });
});