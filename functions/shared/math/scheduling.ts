/**
 * Scheduling & Transit Math
 */

/**
 * Calculate estimated transit hours
 */
export function calcTransitHours(miles: number, avgSpeedMph: number = 50): number {
  if (avgSpeedMph <= 0) throw new Error('Speed must be positive');
  return miles / avgSpeedMph;
}

/**
 * Check if delivery is late
 */
export function isLate(
  actualDelivery: Date,
  scheduledDelivery: Date,
  gracePeriodMinutes: number = 30
): boolean {
  const diffMinutes = (actualDelivery.getTime() - scheduledDelivery.getTime()) / (1000 * 60);
  return diffMinutes > gracePeriodMinutes;
}

/**
 * Calculate on-time classification
 */
export function calcOnTimeClassification(
  actualDelivery: Date | null,
  scheduledDelivery: Date,
  gracePeriodMinutes: number = 30
): 'on_time' | 'late' | 'early' | 'pending' {
  if (!actualDelivery) return 'pending';
  
  const diffMinutes = (actualDelivery.getTime() - scheduledDelivery.getTime()) / (1000 * 60);
  
  if (diffMinutes > gracePeriodMinutes) return 'late';
  if (diffMinutes < -60) return 'early'; // More than 1 hour early
  
  return 'on_time';
}

/**
 * Calculate HOS feasibility (basic)
 */
export function calcHOSFeasibility(
  requiredDrivingHours: number,
  driverHOSRemaining: number,
  resetAvailable: boolean = false
): { feasible: boolean; hosShortfall: number } {
  if (driverHOSRemaining >= requiredDrivingHours) {
    return { feasible: true, hosShortfall: 0 };
  }
  
  if (resetAvailable) {
    // After reset, driver gets 11 hours back
    const afterReset = driverHOSRemaining + 11;
    if (afterReset >= requiredDrivingHours) {
      return { feasible: true, hosShortfall: 0 };
    }
  }
  
  return {
    feasible: false,
    hosShortfall: requiredDrivingHours - driverHOSRemaining
  };
}