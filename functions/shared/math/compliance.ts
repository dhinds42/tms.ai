/**
 * Compliance Timing Math
 */

/**
 * Calculate days until a future date
 */
export function daysUntil(futureDate: Date, fromDate: Date = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = futureDate.getTime() - fromDate.getTime();
  return Math.ceil(diff / msPerDay);
}

/**
 * Check if document is expiring within window
 */
export function isExpiring(
  expirationDate: Date,
  warningDays: number = 30,
  fromDate: Date = new Date()
): boolean {
  const days = daysUntil(expirationDate, fromDate);
  return days > 0 && days <= warningDays;
}

/**
 * Check if document is expired
 */
export function isExpired(
  expirationDate: Date,
  asOfDate: Date = new Date()
): boolean {
  return expirationDate < asOfDate;
}

/**
 * Calculate next review date (e.g., annual compliance review)
 */
export function nextReviewDate(
  lastReviewDate: Date,
  intervalDays: number = 365
): Date {
  const next = new Date(lastReviewDate);
  next.setDate(next.getDate() + intervalDays);
  return next;
}

/**
 * Calculate compliance risk score based on expiration proximity
 * Returns 0-100 (0 = no risk, 100 = expired/critical)
 */
export function calcComplianceRiskScore(expirationDate: Date): number {
  const daysRemaining = daysUntil(expirationDate);
  
  if (daysRemaining < 0) return 100; // Expired
  if (daysRemaining === 0) return 100; // Expires today
  if (daysRemaining <= 7) return 90;
  if (daysRemaining <= 30) return 70;
  if (daysRemaining <= 60) return 40;
  if (daysRemaining <= 90) return 20;
  
  return 0; // More than 90 days out
}

/**
 * Get compliance action level
 */
export function getComplianceActionLevel(daysUntilExpiry: number): {
  level: 'ok' | 'alert' | 'escalate' | 'suspend' | 'block';
  action: string;
} {
  if (daysUntilExpiry < 0) {
    return { level: 'block', action: 'Block all assignments' };
  }
  if (daysUntilExpiry <= 30) {
    return { level: 'suspend', action: 'Suspend from new loads' };
  }
  if (daysUntilExpiry <= 60) {
    return { level: 'escalate', action: 'Escalate to manager' };
  }
  if (daysUntilExpiry <= 90) {
    return { level: 'alert', action: 'Send alert notification' };
  }
  
  return { level: 'ok', action: 'No action required' };
}