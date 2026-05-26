/**
 * Load Rate Calculations
 * Business logic for load pricing, margins, and totals
 */

import * as Money from './money';
import { roundCurrency } from './rounding';

export interface LoadFinancials {
  // Revenue (customer-side)
  customerRate: Money.Cents;
  fuelSurcharge: Money.Cents;
  accessorials: Money.Cents[];
  totalCustomerCharge: Money.Cents;
  
  // Cost (carrier-side)
  carrierPay: Money.Cents;
  carrierAccessorials: Money.Cents[];
  totalCarrierCost: Money.Cents;
  
  // Profit
  grossMargin: Money.Cents;
  marginPercent: number;
  
  // Other
  overheadAllocation?: Money.Cents;
  insuranceAllocation?: Money.Cents;
  trueProfit?: Money.Cents;
}

/**
 * Calculate load financials with all totals and margins
 * This is the SINGLE SOURCE OF TRUTH for load financial calculations
 */
export function calculateLoadFinancials(input: {
  customerRate: Money.Cents;
  fuelSurcharge?: Money.Cents;
  accessorials?: Money.Cents[];
  carrierPay: Money.Cents;
  carrierAccessorials?: Money.Cents[];
  overheadPercent?: number;
  insurancePercent?: number;
}): LoadFinancials {
  // Revenue side
  const customerRate = input.customerRate;
  const fuelSurcharge = input.fuelSurcharge || 0;
  const accessorials = input.accessorials || [];
  const totalCustomerCharge = Money.add(
    Money.add(customerRate, fuelSurcharge),
    Money.sum(accessorials)
  );
  
  // Cost side
  const carrierPay = input.carrierPay;
  const carrierAccessorials = input.carrierAccessorials || [];
  const totalCarrierCost = Money.add(
    carrierPay,
    Money.sum(carrierAccessorials)
  );
  
  // Gross margin
  const grossMargin = Money.subtract(totalCustomerCharge, totalCarrierCost);
  
  // Margin percentage (safe division)
  const marginPercent = totalCustomerCharge > 0
    ? roundCurrency((grossMargin / totalCustomerCharge) * 100)
    : 0;
  
  // Overhead and insurance allocations
  const overheadPercent = input.overheadPercent || 0;
  const insurancePercent = input.insurancePercent || 0;
  
  const overheadAllocation = Money.percentage(totalCustomerCharge, overheadPercent);
  const insuranceAllocation = Money.percentage(totalCustomerCharge, insurancePercent);
  
  // True profit (after allocations)
  const trueProfit = Money.subtract(
    grossMargin,
    Money.add(overheadAllocation, insuranceAllocation)
  );
  
  return {
    customerRate,
    fuelSurcharge,
    accessorials,
    totalCustomerCharge,
    carrierPay,
    carrierAccessorials,
    totalCarrierCost,
    grossMargin,
    marginPercent,
    overheadAllocation,
    insuranceAllocation,
    trueProfit
  };
}

/**
 * Validate load financials meet business rules
 */
export function validateLoadFinancials(
  financials: LoadFinancials,
  options?: {
    allowNegativeMargin?: boolean;
    minMarginPercent?: number;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Customer rate must be non-negative
  if (financials.customerRate < 0) {
    errors.push('Customer rate cannot be negative');
  }
  
  // Carrier pay must be non-negative
  if (financials.carrierPay < 0) {
    errors.push('Carrier pay cannot be negative');
  }
  
  // Check negative margin unless explicitly allowed
  if (!options?.allowNegativeMargin && financials.grossMargin < 0) {
    errors.push(
      `Negative margin: Customer charge $${Money.formatAmount(financials.totalCustomerCharge)} ` +
      `is less than carrier cost $${Money.formatAmount(financials.totalCarrierCost)}`
    );
  }
  
  // Check minimum margin if specified
  if (options?.minMarginPercent && financials.marginPercent < options.minMarginPercent) {
    errors.push(
      `Margin ${financials.marginPercent.toFixed(1)}% is below minimum ` +
      `${options.minMarginPercent}%`
    );
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculate rate per mile
 */
export function calculateRatePerMile(
  totalCharge: Money.Cents,
  miles: number
): number {
  if (miles <= 0) {
    throw new Error('Miles must be greater than zero');
  }
  
  const dollars = Money.centsToDollars(totalCharge);
  return roundCurrency(dollars / miles);
}

/**
 * Calculate all-in rate (includes FSC, accessorials)
 */
export function calcAllInRate(
  baseRate: Money.Cents,
  fuelSurcharge: Money.Cents,
  accessorials: Money.Cents[]
): Money.Cents {
  return Money.add(Money.add(baseRate, fuelSurcharge), Money.sum(accessorials));
}

/**
 * Calculate contribution margin (before fixed costs)
 */
export function calcContributionMargin(
  revenue: Money.Cents,
  variableCosts: Money.Cents
): Money.Cents {
  return Money.subtract(revenue, variableCosts);
}

/**
 * Calculate fuel surcharge based on DOE price
 * 
 * @param baseMiles - Distance in miles
 * @param doePrice - DOE diesel price per gallon
 * @param fscSchedule - FSC rate schedule
 */
export function calculateFuelSurcharge(
  baseMiles: number,
  doePrice: number,
  fscSchedule: { minPrice: number; maxPrice: number; centsPerMile: number }[]
): Money.Cents {
  // Find applicable FSC bracket
  const bracket = fscSchedule.find(b => 
    doePrice >= b.minPrice && doePrice < b.maxPrice
  );
  
  if (!bracket) {
    return 0; // No FSC if price not in any bracket
  }
  
  // Calculate FSC
  const fscDollars = (baseMiles * bracket.centsPerMile) / 100;
  return Money.dollarsToCents(fscDollars);
}