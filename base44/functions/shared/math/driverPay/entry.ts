/**
 * Driver Pay Calculations
 */

import * as Money from './money';

/**
 * Calculate driver pay - cents per mile
 */
export function calcDriverPayCPM(miles: number, centsPerMile: number): Money.Cents {
  if (miles < 0) throw new Error('Miles cannot be negative');
  if (centsPerMile < 0) throw new Error('Rate per mile cannot be negative');
  
  return Math.round(miles * centsPerMile);
}

/**
 * Calculate driver pay - percentage of load
 */
export function calcDriverPayPercent(loadRevenue: Money.Cents, percentage: number): Money.Cents {
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Invalid percentage: ${percentage}%`);
  }
  
  return Money.percentage(loadRevenue, percentage);
}

/**
 * Calculate driver pay - flat per load
 */
export function calcDriverPayFlat(ratePerLoad: Money.Cents): Money.Cents {
  Money.assertNonNegative(ratePerLoad, 'Driver pay rate');
  return ratePerLoad;
}

/**
 * Calculate per diem allowance
 */
export function calcPerDiem(days: number, perDiemRate: Money.Cents): Money.Cents {
  if (days < 0) throw new Error('Days cannot be negative');
  Money.assertNonNegative(perDiemRate, 'Per diem rate');
  
  return Money.multiply(perDiemRate, days);
}

/**
 * Calculate driver deductions
 */
export function calcDriverDeductions(input: {
  advances?: Money.Cents[];
  fuelCharges?: Money.Cents[];
  equipmentRental?: Money.Cents;
  insurance?: Money.Cents;
  other?: Money.Cents[];
}): { total: Money.Cents; breakdown: any } {
  const advances = Money.sum(input.advances || []);
  const fuel = Money.sum(input.fuelCharges || []);
  const equipment = input.equipmentRental || 0;
  const insurance = input.insurance || 0;
  const other = Money.sum(input.other || []);
  
  const total = Money.sum([advances, fuel, equipment, insurance, other]);
  
  return {
    total,
    breakdown: {
      advances,
      fuel,
      equipment,
      insurance,
      other
    }
  };
}