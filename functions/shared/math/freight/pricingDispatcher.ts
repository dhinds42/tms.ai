/**
 * Multi-Modal Freight Pricing Dispatcher
 * Routes to appropriate pricing calculator based on mode + method
 */

import { calcFTLPerMile, calcFTLFlat, calcLTLCWT } from './truckPricing';
import { calcRailPerCar, calcRailIntermodal, calcRailTonMile } from './railPricing';
import { calcBargePerBarge, calcBargeIndexPerTon } from './bargePricing';
import { calcOceanFCL, calcOceanLCL_WM, calcOceanBulkPerMT } from './oceanPricing';
import { calcAirChargeableWeight } from './airPricing';
import {
  calcGrainPerBushel,
  calcGrainPerTon,
  calcGrainPerCar,
  calcGrainPerBarge,
  calcGrainPerMT,
  calcGrainCPMBanded
} from './grainPricing';
import { applyMinimum } from './freightCommon';

/**
 * Calculate customer freight quote
 * Single entry point for all pricing
 */
export function calculateCustomerFreightQuote(input) {
  // Validate transport_mode + pricing_method
  if (!input.transport_mode) {
    throw new Error('transport_mode required (TRUCK, RAIL, BARGE, OCEAN, AIR)');
  }
  
  if (!input.pricing_method) {
    throw new Error('pricing_method required');
  }
  
  let result;
  
  // Route to correct calculator
  switch (input.pricing_method) {
    // TRUCK
    case 'FTL_RPM':
      result = calcFTLPerMile(input);
      break;
    case 'FTL_FLAT':
      result = calcFTLFlat(input);
      break;
    case 'LTL_CWT':
      result = calcLTLCWT(input);
      break;
    
    // RAIL
    case 'RAIL_PER_CAR':
      result = calcRailPerCar(input);
      break;
    case 'RAIL_INTERMODAL':
      result = calcRailIntermodal(input);
      break;
    case 'RAIL_TON_MILE':
      result = calcRailTonMile(input);
      break;
    
    // BARGE
    case 'BARGE_PER_BARGE':
      result = calcBargePerBarge(input);
      break;
    case 'BARGE_INDEX_PER_TON':
      result = calcBargeIndexPerTon(input);
      break;
    
    // OCEAN
    case 'OCEAN_FCL':
      result = calcOceanFCL(input);
      break;
    case 'OCEAN_LCL_WM':
      result = calcOceanLCL_WM(input);
      break;
    case 'OCEAN_BULK_PER_MT':
      result = calcOceanBulkPerMT(input);
      break;
    
    // AIR
    case 'AIR_CHARGEABLE_WEIGHT':
      result = calcAirChargeableWeight(input);
      break;
    
    // GRAIN
    case 'GRAIN_PER_BUSHEL':
      result = calcGrainPerBushel(input);
      break;
    case 'GRAIN_PER_TON':
      result = calcGrainPerTon(input);
      break;
    case 'GRAIN_PER_CAR':
      result = calcGrainPerCar(input);
      break;
    case 'GRAIN_PER_BARGE':
      result = calcGrainPerBarge(input);
      break;
    case 'GRAIN_PER_MT':
      result = calcGrainPerMT(input);
      break;
    case 'GRAIN_CPM_BANDED':
      result = calcGrainCPMBanded(input);
      break;
    
    default:
      throw new Error(`Unknown pricing method: ${input.pricing_method}`);
  }
  
  // Apply minimum charge if specified
  if (input.minimum_charge_cents) {
    const original_total = result.total_cents;
    result.total_cents = applyMinimum(result.total_cents, input.minimum_charge_cents);
    
    if (result.total_cents > original_total) {
      result.itemized_lines.push({
        line_type: 'fee',
        description: 'Minimum Charge Applied',
        quantity: 1,
        unit_type: 'load',
        rate_cents: input.minimum_charge_cents,
        amount_cents: result.total_cents - original_total
      });
      
      result.explain_json.minimum_applied = true;
      result.explain_json.original_total_cents = original_total;
      result.explain_json.minimum_charge_cents = input.minimum_charge_cents;
    }
  }
  
  // FSC Resolution
  let fsc_cents = 0;
  let fsc_line_item = null;

  if (input.fsc_enabled && input.fsc_handling === 'SEPARATE') {
    if (input.fsc_method === 'FLAT_PER_MILE') {
      fsc_cents = (input.loaded_miles || 0) * (input.fsc_cpm_cents || 0);
      fsc_line_item = {
        line_type: 'fuel_surcharge',
        description: 'Fuel Surcharge (Per Mile)',
        quantity: input.loaded_miles,
        unit_type: 'miles',
        rate_cents: input.fsc_cpm_cents,
        amount_cents: fsc_cents
      };
    } else if (input.fsc_method === 'PERCENT_OF_LINEHAUL') {
      fsc_cents = Math.round((result.linehaul_cents * (input.fsc_percent_bps || 0)) / 10000);
      fsc_line_item = {
        line_type: 'fuel_surcharge',
        description: `Fuel Surcharge (${((input.fsc_percent_bps || 0) / 100).toFixed(2)}%)`,
        quantity: 1,
        unit_type: 'load',
        rate_cents: fsc_cents,
        amount_cents: fsc_cents
      };
    } else if (input.fsc_method === 'TABLE_LOOKUP' && input.fsc_table_id) {
      const fscTableResult = resolveFSCFromTableSync(input, result.linehaul_cents);
      fsc_cents = fscTableResult.fsc_cents;
      fsc_line_item = fscTableResult.line_item;
    }
    
    if (fsc_line_item) {
      result.itemized_lines.push(fsc_line_item);
    }
    result.fuel_surcharge_cents = (result.fuel_surcharge_cents || 0) + fsc_cents;
    result.total_cents += fsc_cents;
    
    if (!result.explain_json.fsc) {
      result.explain_json.fsc = {};
    }
    result.explain_json.fsc = {
      ...result.explain_json.fsc,
      enabled: true,
      handling: input.fsc_handling,
      method: input.fsc_method,
      fsc_cents
    };
  } else if (input.fsc_enabled && input.fsc_handling === 'INCLUDED') {
    // FSC computed but not itemized
    result.explain_json.fsc = {
      enabled: true,
      handling: 'INCLUDED',
      note: 'FSC included in base rate, not separately itemized'
    };
  }
  
  // Add pricing version
  result.pricing_snapshot_version = 'v1.0.0';
  result.calculated_at = new Date().toISOString();
  
  return result;
}

/**
 * Resolve FSC from customer table (synchronous stub)
 * In production, this would query CustomerFSCTable and rows
 */
function resolveFSCFromTableSync(input, linehaul_cents) {
  // Stub implementation - in real system would query base44
  // For now, return zero with explanation
  return {
    fsc_cents: 0,
    line_item: {
      line_type: 'fuel_surcharge',
      description: 'Fuel Surcharge (Table Lookup - stub)',
      quantity: 1,
      unit_type: 'load',
      rate_cents: 0,
      amount_cents: 0
    }
  };
}

/**
 * Validate quote inputs before pricing
 */
export function validateQuoteInputs(input) {
  const errors = [];
  
  if (!input.transport_mode) {
    errors.push('Transport mode required');
  }
  
  if (!input.pricing_method) {
    errors.push('Pricing method required');
  }
  
  // Mode-specific validations
  if (input.pricing_method?.includes('RPM') && !input.loaded_miles) {
    errors.push('Loaded miles required for per-mile pricing');
  }
  
  if (input.pricing_method?.includes('CWT') && !input.weight_value) {
    errors.push('Weight required for CWT pricing');
  }
  
  if (input.pricing_method?.includes('BUSHEL') && !input.bushels) {
    errors.push('Bushel quantity required');
  }
  
  if ((input.pricing_method?.includes('CONTAINER') || input.pricing_method?.includes('FCL')) && !input.containers_count) {
    errors.push('Container count required');
  }
  
  if (input.pricing_method?.includes('BARGE') && !input.barges_count) {
    errors.push('Barge count required');
  }
  
  return { valid: errors.length === 0, errors };
}