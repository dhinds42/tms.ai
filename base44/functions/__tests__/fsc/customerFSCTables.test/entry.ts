/**
 * Customer FSC Tables - Test Suite
 * Tests FSC table lookup, INCLUDED vs SEPARATE handling, and validation
 */

const { calculateCustomerFreightQuote } = require('../../shared/math/freight/pricingDispatcher');

describe('Customer FSC Tables', () => {
  
  describe('FSC Disabled', () => {
    test('fsc_enabled=false results in zero FSC and no line item', () => {
      const input = {
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_RPM',
        loaded_miles: 500,
        rpm_cents: 200,
        fsc_enabled: false
      };
      
      const result = calculateCustomerFreightQuote(input);
      
      expect(result.fuel_surcharge_cents || 0).toBe(0);
      expect(result.itemized_lines.find(l => l.line_type === 'fuel_surcharge')).toBeUndefined();
    });
  });
  
  describe('FSC INCLUDED Handling', () => {
    test('fsc_enabled=true + INCLUDED does not itemize FSC', () => {
      const input = {
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_RPM',
        loaded_miles: 500,
        rpm_cents: 200,
        fsc_enabled: true,
        fsc_handling: 'INCLUDED'
      };
      
      const result = calculateCustomerFreightQuote(input);
      
      // No FSC line item
      expect(result.itemized_lines.find(l => l.line_type === 'fuel_surcharge')).toBeUndefined();
      
      // Explain JSON should note FSC included
      expect(result.explain_json.fsc).toBeDefined();
      expect(result.explain_json.fsc.handling).toBe('INCLUDED');
    });
  });
  
  describe('FSC SEPARATE - FLAT_PER_MILE', () => {
    test('calculates FSC correctly per mile', () => {
      const input = {
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_RPM',
        loaded_miles: 500,
        rpm_cents: 200,
        fsc_enabled: true,
        fsc_handling: 'SEPARATE',
        fsc_method: 'FLAT_PER_MILE',
        fsc_cpm_cents: 10
      };
      
      const result = calculateCustomerFreightQuote(input);
      
      const expectedFSC = 500 * 10; // 5000 cents = $50
      expect(result.fuel_surcharge_cents).toBe(expectedFSC);
      
      const fscLine = result.itemized_lines.find(l => l.line_type === 'fuel_surcharge');
      expect(fscLine).toBeDefined();
      expect(fscLine.amount_cents).toBe(expectedFSC);
      expect(fscLine.quantity).toBe(500);
      expect(fscLine.rate_cents).toBe(10);
    });
  });
  
  describe('FSC SEPARATE - PERCENT_OF_LINEHAUL', () => {
    test('calculates FSC as percentage of linehaul', () => {
      const input = {
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_RPM',
        loaded_miles: 500,
        rpm_cents: 200,
        fsc_enabled: true,
        fsc_handling: 'SEPARATE',
        fsc_method: 'PERCENT_OF_LINEHAUL',
        fsc_percent_bps: 1500 // 15%
      };
      
      const result = calculateCustomerFreightQuote(input);
      
      const linehaul = 500 * 200; // 100000 cents
      const expectedFSC = Math.round((linehaul * 1500) / 10000); // 15000 cents
      
      expect(result.fuel_surcharge_cents).toBe(expectedFSC);
      
      const fscLine = result.itemized_lines.find(l => l.line_type === 'fuel_surcharge');
      expect(fscLine).toBeDefined();
      expect(fscLine.amount_cents).toBe(expectedFSC);
    });
  });
  
  describe('FSC SEPARATE - TABLE_LOOKUP', () => {
    test('uses table lookup (stub implementation)', () => {
      const input = {
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_RPM',
        loaded_miles: 500,
        rpm_cents: 200,
        fsc_enabled: true,
        fsc_handling: 'SEPARATE',
        fsc_method: 'TABLE_LOOKUP',
        fsc_table_id: 'table_123'
      };
      
      const result = calculateCustomerFreightQuote(input);
      
      // Stub returns 0 for now
      const fscLine = result.itemized_lines.find(l => l.line_type === 'fuel_surcharge');
      expect(fscLine).toBeDefined();
      expect(fscLine.description).toContain('Table Lookup');
    });
  });
  
  describe('FSC adds to total', () => {
    test('total includes linehaul + FSC', () => {
      const input = {
        transport_mode: 'TRUCK',
        pricing_method: 'FTL_RPM',
        loaded_miles: 500,
        rpm_cents: 200,
        fsc_enabled: true,
        fsc_handling: 'SEPARATE',
        fsc_method: 'FLAT_PER_MILE',
        fsc_cpm_cents: 10
      };
      
      const result = calculateCustomerFreightQuote(input);
      
      const expectedLinehaul = 500 * 200; // 100000
      const expectedFSC = 500 * 10; // 5000
      const expectedTotal = expectedLinehaul + expectedFSC; // 105000
      
      expect(result.total_cents).toBe(expectedTotal);
    });
  });
});