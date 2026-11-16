/**
 * Audit Math Tests
 */

import { 
  recomputeDerivedFields, 
  assertInvariants,
  diffFinancialFields,
  explainCalculation
} from '../../../shared/math/auditMath';

describe('Audit Math', () => {
  
  test('recomputes load derived fields', () => {
    const load = {
      customer_rate: 1000,
      carrier_pay: 800,
      fuel_surcharge_revenue: 100,
      accessorial_revenue_total: 50
    };
    
    const recomputed = recomputeDerivedFields('Load', load);
    
    expect(recomputed.total_revenue).toBe(1150);
    expect(recomputed.margin).toBeCloseTo(350, 1);
    expect(recomputed.margin_percent).toBeCloseTo(30.43, 1);
  });
  
  test('asserts load invariants pass', () => {
    const validLoad = {
      customer_rate: 1000,
      fuel_surcharge_revenue: 100,
      accessorial_revenue_total: 50,
      total_revenue: 1150,
      total_carrier_cost: 800,
      margin: 350
    };
    
    const result = assertInvariants('Load', validLoad);
    expect(result.ok).toBe(true);
    expect(result.errors.length).toBe(0);
  });
  
  test('asserts load invariants fail on mismatch', () => {
    const invalidLoad = {
      customer_rate: 1000,
      total_revenue: 999, // Wrong!
      total_carrier_cost: 800,
      margin: 350
    };
    
    const result = assertInvariants('Load', invalidLoad);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
  
  test('diffs financial fields', () => {
    const before = {
      customer_rate: 1000,
      carrier_pay: 800,
      margin: 200
    };
    
    const after = {
      customer_rate: 1100,
      carrier_pay: 800,
      margin: 300
    };
    
    const diffs = diffFinancialFields(before, after);
    
    expect(diffs.length).toBe(2); // customer_rate and margin changed
    expect(diffs[0].field).toBe('customer_rate');
    expect(diffs[0].before).toBe(1000);
    expect(diffs[0].after).toBe(1100);
  });
  
  test('explains calculation', () => {
    const load = {
      load_number: 'L-001',
      customer_rate: 1000,
      carrier_pay: 800,
      margin: 200,
      margin_percent: 20
    };
    
    const explanation = explainCalculation('Load', load);
    
    expect(explanation).toContain('L-001');
    expect(explanation).toContain('$1000');
    expect(explanation).toContain('$200');
  });
});