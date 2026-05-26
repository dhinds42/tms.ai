/**
 * Truck Pricing Calculations
 * FTL (RPM/Flat) + LTL (CWT/Class/Density)
 */

import * as Money from '../money';
import { roundCurrency } from '../rounding';
import { createPricingResult, toCWT, calculateDensity, validateCommonInputs } from './freightCommon';

/**
 * Calculate FTL Per-Mile Pricing
 */
export function calcFTLPerMile(input) {
  const validation = validateCommonInputs(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }
  
  if (!input.loaded_miles || input.loaded_miles <= 0) {
    throw new Error('Loaded miles required for FTL per-mile pricing');
  }
  
  if (!input.rpm_cents || input.rpm_cents <= 0) {
    throw new Error('RPM rate required');
  }
  
  const linehaul_cents = Math.round(input.loaded_miles * input.rpm_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `FTL Linehaul (${input.loaded_miles} mi × $${Money.centsToDollars(input.rpm_cents)}/mi)`,
    quantity: input.loaded_miles,
    unit_type: 'mile',
    rate_cents: input.rpm_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'FTL_RPM',
    loaded_miles: input.loaded_miles,
    rpm_cents: input.rpm_cents,
    formula: 'linehaul = loaded_miles × rpm_cents',
    linehaul_cents
  };
  
  return createPricingResult(
    linehaul_cents,
    input.fuel_surcharge_cents || 0,
    input.accessorial_total_cents || 0,
    input.taxes_fees_cents || 0,
    itemized,
    explain
  );
}

/**
 * Calculate FTL Flat Rate Pricing
 */
export function calcFTLFlat(input) {
  if (!input.flat_cents || input.flat_cents <= 0) {
    throw new Error('Flat rate required');
  }
  
  const linehaul_cents = input.flat_cents;
  
  const itemized = [{
    line_type: 'linehaul',
    description: `FTL Flat Rate`,
    quantity: 1,
    unit_type: 'load',
    rate_cents: input.flat_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'FTL_FLAT',
    flat_cents: input.flat_cents,
    formula: 'linehaul = flat_cents',
    linehaul_cents
  };
  
  return createPricingResult(
    linehaul_cents,
    input.fuel_surcharge_cents || 0,
    input.accessorial_total_cents || 0,
    input.taxes_fees_cents || 0,
    itemized,
    explain
  );
}

/**
 * LTL Freight Class by Density (simplified mapping)
 */
export const LTL_CLASS_BY_DENSITY = {
  50: { min: 50, max: 9999 },
  55: { min: 35, max: 50 },
  60: { min: 30, max: 35 },
  65: { min: 22.5, max: 30 },
  70: { min: 15, max: 22.5 },
  77.5: { min: 13.5, max: 15 },
  85: { min: 12, max: 13.5 },
  92.5: { min: 10.5, max: 12 },
  100: { min: 9, max: 10.5 },
  110: { min: 8, max: 9 },
  125: { min: 7, max: 8 },
  150: { min: 6, max: 7 },
  175: { min: 5, max: 6 },
  200: { min: 4, max: 5 },
  250: { min: 3, max: 4 },
  300: { min: 2, max: 3 },
  400: { min: 1, max: 2 },
  500: { min: 0, max: 1 }
};

/**
 * Determine freight class from density
 */
export function densityToClass(densityPCF) {
  for (const [freightClass, range] of Object.entries(LTL_CLASS_BY_DENSITY)) {
    if (densityPCF >= range.min && densityPCF < range.max) {
      return parseFloat(freightClass);
    }
  }
  return 500; // Default to highest class if < 1 pcf
}

/**
 * Calculate LTL CWT Pricing
 */
export function calcLTLCWT(input) {
  const validation = validateCommonInputs(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }
  
  if (!input.weight_value || input.weight_value <= 0) {
    throw new Error('Weight required for LTL pricing');
  }
  
  if (!input.rate_per_cwt_cents || input.rate_per_cwt_cents <= 0) {
    throw new Error('Rate per CWT required');
  }
  
  // Convert weight to lbs if needed
  let weightLbs = input.weight_value;
  if (input.weight_unit === 'KG') {
    weightLbs = input.weight_value * 2.20462;
  } else if (input.weight_unit === 'MT') {
    weightLbs = input.weight_value * 2204.62;
  }
  
  // Calculate CWT (round up)
  const cwt = toCWT(weightLbs);
  
  // Calculate linehaul
  const linehaul_cents = Math.round(cwt * input.rate_per_cwt_cents);
  
  // Calculate density if volume provided
  let density = null;
  let freightClass = input.nmfc_class || null;
  
  if (input.volume_value && input.volume_unit === 'CFT') {
    density = calculateDensity(weightLbs, input.volume_value);
    if (!freightClass) {
      freightClass = densityToClass(density);
    }
  }
  
  const itemized = [{
    line_type: 'linehaul',
    description: `LTL Linehaul (${cwt} CWT × $${Money.centsToDollars(input.rate_per_cwt_cents)}/CWT${freightClass ? `, Class ${freightClass}` : ''})`,
    quantity: cwt,
    unit_type: 'cwt',
    rate_cents: input.rate_per_cwt_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'LTL_CWT',
    weight_lbs: weightLbs,
    cwt: cwt,
    rate_per_cwt_cents: input.rate_per_cwt_cents,
    density_pcf: density,
    freight_class: freightClass,
    formula: 'linehaul = ceil(weight_lbs / 100) × rate_per_cwt_cents',
    linehaul_cents
  };
  
  return createPricingResult(
    linehaul_cents,
    input.fuel_surcharge_cents || 0,
    input.accessorial_total_cents || 0,
    input.taxes_fees_cents || 0,
    itemized,
    explain
  );
}