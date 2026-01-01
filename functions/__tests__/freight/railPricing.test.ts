/**
 * Rail Pricing Tests
 */

import { calcRailPerCar, calcRailIntermodal, calcRailTonMile } from '../../shared/math/freight/railPricing';

describe('Rail Pricing', () => {
  describe('Per Railcar', () => {
    it('should calculate per-car correctly', () => {
      const result = calcRailPerCar({
        railcars_count: 3,
        rate_per_car_cents: 250000 // $2500/car
      });
      
      expect(result.linehaul_cents).toBe(750000); // $7500
      expect(result.explain_json.railcars_count).toBe(3);
    });
  });
  
  describe('Intermodal', () => {
    it('should calculate intermodal container pricing', () => {
      const result = calcRailIntermodal({
        containers_count: 2,
        container_type: '53FT',
        rate_per_container_cents: 180000 // $1800/container
      });
      
      expect(result.linehaul_cents).toBe(360000); // $3600
      expect(result.explain_json.container_type).toBe('53FT');
    });
  });
  
  describe('Ton-Mile', () => {
    it('should calculate ton-mile correctly', () => {
      const result = calcRailTonMile({
        weight_value: 100000, // lbs
        weight_unit: 'LBS',
        loaded_miles: 500,
        ton_mile_rate_cents: 5 // $0.05 per ton-mile
      });
      
      // 100,000 lbs = 50 tons
      // 50 tons × 500 mi × $0.05 = $1250
      expect(result.linehaul_cents).toBe(125000);
      expect(result.explain_json.weight_tons).toBeCloseTo(50);
    });
  });
});