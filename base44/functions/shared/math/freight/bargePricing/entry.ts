/**
 * Barge Pricing Calculations
 * Per Barge, Index-Based Per Ton
 */

import * as Money from '../money';
import { createPricingResult, toShortTons, validateCommonInputs } from './freightCommon';

/**
 * Calculate Barge Per-Barge Pricing
 */
export function calcBargePerBarge(input) {
  if (!input.barges_count || input.barges_count <= 0) {
    throw new Error('Barge count required');
  }
  
  if (!input.rate_per_barge_cents || input.rate_per_barge_cents <= 0) {
    throw new Error('Rate per barge required');
  }
  
  const linehaul_cents = Math.round(input.barges_count * input.rate_per_barge_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Barge Transport (${input.barges_count} barges × $${Money.centsToDollars(input.rate_per_barge_cents)})`,
    quantity: input.barges_count,
    unit_type: 'barge',
    rate_cents: input.rate_per_barge_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'BARGE_PER_BARGE',
    barges_count: input.barges_count,
    rate_per_barge_cents: input.rate_per_barge_cents,
    formula: 'linehaul = barges_count × rate_per_barge_cents',
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
 * Calculate Barge Index-Based Per Ton
 */
export function calcBargeIndexPerTon(input) {
  const validation = validateCommonInputs(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }
  
  if (!input.weight_value || input.weight_value <= 0) {
    throw new Error('Weight required for per-ton pricing');
  }
  
  if (!input.benchmark_rate_per_ton_cents || input.benchmark_rate_per_ton_cents <= 0) {
    throw new Error('Benchmark rate per ton required');
  }
  
  const index_percent = input.index_percent || 100;
  
  // Convert weight to short tons
  const tons = toShortTons(input.weight_value, input.weight_unit || 'LBS');
  
  // Apply index adjustment
  const adjusted_rate_cents = Math.round(input.benchmark_rate_per_ton_cents * (index_percent / 100));
  
  // Calculate linehaul
  const linehaul_cents = Math.round(tons * adjusted_rate_cents);
  
  const itemized = [{
    line_type: 'linehaul',
    description: `Barge Index-Based (${tons.toFixed(2)} tons × $${Money.centsToDollars(adjusted_rate_cents)}/ton, Index: ${index_percent}%)`,
    quantity: tons,
    unit_type: 'ton',
    rate_cents: adjusted_rate_cents,
    amount_cents: linehaul_cents
  }];
  
  const explain = {
    method: 'BARGE_INDEX_PER_TON',
    weight_tons: tons,
    benchmark_rate_per_ton_cents: input.benchmark_rate_per_ton_cents,
    index_percent: index_percent,
    adjusted_rate_cents: adjusted_rate_cents,
    formula: 'rate = benchmark × (index/100); linehaul = tons × rate',
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