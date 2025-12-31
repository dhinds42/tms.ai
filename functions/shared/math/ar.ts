/**
 * Accounts Receivable (AR) Extended Functions
 */

import * as Money from './money';

/**
 * Calculate aging buckets summary
 */
export function calcAgingBucketsSummary(invoices: Array<{
  invoiceDate: Date;
  balanceDue: Money.Cents;
}>): {
  current: Money.Cents;
  days_1_30: Money.Cents;
  days_31_60: Money.Cents;
  days_61_90: Money.Cents;
  days_90_plus: Money.Cents;
  total: Money.Cents;
} {
  const now = new Date();
  const buckets = {
    current: 0,
    days_1_30: 0,
    days_31_60: 0,
    days_61_90: 0,
    days_90_plus: 0,
    total: 0
  };
  
  invoices.forEach(inv => {
    const daysPast = Math.floor((now.getTime() - inv.invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysPast <= 0) {
      buckets.current = Money.add(buckets.current, inv.balanceDue);
    } else if (daysPast <= 30) {
      buckets.days_1_30 = Money.add(buckets.days_1_30, inv.balanceDue);
    } else if (daysPast <= 60) {
      buckets.days_31_60 = Money.add(buckets.days_31_60, inv.balanceDue);
    } else if (daysPast <= 90) {
      buckets.days_61_90 = Money.add(buckets.days_61_90, inv.balanceDue);
    } else {
      buckets.days_90_plus = Money.add(buckets.days_90_plus, inv.balanceDue);
    }
    
    buckets.total = Money.add(buckets.total, inv.balanceDue);
  });
  
  return buckets;
}

/**
 * Calculate payment terms discount
 */
export function calcEarlyPaymentDiscount(
  invoiceAmount: Money.Cents,
  discountPercent: number,
  daysPaid: number,
  discountPeriodDays: number
): Money.Cents {
  if (daysPaid > discountPeriodDays) return 0;
  
  return Money.percentage(invoiceAmount, discountPercent);
}