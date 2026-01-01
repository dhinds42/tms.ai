/**
 * Rail Pricing Calculations
 * Per Railcar, Intermodal, Ton-Mile
 */

import * as Money from '../money';
import { createPricingResult, toShortTons, validateCommonInputs } from './freightCommon';

/**
 * Calculate Rail Per-Railcar Pricing
 */
export function calcRailPerCar(input) {
  if (!input.railcars_count || input.railcars_count <= 0) {
    throw new Error('Railcar count required');
  }
  
  if (!input.rate_per_car_cents || input.rate_per_car_cents <= 0) {
    throw new Error('Rate per railcar required');
  }
  
  const linehaul_cents = Math.round(input.railcars_count * input.rate_per_car_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Rail Carload (${input.railcars_count} cars × $${Money.centsToDollars(input.rate_per_car_cents)}/car)`,
    quantity: input.railcars_count,
    unit_type: 'railcar',
    rate_cents: input.rate_per_car_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'RAIL_PER_CAR',
    railcars_count: input.railcars_count,
    rate_per_car_cents: input.rate_per_car_cents,
    formula: 'linehaul = railcars_count × rate_per_car_cents',
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
 * Calculate Rail Intermodal (per container)
 */
export function calcRailIntermodal(input) {
  if (!input.containers_count || input.containers_count <= 0) {
    throw new Error('Container count required');
  }
  
  if (!input.rate_per_container_cents || input.rate_per_container_cents <= 0) {
    throw new Error('Rate per container required');
  }
  
  const linehaul_cents = Math.round(input.containers_count * input.rate_per_container_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Rail Intermodal (${input.containers_count} × ${input.container_type || 'container'} × $${Money.centsToDollars(input.rate_per_container_cents)})`,
    quantity: input.containers_count,
    unit_type: 'container',
    rate_cents: input.rate_per_container_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'RAIL_INTERMODAL',
    containers_count: input.containers_count,
    container_type: input.container_type,
    rate_per_container_cents: input.rate_per_container_cents,
    formula: 'linehaul = containers_count × rate_per_container_cents',
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
 * Calculate Rail Ton-Mile Pricing
 */
export function calcRailTonMile(input) {
  if (!input.loaded_miles || input.loaded_miles <= 0) {
    throw new Error('Miles required for ton-mile pricing');
  }
  
  if (!input.weight_value || input.weight_value <= 0) {
    throw new Error('Weight required for ton-mile pricing');
  }
  
  if (!input.ton_mile_rate_cents) {
    throw new Error('Ton-mile rate required');
  }
  
  // Convert to short tons
  const tons = toShortTons(input.weight_value, input.weight_unit || 'LBS');
  
  // Calculate: tons × miles × rate
  const linehaul_cents = Math.round(tons * input.loaded_miles * input.ton_mile_rate_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Rail Ton-Mile (${tons.toFixed(2)} tons × ${input.loaded_miles} mi × $${Money.centsToDollars(input.ton_mile_rate_cents)})`,
    quantity: tons * input.loaded_miles,
    unit_type: 'ton-mile',
    rate_cents: input.ton_mile_rate_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'RAIL_TON_MILE',
    weight_tons: tons,
    loaded_miles: input.loaded_miles,
    ton_mile_rate_cents: input.ton_mile_rate_cents,
    formula: 'linehaul = tons × miles × ton_mile_rate_cents',
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