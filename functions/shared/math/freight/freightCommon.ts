/**
 * Common Freight Pricing Utilities
 * Shared across all modes
 */

import * as Money from '../money';
import { roundCurrency } from '../rounding';

/**
 * Standard grain weights per bushel (USDA)
 */
export const GRAIN_BUSHEL_WEIGHTS = {
  CORN: 56,
  SOYBEANS: 60,
  WHEAT: 60,
  BARLEY: 48,
  OATS: 32,
  RYE: 56,
  SORGHUM: 56
};

/**
 * Air freight dimensional factors
 */
export const DIM_FACTORS = {
  DOMESTIC_IN: 139,  // in³ → lbs
  DOMESTIC_CM: 166,  // cm³ → kg
  INTERNATIONAL_IN: 166,
  INTERNATIONAL_CM: 200
};

/**
 * Convert bushels to weight
 */
export function bushelsToWeight(bushels, commodityType, targetUnit = 'LBS') {
  const weightPerBushel = GRAIN_BUSHEL_WEIGHTS[commodityType] || 60;
  const totalLbs = bushels * weightPerBushel;
  
  if (targetUnit === 'KG') return totalLbs * 0.453592;
  if (targetUnit === 'MT') return totalLbs * 0.000453592;
  return totalLbs;
}

/**
 * Convert weight to metric tons
 */
export function toMetricTons(weight, unit) {
  if (unit === 'MT') return weight;
  if (unit === 'KG') return weight / 1000;
  if (unit === 'LBS') return weight * 0.000453592;
  return 0;
}

/**
 * Convert weight to short tons
 */
export function toShortTons(weight, unit) {
  if (unit === 'TONS') return weight;
  if (unit === 'LBS') return weight / 2000;
  if (unit === 'KG') return weight / 907.185;
  if (unit === 'MT') return weight / 0.907185;
  return 0;
}

/**
 * Calculate density
 */
export function calculateDensity(weightLbs, volumeCft) {
  if (volumeCft <= 0) return 0;
  return roundCurrency(weightLbs / volumeCft);
}

/**
 * Calculate volume from dimensions
 */
export function calculateVolume(length, width, height, unit = 'IN') {
  const volumeIn3 = length * width * height;
  
  if (unit === 'CM') {
    const volumeCm3 = volumeIn3;
    return {
      cubic_inches: volumeCm3 / 16.387,
      cubic_feet: volumeCm3 / 28316.8,
      cubic_meters: volumeCm3 / 1000000
    };
  }
  
  return {
    cubic_inches: volumeIn3,
    cubic_feet: volumeIn3 / 1728,
    cubic_meters: volumeIn3 / 61023.7
  };
}

/**
 * Calculate dimensional weight for air freight
 */
export function calculateDimensionalWeight(length, width, height, unit = 'IN', dimFactor = DIM_FACTORS.DOMESTIC_IN) {
  const vol = calculateVolume(length, width, height, unit);
  
  if (unit === 'CM') {
    return vol.cubic_meters * 1000000 / dimFactor; // kg
  }
  
  return vol.cubic_inches / dimFactor; // lbs
}

/**
 * Calculate chargeable weight (air freight)
 */
export function calculateChargeableWeight(actualWeight, dimWeight) {
  return Math.max(actualWeight, dimWeight);
}

/**
 * Calculate W/M (Weight or Measurement) for ocean LCL
 * Standard: 1 MT = 1 CBM
 */
export function calculateWM(weightMT, volumeCBM) {
  return Math.max(weightMT, volumeCBM);
}

/**
 * Convert CWT (hundredweight)
 */
export function toCWT(weightLbs) {
  return Math.ceil(weightLbs / 100);
}

/**
 * Standard pricing result structure
 */
export function createPricingResult(
  linehaul_cents,
  fuel_surcharge_cents = 0,
  accessorial_total_cents = 0,
  taxes_fees_cents = 0,
  itemized_lines = [],
  explain_json = {}
) {
  const total_cents = Money.sum([
    linehaul_cents,
    fuel_surcharge_cents,
    accessorial_total_cents,
    taxes_fees_cents
  ]);
  
  return {
    linehaul_cents,
    fuel_surcharge_cents,
    accessorial_total_cents,
    taxes_fees_cents,
    total_cents,
    itemized_lines,
    explain_json
  };
}

/**
 * Apply minimum charge
 */
export function applyMinimum(total_cents, minimum_charge_cents) {
  if (!minimum_charge_cents) return total_cents;
  return Math.max(total_cents, minimum_charge_cents);
}

/**
 * Validate pricing inputs (common validations)
 */
export function validateCommonInputs(input) {
  const errors = [];
  
  if (input.loaded_miles !== undefined && input.loaded_miles < 0) {
    errors.push('Loaded miles cannot be negative');
  }
  
  if (input.weight_value !== undefined && input.weight_value < 0) {
    errors.push('Weight cannot be negative');
  }
  
  if (input.volume_value !== undefined && input.volume_value < 0) {
    errors.push('Volume cannot be negative');
  }
  
  return { valid: errors.length === 0, errors };
}