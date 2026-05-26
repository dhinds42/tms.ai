/**
 * Owner-Operator Specific Calculations
 */

import * as Money from './money';

/**
 * Calculate advance balance remaining
 */
export function calcAdvanceRemaining(
  totalAdvances: Money.Cents,
  repaidAmount: Money.Cents
): Money.Cents {
  return Money.subtract(totalAdvances, repaidAmount);
}

/**
 * Calculate escrow contribution (withholding)
 */
export function calcEscrowContribution(
  grossPay: Money.Cents,
  escrowPercent: number
): Money.Cents {
  if (escrowPercent < 0 || escrowPercent > 50) {
    throw new Error(`Invalid escrow percentage: ${escrowPercent}%`);
  }
  
  return Money.percentage(grossPay, escrowPercent);
}

/**
 * Calculate owner-operator lease payment
 */
export function calcOwnerOpLease(
  loadRevenue: Money.Cents,
  leasePercent: number
): Money.Cents {
  if (leasePercent < 0 || leasePercent > 100) {
    throw new Error(`Invalid lease percentage: ${leasePercent}%`);
  }
  
  return Money.percentage(loadRevenue, leasePercent);
}

/**
 * Calculate maintenance reserve withholding
 */
export function calcOwnerOpMaintenance(
  grossPay: Money.Cents,
  maintenancePercentOrFlat: { type: 'percent' | 'flat'; value: number }
): Money.Cents {
  if (maintenancePercentOrFlat.type === 'percent') {
    return Money.percentage(grossPay, maintenancePercentOrFlat.value);
  } else {
    return Money.dollarsToCents(maintenancePercentOrFlat.value);
  }
}

/**
 * Calculate owner-operator net after all deductions
 */
export function calcOwnerOpNet(input: {
  grossPay: Money.Cents;
  leasePayment?: Money.Cents;
  maintenanceReserve?: Money.Cents;
  escrow?: Money.Cents;
  fuelCharges?: Money.Cents;
  advances?: Money.Cents;
  other?: Money.Cents[];
}): {
  netPay: Money.Cents;
  totalDeductions: Money.Cents;
  breakdown: any;
} {
  const lease = input.leasePayment || 0;
  const maintenance = input.maintenanceReserve || 0;
  const escrow = input.escrow || 0;
  const fuel = input.fuelCharges || 0;
  const advances = input.advances || 0;
  const other = Money.sum(input.other || []);
  
  const totalDeductions = Money.sum([lease, maintenance, escrow, fuel, advances, other]);
  const netPay = Money.subtract(input.grossPay, totalDeductions);
  
  return {
    netPay,
    totalDeductions,
    breakdown: {
      lease,
      maintenance,
      escrow,
      fuel,
      advances,
      other
    }
  };
}