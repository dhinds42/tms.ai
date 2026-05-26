/**
 * Parsing Utilities
 * Convert strings to numbers safely with validation
 */

import { dollarsToCents, Cents } from './money';

/**
 * Parse currency string to cents
 * Handles: $1,234.56, 1234.56, $1234, 1,234, etc.
 * 
 * @param value - Currency string or number
 * @returns Integer cents
 * @throws Error if invalid
 */
export function parseCurrency(value: string | number | null | undefined): Cents {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  if (typeof value === 'number') {
    return dollarsToCents(value);
  }
  
  // Remove currency symbols, commas, spaces
  const cleaned = value
    .replace(/[$€£¥,\s]/g, '')
    .trim();
  
  if (cleaned === '') {
    return 0;
  }
  
  // Parse as float
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error(`Invalid currency value: "${value}"`);
  }
  
  return dollarsToCents(parsed);
}

/**
 * Parse number string safely
 */
export function parseNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  // Remove commas and spaces
  const cleaned = value.replace(/[,\s]/g, '').trim();
  
  if (cleaned === '') {
    return 0;
  }
  
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error(`Invalid number: "${value}"`);
  }
  
  return parsed;
}

/**
 * Parse miles (handles decimals)
 */
export function parseMiles(value: string | number | null | undefined): number {
  const miles = parseNumber(value);
  
  if (miles < 0) {
    throw new Error(`Miles cannot be negative: ${miles}`);
  }
  
  return Math.round(miles * 10) / 10; // Round to 1 decimal
}

/**
 * Parse weight in pounds
 */
export function parseWeight(value: string | number | null | undefined): number {
  const weight = parseNumber(value);
  
  if (weight < 0) {
    throw new Error(`Weight cannot be negative: ${weight}`);
  }
  
  return Math.round(weight); // Integer pounds
}

/**
 * Parse percentage (returns decimal: 15% → 0.15)
 */
export function parsePercentage(value: string | number | null | undefined): number {
  let percent = parseNumber(value);
  
  // If value looks like it's already a decimal (0.15), use as-is
  // If it's > 1, assume it's a percentage (15 → 0.15)
  if (percent > 1) {
    percent = percent / 100;
  }
  
  if (percent < 0 || percent > 1) {
    throw new Error(`Percentage must be between 0 and 1: ${percent}`);
  }
  
  return percent;
}

/**
 * Parse integer safely
 */
export function parseInteger(value: string | number | null | undefined): number {
  const num = parseNumber(value);
  return Math.round(num);
}

/**
 * Validate and normalize phone number
 */
export function parsePhone(value: string | null | undefined): string {
  if (!value) return '';
  
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Validate length (US: 10 digits)
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    // Strip leading 1
    return parsePhone(digits.slice(1));
  }
  
  // Return original if can't parse
  return value;
}

/**
 * Parse date string to Date object
 */
export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  
  if (value instanceof Date) {
    return value;
  }
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: "${value}"`);
  }
  
  return date;
}

/**
 * Validate date is not in past
 */
export function assertFutureDate(date: Date, fieldName: string = 'date'): void {
  if (date < new Date()) {
    throw new Error(`${fieldName} cannot be in the past`);
  }
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / msPerDay);
}