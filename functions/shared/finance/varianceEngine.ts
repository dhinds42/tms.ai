/**
 * Quote → Invoice Variance Detection Engine
 * Automatically flags variances exceeding tolerance
 */

import { dollarsToCents, centsToDollars } from '../math/money';

export async function detectAndFlagVariance(invoice, base44) {
  try {
    // Must have quote reference
    if (!invoice.quote_id) {
      return { variance_detected: false, reason: 'No quote reference' };
    }
    
    // Get original quote
    const quotes = await base44.asServiceRole.entities.Quote.filter({ id: invoice.quote_id });
    if (!quotes || quotes.length === 0) {
      return { variance_detected: false, reason: 'Quote not found' };
    }
    
    const quote = quotes[0];
    
    // Get customer variance tolerance
    const customers = await base44.asServiceRole.entities.Customer.filter({ party_id: invoice.customer_party_id });
    const customer = customers?.[0];
    
    const tolerancePercentBps = customer?.variance_tolerance_percent_bps || 500; // Default 5%
    const toleranceCents = customer?.variance_tolerance_cents || 10000; // Default $100
    
    // Calculate variance
    const quoteTotalCents = quote.computed_total_cents || dollarsToCents(quote.quoted_rate || 0);
    const invoiceTotalCents = invoice.computed_total_cents || dollarsToCents(invoice.total_amount || 0);
    
    const varianceCents = invoiceTotalCents - quoteTotalCents;
    const variancePercentBps = quoteTotalCents > 0 
      ? Math.round((varianceCents / quoteTotalCents) * 10000)
      : 0;
    
    const absoluteVariance = Math.abs(varianceCents);
    const absoluteVarianceBps = Math.abs(variancePercentBps);
    
    // Check if tolerance exceeded
    const exceedsAbsolute = absoluteVariance > toleranceCents;
    const exceedsPercent = absoluteVarianceBps > tolerancePercentBps;
    
    if (exceedsAbsolute || exceedsPercent) {
      // Create variance case
      const varianceCase = await base44.asServiceRole.entities.VarianceCase.create({
        org_id: invoice.org_id || customer?.org_id || 'default',
        invoice_id: invoice.id,
        quote_id: quote.id,
        load_id: invoice.load_id,
        case_number: `VAR-${Date.now()}`,
        variance_amount_cents: varianceCents,
        variance_percent_bps: variancePercentBps,
        quote_total_cents: quoteTotalCents,
        invoice_total_cents: invoiceTotalCents,
        tolerance_exceeded: true,
        status: 'OPEN'
      });
      
      // Flag invoice
      await base44.asServiceRole.entities.Invoice.update(invoice.id, {
        variance_cents: varianceCents,
        variance_flagged: true,
        variance_case_id: varianceCase.id
      });
      
      // Audit log
      await base44.asServiceRole.entities.AuditLog.create({
        entity_type: 'VarianceCase',
        entity_id: varianceCase.id,
        action: 'CREATE',
        actor_email: 'system@tms.ai',
        actor_role: 'system',
        metadata: {
          variance_cents: varianceCents,
          variance_percent_bps: variancePercentBps,
          tolerance_cents: toleranceCents,
          tolerance_percent_bps: tolerancePercentBps,
          exceeded_absolute: exceedsAbsolute,
          exceeded_percent: exceedsPercent
        }
      });
      
      return {
        variance_detected: true,
        variance_case_id: varianceCase.id,
        variance_cents: varianceCents,
        variance_percent_bps: variancePercentBps
      };
    }
    
    return { variance_detected: false, variance_cents: varianceCents, within_tolerance: true };
    
  } catch (error) {
    console.error('Variance detection error:', error);
    return { variance_detected: false, error: error.message };
  }
}

export function categorizeVariance(quote, invoice) {
  /**
   * Determine primary cause of variance
   */
  
  const categories = [];
  
  // Analyze line items
  const quoteLines = quote.itemized_charges_json?.lines || [];
  const invoiceLines = invoice.itemized_charges_json?.lines || [];
  
  // More accessorials in invoice
  const quoteAccessorialCount = quoteLines.filter(l => l.line_type === 'accessorial').length;
  const invoiceAccessorialCount = invoiceLines.filter(l => l.line_type === 'accessorial').length;
  
  if (invoiceAccessorialCount > quoteAccessorialCount) {
    categories.push('ACCESSORIAL_ADDED');
  }
  
  // Mileage difference
  const quoteMiles = quote.loaded_miles || 0;
  const invoiceMiles = invoice.actual_miles || quoteMiles;
  if (Math.abs(invoiceMiles - quoteMiles) > 10) {
    categories.push('MILEAGE_DIFFERENCE');
  }
  
  // Fuel surcharge change
  const quoteFSC = quote.itemized_charges_json?.subtotals?.fuel_surcharge_cents || 0;
  const invoiceFSC = invoice.itemized_charges_json?.subtotals?.fuel_surcharge_cents || 0;
  if (Math.abs(invoiceFSC - quoteFSC) > 1000) {
    categories.push('FUEL_CHANGE');
  }
  
  return categories[0] || 'OTHER';
}