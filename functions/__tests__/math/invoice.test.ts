/**
 * Invoice Calculation Tests
 */

import { 
  calcInvoiceTotal, 
  calcBalanceDue, 
  calcCreditMemo,
  calcDueDate,
  calcAgingBucket,
  detectDuplicateInvoice
} from '../../shared/math/invoice';
import { dollarsToCents } from '../../shared/math/money';

describe('Invoice Calculations', () => {
  
  test('calculates invoice total from line items', () => {
    const lineItems = [
      { amount: dollarsToCents(100), description: 'Item 1' },
      { amount: dollarsToCents(200), description: 'Item 2' },
      { amount: dollarsToCents(50), description: 'Item 3' }
    ];
    
    const total = calcInvoiceTotal(lineItems);
    expect(total).toBe(35000); // $350 in cents
  });
  
  test('calculates balance due after payments', () => {
    const invoiceTotal = dollarsToCents(1000);
    const payments = [dollarsToCents(300), dollarsToCents(200)];
    
    const balance = calcBalanceDue(invoiceTotal, payments);
    expect(balance).toBe(50000); // $500 remaining
  });
  
  test('calculates credit memo as negative', () => {
    const creditLines = [
      { amount: dollarsToCents(100), description: 'Return' }
    ];
    
    const credit = calcCreditMemo(dollarsToCents(1000), creditLines);
    expect(credit).toBe(-10000); // -$100
  });
  
  test('calculates due date from terms', () => {
    const invoiceDate = new Date('2025-01-01');
    const dueDate = calcDueDate(invoiceDate, 30); // Net 30
    
    expect(dueDate.toISOString().split('T')[0]).toBe('2025-01-31');
  });
  
  test('calculates aging buckets', () => {
    const invoiceDate = new Date('2024-12-01');
    const asOf = new Date('2025-01-15');
    
    const bucket = calcAgingBucket(invoiceDate, asOf);
    expect(bucket).toBe('31-60'); // 45 days old
  });
  
  test('detects duplicate invoice by load_id', () => {
    const existing = [
      { load_id: 'load_1', invoice_number: 'INV-001' },
      { load_id: 'load_2', invoice_number: 'INV-002' }
    ];
    
    const isDupe = detectDuplicateInvoice(existing, {
      load_id: 'load_1',
      invoice_number: 'INV-003'
    });
    
    expect(isDupe).toBe(true);
  });
  
  test('detects duplicate invoice by invoice_number', () => {
    const existing = [
      { load_id: 'load_1', invoice_number: 'INV-001' }
    ];
    
    const isDupe = detectDuplicateInvoice(existing, {
      load_id: 'load_2',
      invoice_number: 'INV-001'
    });
    
    expect(isDupe).toBe(true);
  });
});