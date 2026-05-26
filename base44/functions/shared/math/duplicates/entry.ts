/**
 * Duplicate Detection Utilities
 */

/**
 * Detect duplicate settlement
 */
export function detectDuplicateSettlement(
  existingSettlements: Array<{
    driver_id?: string;
    carrier_id?: string;
    period_start: string;
    period_end: string;
  }>,
  newSettlement: {
    driver_id?: string;
    carrier_id?: string;
    period_start: string;
    period_end: string;
  }
): boolean {
  const entityId = newSettlement.driver_id || newSettlement.carrier_id;
  
  return existingSettlements.some(existing => {
    const existingEntityId = existing.driver_id || existing.carrier_id;
    
    return existingEntityId === entityId &&
           existing.period_start === newSettlement.period_start &&
           existing.period_end === newSettlement.period_end;
  });
}

/**
 * Detect duplicate payment
 */
export function detectDuplicatePayment(
  existingPayments: Array<{
    reference_number?: string;
    amount: number;
    payment_date: string;
  }>,
  newPayment: {
    reference_number?: string;
    amount: number;
    payment_date: string;
  }
): boolean {
  // Match by reference number if present
  if (newPayment.reference_number) {
    return existingPayments.some(p => 
      p.reference_number === newPayment.reference_number
    );
  }
  
  // Otherwise match by exact amount + date
  return existingPayments.some(p =>
    Math.abs(p.amount - newPayment.amount) < 0.01 &&
    p.payment_date === newPayment.payment_date
  );
}