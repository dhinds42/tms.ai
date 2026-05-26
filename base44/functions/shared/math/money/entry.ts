/**
 * Money Mathematics Library
 * All money values are represented as INTEGER CENTS to avoid floating-point precision issues
 * 
 * Example: $123.45 = 12345 cents
 */

export type Cents = number; // Always an integer

/**
 * Convert dollars (float) to cents (integer)
 * @param dollars - Dollar amount (can have decimals)
 * @returns Integer cents
 */
export function dollarsToCents(dollars: number | string): Cents {
  if (typeof dollars === 'string') {
    dollars = parseFloat(dollars);
  }
  
  if (isNaN(dollars)) {
    throw new Error(`Invalid dollar amount: ${dollars}`);
  }
  
  // Multiply by 100 and round to handle floating-point imprecision
  return Math.round(dollars * 100);
}

/**
 * Convert cents (integer) to dollars (float)
 * @param cents - Integer cents
 * @returns Dollar amount with 2 decimals
 */
export function centsToDollars(cents: Cents): number {
  return cents / 100;
}

/**
 * Add two money amounts (in cents)
 */
export function add(a: Cents, b: Cents): Cents {
  return a + b;
}

/**
 * Subtract money amounts (in cents)
 */
export function subtract(a: Cents, b: Cents): Cents {
  return a - b;
}

/**
 * Multiply money by a scalar (e.g., quantity * price)
 * @param cents - Money amount in cents
 * @param multiplier - Scalar value
 * @returns Result in cents, rounded
 */
export function multiply(cents: Cents, multiplier: number): Cents {
  return Math.round(cents * multiplier);
}

/**
 * Divide money by a scalar
 * @param cents - Money amount in cents
 * @param divisor - Scalar value
 * @returns Result in cents, rounded
 */
export function divide(cents: Cents, divisor: number): Cents {
  if (divisor === 0) {
    throw new Error('Division by zero');
  }
  return Math.round(cents / divisor);
}

/**
 * Calculate percentage of a money amount
 * @param cents - Money amount in cents
 * @param percentage - Percentage (e.g., 15 for 15%)
 * @returns Result in cents
 */
export function percentage(cents: Cents, percentage: number): Cents {
  return Math.round((cents * percentage) / 100);
}

/**
 * Sum an array of money amounts
 */
export function sum(amounts: Cents[]): Cents {
  return amounts.reduce((total, amount) => total + amount, 0);
}

/**
 * Calculate average of money amounts
 */
export function average(amounts: Cents[]): Cents {
  if (amounts.length === 0) return 0;
  return Math.round(sum(amounts) / amounts.length);
}

/**
 * Compare two money amounts
 */
export function isGreaterThan(a: Cents, b: Cents): boolean {
  return a > b;
}

export function isLessThan(a: Cents, b: Cents): boolean {
  return a < b;
}

export function isEqual(a: Cents, b: Cents): boolean {
  return a === b;
}

/**
 * Ensure money amount is non-negative
 */
export function assertNonNegative(cents: Cents, fieldName: string = 'amount'): void {
  if (cents < 0) {
    throw new Error(`${fieldName} cannot be negative: ${centsToDollars(cents)}`);
  }
}

/**
 * Allocate money proportionally (for splitting costs)
 * Ensures total allocated equals input (handles rounding)
 * 
 * @param total - Total amount to allocate
 * @param ratios - Array of ratios (e.g., [1, 2, 1] for 1:2:1 split)
 * @returns Array of allocated amounts
 */
export function allocate(total: Cents, ratios: number[]): Cents[] {
  if (ratios.length === 0) {
    throw new Error('Cannot allocate to zero recipients');
  }
  
  const ratioSum = ratios.reduce((sum, r) => sum + r, 0);
  if (ratioSum === 0) {
    throw new Error('Ratio sum cannot be zero');
  }
  
  const results: Cents[] = [];
  let allocated = 0;
  
  // Allocate proportionally
  for (let i = 0; i < ratios.length; i++) {
    if (i === ratios.length - 1) {
      // Last item gets remainder to avoid rounding errors
      results.push(total - allocated);
    } else {
      const amount = Math.round((total * ratios[i]) / ratioSum);
      results.push(amount);
      allocated += amount;
    }
  }
  
  return results;
}

/**
 * Format cents as currency string
 * @param cents - Money amount in cents
 * @param locale - Locale for formatting (default: en-US)
 * @param currency - Currency code (default: USD)
 */
export function formatCurrency(
  cents: Cents, 
  locale: string = 'en-US', 
  currency: string = 'USD'
): string {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}

/**
 * Format cents as plain number with 2 decimals
 */
export function formatAmount(cents: Cents): string {
  return centsToDollars(cents).toFixed(2);
}