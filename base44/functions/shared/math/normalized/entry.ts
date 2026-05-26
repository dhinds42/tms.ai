/**
 * Unit Normalization Utilities
 */

/**
 * Normalize weight units
 */
export function normalizeWeight(value: number, fromUnit: 'lbs' | 'kg', toUnit: 'lbs' | 'kg' = 'lbs'): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return value * 2.20462;
  }
  
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return value / 2.20462;
  }
  
  return value;
}

/**
 * Normalize distance units
 */
export function normalizeDistance(value: number, fromUnit: 'mi' | 'km', toUnit: 'mi' | 'km' = 'mi'): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'km' && toUnit === 'mi') {
    return value * 0.621371;
  }
  
  if (fromUnit === 'mi' && toUnit === 'km') {
    return value / 0.621371;
  }
  
  return value;
}

/**
 * Normalize temperature units
 */
export function normalizeTemperature(value: number, fromUnit: 'F' | 'C', toUnit: 'F' | 'C' = 'F'): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'C' && toUnit === 'F') {
    return (value * 9/5) + 32;
  }
  
  if (fromUnit === 'F' && toUnit === 'C') {
    return (value - 32) * 5/9;
  }
  
  return value;
}