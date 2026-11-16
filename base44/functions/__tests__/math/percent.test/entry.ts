/**
 * Percentage Utilities Tests
 */

import { parsePercent, formatPercent, safePercent } from '../../../shared/math/percent';

describe('Percentage Utilities', () => {
  
  test('parses percentage strings', () => {
    expect(parsePercent('15%')).toBe(0.15);
    expect(parsePercent('15')).toBe(0.15);
    expect(parsePercent('0.15')).toBe(0.15);
  });
  
  test('formats as percentage string', () => {
    expect(formatPercent(0.15)).toBe('15.0%');
    expect(formatPercent(0.2567, 2)).toBe('25.67%');
  });
  
  test('safe percent handles zero denominator', () => {
    expect(safePercent(100, 0)).toBe(0);
    expect(safePercent(100, 200)).toBe(0.5);
  });
});