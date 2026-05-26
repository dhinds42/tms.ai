/**
 * Multi-Stop Allocation Calculations
 */

import * as Money from './money';

export interface Stop {
  stopNumber: number;
  miles: number;
  weight?: number;
  timeMinutes?: number;
}

/**
 * Allocate revenue across stops proportionally by miles
 */
export function allocateRevenueAcrossStops(
  totalRevenue: Money.Cents,
  stops: Stop[],
  method: 'miles' | 'weight' | 'equal' = 'miles'
): Money.Cents[] {
  if (stops.length === 0) return [];
  
  let weights: number[];
  
  switch (method) {
    case 'miles':
      weights = stops.map(s => s.miles);
      break;
    case 'weight':
      weights = stops.map(s => s.weight || 1);
      break;
    case 'equal':
      weights = stops.map(() => 1);
      break;
  }
  
  return Money.allocate(totalRevenue, weights);
}

/**
 * Allocate costs across stops
 */
export function allocateCostAcrossStops(
  totalCost: Money.Cents,
  stops: Stop[],
  method: 'miles' | 'time' | 'equal' = 'miles'
): Money.Cents[] {
  if (stops.length === 0) return [];
  
  let weights: number[];
  
  switch (method) {
    case 'miles':
      weights = stops.map(s => s.miles);
      break;
    case 'time':
      weights = stops.map(s => s.timeMinutes || 1);
      break;
    case 'equal':
      weights = stops.map(() => 1);
      break;
  }
  
  return Money.allocate(totalCost, weights);
}

/**
 * Calculate cost per stop
 */
export function calcStopCost(
  baseCost: Money.Cents,
  stopNumber: number,
  totalStops: number,
  stopOffRate: Money.Cents
): Money.Cents {
  // Base cost allocation
  const allocatedBase = Money.divide(baseCost, totalStops);
  
  // Additional stop-off charges (first stop free, additional stops charged)
  const additionalStopCharge = stopNumber > 1 ? stopOffRate : 0;
  
  return Money.add(allocatedBase, additionalStopCharge);
}

/**
 * Calculate profit by stop
 */
export function calcProfitByStop(
  revenueAllocations: Money.Cents[],
  costAllocations: Money.Cents[]
): Money.Cents[] {
  if (revenueAllocations.length !== costAllocations.length) {
    throw new Error('Revenue and cost arrays must have same length');
  }
  
  return revenueAllocations.map((rev, idx) => 
    Money.subtract(rev, costAllocations[idx])
  );
}

/**
 * Calculate lane profitability (origin-destination pair)
 */
export function calcLaneProfitability(loads: Array<{
  lane: string;
  revenue: Money.Cents;
  cost: Money.Cents;
}>): Map<string, { revenue: Money.Cents; cost: Money.Cents; profit: Money.Cents; count: number }> {
  const laneMap = new Map();
  
  loads.forEach(load => {
    const current = laneMap.get(load.lane) || { revenue: 0, cost: 0, profit: 0, count: 0 };
    
    laneMap.set(load.lane, {
      revenue: Money.add(current.revenue, load.revenue),
      cost: Money.add(current.cost, load.cost),
      profit: Money.add(current.profit, Money.subtract(load.revenue, load.cost)),
      count: current.count + 1
    });
  });
  
  return laneMap;
}