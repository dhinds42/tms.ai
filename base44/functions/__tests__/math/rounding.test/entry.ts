/**
 * Rounding Strategy Tests
 */

import { roundTo, roundCurrency, RoundingStrategy } from '../../shared/math/rounding';

describe('Rounding Strategies', () => {
  
  test('HALF_UP rounds 0.5 up', () => {
    expect(roundTo(0.5, 0, RoundingStrategy.HALF_UP)).toBe(1);
    expect(roundTo(1.5, 0, RoundingStrategy.HALF_UP)).toBe(2);
    expect(roundTo(2.5, 0, RoundingStrategy.HALF_UP)).toBe(3);
  });
  
  test('HALF_EVEN rounds 0.5 to nearest even', () => {
    expect(roundTo(0.5, 0, RoundingStrategy.HALF_EVEN)).toBe(0);
    expect(roundTo(1.5, 0, RoundingStrategy.HALF_EVEN)).toBe(2);
    expect(roundTo(2.5, 0, RoundingStrategy.HALF_EVEN)).toBe(2);
  });
  
  test('rounds currency to 2 decimals', () => {
    expect(roundCurrency(123.456)).toBe(123.46);
    expect(roundCurrency(123.454)).toBe(123.45);
    expect(roundCurrency(123.455)).toBe(123.46); // HALF_UP
  });
  
  test('handles edge case 0.005', () => {
    expect(roundCurrency(0.005)).toBe(0.01); // HALF_UP
  });
});