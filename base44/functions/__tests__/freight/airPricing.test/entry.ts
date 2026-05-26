/**
 * Air Pricing Tests
 */

import { calcAirChargeableWeight } from '../../shared/math/freight/airPricing';

describe('Air Pricing', () => {
  describe('Chargeable Weight', () => {
    it('should use actual weight when actual > dim', () => {
      const result = calcAirChargeableWeight({
        weight_value: 200, // kg
        weight_unit: 'KG',
        length: 40,
        width: 40,
        height: 40,
        dim_unit: 'CM',
        rate_per_kg_cents: 150 // $1.50/kg
      });
      
      // Dim weight: 40×40×40 / 166 = 64,000 / 166 = ~386 kg
      // Actual 200kg < Dim 386kg, so chargeable = 386kg
      expect(result.explain_json.chargeable_weight_kg).toBeGreaterThan(200);
      expect(result.explain_json.used_dim_weight).toBe(true);
    });
    
    it('should use dim weight when dim > actual', () => {
      const result = calcAirChargeableWeight({
        weight_value: 50, // kg (light, bulky)
        weight_unit: 'KG',
        length: 60,
        width: 60,
        height: 60,
        dim_unit: 'CM',
        rate_per_kg_cents: 150
      });
      
      // Dim weight: 60³ / 166 = 216,000 / 166 = 1301 kg
      // Actual 50kg < Dim 1301kg, so use dim
      expect(result.explain_json.used_dim_weight).toBe(true);
      expect(result.explain_json.chargeable_weight_kg).toBeGreaterThan(1000);
    });
    
    it('should work without dimensions (actual weight only)', () => {
      const result = calcAirChargeableWeight({
        weight_value: 100,
        weight_unit: 'KG',
        rate_per_kg_cents: 200
      });
      
      expect(result.linehaul_cents).toBe(20000); // 100kg × $2
      expect(result.explain_json.used_dim_weight).toBe(false);
    });
  });
});