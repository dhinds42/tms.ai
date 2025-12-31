/**
 * Duplicate Detection Tests
 */

import { detectDuplicateSettlement, detectDuplicatePayment } from '../../shared/math/duplicates';

describe('Duplicate Detection', () => {
  
  test('detects duplicate settlement', () => {
    const existing = [
      { driver_id: 'driver_1', period_start: '2025-01-01', period_end: '2025-01-15' }
    ];
    
    const isDupe = detectDuplicateSettlement(existing, {
      driver_id: 'driver_1',
      period_start: '2025-01-01',
      period_end: '2025-01-15'
    });
    
    expect(isDupe).toBe(true);
  });
  
  test('allows different periods', () => {
    const existing = [
      { driver_id: 'driver_1', period_start: '2025-01-01', period_end: '2025-01-15' }
    ];
    
    const isDupe = detectDuplicateSettlement(existing, {
      driver_id: 'driver_1',
      period_start: '2025-01-16',
      period_end: '2025-01-31'
    });
    
    expect(isDupe).toBe(false);
  });
  
  test('detects duplicate payment by reference', () => {
    const existing = [
      { reference_number: 'CHK-001', amount: 1000, payment_date: '2025-01-01' }
    ];
    
    const isDupe = detectDuplicatePayment(existing, {
      reference_number: 'CHK-001',
      amount: 1000,
      payment_date: '2025-01-02'
    });
    
    expect(isDupe).toBe(true);
  });
  
  test('detects duplicate payment by amount and date', () => {
    const existing = [
      { amount: 1000, payment_date: '2025-01-01' }
    ];
    
    const isDupe = detectDuplicatePayment(existing, {
      amount: 1000,
      payment_date: '2025-01-01'
    });
    
    expect(isDupe).toBe(true);
  });
});