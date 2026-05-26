/**
 * Air Freight Pricing Calculations
 * Chargeable Weight (max of actual vs dimensional)
 */

import * as Money from '../money';
import { createPricingResult, calculateDimensionalWeight, calculateChargeableWeight, DIM_FACTORS, validateCommonInputs } from './freightCommon';

/**
 * Calculate Air Freight Chargeable Weight Pricing
 */
export function calcAirChargeableWeight(input) {
  const validation = validateCommonInputs(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }
  
  if (!input.weight_value || input.weight_value <= 0) {
    throw new Error('Actual weight required for air freight');
  }
  
  if (!input.rate_per_kg_cents || input.rate_per_kg_cents <= 0) {
    throw new Error('Rate per kg required');
  }
  
  // Get actual weight in kg
  let actualWeightKG = input.weight_value;
  if (input.weight_unit === 'LBS') {
    actualWeightKG = input.weight_value * 0.453592;
  } else if (input.weight_unit === 'MT') {
    actualWeightKG = input.weight_value * 1000;
  }
  
  // Calculate dimensional weight if dims provided
  let dimWeightKG = 0;
  let usedDimWeight = false;
  
  if (input.length && input.width && input.height) {
    const dimFactor = input.dim_unit === 'CM' ? DIM_FACTORS.DOMESTIC_CM : DIM_FACTORS.DOMESTIC_IN;
    dimWeightKG = calculateDimensionalWeight(
      input.length,
      input.width,
      input.height,
      input.dim_unit || 'IN',
      dimFactor
    );
    
    // For CM, dimWeightKG is already in kg
    // For IN, dimWeightKG is in lbs, convert to kg
    if (input.dim_unit === 'IN') {
      dimWeightKG = dimWeightKG * 0.453592;
    }
  }
  
  // Chargeable weight = max(actual, dim)
  const chargeableWeightKG = calculateChargeableWeight(actualWeightKG, dimWeightKG);
  usedDimWeight = chargeableWeightKG === dimWeightKG && dimWeightKG > 0;
  
  // Calculate linehaul
  const linehaul_cents = Math.round(chargeableWeightKG * input.rate_per_kg_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Air Freight (${chargeableWeightKG.toFixed(2)} kg × $${Money.centsToDollars(input.rate_per_kg_cents)}/kg${usedDimWeight ? ' - Dim Weight' : ''})`,
    quantity: chargeableWeightKG,
    unit_type: 'kg',
    rate_cents: input.rate_per_kg_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'AIR_CHARGEABLE_WEIGHT',
    actual_weight_kg: actualWeightKG,
    dim_weight_kg: dimWeightKG,
    chargeable_weight_kg: chargeableWeightKG,
    used_dim_weight: usedDimWeight,
    rate_per_kg_cents: input.rate_per_kg_cents,
    formula: 'chargeable_weight = max(actual, dim_weight); linehaul = chargeable × rate_per_kg',
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