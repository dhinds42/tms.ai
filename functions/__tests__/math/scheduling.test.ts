/**
 * Scheduling Math Tests
 */

import { 
  calcTransitHours, 
  isLate, 
  calcOnTimeClassification,
  calcHOSFeasibility
} from '../../shared/math/scheduling';

describe('Scheduling Calculations', () => {
  
  test('calculates transit hours', () => {
    const hours = calcTransitHours(500, 50); // 500 miles @ 50 mph
    expect(hours).toBe(10);
  });
  
  test('throws on invalid speed', () => {
    expect(() => calcTransitHours(500, 0)).toThrow();
  });
  
  test('detects late delivery', () => {
    const scheduled = new Date('2025-01-01T10:00:00');
    const actual = new Date('2025-01-01T11:00:00'); // 60 min late
    
    expect(isLate(actual, scheduled, 30)).toBe(true);
  });
  
  test('on-time within grace period', () => {
    const scheduled = new Date('2025-01-01T10:00:00');
    const actual = new Date('2025-01-01T10:20:00'); // 20 min late
    
    expect(isLate(actual, scheduled, 30)).toBe(false);
  });
  
  test('classifies delivery status', () => {
    const scheduled = new Date('2025-01-01T10:00:00');
    
    expect(calcOnTimeClassification(null, scheduled)).toBe('pending');
    expect(calcOnTimeClassification(new Date('2025-01-01T10:15:00'), scheduled)).toBe('on_time');
    expect(calcOnTimeClassification(new Date('2025-01-01T11:00:00'), scheduled)).toBe('late');
    expect(calcOnTimeClassification(new Date('2025-01-01T08:00:00'), scheduled)).toBe('early');
  });
  
  test('calculates HOS feasibility', () => {
    expect(calcHOSFeasibility(8, 10, false).feasible).toBe(true);
    expect(calcHOSFeasibility(12, 10, false).feasible).toBe(false);
    expect(calcHOSFeasibility(12, 10, true).feasible).toBe(true); // Reset available
  });
});