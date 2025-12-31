/**
 * Percentage Utilities
 */

import { roundPercentage } from './rounding';

/**
 * Parse percentage string or number to decimal
 * "15%" → 0.15
 * 15 → 0.15
 * 0.15 → 0.15
 */
export function parsePercent(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  
  let num: number;
  
  if (typeof value === 'string') {
    // Remove % sign and spaces
    const cleaned = value.replace(/%/g, '').trim();
    num = parseFloat(cleaned);
    
    if (isNaN(num)) {
      throw new Error(`Invalid percentage: "${value}"`);
    }
  } else {
    num = value;
  }
  
  // If > 1, assume it's a percentage (15 → 0.15)
  if (num > 1 || num < -1) {
    num = num / 100;
  }
  
  return num;
}

/**
 * Format decimal as percentage string
 * 0.15 → "15.0%"
 * 0.2567 → "25.7%"
 */
export function formatPercent(decimal: number, decimals: number = 1): string {
  return `${roundPercentage(decimal * 100, decimals).toFixed(decimals)}%`;
}

/**
 * Safe percentage calculation (handles zero denominator)
 * @returns percentage as decimal (0.15 for 15%)
 */
export function safePercent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Calculate percentage of a value
 * percentOf(100, 0.15) → 15
 */
export function percentOf(value: number, percent: number): number {
  return value * percent;
}

/**
 * Check if value is within percentage tolerance
 * isWithinPercentTolerance(100, 105, 0.06) → true (within 6%)
 */
export function isWithinPercentTolerance(
  value: number,
  expected: number,
  tolerancePercent: number
): boolean {
  if (expected === 0) {
    return Math.abs(value) <= tolerancePercent;
  }
  
  const diff = Math.abs(value - expected);
  const percentDiff = diff / Math.abs(expected);
  
  return percentDiff <= tolerancePercent;
}