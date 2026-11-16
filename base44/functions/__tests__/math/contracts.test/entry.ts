/**
 * Contract Pricing Tests
 */

import { 
  getEffectiveRate, 
  applyMinCharge, 
  applyRateCap,
  applyEscalators
} from '../../../shared/math/contracts';
import { dollarsToCents } from '../../../shared/math/money';

describe('Contract Pricing', () => {
  
  test('gets effective rate for date', () => {
    const rates = [
      { 
        effectiveDate: new Date('2025-01-01'), 
        baseRate: dollarsToCents(1000) 
      },
      { 
        effectiveDate: new Date('2025-02-01'), 
        baseRate: dollarsToCents(1100) 
      }
    ];
    
    const rate = getEffectiveRate(new Date('2025-01-15'), rates);
    expect(rate?.baseRate).toBe(100000); // $1000
  });
  
  test('applies minimum charge', () => {
    const rate = applyMinCharge(dollarsToCents(80), dollarsToCents(100));
    expect(rate).toBe(10000); // Bumped to $100 minimum
  });
  
  test('applies rate cap', () => {
    const rate = applyRateCap(dollarsToCents(1500), dollarsToCents(1200));
    expect(rate).toBe(120000); // Capped at $1200
  });
  
  test('applies annual escalators', () => {
    const escalated = applyEscalators(dollarsToCents(1000), 2, 3); // 3% annual for 2 years
    // $1000 * 1.03^2 = $1060.90
    expect(escalated).toBe(106090);
  });
});