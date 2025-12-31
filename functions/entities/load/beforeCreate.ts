/**
 * Load Entity - Before Create Hook
 * Server-side validation and calculation enforcement
 */

import { parseCurrency, parseMiles, parseDate } from '../../shared/math/parsing';
import { calculateLoadFinancials, validateLoadFinancials } from '../../shared/math/rates';
import { dollarsToCents, centsToDollars } from '../../shared/math/money';

export default async function beforeCreate({ data, user }) {
  const errors = [];
  
  try {
    // Parse and normalize inputs
    const customerRate = parseCurrency(data.customer_rate || 0);
    const carrierPay = parseCurrency(data.carrier_pay || 0);
    const fuelSurcharge = parseCurrency(data.fuel_surcharge_revenue || 0);
    const accessorialTotal = parseCurrency(data.accessorial_revenue_total || 0);
    
    // Calculate financials using centralized library
    const financials = calculateLoadFinancials({
      customerRate,
      carrierPay,
      fuelSurcharge,
      accessorials: accessorialTotal > 0 ? [accessorialTotal] : [],
      overheadPercent: 15,  // Default overhead
      insurancePercent: 2    // Default insurance
    });
    
    // Validate business rules
    const validation = validateLoadFinancials(financials, {
      allowNegativeMargin: data.margin_override_approved === true && user.role === 'admin',
      minMarginPercent: 5  // Minimum 5% margin unless overridden
    });
    
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
    
    // Validate dates
    if (data.pickup_date && data.delivery_date) {
      const pickupDate = parseDate(data.pickup_date);
      const deliveryDate = parseDate(data.delivery_date);
      
      if (pickupDate && deliveryDate && pickupDate > deliveryDate) {
        errors.push('Pickup date cannot be after delivery date');
      }
    }
    
    // Validate distance
    if (data.distance_miles) {
      const miles = parseMiles(data.distance_miles);
      if (miles <= 0) {
        errors.push('Distance must be greater than zero');
      }
    }
    
    // If validation failed, reject
    if (errors.length > 0) {
      return {
        ok: false,
        errors: errors.map(msg => ({
          field: 'load',
          code: 'VALIDATION_ERROR',
          message: msg
        }))
      };
    }
    
    // Overwrite computed fields with server-calculated values
    data.total_revenue = centsToDollars(financials.totalCustomerCharge);
    data.total_carrier_cost = centsToDollars(financials.totalCarrierCost);
    data.margin = centsToDollars(financials.grossMargin);
    data.margin_percent = financials.marginPercent;
    
    // Add audit metadata
    data.calculated_at = new Date().toISOString();
    data.calculated_by_server = true;
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{
        field: 'load',
        code: 'CALCULATION_ERROR',
        message: `Failed to calculate load financials: ${error.message}`
      }]
    };
  }
}