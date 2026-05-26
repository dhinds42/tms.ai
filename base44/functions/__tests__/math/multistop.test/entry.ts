/**
 * Multi-Stop Allocation Tests
 */

import { 
  allocateRevenueAcrossStops,
  calcProfitByStop,
  calcLaneProfitability
} from '../../shared/math/multistop';
import { dollarsToCents, sum } from '../../shared/math/money';

describe('Multi-Stop Allocation', () => {
  
  test('allocates revenue by miles', () => {
    const stops = [
      { stopNumber: 1, miles: 100 },
      { stopNumber: 2, miles: 200 },
      { stopNumber: 3, miles: 100 }
    ];
    
    const allocated = allocateRevenueAcrossStops(
      dollarsToCents(1000),
      stops,
      'miles'
    );
    
    expect(sum(allocated)).toBe(100000); // Penny-perfect
    expect(allocated[1]).toBeGreaterThan(allocated[0]); // Stop 2 gets more (200 miles)
  });
  
  test('allocates equally when method is equal', () => {
    const stops = [
      { stopNumber: 1, miles: 50 },
      { stopNumber: 2, miles: 200 }
    ];
    
    const allocated = allocateRevenueAcrossStops(
      dollarsToCents(1000),
      stops,
      'equal'
    );
    
    expect(allocated[0]).toBe(50000); // $500 each
    expect(allocated[1]).toBe(50000);
  });
  
  test('calculates profit by stop', () => {
    const revenue = [dollarsToCents(500), dollarsToCents(600)];
    const costs = [dollarsToCents(300), dollarsToCents(400)];
    
    const profit = calcProfitByStop(revenue, costs);
    
    expect(profit[0]).toBe(20000); // $200
    expect(profit[1]).toBe(20000); // $200
  });
  
  test('calculates lane profitability', () => {
    const loads = [
      { lane: 'CHI-NYC', revenue: dollarsToCents(1000), cost: dollarsToCents(800) },
      { lane: 'CHI-NYC', revenue: dollarsToCents(1100), cost: dollarsToCents(850) },
      { lane: 'LA-SF', revenue: dollarsToCents(500), cost: dollarsToCents(400) }
    ];
    
    const lanes = calcLaneProfitability(loads);
    
    const chiNyc = lanes.get('CHI-NYC');
    expect(chiNyc?.count).toBe(2);
    expect(chiNyc?.profit).toBe(45000); // $450 total profit
  });
});