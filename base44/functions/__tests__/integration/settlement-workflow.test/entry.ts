/**
 * Settlement Workflow Integration Tests
 */

import beforeCreate from '../../entities/settlement/beforeCreate';
import afterRead from '../../entities/settlement/afterRead';

describe('Settlement Workflow', () => {
  
  const mockBase44 = {
    asServiceRole: {
      entities: {
        Settlement: { filter: async () => [] }
      }
    }
  };
  
  test('creates settlement with net calculation', async () => {
    const result = await beforeCreate({
      data: {
        driver_id: 'driver_1',
        load_pays: [500, 600, 700],
        advances: [200],
        deductions: [{ type: 'insurance', amount: 50 }],
        period_start: '2025-01-01',
        period_end: '2025-01-15'
      },
      user: { role: 'broker', id: 'user_1', email: 'broker@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.gross_pay).toBe(1800);
    expect(result.data.total_deductions).toBe(250);
    expect(result.data.net_pay).toBe(1550);
  });
  
  test('flags negative net for review', async () => {
    const result = await beforeCreate({
      data: {
        driver_id: 'driver_1',
        load_pays: [500],
        advances: [700],
        period_start: '2025-01-01',
        period_end: '2025-01-15'
      },
      user: { role: 'broker', id: 'user_1', email: 'test@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.net_pay).toBe(-200);
    expect(result.data.requires_review).toBe(true);
  });
  
  test('carrier can read own settlement', async () => {
    const settlement = {
      id: 'set_1',
      carrier_id: 'carrier_1',
      gross_pay: 1800,
      net_pay: 1550,
      internal_notes: 'Confidential'
    };
    
    const result = await afterRead({
      data: settlement,
      user: { role: 'carrier', id: 'carrier_1', email: 'carrier@test.com' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.net_pay).toBe(1550);
    expect(result.data.internal_notes).toBeUndefined();
  });
});