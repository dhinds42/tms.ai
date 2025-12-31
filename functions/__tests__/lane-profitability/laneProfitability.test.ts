/**
 * Lane Profitability Math Tests
 */

import { calculateLaneProfitability, validateProfitability } from '../../shared/math/laneProfitability';
import { dollarsToCents } from '../../shared/math/money';

describe('Lane Profitability Calculations', () => {
  
  test('calculates RPM-based profitability correctly', () => {
    const snapshot = calculateLaneProfitability({
      loaded_miles: 500,
      deadhead_miles: 50,
      rate_type: 'per_mile',
      customer_rpm_cents: 200, // $2.00/mi
      carrier_rpm_cents: 150,  // $1.50/mi
      carrier_or_oo_cost_profile: {
        fuel_cost_per_mile_cents: 50,
        maintenance_cost_per_mile_cents: 20,
        insurance_cost_per_mile_cents: 10,
        overhead_cost_per_mile_cents: 15,
        tolls_cost_per_mile_cents: 5,
        desired_profit_per_mile_cents: 20
      },
      broker_cost_profile: {
        desired_margin_bps: 1500 // 15%
      }
    });
    
    // Verify totals
    expect(snapshot.computed_loaded_miles).toBe(500);
    expect(snapshot.computed_total_miles).toBe(550);
    expect(snapshot.computed_customer_revenue_cents).toBe(100000); // $1000 (500 mi * $2)
    expect(snapshot.computed_carrier_pay_cents).toBe(75000); // $750 (500 mi * $1.50)
    expect(snapshot.computed_broker_margin_cents).toBe(25000); // $250
    
    // Verify operating costs (550 miles * costs/mi)
    const expected_fuel = 550 * 50;
    const expected_maint = 550 * 20;
    const expected_ins = 550 * 10;
    const expected_overhead = 550 * 15;
    const expected_tolls = 550 * 5;
    const expected_total = expected_fuel + expected_maint + expected_ins + expected_overhead + expected_tolls;
    
    expect(snapshot.computed_operating_cost_cents).toBe(expected_total);
  });
  
  test('calculates flat rate profitability correctly', () => {
    const snapshot = calculateLaneProfitability({
      loaded_miles: 500,
      deadhead_miles: 50,
      rate_type: 'flat',
      customer_flat_cents: dollarsToCents(1200),
      carrier_flat_cents: dollarsToCents(900),
      carrier_or_oo_cost_profile: {
        fuel_cost_per_mile_cents: 50,
        maintenance_cost_per_mile_cents: 20,
        insurance_cost_per_mile_cents: 10,
        overhead_cost_per_mile_cents: 15,
        tolls_cost_per_mile_cents: 5
      }
    });
    
    expect(snapshot.computed_customer_revenue_cents).toBe(120000); // $1200
    expect(snapshot.computed_carrier_pay_cents).toBe(90000); // $900
    expect(snapshot.computed_broker_margin_cents).toBe(30000); // $300
  });
  
  test('handles company driver pay correctly (CPM)', () => {
    const snapshot = calculateLaneProfitability({
      loaded_miles: 500,
      deadhead_miles: 0,
      rate_type: 'per_mile',
      carrier_rpm_cents: 150,
      driver_cost_profile: {
        pay_type: 'cpm',
        pay_cpm_cents: 50 // $0.50/mi
      },
      carrier_or_oo_cost_profile: {
        fuel_cost_per_mile_cents: 60,
        maintenance_cost_per_mile_cents: 20,
        insurance_cost_per_mile_cents: 10,
        overhead_cost_per_mile_cents: 10
      }
    });
    
    expect(snapshot.computed_driver_pay_cents).toBe(25000); // 500 mi * $0.50
    
    // Carrier profit = carrier_pay - (driver_pay + operating_cost)
    const carrier_pay = 75000; // 500 * $1.50
    const operating_cost = 500 * (60 + 20 + 10 + 10);
    const expected_carrier_profit = carrier_pay - 25000 - operating_cost;
    
    expect(snapshot.computed_carrier_profit_cents).toBe(expected_carrier_profit);
  });
  
  test('handles owner-operator profit correctly', () => {
    const snapshot = calculateLaneProfitability({
      loaded_miles: 500,
      deadhead_miles: 50,
      rate_type: 'per_mile',
      carrier_rpm_cents: 180,
      carrier_or_oo_cost_profile: {
        fuel_cost_per_mile_cents: 60,
        maintenance_cost_per_mile_cents: 25,
        insurance_cost_per_mile_cents: 15,
        overhead_cost_per_mile_cents: 10,
        tolls_cost_per_mile_cents: 5
      }
    });
    
    const carrier_pay = 500 * 180; // $900
    const total_miles = 550;
    const operating_cost = total_miles * (60 + 25 + 15 + 10 + 5);
    const expected_profit = carrier_pay - operating_cost;
    
    expect(snapshot.computed_ownerop_profit_cents).toBe(expected_profit);
  });
  
  test('handles deadhead sensitivity', () => {
    const base = calculateLaneProfitability({
      loaded_miles: 500,
      deadhead_miles: 0,
      rate_type: 'per_mile',
      carrier_rpm_cents: 150,
      carrier_or_oo_cost_profile: {
        fuel_cost_per_mile_cents: 50,
        maintenance_cost_per_mile_cents: 20,
        insurance_cost_per_mile_cents: 10,
        overhead_cost_per_mile_cents: 10
      }
    });
    
    const withDeadhead = calculateLaneProfitability({
      loaded_miles: 500,
      deadhead_miles: 100,
      rate_type: 'per_mile',
      carrier_rpm_cents: 150,
      carrier_or_oo_cost_profile: {
        fuel_cost_per_mile_cents: 50,
        maintenance_cost_per_mile_cents: 20,
        insurance_cost_per_mile_cents: 10,
        overhead_cost_per_mile_cents: 10
      }
    });
    
    // Deadhead should increase operating costs and reduce profit
    expect(withDeadhead.computed_operating_cost_cents).toBeGreaterThan(base.computed_operating_cost_cents);
    expect(withDeadhead.computed_ownerop_profit_cents).toBeLessThan(base.computed_ownerop_profit_cents);
  });
  
  test('calculates minimum profitable RPM', () => {
    const snapshot = calculateLaneProfitability({
      loaded_miles: 500,
      deadhead_miles: 50,
      rate_type: 'per_mile',
      carrier_rpm_cents: 150,
      carrier_or_oo_cost_profile: {
        fuel_cost_per_mile_cents: 50,
        maintenance_cost_per_mile_cents: 20,
        insurance_cost_per_mile_cents: 10,
        overhead_cost_per_mile_cents: 10,
        desired_profit_per_mile_cents: 30
      }
    });
    
    expect(snapshot.computed_min_profitable_rpm_cents).toBeGreaterThan(0);
    expect(snapshot.computed_min_profitable_flat_cents).toBeGreaterThan(0);
  });
  
  test('validates profitability flags', () => {
    const snapshot = calculateLaneProfitability({
      loaded_miles: 500,
      deadhead_miles: 0,
      rate_type: 'per_mile',
      customer_rpm_cents: 200,
      carrier_rpm_cents: 180,
      carrier_or_oo_cost_profile: {
        fuel_cost_per_mile_cents: 50,
        maintenance_cost_per_mile_cents: 20,
        insurance_cost_per_mile_cents: 10,
        overhead_cost_per_mile_cents: 10,
        desired_profit_per_mile_cents: 30
      },
      broker_cost_profile: {
        desired_margin_bps: 500 // 5%
      }
    });
    
    const validation = validateProfitability(snapshot, {
      requireCarrierOk: true,
      requireBrokerOk: true
    });
    
    expect(validation.valid).toBe(true);
  });
  
  test('rejects zero or negative miles', () => {
    expect(() => calculateLaneProfitability({
      loaded_miles: -100,
      deadhead_miles: 0,
      rate_type: 'per_mile',
      carrier_rpm_cents: 150
    })).toThrow('cannot be negative');
  });
});