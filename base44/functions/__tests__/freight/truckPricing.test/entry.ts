/**
 * Truck Pricing Tests
 */

import { calcFTLPerMile, calcFTLFlat, calcLTLCWT, densityToClass } from '../../shared/math/freight/truckPricing';

describe('Truck Pricing', () => {
  describe('FTL Per-Mile', () => {
    it('should calculate FTL RPM correctly', () => {
      const result = calcFTLPerMile({
        loaded_miles: 500,
        rpm_cents: 200 // $2.00/mile
      });
      
      expect(result.linehaul_cents).toBe(100000); // $1000
      expect(result.total_cents).toBe(100000);
      expect(result.explain_json.method).toBe('FTL_RPM');
      expect(result.itemized_lines).toHaveLength(1);
    });
    
    it('should throw error if miles missing', () => {
      expect(() => {
        calcFTLPerMile({ rpm_cents: 200 });
      }).toThrow('Loaded miles required');
    });
    
    it('should throw error if rpm missing', () => {
      expect(() => {
        calcFTLPerMile({ loaded_miles: 500 });
      }).toThrow('RPM rate required');
    });
  });
  
  describe('FTL Flat', () => {
    it('should calculate flat rate correctly', () => {
      const result = calcFTLFlat({
        flat_cents: 150000 // $1500
      });
      
      expect(result.linehaul_cents).toBe(150000);
      expect(result.total_cents).toBe(150000);
      expect(result.explain_json.method).toBe('FTL_FLAT');
    });
  });
  
  describe('LTL CWT', () => {
    it('should calculate CWT correctly', () => {
      const result = calcLTLCWT({
        weight_value: 5000, // lbs
        weight_unit: 'LBS',
        rate_per_cwt_cents: 2500 // $25/cwt
      });
      
      expect(result.linehaul_cents).toBe(125000); // 50 cwt × $25 = $1250
      expect(result.explain_json.cwt).toBe(50);
      expect(result.total_cents).toBe(125000);
    });
    
    it('should round up CWT correctly', () => {
      const result = calcLTLCWT({
        weight_value: 5001, // 50.01 cwt
        weight_unit: 'LBS',
        rate_per_cwt_cents: 2500
      });
      
      expect(result.explain_json.cwt).toBe(51); // Rounded up
      expect(result.linehaul_cents).toBe(127500); // 51 × $25
    });
    
    it('should calculate density and suggest class', () => {
      const result = calcLTLCWT({
        weight_value: 2000,
        weight_unit: 'LBS',
        volume_value: 100, // cft
        volume_unit: 'CFT',
        rate_per_cwt_cents: 3000
      });
      
      expect(result.explain_json.density_pcf).toBe(20); // 2000/100
      expect(result.explain_json.freight_class).toBe(65); // Density 20 → Class 65
    });
  });
  
  describe('Density to Class Mapping', () => {
    it('should map density to correct freight class', () => {
      expect(densityToClass(50)).toBe(50);
      expect(densityToClass(25)).toBe(65);
      expect(densityToClass(8.5)).toBe(110);
      expect(densityToClass(0.5)).toBe(500);
    });
  });
});