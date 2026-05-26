/**
 * Invoice Calculations (AR)
 */

import * as Money from './money';

export interface InvoiceLineItem {
  amount: Money.Cents;
  description: string;
  quantity?: number;
  unit_price?: Money.Cents;
}

export interface InvoiceCalc {
  lineItems: InvoiceLineItem[];
  subtotal: Money.Cents;
  adjustments?: Money.Cents[];
  payments?: Money.Cents[];
  invoiceTotal: Money.Cents;
  balanceDue: Money.Cents;
}

/**
 * Calculate invoice total from line items
 */
export function calcInvoiceTotal(lineItems: InvoiceLineItem[]): Money.Cents {
  return Money.sum(lineItems.map(item => item.amount));
}

/**
 * Calculate balance due
 */
export function calcBalanceDue(
  invoiceTotal: Money.Cents,
  paymentsApplied: Money.Cents[]
): Money.Cents {
  const totalPayments = Money.sum(paymentsApplied);
  return Money.subtract(invoiceTotal, totalPayments);
}

/**
 * Calculate credit memo amount
 */
export function calcCreditMemo(
  originalInvoiceTotal: Money.Cents,
  creditLineItems: InvoiceLineItem[]
): Money.Cents {
  // Credit memos are negative
  return -Math.abs(calcInvoiceTotal(creditLineItems));
}

/**
 * Apply adjustments to invoice
 */
export function applyAdjustments(
  subtotal: Money.Cents,
  adjustments: Array<{ amount: Money.Cents; type: 'credit' | 'debit' }>
): Money.Cents {
  let total = subtotal;
  
  adjustments.forEach(adj => {
    if (adj.type === 'credit') {
      total = Money.subtract(total, Math.abs(adj.amount));
    } else {
      total = Money.add(total, Math.abs(adj.amount));
    }
  });
  
  return total;
}

/**
 * Calculate disputed balance
 */
export function calcDisputeBalance(
  balanceDue: Money.Cents,
  disputedAmount: Money.Cents
): Money.Cents {
  return Money.subtract(balanceDue, disputedAmount);
}

/**
 * Calculate due date from invoice date and terms
 * @param invoiceDate - Invoice date
 * @param terms - Net terms (e.g., 30 for Net 30)
 */
export function calcDueDate(invoiceDate: Date, terms: number): Date {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + terms);
  return dueDate;
}

/**
 * Calculate aging bucket
 * @returns Bucket name (current, 1-30, 31-60, 61-90, 90+)
 */
export function calcAgingBucket(invoiceDate: Date, asOfDate: Date = new Date()): string {
  const daysPastDue = Math.floor((asOfDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysPastDue <= 0) return 'current';
  if (daysPastDue <= 30) return '1-30';
  if (daysPastDue <= 60) return '31-60';
  if (daysPastDue <= 90) return '61-90';
  return '90+';
}

/**
 * Detect duplicate invoice
 */
export function detectDuplicateInvoice(
  existingInvoices: Array<{ load_id: string; invoice_number?: string }>,
  newInvoice: { load_id: string; invoice_number?: string }
): boolean {
  return existingInvoices.some(inv => {
    // Match by load_id
    if (inv.load_id === newInvoice.load_id) return true;
    
    // Match by invoice_number if present
    if (inv.invoice_number && newInvoice.invoice_number && 
        inv.invoice_number === newInvoice.invoice_number) {
      return true;
    }
    
    return false;
  });
}