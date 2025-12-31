/**
 * Unit Normalization Tests
 */

import { normalizeWeight, normalizeDistance, normalizeTemperature } from '../../shared/math/normalized';

describe('Unit Normalization', () => {
  
  test('converts kg to lbs', () => {
    const lbs = normalizeWeight(100, 'kg', 'lbs');
    expect(lbs).toBeCloseTo(220.462, 2);
  });
  
  test('converts lbs to kg', () => {
    const kg = normalizeWeight(220.462, 'lbs', 'kg');
    expect(kg).toBeCloseTo(100, 2);
  });
  
  test('converts km to mi', () => {
    const mi = normalizeDistance(100, 'km', 'mi');
    expect(mi).toBeCloseTo(62.137, 2);
  });
  
  test('converts mi to km', () => {
    const km = normalizeDistance(100, 'mi', 'km');
    expect(km).toBeCloseTo(160.934, 2);
  });
  
  test('converts celsius to fahrenheit', () => {
    const f = normalizeTemperature(0, 'C', 'F');
    expect(f).toBe(32);
  });
  
  test('converts fahrenheit to celsius', () => {
    const c = normalizeTemperature(32, 'F', 'C');
    expect(c).toBe(0);
  });
  
  test('returns same value for matching units', () => {
    expect(normalizeWeight(100, 'lbs', 'lbs')).toBe(100);
    expect(normalizeDistance(100, 'mi', 'mi')).toBe(100);
  });
});