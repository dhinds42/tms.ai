/**
 * Ocean Pricing Tests
 */

import { calcOceanFCL, calcOceanLCL_WM, calcOceanBulkPerMT } from '../../../shared/math/freight/oceanPricing';

describe('Ocean Pricing', () => {
  describe('FCL', () => {
    it('should calculate FCL correctly', () => {
      const result = calcOceanFCL({
        containers_count: 2,
        container_type: '40HC',
        rate_per_container_cents: 300000 // $3000/container
      });
      
      expect(result.linehaul_cents).toBe(600000); // $6000
      expect(result.explain_json.container_type).toBe('40HC');
    });
    
    it('should add BAF and CAF if provided', () => {
      const result = calcOceanFCL({
        containers_count: 1,
        container_type: '20GP',
        rate_per_container_cents: 200000,
        baf_cents: 10000, // $100 BAF
        caf_cents: 5000   // $50 CAF
      });
      
      expect(result.linehaul_cents).toBe(200000);
      expect(result.itemized_lines.length).toBeGreaterThan(1); // Includes BAF/CAF
    });
  });
  
  describe('LCL W/M', () => {
    it('should use weight when weight > volume', () => {
      const result = calcOceanLCL_WM({
        weight_value: 5000, // kg → 5 MT
        weight_unit: 'KG',
        volume_value: 3, // CBM
        volume_unit: 'CBM',
        rate_per_wm_cents: 8000 // $80/W/M
      });
      
      // 5 MT > 3 CBM, so W/M = 5
      expect(result.explain_json.wm_units).toBe(5);
      expect(result.linehaul_cents).toBe(40000); // 5 × $80
    });
    
    it('should use volume when volume > weight', () => {
      const result = calcOceanLCL_WM({
        weight_value: 2000, // kg → 2 MT
        weight_unit: 'KG',
        volume_value: 5, // CBM
        volume_unit: 'CBM',
        rate_per_wm_cents: 8000
      });
      
      // 2 MT < 5 CBM, so W/M = 5
      expect(result.explain_json.wm_units).toBe(5);
      expect(result.linehaul_cents).toBe(40000);
    });
  });
  
  describe('Bulk Per MT', () => {
    it('should calculate bulk MT correctly', () => {
      const result = calcOceanBulkPerMT({
        weight_value: 25000, // kg → 25 MT
        weight_unit: 'KG',
        rate_per_metric_ton_cents: 4500 // $45/MT
      });
      
      expect(result.linehaul_cents).toBe(112500); // 25 × $45
      expect(result.explain_json.weight_mt).toBe(25);
    });
  });
});