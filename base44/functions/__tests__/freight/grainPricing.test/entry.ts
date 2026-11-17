/**
 * Grain Pricing Tests
 */

import {
  calcGrainPerBushel,
  calcGrainPerTon,
  calcGrainPerCar,
  calcGrainPerBarge,
  calcGrainPerMT,
  calcGrainCPMBanded
} from '../../../shared/math/freight/grainPricing';

describe('Grain Pricing', () => {
  describe('Per Bushel', () => {
    it('should calculate per-bushel correctly', () => {
      const result = calcGrainPerBushel({
        bushels: 1000,
        commodity_type: 'CORN',
        rate_per_bushel_cents: 45 // $0.45/bushel
      });
      
      expect(result.linehaul_cents).toBe(45000); // $450
      expect(result.explain_json.bushels).toBe(1000);
    });
  });
  
  describe('Per Ton', () => {
    it('should calculate per-ton correctly', () => {
      const result = calcGrainPerTon({
        weight_value: 50000, // lbs
        weight_unit: 'LBS',
        rate_per_ton_cents: 3500 // $35/ton
      });
      
      // 50,000 lbs = 25 tons
      expect(result.linehaul_cents).toBe(87500); // 25 × $35
    });
  });
  
  describe('Per Railcar', () => {
    it('should calculate grain railcar correctly', () => {
      const result = calcGrainPerCar({
        railcars_count: 5,
        rate_per_car_cents: 450000 // $4500/car
      });
      
      expect(result.linehaul_cents).toBe(2250000); // $22,500
    });
  });
  
  describe('Per Barge', () => {
    it('should calculate grain barge correctly', () => {
      const result = calcGrainPerBarge({
        barges_count: 2,
        rate_per_barge_cents: 1200000 // $12,000/barge
      });
      
      expect(result.linehaul_cents).toBe(2400000); // $24,000
    });
  });
  
  describe('Per MT (ocean)', () => {
    it('should calculate grain MT correctly', () => {
      const result = calcGrainPerMT({
        weight_value: 50, // MT
        weight_unit: 'MT',
        rate_per_metric_ton_cents: 8500 // $85/MT
      });
      
      expect(result.linehaul_cents).toBe(425000); // 50 × $85
    });
  });
  
  describe('CPM Banded', () => {
    it('should select correct band for short haul', () => {
      const result = calcGrainCPMBanded({
        loaded_miles: 75
      });
      
      // 75 miles falls in 50-100 band (320 cents/mi default)
      expect(result.linehaul_cents).toBe(24000); // 75 × $3.20
      expect(result.explain_json.band_min_miles).toBe(50);
      expect(result.explain_json.band_max_miles).toBe(100);
    });
    
    it('should select correct band for long haul', () => {
      const result = calcGrainCPMBanded({
        loaded_miles: 600
      });
      
      // 600 miles falls in 500+ band (200 cents/mi)
      expect(result.linehaul_cents).toBe(120000); // 600 × $2.00
    });
    
    it('should allow rate override', () => {
      const result = calcGrainCPMBanded({
        loaded_miles: 75,
        rpm_cents: 400 // Override band rate
      });
      
      expect(result.linehaul_cents).toBe(30000); // 75 × $4.00
    });
  });
});