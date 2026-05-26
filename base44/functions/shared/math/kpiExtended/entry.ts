/**
 * Extended KPI Functions
 * Additional metrics for analytics
 */

import * as Money from './money';
import { roundPercentage } from './rounding';

/**
 * Calculate tender acceptance rate
 */
export function calcTenderAcceptanceRate(tenders: Array<{
  status: 'accepted' | 'rejected' | 'pending';
}>): number {
  if (tenders.length === 0) return 0;
  
  const accepted = tenders.filter(t => t.status === 'accepted').length;
  return roundPercentage((accepted / tenders.length) * 100);
}

/**
 * Calculate empty miles percentage (deadhead)
 */
export function calcEmptyMilesPercent(
  totalMiles: number,
  loadedMiles: number
): number {
  if (totalMiles === 0) return 0;
  
  const emptyMiles = totalMiles - loadedMiles;
  return roundPercentage((emptyMiles / totalMiles) * 100);
}

/**
 * Calculate fleet utilization
 */
export function calcFleetUtilization(
  activeTrucks: number,
  totalTrucks: number
): number {
  if (totalTrucks === 0) return 0;
  
  return roundPercentage((activeTrucks / totalTrucks) * 100);
}

/**
 * Calculate revenue per truck
 */
export function calcRevenuePerTruck(
  totalRevenue: Money.Cents,
  truckCount: number,
  periodDays: number = 30
): Money.Cents {
  if (truckCount === 0) return 0;
  
  return Money.divide(totalRevenue, truckCount);
}

/**
 * Calculate profit by customer
 */
export function calcProfitByCustomer(loads: Array<{
  customerId: string;
  margin: Money.Cents;
}>): Map<string, Money.Cents> {
  const profitMap = new Map<string, Money.Cents>();
  
  loads.forEach(load => {
    const current = profitMap.get(load.customerId) || 0;
    profitMap.set(load.customerId, Money.add(current, load.margin));
  });
  
  return profitMap;
}

/**
 * Calculate average revenue per load by lane
 */
export function calcAvgRevenueByLane(loads: Array<{
  lane: string;
  revenue: Money.Cents;
}>): Map<string, Money.Cents> {
  const laneStats = new Map<string, { sum: Money.Cents; count: number }>();
  
  loads.forEach(load => {
    const current = laneStats.get(load.lane) || { sum: 0, count: 0 };
    laneStats.set(load.lane, {
      sum: Money.add(current.sum, load.revenue),
      count: current.count + 1
    });
  });
  
  const avgMap = new Map<string, Money.Cents>();
  laneStats.forEach((stats, lane) => {
    avgMap.set(lane, Money.divide(stats.sum, stats.count));
  });
  
  return avgMap;
}