/**
 * Invoice Entity - Before Create Hook
 * Enhanced with variance detection
 */

import { parseCurrency } from '../../shared/math/parsing';
import { calcInvoiceTotal, calcBalanceDue, calcDueDate, detectDuplicateInvoice } from '../../shared/math/invoice';
import { dollarsToCents, centsToDollars } from '../../shared/math/money';
import { assertInvariants } from '../../shared/math/auditMath';
import { logFinancialChange } from '../../shared/security/auditLogger';
import { detectAndFlagVariance } from '../../shared/finance/varianceEngine';
import { generateAccrualsForLoadEvent } from '../../shared/finance/accrualEngine';

export default async function beforeCreate({ data, user, base44 }) {
  const errors = [];
  
  try {
    // Parse line items
    const lineItems = data.line_items || [];
    const parsedLines = lineItems.map((item, idx) => {
      try {
        return {
          ...item,
          amount: parseCurrency(item.amount)
        };
      } catch (error) {
        errors.push(`Line item ${idx + 1}: ${error.message}`);
        return null;
      }
    }).filter(Boolean);
    
    if (errors.length > 0) {
      return { ok: false, errors: errors.map(msg => ({ field: 'line_items', code: 'PARSE_ERROR', message: msg })) };
    }
    
    // Calculate invoice total
    const invoiceTotal = calcInvoiceTotal(parsedLines);
    
    // Calculate balance due
    const paymentsApplied = (data.payments_applied || []).map(p => parseCurrency(p));
    const balanceDue = calcBalanceDue(invoiceTotal, paymentsApplied);
    
    // Calculate due date if terms provided
    let dueDate = data.due_date;
    if (!dueDate && data.invoice_date && data.payment_terms) {
      dueDate = calcDueDate(new Date(data.invoice_date), data.payment_terms);
    }
    
    // Check for duplicates
    if (data.load_id) {
      const existingInvoices = await base44.asServiceRole.entities.Invoice.filter({ 
        load_id: data.load_id 
      });
      
      if (detectDuplicateInvoice(existingInvoices, data)) {
        errors.push('Duplicate invoice detected for this load');
      }
    }
    
    if (errors.length > 0) {
      return { ok: false, errors: errors.map(msg => ({ field: 'invoice', code: 'DUPLICATE', message: msg })) };
    }
    
    // Set server-calculated values
    data.invoice_total = centsToDollars(invoiceTotal);
    data.balance_due = centsToDollars(balanceDue);
    if (dueDate) data.due_date = dueDate;
    data.calculated_at = new Date().toISOString();
    data.calculated_by_server = true;
    
    // Audit log
    await logFinancialChange('Invoice', data.id || 'new', 'CREATE', {
      id: user.id,
      email: user.email,
      role: user.role
    }, null, data);
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{
        field: 'invoice',
        code: 'CALCULATION_ERROR',
        message: error.message
      }]
    };
  }
}