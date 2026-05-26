/**
 * Fuel Surcharge (FSC) Calculations
 */

import * as Money from './money';

export interface FSCBracket {
  minPrice: number;
  maxPrice: number;
  centsPerMile: number;
}

export interface FSCIndex {
  effectiveDate: Date;
  doePrice: number;
  applicableWeekStart?: Date;
}

/**
 * Calculate FSC from DOE price and bracket table
 */
export function calcFSC(
  miles: number,
  doePrice: number,
  fscSchedule: FSCBracket[]
): Money.Cents {
  const bracket = fscSchedule.find(b => 
    doePrice >= b.minPrice && doePrice < b.maxPrice
  );
  
  if (!bracket) return 0;
  
  const fscDollars = (miles * bracket.centsPerMile) / 100;
  return Money.dollarsToCents(fscDollars);
}

/**
 * Calculate FSC from custom index
 */
export function calcFSCFromIndex(
  miles: number,
  baseIndex: number,
  currentIndex: number,
  baseFSC: Money.Cents
): Money.Cents {
  if (baseIndex === 0) return baseFSC;
  
  const indexRatio = currentIndex / baseIndex;
  return Money.multiply(baseFSC, indexRatio);
}

/**
 * Get effective FSC based on effective dates
 * Finds the FSC index applicable for a given date
 */
export function getEffectiveFSC(
  loadDate: Date,
  fscIndices: FSCIndex[]
): FSCIndex | null {
  // Sort by effective date descending
  const sorted = fscIndices
    .filter(idx => idx.effectiveDate <= loadDate)
    .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());
  
  return sorted[0] || null;
}

/**
 * Calculate FSC for multi-leg loads
 */
export function calcMultiLegFSC(
  legs: Array<{ miles: number; doePrice: number }>,
  fscSchedule: FSCBracket[]
): Money.Cents {
  return Money.sum(
    legs.map(leg => calcFSC(leg.miles, leg.doePrice, fscSchedule))
  );
}