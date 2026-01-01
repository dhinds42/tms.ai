/**
 * Grain-Specific Pricing Calculations
 * 6 Methods: per bushel, per ton, per railcar, per barge, per MT, banded CPM
 */

import * as Money from '../money';
import { createPricingResult, bushelsToWeight, toShortTons, toMetricTons, validateCommonInputs } from './freightCommon';

/**
 * Calculate Grain Per-Bushel Pricing
 */
export function calcGrainPerBushel(input) {
  if (!input.bushels || input.bushels <= 0) {
    throw new Error('Bushel quantity required');
  }
  
  if (!input.rate_per_bushel_cents || input.rate_per_bushel_cents <= 0) {
    throw new Error('Rate per bushel required');
  }
  
  const linehaul_cents = Math.round(input.bushels * input.rate_per_bushel_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Grain Transport (${input.bushels} bu × $${Money.centsToDollars(input.rate_per_bushel_cents)}/bu)`,
    quantity: input.bushels,
    unit_type: 'bushel',
    rate_cents: input.rate_per_bushel_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'GRAIN_PER_BUSHEL',
    bushels: input.bushels,
    commodity_type: input.commodity_type,
    rate_per_bushel_cents: input.rate_per_bushel_cents,
    formula: 'linehaul = bushels × rate_per_bushel',
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
 * Calculate Grain Per-Ton Pricing
 */
export function calcGrainPerTon(input) {
  const validation = validateCommonInputs(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }
  
  if (!input.weight_value || input.weight_value <= 0) {
    throw new Error('Weight required');
  }
  
  if (!input.rate_per_ton_cents || input.rate_per_ton_cents <= 0) {
    throw new Error('Rate per ton required');
  }
  
  // Convert to short tons
  const tons = toShortTons(input.weight_value, input.weight_unit || 'LBS');
  
  const linehaul_cents = Math.round(tons * input.rate_per_ton_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Grain Transport (${tons.toFixed(2)} tons × $${Money.centsToDollars(input.rate_per_ton_cents)}/ton)`,
    quantity: tons,
    unit_type: 'ton',
    rate_cents: input.rate_per_ton_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'GRAIN_PER_TON',
    weight_tons: tons,
    rate_per_ton_cents: input.rate_per_ton_cents,
    formula: 'linehaul = tons × rate_per_ton',
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
 * Calculate Grain Per-Railcar
 */
export function calcGrainPerCar(input) {
  if (!input.railcars_count || input.railcars_count <= 0) {
    throw new Error('Railcar count required');
  }
  
  if (!input.rate_per_car_cents || input.rate_per_car_cents <= 0) {
    throw new Error('Rate per railcar required');
  }
  
  const linehaul_cents = Math.round(input.railcars_count * input.rate_per_car_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Grain Rail (${input.railcars_count} cars × $${Money.centsToDollars(input.rate_per_car_cents)}/car)`,
    quantity: input.railcars_count,
    unit_type: 'railcar',
    rate_cents: input.rate_per_car_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'GRAIN_PER_CAR',
    railcars_count: input.railcars_count,
    rate_per_car_cents: input.rate_per_car_cents,
    formula: 'linehaul = railcars × rate_per_car',
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
 * Calculate Grain Per-Barge
 */
export function calcGrainPerBarge(input) {
  if (!input.barges_count || input.barges_count <= 0) {
    throw new Error('Barge count required');
  }
  
  if (!input.rate_per_barge_cents || input.rate_per_barge_cents <= 0) {
    throw new Error('Rate per barge required');
  }
  
  const linehaul_cents = Math.round(input.barges_count * input.rate_per_barge_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Grain Barge (${input.barges_count} barges × $${Money.centsToDollars(input.rate_per_barge_cents)}/barge)`,
    quantity: input.barges_count,
    unit_type: 'barge',
    rate_cents: input.rate_per_barge_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'GRAIN_PER_BARGE',
    barges_count: input.barges_count,
    rate_per_barge_cents: input.rate_per_barge_cents,
    formula: 'linehaul = barges × rate_per_barge',
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
 * Calculate Grain Per-MT (ocean export)
 */
export function calcGrainPerMT(input) {
  const validation = validateCommonInputs(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }
  
  if (!input.weight_value || input.weight_value <= 0) {
    throw new Error('Weight required');
  }
  
  if (!input.rate_per_metric_ton_cents || input.rate_per_metric_ton_cents <= 0) {
    throw new Error('Rate per MT required');
  }
  
  const weightMT = toMetricTons(input.weight_value, input.weight_unit || 'LBS');
  
  const linehaul_cents = Math.round(weightMT * input.rate_per_metric_ton_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Grain Export (${weightMT.toFixed(2)} MT × $${Money.centsToDollars(input.rate_per_metric_ton_cents)}/MT)`,
    quantity: weightMT,
    unit_type: 'metric_ton',
    rate_cents: input.rate_per_metric_ton_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'GRAIN_PER_MT',
    weight_mt: weightMT,
    rate_per_metric_ton_cents: input.rate_per_metric_ton_cents,
    formula: 'linehaul = weight_MT × rate_per_MT',
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
 * Grain CPM banding (distance-based rate tiers)
 */
export const GRAIN_CPM_BANDS = [
  { minMiles: 0, maxMiles: 50, rpm_cents: 350 },
  { minMiles: 50, maxMiles: 100, rpm_cents: 320 },
  { minMiles: 100, maxMiles: 200, rpm_cents: 280 },
  { minMiles: 200, maxMiles: 300, rpm_cents: 250 },
  { minMiles: 300, maxMiles: 500, rpm_cents: 220 },
  { minMiles: 500, maxMiles: 9999, rpm_cents: 200 }
];

/**
 * Calculate Grain CPM Banded Pricing
 */
export function calcGrainCPMBanded(input) {
  if (!input.loaded_miles || input.loaded_miles <= 0) {
    throw new Error('Miles required for CPM banded pricing');
  }
  
  // Find applicable band
  const band = GRAIN_CPM_BANDS.find(b => 
    input.loaded_miles >= b.minMiles && input.loaded_miles < b.maxMiles
  );
  
  if (!band) {
    throw new Error('No pricing band found for distance');
  }
  
  // Override with custom rate if provided, else use band rate
  const rpm_cents = input.rpm_cents || band.rpm_cents;
  
  const linehaul_cents = Math.round(input.loaded_miles * rpm_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Grain Truck (${input.loaded_miles} mi × $${Money.centsToDollars(rpm_cents)}/mi, Band: ${band.minMiles}-${band.maxMiles}mi)`,
    quantity: input.loaded_miles,
    unit_type: 'mile',
    rate_cents: rpm_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'GRAIN_CPM_BANDED',
    loaded_miles: input.loaded_miles,
    band_min_miles: band.minMiles,
    band_max_miles: band.maxMiles,
    band_rpm_cents: band.rpm_cents,
    applied_rpm_cents: rpm_cents,
    formula: 'Find band by miles; linehaul = miles × rpm_cents',
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