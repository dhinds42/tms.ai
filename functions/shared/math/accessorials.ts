/**
 * Accessorial Charge Calculations
 * Detention, layover, TONU, lumper, stop-off, etc.
 */

import * as Money from './money';

export interface DetentionCalcInput {
  arrivalTime: Date;
  departureTime: Date;
  freeTimeMinutes: number;    // Usually 120 minutes (2 hours)
  ratePerHour: Money.Cents;   // Hourly detention rate
  incrementMinutes: number;   // Usually 15 minutes
}

/**
 * Calculate detention charges
 * Free time → then charge per increment
 */
export function calcDetention(input: DetentionCalcInput): Money.Cents {
  const totalMinutes = (input.departureTime.getTime() - input.arrivalTime.getTime()) / (1000 * 60);
  
  if (totalMinutes <= input.freeTimeMinutes) {
    return 0; // Within free time
  }
  
  const chargeableMinutes = totalMinutes - input.freeTimeMinutes;
  const increments = Math.ceil(chargeableMinutes / input.incrementMinutes);
  
  // Rate per increment
  const ratePerIncrement = Money.divide(input.ratePerHour, 60 / input.incrementMinutes);
  
  return Money.multiply(ratePerIncrement, increments);
}

/**
 * Check if detention is eligible
 */
export function isDetentionEligible(load: any): boolean {
  // Detention eligible if:
  // 1. Has actual arrival/departure times
  // 2. Not already charged
  // 3. Load delivered (not cancelled)
  
  return !!(
    load.actual_pickup_datetime && 
    load.actual_delivery_datetime &&
    load.status === 'delivered' &&
    !load.detention_already_charged
  );
}

/**
 * Calculate layover charge
 */
export function calcLayover(
  overnightDays: number,
  ratePerDay: Money.Cents
): Money.Cents {
  if (overnightDays <= 0) return 0;
  return Money.multiply(ratePerDay, overnightDays);
}

/**
 * Check if layover is eligible
 */
export function isLayoverEligible(load: any): boolean {
  // Layover eligible if driver had to wait overnight
  return !!(
    load.layover_required === true &&
    load.status !== 'cancelled'
  );
}

/**
 * Calculate TONU (Truck Ordered Not Used) charge
 */
export function calcTONU(
  baseRate: Money.Cents,
  tonuPercent: number = 0.50  // Default 50% of load rate
): Money.Cents {
  return Money.percentage(baseRate, tonuPercent * 100);
}

/**
 * Check if TONU is eligible
 */
export function isToNuEligible(load: any): boolean {
  return !!(
    load.tonu === true &&
    load.status === 'cancelled' &&
    load.tonu_reason
  );
}

/**
 * Calculate lumper fee
 */
export function calcLumper(
  receiptAmount: Money.Cents,
  maxAllowed?: Money.Cents
): Money.Cents {
  if (maxAllowed && receiptAmount > maxAllowed) {
    return maxAllowed;
  }
  return receiptAmount;
}

/**
 * Validate lumper receipt
 */
export function validateLumper(
  receiptAmount: Money.Cents,
  receiptUrl: string | null
): { valid: boolean; error?: string } {
  if (!receiptUrl) {
    return { valid: false, error: 'Lumper receipt required' };
  }
  
  if (receiptAmount <= 0) {
    return { valid: false, error: 'Lumper amount must be positive' };
  }
  
  // Could add max limit validation
  if (receiptAmount > Money.dollarsToCents(500)) {
    return { valid: false, error: 'Lumper fee exceeds $500 limit' };
  }
  
  return { valid: true };
}

/**
 * Calculate stop-off charge
 */
export function calcStopOff(
  numberOfStops: number,
  ratePerStop: Money.Cents
): Money.Cents {
  if (numberOfStops <= 0) return 0;
  return Money.multiply(ratePerStop, numberOfStops);
}

/**
 * Sum all accessorial charges
 */
export function sumAccessorials(
  accessorials: Array<{ amount: Money.Cents }>
): Money.Cents {
  return Money.sum(accessorials.map(a => a.amount));
}

/**
 * Detect duplicate accessorial
 */
export function detectDuplicateAccessorial(
  existingAccessorials: Array<{ type: string; load_id: string }>,
  newAccessorial: { type: string; load_id: string }
): boolean {
  return existingAccessorials.some(a => 
    a.type === newAccessorial.type && 
    a.load_id === newAccessorial.load_id
  );
}