/**
 * Allocation & Reconciliation Tests
 */

import { reconcileHeaderToLines, isWithinTolerance } from '../../shared/math/allocation';
import { dollarsToCents, sum } from '../../shared/math/money';

describe('Allocation Utilities', () => {
  
  test('reconciles matching header and lines', () => {
    const result = reconcileHeaderToLines(
      dollarsToCents(100),
      [dollarsToCents(50), dollarsToCents(30), dollarsToCents(20)]
    );
    
    expect(result.ok).toBe(true);
    expect(result.variance).toBe(0);
  });
  
  test('reconciles with small variance', () => {
    const result = reconcileHeaderToLines(
      10000, // $100.00
      [3333, 3333, 3333] // $33.33 * 3 = $99.99
    );
    
    expect(result.ok).toBe(true);
    expect(result.adjusted).toBeDefined();
    expect(sum(result.adjusted!)).toBe(10000); // Penny-perfect
  });
  
  test('rejects large variance', () => {
    const result = reconcileHeaderToLines(
      dollarsToCents(100),
      [dollarsToCents(50), dollarsToCents(30)] // Missing $20
    );
    
    expect(result.ok).toBe(false);
    expect(result.error).toContain('variance');
  });
  
  test('checks tolerance', () => {
    expect(isWithinTolerance(10000, 10003, 5)).toBe(true); // Within 5 cents
    expect(isWithinTolerance(10000, 10010, 5)).toBe(false); // Outside 5 cents
  });
});