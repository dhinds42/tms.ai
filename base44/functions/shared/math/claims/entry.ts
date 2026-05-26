/**
 * Claims, Penalties, and Bonuses
 */

import * as Money from './money';

/**
 * Calculate late delivery penalty
 */
export function calcLatePenalty(
  loadValue: Money.Cents,
  penaltyPercent: number,
  maxPenalty?: Money.Cents
): Money.Cents {
  const penalty = Money.percentage(loadValue, penaltyPercent);
  
  if (maxPenalty && penalty > maxPenalty) {
    return maxPenalty;
  }
  
  return penalty;
}

/**
 * Calculate on-time delivery bonus
 */
export function calcOTDBonus(
  loadValue: Money.Cents,
  bonusPercent: number
): Money.Cents {
  return Money.percentage(loadValue, bonusPercent);
}

/**
 * Calculate claim exposure (potential loss)
 */
export function calcClaimExposure(
  cargoValue: Money.Cents,
  liabilityPercent: number = 100
): Money.Cents {
  return Money.percentage(cargoValue, liabilityPercent);
}

/**
 * Calculate claim deductible
 */
export function calcClaimDeductible(
  claimAmount: Money.Cents,
  deductibleAmount: Money.Cents
): Money.Cents {
  return Money.subtract(claimAmount, deductibleAmount);
}

/**
 * Calculate salvage value credit
 */
export function calcSalvageCredit(
  originalValue: Money.Cents,
  salvageValue: Money.Cents
): Money.Cents {
  return Money.subtract(originalValue, salvageValue);
}