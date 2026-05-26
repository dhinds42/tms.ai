/**
 * Lane Profitability Calculations
 * Single source of truth for driver/carrier/owner-operator/broker profitability analysis
 */

import * as Money from './money';
import { roundCurrency } from './rounding';
import { safePercent } from './percent';

export interface LaneProfitabilityInput {
  // Miles
  loaded_miles: number;
  deadhead_miles: number;
  
  // Rates
  rate_type: 'per_mile' | 'flat';
  customer_rpm_cents?: Money.Cents;
  customer_flat_cents?: Money.Cents;
  carrier_rpm_cents?: Money.Cents;
  carrier_flat_cents?: Money.Cents;
  
  // Cost Profiles
  driver_cost_profile?: {
    pay_type: 'cpm' | 'percent' | 'flat';
    pay_cpm_cents?: Money.Cents;
    pay_percent_bps?: number;
    pay_flat_cents?: Money.Cents;
    per_diem_cents?: Money.Cents;
  };
  
  carrier_or_oo_cost_profile?: {
    fuel_cost_per_mile_cents: Money.Cents;
    maintenance_cost_per_mile_cents: Money.Cents;
    insurance_cost_per_mile_cents: Money.Cents;
    overhead_cost_per_mile_cents: Money.Cents;
    tolls_cost_per_mile_cents?: Money.Cents;
    desired_profit_per_mile_cents?: Money.Cents;
    desired_margin_bps?: number;
  };
  
  broker_cost_profile?: {
    overhead_per_load_cents?: Money.Cents;
    desired_margin_bps?: number;
    desired_margin_cents_min?: Money.Cents;
    factoring_fee_bps?: number;
    chargeback_reserve_bps?: number;
  };
}

export interface ProfitabilitySnapshot {
  // Computed Miles
  computed_loaded_miles: number;
  computed_deadhead_miles: number;
  computed_total_miles: number;
  
  // Computed Revenue & Pay
  computed_customer_revenue_cents: Money.Cents;
  computed_carrier_pay_cents: Money.Cents;
  computed_driver_pay_cents: Money.Cents;
  
  // Computed Costs
  computed_operating_cost_cents: Money.Cents;
  computed_operating_cost_breakdown: {
    fuel_cents: Money.Cents;
    maintenance_cents: Money.Cents;
    insurance_cents: Money.Cents;
    overhead_cents: Money.Cents;
    tolls_cents: Money.Cents;
  };
  
  // Computed Profits
  computed_carrier_profit_cents: Money.Cents;
  computed_ownerop_profit_cents: Money.Cents;
  computed_broker_margin_cents: Money.Cents;
  computed_broker_margin_bps: number;
  computed_broker_net_margin_cents: Money.Cents;
  
  // Minimums
  computed_min_profitable_rpm_cents: Money.Cents;
  computed_min_profitable_flat_cents: Money.Cents;
  computed_min_carrier_pay_cents: Money.Cents;
  computed_min_customer_rate_cents: Money.Cents;
  
  // Flags
  driver_profitability_ok: boolean;
  carrier_profitability_ok: boolean;
  ownerop_profitability_ok: boolean;
  broker_profitability_ok: boolean;
  
  // Explanation
  explain_calculation_json: object;
}

/**
 * Calculate complete lane profitability snapshot
 * This is the SINGLE SOURCE OF TRUTH for lane profitability analysis
 */
export function calculateLaneProfitability(input: LaneProfitabilityInput): ProfitabilitySnapshot {
  // Validate inputs
  if (input.loaded_miles < 0) {
    throw new Error('Loaded miles cannot be negative');
  }
  if (input.deadhead_miles < 0) {
    throw new Error('Deadhead miles cannot be negative');
  }
  
  // Step 1: Compute miles
  const loaded_miles = input.loaded_miles;
  const deadhead_miles = input.deadhead_miles;
  const total_miles = loaded_miles + deadhead_miles;
  
  // Step 2: Compute customer revenue
  let customer_revenue_cents: Money.Cents;
  if (input.rate_type === 'per_mile') {
    if (!input.customer_rpm_cents) {
      throw new Error('customer_rpm_cents required for per_mile rate type');
    }
    customer_revenue_cents = Math.round(loaded_miles * input.customer_rpm_cents);
  } else {
    if (!input.customer_flat_cents) {
      throw new Error('customer_flat_cents required for flat rate type');
    }
    customer_revenue_cents = input.customer_flat_cents;
  }
  
  // Step 3: Compute carrier pay
  let carrier_pay_cents: Money.Cents;
  if (input.rate_type === 'per_mile') {
    if (!input.carrier_rpm_cents) {
      throw new Error('carrier_rpm_cents required for per_mile rate type');
    }
    carrier_pay_cents = Math.round(loaded_miles * input.carrier_rpm_cents);
  } else {
    if (!input.carrier_flat_cents) {
      throw new Error('carrier_flat_cents required for flat rate type');
    }
    carrier_pay_cents = input.carrier_flat_cents;
  }
  
  // Step 4: Compute operating costs (carrier/OO)
  const costProfile = input.carrier_or_oo_cost_profile;
  let operating_cost_cents: Money.Cents = 0;
  let cost_breakdown = {
    fuel_cents: 0,
    maintenance_cents: 0,
    insurance_cents: 0,
    overhead_cents: 0,
    tolls_cents: 0
  };
  
  if (costProfile) {
    cost_breakdown.fuel_cents = Math.round(total_miles * costProfile.fuel_cost_per_mile_cents);
    cost_breakdown.maintenance_cents = Math.round(total_miles * costProfile.maintenance_cost_per_mile_cents);
    cost_breakdown.insurance_cents = Math.round(total_miles * costProfile.insurance_cost_per_mile_cents);
    cost_breakdown.overhead_cents = Math.round(total_miles * costProfile.overhead_cost_per_mile_cents);
    cost_breakdown.tolls_cents = Math.round(total_miles * (costProfile.tolls_cost_per_mile_cents || 0));
    
    operating_cost_cents = Money.sum([
      cost_breakdown.fuel_cents,
      cost_breakdown.maintenance_cents,
      cost_breakdown.insurance_cents,
      cost_breakdown.overhead_cents,
      cost_breakdown.tolls_cents
    ]);
  }
  
  // Step 5: Compute driver pay (if company driver)
  let driver_pay_cents: Money.Cents = 0;
  const driverProfile = input.driver_cost_profile;
  
  if (driverProfile) {
    if (driverProfile.pay_type === 'cpm' && driverProfile.pay_cpm_cents) {
      driver_pay_cents = Math.round(loaded_miles * driverProfile.pay_cpm_cents);
    } else if (driverProfile.pay_type === 'percent' && driverProfile.pay_percent_bps) {
      driver_pay_cents = Money.percentage(carrier_pay_cents, driverProfile.pay_percent_bps / 100);
    } else if (driverProfile.pay_type === 'flat' && driverProfile.pay_flat_cents) {
      driver_pay_cents = driverProfile.pay_flat_cents;
    }
    
    // Add per diem if applicable
    if (driverProfile.per_diem_cents) {
      const estimated_days = Math.ceil(total_miles / 500); // Assume 500 mi/day
      driver_pay_cents = Money.add(driver_pay_cents, driver_pay_cents * estimated_days);
    }
  }
  
  // Step 6: Compute carrier profit (company driver model)
  const carrier_profit_cents = Money.subtract(
    carrier_pay_cents,
    Money.add(driver_pay_cents, operating_cost_cents)
  );
  
  // Step 7: Compute owner-operator profit
  const ownerop_profit_cents = Money.subtract(carrier_pay_cents, operating_cost_cents);
  
  // Step 8: Compute broker margin
  const broker_margin_cents = Money.subtract(customer_revenue_cents, carrier_pay_cents);
  const broker_margin_bps = customer_revenue_cents > 0
    ? Math.round(safePercent(broker_margin_cents, customer_revenue_cents) * 10000)
    : 0;
  
  // Apply broker costs
  const brokerProfile = input.broker_cost_profile;
  let broker_net_margin_cents = broker_margin_cents;
  
  if (brokerProfile) {
    if (brokerProfile.overhead_per_load_cents) {
      broker_net_margin_cents = Money.subtract(broker_net_margin_cents, brokerProfile.overhead_per_load_cents);
    }
    if (brokerProfile.factoring_fee_bps) {
      const factoring_fee = Money.percentage(customer_revenue_cents, brokerProfile.factoring_fee_bps / 100);
      broker_net_margin_cents = Money.subtract(broker_net_margin_cents, factoring_fee);
    }
    if (brokerProfile.chargeback_reserve_bps) {
      const reserve = Money.percentage(customer_revenue_cents, brokerProfile.chargeback_reserve_bps / 100);
      broker_net_margin_cents = Money.subtract(broker_net_margin_cents, reserve);
    }
  }
  
  // Step 9: Calculate minimums
  let min_carrier_pay_cents: Money.Cents = 0;
  let min_customer_rate_cents: Money.Cents = 0;
  let min_profitable_rpm_cents: Money.Cents = 0;
  let min_profitable_flat_cents: Money.Cents = 0;
  
  if (costProfile) {
    // Minimum carrier pay = operating costs + driver pay + desired profit
    const desired_profit = costProfile.desired_profit_per_mile_cents
      ? Math.round(loaded_miles * costProfile.desired_profit_per_mile_cents)
      : 0;
    
    min_carrier_pay_cents = Money.sum([
      operating_cost_cents,
      driver_pay_cents,
      desired_profit
    ]);
    
    // Minimum customer rate = carrier pay + broker margin
    if (brokerProfile) {
      const min_broker_margin = brokerProfile.desired_margin_cents_min || 0;
      const min_broker_overhead = brokerProfile.overhead_per_load_cents || 0;
      min_customer_rate_cents = Money.sum([
        min_carrier_pay_cents,
        min_broker_margin,
        min_broker_overhead
      ]);
    } else {
      min_customer_rate_cents = min_carrier_pay_cents;
    }
    
    // Convert to RPM/flat
    if (loaded_miles > 0) {
      min_profitable_rpm_cents = Math.round(min_customer_rate_cents / loaded_miles);
    }
    min_profitable_flat_cents = min_customer_rate_cents;
  }
  
  // Step 10: Profitability flags
  const driver_ok = driverProfile ? driver_pay_cents >= 0 : true; // Drivers always ok if profile exists and pay >= 0
  
  const carrier_ok = costProfile
    ? carrier_profit_cents >= (costProfile.desired_profit_per_mile_cents || 0) * loaded_miles
    : true;
  
  const ownerop_ok = costProfile
    ? ownerop_profit_cents >= (costProfile.desired_profit_per_mile_cents || 0) * loaded_miles
    : true;
  
  const broker_ok = brokerProfile
    ? (
        (brokerProfile.desired_margin_cents_min ? broker_net_margin_cents >= brokerProfile.desired_margin_cents_min : true) &&
        (brokerProfile.desired_margin_bps ? broker_margin_bps >= brokerProfile.desired_margin_bps : true)
      )
    : true;
  
  // Step 11: Explain calculation
  const explanation = {
    input_summary: {
      loaded_miles,
      deadhead_miles,
      total_miles,
      rate_type: input.rate_type
    },
    revenue_breakdown: {
      customer_revenue_cents,
      carrier_pay_cents,
      broker_margin_cents,
      broker_margin_percent: roundCurrency(broker_margin_bps / 100)
    },
    cost_breakdown: {
      operating_cost_cents,
      fuel_cents: cost_breakdown.fuel_cents,
      maintenance_cents: cost_breakdown.maintenance_cents,
      insurance_cents: cost_breakdown.insurance_cents,
      overhead_cents: cost_breakdown.overhead_cents,
      tolls_cents: cost_breakdown.tolls_cents,
      driver_pay_cents
    },
    profit_breakdown: {
      carrier_profit_cents,
      ownerop_profit_cents,
      broker_net_margin_cents
    },
    minimums: {
      min_carrier_pay_cents,
      min_customer_rate_cents,
      min_rpm_cents: min_profitable_rpm_cents,
      min_flat_cents: min_profitable_flat_cents
    },
    flags: {
      driver_ok,
      carrier_ok,
      ownerop_ok,
      broker_ok
    }
  };
  
  return {
    computed_loaded_miles: loaded_miles,
    computed_deadhead_miles: deadhead_miles,
    computed_total_miles: total_miles,
    computed_customer_revenue_cents: customer_revenue_cents,
    computed_carrier_pay_cents: carrier_pay_cents,
    computed_driver_pay_cents: driver_pay_cents,
    computed_operating_cost_cents: operating_cost_cents,
    computed_operating_cost_breakdown: cost_breakdown,
    computed_carrier_profit_cents: carrier_profit_cents,
    computed_ownerop_profit_cents: ownerop_profit_cents,
    computed_broker_margin_cents: broker_margin_cents,
    computed_broker_margin_bps: broker_margin_bps,
    computed_broker_net_margin_cents: broker_net_margin_cents,
    computed_min_profitable_rpm_cents: min_profitable_rpm_cents,
    computed_min_profitable_flat_cents: min_profitable_flat_cents,
    computed_min_carrier_pay_cents: min_carrier_pay_cents,
    computed_min_customer_rate_cents: min_customer_rate_cents,
    driver_profitability_ok: driver_ok,
    carrier_profitability_ok: carrier_ok,
    ownerop_profitability_ok: ownerop_ok,
    broker_profitability_ok: broker_ok,
    explain_calculation_json: explanation
  };
}

/**
 * Validate profitability snapshot meets all requirements
 */
export function validateProfitability(
  snapshot: ProfitabilitySnapshot,
  options?: {
    requireDriverOk?: boolean;
    requireCarrierOk?: boolean;
    requireOwneopOk?: boolean;
    requireBrokerOk?: boolean;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (options?.requireDriverOk && !snapshot.driver_profitability_ok) {
    errors.push('Driver profitability requirement not met');
  }
  
  if (options?.requireCarrierOk && !snapshot.carrier_profitability_ok) {
    errors.push('Carrier profitability requirement not met');
  }
  
  if (options?.requireOwneopOk && !snapshot.ownerop_profitability_ok) {
    errors.push('Owner-operator profitability requirement not met');
  }
  
  if (options?.requireBrokerOk && !snapshot.broker_profitability_ok) {
    errors.push('Broker margin requirement not met');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}