/**
 * Allocation Utilities
 * For splitting money across multiple items with penny-perfect precision
 */

import * as Money from './money';

/**
 * Reconcile header total to line items
 * Ensures sum(lines) exactly equals header (penny-perfect)
 * 
 * @param headerTotal - Expected total in cents
 * @param lineAmounts - Array of line amounts in cents
 * @returns Adjusted line amounts or error
 */
export function reconcileHeaderToLines(
  headerTotal: Money.Cents,
  lineAmounts: Money.Cents[]
): { ok: boolean; adjusted?: Money.Cents[]; variance?: Money.Cents; error?: string } {
  
  if (lineAmounts.length === 0) {
    return {
      ok: false,
      error: 'Cannot reconcile empty line items'
    };
  }
  
  const lineSum = Money.sum(lineAmounts);
  const variance = Money.subtract(headerTotal, lineSum);
  
  // If already matches, return as-is
  if (variance === 0) {
    return {
      ok: true,
      adjusted: lineAmounts,
      variance: 0
    };
  }
  
  // If variance is within reasonable tolerance (1 cent per line max), adjust
  const maxTolerance = lineAmounts.length; // 1 cent per line
  
  if (Math.abs(variance) > maxTolerance) {
    return {
      ok: false,
      variance,
      error: `Header/line variance ${Money.formatCurrency(variance)} exceeds tolerance`
    };
  }
  
  // Distribute variance across lines
  const adjusted = [...lineAmounts];
  let remaining = variance;
  
  // Add/subtract 1 cent at a time to largest lines
  const indices = adjusted
    .map((amt, idx) => ({ idx, amt: Math.abs(amt) }))
    .sort((a, b) => b.amt - a.amt)
    .map(item => item.idx);
  
  for (let i = 0; i < indices.length && remaining !== 0; i++) {
    const idx = indices[i];
    if (remaining > 0) {
      adjusted[idx] += 1;
      remaining -= 1;
    } else {
      adjusted[idx] -= 1;
      remaining += 1;
    }
  }
  
  return {
    ok: true,
    adjusted,
    variance: 0
  };
}

/**
 * Validate tolerance between two amounts
 */
export function isWithinTolerance(
  actual: Money.Cents,
  expected: Money.Cents,
  toleranceCents: Money.Cents = 5
): boolean {
  return Math.abs(Money.subtract(actual, expected)) <= toleranceCents;
}