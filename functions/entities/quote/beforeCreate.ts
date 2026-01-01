/**
 * Quote - Before Create Hook
 * Server-side pricing computation and validation
 */

import { calculateCustomerFreightQuote, validateQuoteInputs } from '../../shared/math/freight/pricingDispatcher';
import { dollarsToCents, centsToDollars } from '../../shared/math/money';

export default async function beforeCreate({ data, user, base44 }) {
  try {
    // Validate quote inputs
    const validation = validateQuoteInputs(data);
    if (!validation.valid) {
      return {
        ok: false,
        errors: validation.errors.map(msg => ({ field: 'quote', code: 'VALIDATION_ERROR', message: msg }))
      };
    }
    
    // Calculate pricing (server authoritative)
    const pricingResult = calculateCustomerFreightQuote(data);
    
    // Override any client-submitted totals
    data.computed_total_cents = pricingResult.total_cents;
    data.itemized_charges_json = {
      lines: pricingResult.itemized_lines,
      subtotals: {
        linehaul_cents: pricingResult.linehaul_cents,
        fuel_surcharge_cents: pricingResult.fuel_surcharge_cents,
        accessorial_total_cents: pricingResult.accessorial_total_cents,
        taxes_fees_cents: pricingResult.taxes_fees_cents
      }
    };
    data.explain_calculation_json = pricingResult.explain_json;
    data.pricing_snapshot_version = pricingResult.pricing_snapshot_version;
    
    // Set legacy fields for compatibility
    data.quoted_rate = centsToDollars(pricingResult.linehaul_cents);
    data.fuel_surcharge = centsToDollars(pricingResult.fuel_surcharge_cents);
    
    // Create line items
    const lineItems = [];
    for (const [index, line] of pricingResult.itemized_lines.entries()) {
      lineItems.push({
        line_number: index + 1,
        ...line
      });
    }
    
    // Store for bulk creation after quote is created
    data._line_items_to_create = lineItems;
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Quote',
      entity_id: data.id || 'new',
      action: 'QUOTE_PRICING_COMPUTED',
      actor_email: user.email,
      actor_role: user.role,
      metadata: {
        transport_mode: data.transport_mode,
        pricing_method: data.pricing_method,
        computed_total_cents: data.computed_total_cents,
        pricing_version: data.pricing_snapshot_version
      }
    });
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{
        field: 'quote',
        code: 'PRICING_ERROR',
        message: error.message
      }]
    };
  }
}