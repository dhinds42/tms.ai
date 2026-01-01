/**
 * Invoice - Before Update Hook
 * Recompute totals if line items changed, track variance
 */

import { calculateCustomerFreightQuote } from '../../shared/math/freight/pricingDispatcher';
import { centsToDollars } from '../../shared/math/money';

export default async function beforeUpdate({ data, existing, user, base44 }) {
  try {
    // If pricing inputs changed, recompute
    const pricingFieldsChanged = [
      'transport_mode',
      'pricing_method',
      'loaded_miles',
      'weight_value',
      'containers_count',
      'railcars_count',
      'barges_count'
    ].some(field => data[field] !== undefined && data[field] !== existing[field]);
    
    if (pricingFieldsChanged) {
      // Merge existing + new data for recalculation
      const mergedData = { ...existing, ...data };
      
      const pricingResult = calculateCustomerFreightQuote(mergedData);
      
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
      
      // Update legacy fields
      data.total_amount = centsToDollars(pricingResult.total_cents);
      
      // Compute variance vs quote if quote_id present
      if (existing.quote_id && existing.quote_total_cents) {
        data.variance_cents = pricingResult.total_cents - existing.quote_total_cents;
        
        const VARIANCE_TOLERANCE_CENTS = 1000; // $10 tolerance
        if (Math.abs(data.variance_cents) > VARIANCE_TOLERANCE_CENTS) {
          data.variance_reason = 'Recomputed pricing differs from original quote';
          
          // Log variance alert
          await base44.asServiceRole.entities.AuditLog.create({
            entity_type: 'Invoice',
            entity_id: existing.id,
            action: 'INVOICE_VARIANCE_FLAGGED',
            actor_email: user.email,
            actor_role: user.role,
            metadata: {
              quote_total_cents: existing.quote_total_cents,
              invoice_total_cents: pricingResult.total_cents,
              variance_cents: data.variance_cents
            }
          });
        }
      }
      
      // Audit log
      await base44.asServiceRole.entities.AuditLog.create({
        entity_type: 'Invoice',
        entity_id: existing.id,
        action: 'INVOICE_PRICING_RECOMPUTED',
        actor_email: user.email,
        actor_role: user.role,
        metadata: {
          computed_total_cents: data.computed_total_cents,
          pricing_version: pricingResult.pricing_snapshot_version
        }
      });
    }
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{
        field: 'invoice',
        code: 'PRICING_ERROR',
        message: error.message
      }]
    };
  }
}