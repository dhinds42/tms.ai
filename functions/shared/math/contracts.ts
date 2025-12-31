/**
 * Contract & Tariff Pricing Rules
 */

import * as Money from './money';

export interface ContractRate {
  effectiveDate: Date;
  expirationDate?: Date;
  baseRate: Money.Cents;
  minCharge?: Money.Cents;
  rateCap?: Money.Cents;
}

/**
 * Get effective rate based on date
 */
export function getEffectiveRate(
  loadDate: Date,
  contractRates: ContractRate[]
): ContractRate | null {
  const applicable = contractRates.filter(rate => {
    const afterStart = loadDate >= rate.effectiveDate;
    const beforeEnd = !rate.expirationDate || loadDate <= rate.expirationDate;
    return afterStart && beforeEnd;
  });
  
  // Return most recent effective rate
  applicable.sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());
  return applicable[0] || null;
}

/**
 * Calculate contract rate for load
 */
export function calcContractRate(
  miles: number,
  weight: number,
  contractRate: ContractRate
): Money.Cents {
  // Base calculation (could be per-mile, per-cwt, etc.)
  let calculatedRate = contractRate.baseRate;
  
  // Apply minimum charge
  if (contractRate.minCharge && calculatedRate < contractRate.minCharge) {
    calculatedRate = contractRate.minCharge;
  }
  
  // Apply rate cap
  if (contractRate.rateCap && calculatedRate > contractRate.rateCap) {
    calculatedRate = contractRate.rateCap;
  }
  
  return calculatedRate;
}

/**
 * Apply minimum charge
 */
export function applyMinCharge(
  calculatedRate: Money.Cents,
  minCharge: Money.Cents
): Money.Cents {
  return Money.isGreaterThan(calculatedRate, minCharge) ? calculatedRate : minCharge;
}

/**
 * Apply rate cap (maximum)
 */
export function applyRateCap(
  calculatedRate: Money.Cents,
  rateCap: Money.Cents
): Money.Cents {
  return Money.isLessThan(calculatedRate, rateCap) ? calculatedRate : rateCap;
}

/**
 * Apply annual escalator to contract rate
 */
export function applyEscalators(
  baseRate: Money.Cents,
  yearsElapsed: number,
  annualEscalatorPercent: number
): Money.Cents {
  if (yearsElapsed === 0) return baseRate;
  
  const multiplier = Math.pow(1 + (annualEscalatorPercent / 100), yearsElapsed);
  return Money.multiply(baseRate, multiplier);
}

/**
 * Create new pricing version (contract amendment)
 */
export function pricingRuleVersioning(
  currentVersion: ContractRate,
  newRates: Partial<ContractRate>
): ContractRate {
  return {
    ...currentVersion,
    ...newRates,
    effectiveDate: newRates.effectiveDate || new Date()
  };
}