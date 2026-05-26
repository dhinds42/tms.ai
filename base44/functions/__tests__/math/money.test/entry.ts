/**
 * Money Math Tests
 * Verify integer-cents arithmetic and floating-point safety
 */

import * as Money from '../../shared/math/money';

describe('Money Mathematics', () => {
  
  describe('dollarsToCents', () => {
    test('converts whole dollars', () => {
      expect(Money.dollarsToCents(100)).toBe(10000);
      expect(Money.dollarsToCents(1)).toBe(100);
      expect(Money.dollarsToCents(0)).toBe(0);
    });
    
    test('converts decimal dollars', () => {
      expect(Money.dollarsToCents(123.45)).toBe(12345);
      expect(Money.dollarsToCents(0.99)).toBe(99);
      expect(Money.dollarsToCents(0.01)).toBe(1);
    });
    
    test('handles floating-point precision issues', () => {
      // 0.1 + 0.2 = 0.30000000000000004 in JavaScript
      const sum = 0.1 + 0.2;
      expect(Money.dollarsToCents(sum)).toBe(30); // Should be 30 cents
    });
    
    test('handles string input', () => {
      expect(Money.dollarsToCents('123.45')).toBe(12345);
      expect(Money.dollarsToCents('100')).toBe(10000);
    });
    
    test('throws on invalid input', () => {
      expect(() => Money.dollarsToCents('abc')).toThrow();
      expect(() => Money.dollarsToCents(NaN)).toThrow();
    });
  });
  
  describe('centsToDollars', () => {
    test('converts cents to dollars', () => {
      expect(Money.centsToDollars(10000)).toBe(100);
      expect(Money.centsToDollars(12345)).toBe(123.45);
      expect(Money.centsToDollars(99)).toBe(0.99);
      expect(Money.centsToDollars(0)).toBe(0);
    });
  });
  
  describe('arithmetic operations', () => {
    test('add', () => {
      expect(Money.add(10000, 5000)).toBe(15000); // $100 + $50 = $150
      expect(Money.add(99, 1)).toBe(100); // $0.99 + $0.01 = $1.00
    });
    
    test('subtract', () => {
      expect(Money.subtract(10000, 5000)).toBe(5000); // $100 - $50 = $50
      expect(Money.subtract(100, 1)).toBe(99); // $1.00 - $0.01 = $0.99
    });
    
    test('multiply', () => {
      expect(Money.multiply(100, 10)).toBe(1000); // $1.00 * 10 = $10.00
      expect(Money.multiply(125, 1.5)).toBe(188); // $1.25 * 1.5 = $1.88 (rounded)
    });
    
    test('divide', () => {
      expect(Money.divide(10000, 2)).toBe(5000); // $100 / 2 = $50
      expect(Money.divide(100, 3)).toBe(33); // $1.00 / 3 = $0.33 (rounded)
    });
    
    test('divide by zero throws', () => {
      expect(() => Money.divide(100, 0)).toThrow();
    });
    
    test('percentage', () => {
      expect(Money.percentage(10000, 10)).toBe(1000); // 10% of $100 = $10
      expect(Money.percentage(10000, 15)).toBe(1500); // 15% of $100 = $15
      expect(Money.percentage(12345, 2)).toBe(247); // 2% of $123.45 = $2.47 (rounded)
    });
  });
  
  describe('aggregations', () => {
    test('sum', () => {
      expect(Money.sum([1000, 2000, 3000])).toBe(6000); // $10 + $20 + $30 = $60
      expect(Money.sum([])).toBe(0);
    });
    
    test('average', () => {
      expect(Money.average([1000, 2000, 3000])).toBe(2000); // avg($10, $20, $30) = $20
      expect(Money.average([])).toBe(0);
    });
  });
  
  describe('allocate', () => {
    test('splits money proportionally', () => {
      const result = Money.allocate(10000, [1, 1, 1]); // $100 split 3 ways
      expect(result).toHaveLength(3);
      expect(Money.sum(result)).toBe(10000); // Total preserved
      expect(result[0]).toBe(3333); // $33.33
      expect(result[1]).toBe(3333); // $33.33
      expect(result[2]).toBe(10000 - 3333 - 3333); // $33.34 (remainder)
    });
    
    test('handles unequal ratios', () => {
      const result = Money.allocate(10000, [1, 2, 1]); // 1:2:1 split
      expect(Money.sum(result)).toBe(10000);
      expect(result[1]).toBeGreaterThan(result[0]); // Middle should be larger
    });
  });
  
  describe('formatCurrency', () => {
    test('formats USD', () => {
      expect(Money.formatCurrency(12345)).toBe('$123.45');
      expect(Money.formatCurrency(10000)).toBe('$100.00');
      expect(Money.formatCurrency(99)).toBe('$0.99');
    });
  });
  
  describe('comparisons', () => {
    test('comparison operators', () => {
      expect(Money.isGreaterThan(10000, 5000)).toBe(true);
      expect(Money.isLessThan(5000, 10000)).toBe(true);
      expect(Money.isEqual(10000, 10000)).toBe(true);
    });
  });
  
  describe('assertNonNegative', () => {
    test('passes for non-negative', () => {
      expect(() => Money.assertNonNegative(0)).not.toThrow();
      expect(() => Money.assertNonNegative(100)).not.toThrow();
    });
    
    test('throws for negative', () => {
      expect(() => Money.assertNonNegative(-100)).toThrow();
    });
  });
});