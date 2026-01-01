/**
 * Ocean Pricing Calculations
 * FCL Per Container, LCL W/M, Bulk Per MT
 */

import * as Money from '../money';
import { createPricingResult, toMetricTons, calculateWM, validateCommonInputs } from './freightCommon';

/**
 * Calculate Ocean FCL (Full Container Load)
 */
export function calcOceanFCL(input) {
  if (!input.containers_count || input.containers_count <= 0) {
    throw new Error('Container count required for FCL');
  }
  
  if (!input.rate_per_container_cents || input.rate_per_container_cents <= 0) {
    throw new Error('Rate per container required');
  }
  
  const linehaul_cents = Math.round(input.containers_count * input.rate_per_container_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Ocean FCL (${input.containers_count} × ${input.container_type || 'container'} × $${Money.centsToDollars(input.rate_per_container_cents)})`,
    quantity: input.containers_count,
    unit_type: 'container',
    rate_cents: input.rate_per_container_cents,
    amount_cents: linehaul_cents
  }];
  
  // Ocean surcharges (BAF, CAF, etc.)
  if (input.baf_cents) {
    itemized.push({
      line_type: 'accessorial',
      description: 'Bunker Adjustment Factor (BAF)',
      quantity: input.containers_count,
      unit_type: 'container',
      rate_cents: input.baf_cents,
      amount_cents: input.containers_count * input.baf_cents
    });
  }
  
  if (input.caf_cents) {
    itemized.push({
      line_type: 'accessorial',
      description: 'Currency Adjustment Factor (CAF)',
      quantity: input.containers_count,
      unit_type: 'container',
      rate_cents: input.caf_cents,
      amount_cents: input.containers_count * input.caf_cents
    });
  }
  
  const explain = {
    method: 'OCEAN_FCL',
    containers_count: input.containers_count,
    container_type: input.container_type,
    rate_per_container_cents: input.rate_per_container_cents,
    baf_cents: input.baf_cents || 0,
    caf_cents: input.caf_cents || 0,
    formula: 'linehaul = containers × rate_per_container; add BAF + CAF',
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
 * Calculate Ocean LCL (Less than Container Load) - W/M Basis
 */
export function calcOceanLCL_WM(input) {
  const validation = validateCommonInputs(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }
  
  if (!input.weight_value || input.weight_value <= 0) {
    throw new Error('Weight required for LCL W/M');
  }
  
  if (!input.rate_per_wm_cents || input.rate_per_wm_cents <= 0) {
    throw new Error('Rate per W/M required');
  }
  
  // Convert weight to MT
  const weightMT = toMetricTons(input.weight_value, input.weight_unit || 'LBS');
  
  // Get volume in CBM (default to 0 if not provided)
  const volumeCBM = input.volume_unit === 'CBM' ? input.volume_value : 0;
  
  // W/M calculation: max(weight_MT, volume_CBM)
  const wmUnits = calculateWM(weightMT, volumeCBM);
  
  // Calculate linehaul
  const linehaul_cents = Math.round(wmUnits * input.rate_per_wm_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Ocean LCL (${wmUnits.toFixed(2)} W/M × $${Money.centsToDollars(input.rate_per_wm_cents)}/W/M)`,
    quantity: wmUnits,
    unit_type: 'wm',
    rate_cents: input.rate_per_wm_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'OCEAN_LCL_WM',
    weight_mt: weightMT,
    volume_cbm: volumeCBM,
    wm_units: wmUnits,
    rate_per_wm_cents: input.rate_per_wm_cents,
    formula: 'W/M = max(weight_MT, volume_CBM); linehaul = W/M × rate',
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
 * Calculate Ocean Bulk Per MT
 */
export function calcOceanBulkPerMT(input) {
  const validation = validateCommonInputs(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }
  
  if (!input.weight_value || input.weight_value <= 0) {
    throw new Error('Weight required for bulk MT pricing');
  }
  
  if (!input.rate_per_metric_ton_cents || input.rate_per_metric_ton_cents <= 0) {
    throw new Error('Rate per MT required');
  }
  
  // Convert to MT
  const weightMT = toMetricTons(input.weight_value, input.weight_unit || 'LBS');
  
  // Calculate linehaul
  const linehaul_cents = Math.round(weightMT * input.rate_per_metric_ton_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Ocean Bulk (${weightMT.toFixed(2)} MT × $${Money.centsToDollars(input.rate_per_metric_ton_cents)}/MT)`,
    quantity: weightMT,
    unit_type: 'metric_ton',
    rate_cents: input.rate_per_metric_ton_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'OCEAN_BULK_PER_MT',
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