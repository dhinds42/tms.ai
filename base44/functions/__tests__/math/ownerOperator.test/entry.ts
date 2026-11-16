/**
 * Owner-Operator Settlement Tests
 */

import { 
  calcAdvanceRemaining,
  calcEscrowContribution,
  calcOwnerOpLease,
  calcOwnerOpMaintenance,
  calcOwnerOpNet
} from '../../../shared/math/ownerOperator';
import { dollarsToCents } from '../../../shared/math/money';

describe('Owner-Operator Calculations', () => {
  
  test('calculates advance balance', () => {
    const remaining = calcAdvanceRemaining(dollarsToCents(500), dollarsToCents(200));
    expect(remaining).toBe(30000); // $300 remaining
  });
  
  test('calculates escrow contribution', () => {
    const escrow = calcEscrowContribution(dollarsToCents(1000), 10); // 10%
    expect(escrow).toBe(10000); // $100
  });
  
  test('validates escrow percent bounds', () => {
    expect(() => calcEscrowContribution(dollarsToCents(1000), 60)).toThrow();
  });
  
  test('calculates lease payment', () => {
    const lease = calcOwnerOpLease(dollarsToCents(2000), 25); // 25% lease
    expect(lease).toBe(50000); // $500
  });
  
  test('calculates maintenance reserve', () => {
    const maint = calcOwnerOpMaintenance(dollarsToCents(1000), { type: 'percent', value: 5 });
    expect(maint).toBe(5000); // $50
  });
  
  test('calculates owner-op net pay', () => {
    const result = calcOwnerOpNet({
      grossPay: dollarsToCents(2000),
      leasePayment: dollarsToCents(500),
      maintenanceReserve: dollarsToCents(100),
      escrow: dollarsToCents(50),
      advances: dollarsToCents(200)
    });
    
    expect(result.netPay).toBe(115000); // $1150
    expect(result.totalDeductions).toBe(85000); // $850
  });
});