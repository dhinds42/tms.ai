/**
 * Extended KPI Tests
 */

import { 
  calcTenderAcceptanceRate,
  calcEmptyMilesPercent,
  calcFleetUtilization,
  calcProfitByCustomer
} from '../../../shared/math/kpiExtended';
import { dollarsToCents } from '../../../shared/math/money';

describe('Extended KPI Calculations', () => {
  
  test('calculates tender acceptance rate', () => {
    const tenders = [
      { status: 'accepted' },
      { status: 'accepted' },
      { status: 'rejected' },
      { status: 'accepted' }
    ];
    
    const rate = calcTenderAcceptanceRate(tenders);
    expect(rate).toBe(75); // 3/4 = 75%
  });
  
  test('calculates empty miles percentage', () => {
    const emptyPct = calcEmptyMilesPercent(1000, 700); // 1000 total, 700 loaded
    expect(emptyPct).toBe(30); // 30% empty
  });
  
  test('calculates fleet utilization', () => {
    const utilization = calcFleetUtilization(45, 50); // 45 active out of 50 total
    expect(utilization).toBe(90); // 90%
  });
  
  test('calculates profit by customer', () => {
    const loads = [
      { customerId: 'cust_1', margin: dollarsToCents(200) },
      { customerId: 'cust_1', margin: dollarsToCents(150) },
      { customerId: 'cust_2', margin: dollarsToCents(300) }
    ];
    
    const profit = calcProfitByCustomer(loads);
    
    expect(profit.get('cust_1')).toBe(35000); // $350
    expect(profit.get('cust_2')).toBe(30000); // $300
  });
});