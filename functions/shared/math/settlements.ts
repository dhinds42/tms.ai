/**
 * Settlement Calculations
 * For driver and owner-operator pay
 */

import * as Money from './money';

export interface SettlementInput {
  loadPays: Money.Cents[];           // Pay for each load
  advances?: Money.Cents[];          // Cash advances given
  fuelAdvances?: Money.Cents[];     // Fuel card advances
  deductions?: {
    type: string;
    amount: Money.Cents;
  }[];
}

export interface Settlement {
  grossPay: Money.Cents;
  totalAdvances: Money.Cents;
  totalDeductions: Money.Cents;
  netPay: Money.Cents;
  breakdown: {
    loadCount: number;
    deductionCount: number;
    advanceCount: number;
  };
}

/**
 * Calculate driver/owner-operator settlement
 * 
 * @param input - Settlement calculation inputs
 * @returns Complete settlement with gross, deductions, and net
 */
export function calculateSettlement(input: SettlementInput): Settlement {
  // Gross pay = sum of all load payments
  const grossPay = Money.sum(input.loadPays || []);
  
  // Total advances
  const advances = input.advances || [];
  const fuelAdvances = input.fuelAdvances || [];
  const totalAdvances = Money.add(
    Money.sum(advances),
    Money.sum(fuelAdvances)
  );
  
  // Total deductions
  const deductions = input.deductions || [];
  const totalDeductions = Money.sum(
    deductions.map(d => d.amount)
  );
  
  // Net pay
  const netPay = Money.subtract(
    grossPay,
    Money.add(totalAdvances, totalDeductions)
  );
  
  return {
    grossPay,
    totalAdvances,
    totalDeductions,
    netPay,
    breakdown: {
      loadCount: input.loadPays?.length || 0,
      deductionCount: deductions.length,
      advanceCount: advances.length + fuelAdvances.length
    }
  };
}

/**
 * Validate settlement
 */
export function validateSettlement(
  settlement: Settlement,
  options?: {
    allowNegativeNet?: boolean;
    maxNegativeNet?: Money.Cents;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for negative gross pay
  if (settlement.grossPay < 0) {
    errors.push('Gross pay cannot be negative');
  }
  
  // Check for negative net pay (unless allowed)
  if (settlement.netPay < 0) {
    if (!options?.allowNegativeNet) {
      errors.push(
        `Negative net pay: $${Money.formatAmount(settlement.netPay)}. ` +
        `Deductions exceed gross pay.`
      );
    } else if (options.maxNegativeNet && settlement.netPay < options.maxNegativeNet) {
      errors.push(
        `Net pay $${Money.formatAmount(settlement.netPay)} exceeds maximum ` +
        `negative threshold $${Money.formatAmount(options.maxNegativeNet)}`
      );
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate percentage-based pay (for percentage of load)
 */
export function calculatePercentagePay(
  loadRevenue: Money.Cents,
  percentage: number
): Money.Cents {
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Invalid percentage: ${percentage}%`);
  }
  
  return Money.percentage(loadRevenue, percentage);
}

/**
 * Calculate per-mile pay
 */
export function calculatePerMilePay(
  miles: number,
  centsPerMile: number
): Money.Cents {
  if (miles < 0) {
    throw new Error('Miles cannot be negative');
  }
  
  if (centsPerMile < 0) {
    throw new Error('Rate per mile cannot be negative');
  }
  
  return Math.round(miles * centsPerMile);
}