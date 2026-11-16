/**
 * Load Rate Calculation Tests
 */

import { calculateLoadFinancials, validateLoadFinancials } from '../../../shared/math/rates';
import { dollarsToCents } from '../../../shared/math/money';

describe('Load Rate Calculations', () => {
  
  test('calculates basic load financials', () => {
    const result = calculateLoadFinancials({
      customerRate: dollarsToCents(1000),      // $1000
      fuelSurcharge: dollarsToCents(100),      // $100
      accessorials: [dollarsToCents(50)],      // $50
      carrierPay: dollarsToCents(800),         // $800
      carrierAccessorials: [dollarsToCents(20)] // $20
    });
    
    // Total customer charge = 1000 + 100 + 50 = 1150
    expect(result.totalCustomerCharge).toBe(115000);
    
    // Total carrier cost = 800 + 20 = 820
    expect(result.totalCarrierCost).toBe(82000);
    
    // Gross margin = 1150 - 820 = 330
    expect(result.grossMargin).toBe(33000);
    
    // Margin % = 330 / 1150 = 28.7%
    expect(result.marginPercent).toBeCloseTo(28.7, 1);
  });
  
  test('handles zero margin', () => {
    const result = calculateLoadFinancials({
      customerRate: dollarsToCents(1000),
      carrierPay: dollarsToCents(1000)
    });
    
    expect(result.grossMargin).toBe(0);
    expect(result.marginPercent).toBe(0);
  });
  
  test('handles negative margin', () => {
    const result = calculateLoadFinancials({
      customerRate: dollarsToCents(800),
      carrierPay: dollarsToCents(1000)
    });
    
    expect(result.grossMargin).toBe(-20000); // -$200
    expect(result.marginPercent).toBe(-25); // -25%
  });
  
  test('calculates overhead and insurance allocations', () => {
    const result = calculateLoadFinancials({
      customerRate: dollarsToCents(1000),
      carrierPay: dollarsToCents(800),
      overheadPercent: 15,
      insurancePercent: 2
    });
    
    // Overhead = 15% of $1000 = $150
    expect(result.overheadAllocation).toBe(15000);
    
    // Insurance = 2% of $1000 = $20
    expect(result.insuranceAllocation).toBe(2000);
    
    // True profit = gross margin - overhead - insurance
    // = 200 - 150 - 20 = 30
    expect(result.trueProfit).toBe(3000);
  });
  
  test('validation rejects negative margin without override', () => {
    const financials = calculateLoadFinancials({
      customerRate: dollarsToCents(800),
      carrierPay: dollarsToCents(1000)
    });
    
    const validation = validateLoadFinancials(financials, {
      allowNegativeMargin: false
    });
    
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors[0]).toContain('Negative margin');
  });
  
  test('validation allows negative margin with override', () => {
    const financials = calculateLoadFinancials({
      customerRate: dollarsToCents(800),
      carrierPay: dollarsToCents(1000)
    });
    
    const validation = validateLoadFinancials(financials, {
      allowNegativeMargin: true
    });
    
    expect(validation.valid).toBe(true);
  });
  
  test('validation enforces minimum margin percent', () => {
    const financials = calculateLoadFinancials({
      customerRate: dollarsToCents(1000),
      carrierPay: dollarsToCents(980) // Only 2% margin
    });
    
    const validation = validateLoadFinancials(financials, {
      minMarginPercent: 5
    });
    
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('below minimum');
  });
  
  test('validation rejects negative rates', () => {
    const financials = calculateLoadFinancials({
      customerRate: dollarsToCents(-100),
      carrierPay: dollarsToCents(800)
    });
    
    const validation = validateLoadFinancials(financials);
    
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Customer rate cannot be negative');
  });
});