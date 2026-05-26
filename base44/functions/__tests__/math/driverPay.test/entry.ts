/**
 * Driver Pay Calculation Tests
 */

import { 
  calcDriverPayCPM, 
  calcDriverPayPercent, 
  calcDriverPayFlat,
  calcPerDiem,
  calcDriverDeductions
} from '../../shared/math/driverPay';
import { dollarsToCents } from '../../shared/math/money';

describe('Driver Pay Calculations', () => {
  
  test('calculates CPM pay', () => {
    const pay = calcDriverPayCPM(500, 45); // 500 miles @ $0.45/mile
    expect(pay).toBe(22500); // $225 in cents
  });
  
  test('calculates percentage pay', () => {
    const loadRevenue = dollarsToCents(1000);
    const pay = calcDriverPayPercent(loadRevenue, 75); // 75% of revenue
    expect(pay).toBe(75000); // $750
  });
  
  test('validates percentage bounds', () => {
    expect(() => calcDriverPayPercent(dollarsToCents(1000), 150)).toThrow();
    expect(() => calcDriverPayPercent(dollarsToCents(1000), -10)).toThrow();
  });
  
  test('calculates flat pay per load', () => {
    const pay = calcDriverPayFlat(dollarsToCents(500));
    expect(pay).toBe(50000); // $500
  });
  
  test('calculates per diem', () => {
    const perDiem = calcPerDiem(5, dollarsToCents(60)); // 5 days @ $60/day
    expect(perDiem).toBe(30000); // $300
  });
  
  test('calculates total deductions', () => {
    const result = calcDriverDeductions({
      advances: [dollarsToCents(100), dollarsToCents(50)],
      fuelCharges: [dollarsToCents(200)],
      insurance: dollarsToCents(75)
    });
    
    expect(result.total).toBe(42500); // $425
    expect(result.breakdown.advances).toBe(15000); // $150
    expect(result.breakdown.fuel).toBe(20000); // $200
    expect(result.breakdown.insurance).toBe(7500); // $75
  });
});