/**
 * LaneRatePreference afterRead Hook
 * Redacts sensitive profitability data by role
 */

export default async function afterRead({ data, user }) {
  try {
    // Fetch related lane preference to determine actor
    const result = { ...data };
    
    // RBAC Redaction Rules:
    // - Driver: Can see own lane rates and profitability, but NOT broker margin details
    // - Carrier: Can see carrier profitability, NOT broker margin or driver pay details
    // - Owner-Operator: Can see OO profitability, NOT broker margin
    // - Broker/Admin: See everything
    // - Customer: No access (should be filtered before this hook)
    
    if (user.role === 'driver') {
      // Driver can see driver pay and minimums, but not broker margin
      delete result.computed_broker_margin_cents;
      delete result.computed_broker_margin_bps;
      delete result.broker_profitability_ok;
    }
    
    if (user.role === 'carrier') {
      // Carrier can see carrier profit, but not broker margin or driver pay details
      delete result.computed_broker_margin_cents;
      delete result.computed_broker_margin_bps;
      delete result.broker_profitability_ok;
      delete result.computed_driver_pay_cents;
      delete result.driver_profitability_ok;
    }
    
    if (user.role === 'owner_operator') {
      // Owner-operator can see OO profit, but not broker margin
      delete result.computed_broker_margin_cents;
      delete result.computed_broker_margin_bps;
      delete result.broker_profitability_ok;
      delete result.computed_driver_pay_cents;
      delete result.driver_profitability_ok;
      delete result.computed_carrier_profit_cents;
      delete result.carrier_profitability_ok;
    }
    
    if (user.role === 'customer') {
      // Customers should not have access to this entity at all
      return {
        ok: false,
        errors: [{ code: 'FORBIDDEN', message: 'Access denied' }]
      };
    }
    
    // Broker and Admin see everything (no redaction)
    
    return { ok: true, data: result };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{ code: 'ERROR', message: error.message }]
    };
  }
}