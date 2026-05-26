/**
 * Financial Lock Tests
 */

import { isFinanciallyLocked, enforceLock } from '../../shared/security/financialLocks';

describe('Financial Locks', () => {
  
  test('detects invoiced load is locked', () => {
    const load = {
      invoice_status: 'sent',
      invoice_sent_at: '2025-01-01'
    };
    
    const lock = isFinanciallyLocked(load);
    expect(lock.locked).toBe(true);
    expect(lock.reason).toContain('invoiced');
  });
  
  test('detects paid settlement is locked', () => {
    const settlement = {
      settlement_status: 'paid',
      paid_at: '2025-01-01'
    };
    
    const lock = isFinanciallyLocked(settlement);
    expect(lock.locked).toBe(true);
    expect(lock.reason).toContain('paid');
  });
  
  test('allows editing unlocked entity', () => {
    const load = {
      status: 'available'
    };
    
    const lock = isFinanciallyLocked(load);
    expect(lock.locked).toBe(false);
  });
  
  test('enforce lock throws for non-admin', () => {
    const lockedLoad = {
      invoice_status: 'paid'
    };
    
    expect(() => {
      enforceLock(lockedLoad, 'broker', 'update');
    }).toThrow('Cannot update');
  });
  
  test('enforce lock allows admin override', () => {
    const lockedLoad = {
      invoice_status: 'paid'
    };
    
    expect(() => {
      enforceLock(lockedLoad, 'admin', 'update');
    }).not.toThrow();
  });
});