/**
 * Settlement Calculation Tests
 */

import { calculateSettlement, validateSettlement } from '../../../shared/math/settlements';
import { dollarsToCents } from '../../../shared/math/money';

describe('Settlement Calculations', () => {
  
  test('calculates basic settlement', () => {
    const result = calculateSettlement({
      loadPays: [dollarsToCents(500), dollarsToCents(600), dollarsToCents(700)]
    });
    
    expect(result.grossPay).toBe(180000); // $1800
    expect(result.totalAdvances).toBe(0);
    expect(result.totalDeductions).toBe(0);
    expect(result.netPay).toBe(180000);
  });
  
  test('subtracts advances from net', () => {
    const result = calculateSettlement({
      loadPays: [dollarsToCents(1000)],
      advances: [dollarsToCents(200)],
      fuelAdvances: [dollarsToCents(100)]
    });
    
    expect(result.grossPay).toBe(100000); // $1000
    expect(result.totalAdvances).toBe(30000); // $300
    expect(result.netPay).toBe(70000); // $700
  });
  
  test('subtracts deductions from net', () => {
    const result = calculateSettlement({
      loadPays: [dollarsToCents(1000)],
      deductions: [
        { type: 'insurance', amount: dollarsToCents(50) },
        { type: 'equipment', amount: dollarsToCents(100) }
      ]
    });
    
    expect(result.grossPay).toBe(100000); // $1000
    expect(result.totalDeductions).toBe(15000); // $150
    expect(result.netPay).toBe(85000); // $850
  });
  
  test('handles negative net pay', () => {
    const result = calculateSettlement({
      loadPays: [dollarsToCents(500)],
      advances: [dollarsToCents(700)]
    });
    
    expect(result.netPay).toBe(-20000); // -$200
  });
  
  test('validation rejects negative net without policy', () => {
    const settlement = calculateSettlement({
      loadPays: [dollarsToCents(500)],
      advances: [dollarsToCents(700)]
    });
    
    const validation = validateSettlement(settlement, {
      allowNegativeNet: false
    });
    
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('Negative net pay');
  });
  
  test('validation allows negative net with policy', () => {
    const settlement = calculateSettlement({
      loadPays: [dollarsToCents(500)],
      advances: [dollarsToCents(600)]
    });
    
    const validation = validateSettlement(settlement, {
      allowNegativeNet: true,
      maxNegativeNet: dollarsToCents(-500)
    });
    
    expect(validation.valid).toBe(true);
  });
  
  test('validation enforces max negative threshold', () => {
    const settlement = calculateSettlement({
      loadPays: [dollarsToCents(100)],
      advances: [dollarsToCents(800)]
    });
    
    const validation = validateSettlement(settlement, {
      allowNegativeNet: true,
      maxNegativeNet: dollarsToCents(-500)
    });
    
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('exceeds maximum negative threshold');
  });
});