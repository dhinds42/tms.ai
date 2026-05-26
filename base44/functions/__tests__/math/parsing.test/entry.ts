/**
 * Currency Parsing Tests
 */

import { parseCurrency } from '../../shared/math/parsing';

describe('Currency Parsing', () => {
  
  test('parses plain numbers', () => {
    expect(parseCurrency(1234.56)).toBe(123456);
    expect(parseCurrency(100)).toBe(10000);
    expect(parseCurrency(0.99)).toBe(99);
  });
  
  test('parses currency strings with $', () => {
    expect(parseCurrency('$1,234.56')).toBe(123456);
    expect(parseCurrency('$100')).toBe(10000);
    expect(parseCurrency('$0.99')).toBe(99);
  });
  
  test('parses strings with commas', () => {
    expect(parseCurrency('1,234.56')).toBe(123456);
    expect(parseCurrency('10,000')).toBe(1000000);
  });
  
  test('parses strings with spaces', () => {
    expect(parseCurrency('1 234.56')).toBe(123456);
    expect(parseCurrency('$ 100')).toBe(10000);
  });
  
  test('handles empty/null/undefined', () => {
    expect(parseCurrency(null)).toBe(0);
    expect(parseCurrency(undefined)).toBe(0);
    expect(parseCurrency('')).toBe(0);
  });
  
  test('throws on invalid input', () => {
    expect(() => parseCurrency('abc')).toThrow('Invalid currency');
    expect(() => parseCurrency('$$$')).toThrow('Invalid currency');
  });
  
  test('handles edge cases', () => {
    expect(parseCurrency('0')).toBe(0);
    expect(parseCurrency('0.00')).toBe(0);
    expect(parseCurrency('.50')).toBe(50); // $0.50
  });
});