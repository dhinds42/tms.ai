/**
 * Rounding Rules
 * Centralized rounding logic for consistency
 */

/**
 * Rounding strategy enum
 */
export enum RoundingStrategy {
  HALF_UP = 'HALF_UP',           // 0.5 rounds up (commercial rounding)
  HALF_DOWN = 'HALF_DOWN',       // 0.5 rounds down
  HALF_EVEN = 'HALF_EVEN',       // 0.5 rounds to nearest even (banker's rounding)
  UP = 'UP',                     // Always round up
  DOWN = 'DOWN',                 // Always round down (truncate)
}

/**
 * Default rounding strategy for the application
 */
export const DEFAULT_ROUNDING = RoundingStrategy.HALF_UP;

/**
 * Round to specified decimal places using given strategy
 * 
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @param strategy - Rounding strategy
 */
export function roundTo(
  value: number, 
  decimals: number = 2, 
  strategy: RoundingStrategy = DEFAULT_ROUNDING
): number {
  const multiplier = Math.pow(10, decimals);
  const shifted = value * multiplier;
  
  let rounded: number;
  
  switch (strategy) {
    case RoundingStrategy.HALF_UP:
      rounded = Math.round(shifted);
      break;
      
    case RoundingStrategy.HALF_DOWN:
      // Round down at 0.5
      rounded = shifted < 0 
        ? Math.round(shifted) 
        : Math.floor(shifted + 0.5);
      break;
      
    case RoundingStrategy.HALF_EVEN:
      // Banker's rounding
      const floor = Math.floor(shifted);
      const diff = shifted - floor;
      
      if (diff < 0.5) {
        rounded = floor;
      } else if (diff > 0.5) {
        rounded = floor + 1;
      } else {
        // Exactly 0.5 - round to even
        rounded = floor % 2 === 0 ? floor : floor + 1;
      }
      break;
      
    case RoundingStrategy.UP:
      rounded = Math.ceil(shifted);
      break;
      
    case RoundingStrategy.DOWN:
      rounded = Math.floor(shifted);
      break;
      
    default:
      rounded = Math.round(shifted);
  }
  
  return rounded / multiplier;
}

/**
 * Round currency to 2 decimal places
 * Uses default rounding strategy
 */
export function roundCurrency(value: number): number {
  return roundTo(value, 2, DEFAULT_ROUNDING);
}

/**
 * Round percentage to specified decimals (default 1)
 */
export function roundPercentage(value: number, decimals: number = 1): number {
  return roundTo(value, decimals, DEFAULT_ROUNDING);
}

/**
 * Round to nearest cent (for money in dollars)
 */
export function roundToNearestCent(dollars: number): number {
  return roundCurrency(dollars);
}

/**
 * Round weight to 1 decimal
 */
export function roundWeight(pounds: number): number {
  return roundTo(pounds, 1);
}

/**
 * Round miles to 1 decimal
 */
export function roundMiles(miles: number): number {
  return roundTo(miles, 1);
}

/**
 * Round to nearest integer
 */
export function roundToInteger(value: number, strategy: RoundingStrategy = DEFAULT_ROUNDING): number {
  return Math.round(roundTo(value, 0, strategy));
}

/**
 * Check if two values are equal within tolerance (for floating point comparisons)
 */
export function areEqual(a: number, b: number, tolerance: number = 0.001): boolean {
  return Math.abs(a - b) < tolerance;
}