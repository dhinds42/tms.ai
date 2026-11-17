/**
 * Pricing Dispatcher Tests
 */

import { calculateCustomerFreightQuote, validateQuoteInputs } from '../../../shared/math/freight/pricingDispatcher';

describe('Pricing Dispatcher', () => {
  describe('Input Validation', () => {
    it('should require transport_mode', () => {
      const validation = validateQuoteInputs({
        pricing_method: 'FTL_RPM'
      });
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Transport mode required');
    });
    
    it('should require pricing_method', () => {
      const validation = validateQuoteInputs({
        transport_mode: 'TRUCK'
      });
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Pricing method required');
    });
    
    it('should validate mode-specific requirements', () => {
      const validation = validateQuoteInputs({
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_RPM'
        // Missing loaded_miles
      });
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Loaded miles required for per-mile pricing');
    });
  });
  
  describe('Route to Correct Calculator', () => {
    it('should route to FTL RPM', () => {
      const result = calculateCustomerFreightQuote({
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_RPM',
        loaded_miles: 300,
        rpm_cents: 250
      });
      
      expect(result.explain_json.method).toBe('FTL_RPM');
      expect(result.linehaul_cents).toBe(75000);
    });
    
    it('should route to LTL CWT', () => {
      const result = calculateCustomerFreightQuote({
        transport_mode: 'TRUCK',
        pricing_method: 'LTL_CWT',
        weight_value: 3000,
        weight_unit: 'LBS',
        rate_per_cwt_cents: 2000
      });
      
      expect(result.explain_json.method).toBe('LTL_CWT');
      expect(result.linehaul_cents).toBe(60000); // 30 cwt × $20
    });
    
    it('should route to ocean FCL', () => {
      const result = calculateCustomerFreightQuote({
        transport_mode: 'OCEAN',
        pricing_method: 'OCEAN_FCL',
        containers_count: 1,
        container_type: '40HC',
        rate_per_container_cents: 280000
      });
      
      expect(result.explain_json.method).toBe('OCEAN_FCL');
      expect(result.linehaul_cents).toBe(280000);
    });
    
    it('should route to grain per bushel', () => {
      const result = calculateCustomerFreightQuote({
        transport_mode: 'TRUCK',
        pricing_method: 'GRAIN_PER_BUSHEL',
        bushels: 5000,
        commodity_type: 'CORN',
        rate_per_bushel_cents: 35
      });
      
      expect(result.explain_json.method).toBe('GRAIN_PER_BUSHEL');
      expect(result.linehaul_cents).toBe(175000); // 5000 × $0.35
    });
  });
  
  describe('Minimum Charge', () => {
    it('should apply minimum charge when total is below', () => {
      const result = calculateCustomerFreightQuote({
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_FLAT',
        flat_cents: 50000, // $500
        minimum_charge_cents: 75000 // $750 minimum
      });
      
      expect(result.total_cents).toBe(75000); // Minimum applied
      expect(result.explain_json.minimum_applied).toBe(true);
    });
    
    it('should not apply minimum when total exceeds it', () => {
      const result = calculateCustomerFreightQuote({
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_FLAT',
        flat_cents: 100000, // $1000
        minimum_charge_cents: 75000 // $750 minimum
      });
      
      expect(result.total_cents).toBe(100000); // No minimum needed
      expect(result.explain_json.minimum_applied).toBeUndefined();
    });
  });
  
  describe('Pricing Snapshot', () => {
    it('should include version and timestamp', () => {
      const result = calculateCustomerFreightQuote({
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_RPM',
        loaded_miles: 100,
        rpm_cents: 200
      });
      
      expect(result.pricing_snapshot_version).toBe('v1.0.0');
      expect(result.calculated_at).toBeDefined();
    });
  });
});