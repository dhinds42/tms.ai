/**
 * Accounts Receivable Tests
 */

import { calcAgingBucketsSummary, calcEarlyPaymentDiscount } from '../../shared/math/ar';
import { dollarsToCents } from '../../shared/math/money';

describe('AR Calculations', () => {
  
  test('calculates aging buckets summary', () => {
    const invoices = [
      { invoiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), balanceDue: dollarsToCents(100) },
      { invoiceDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), balanceDue: dollarsToCents(200) },
      { invoiceDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000), balanceDue: dollarsToCents(300) },
      { invoiceDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), balanceDue: dollarsToCents(400) }
    ];
    
    const buckets = calcAgingBucketsSummary(invoices);
    
    expect(buckets.days_1_30).toBe(10000); // $100
    expect(buckets.days_31_60).toBe(20000); // $200
    expect(buckets.days_61_90).toBe(30000); // $300
    expect(buckets.days_90_plus).toBe(40000); // $400
    expect(buckets.total).toBe(100000); // $1000
  });
  
  test('calculates early payment discount', () => {
    const discount = calcEarlyPaymentDiscount(
      dollarsToCents(1000),
      2, // 2% discount
      10, // Paid in 10 days
      15  // Discount period: 15 days
    );
    
    expect(discount).toBe(2000); // $20 discount
  });
  
  test('no discount after period expires', () => {
    const discount = calcEarlyPaymentDiscount(
      dollarsToCents(1000),
      2,
      20, // Paid after discount period
      15
    );
    
    expect(discount).toBe(0);
  });
});