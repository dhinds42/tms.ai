/**
 * Accrual Engine Tests
 */

import { generateAccrualsForLoadEvent, reverseAccruals } from '../../../shared/finance/accrualEngine';

describe('Accrual Engine', () => {
  
  test('Generates AR and AP accruals on DELIVERED event', async () => {
    const mockBase44 = {
      asServiceRole: {
        entities: {
          Load: {
            filter: jest.fn().mockResolvedValue([{
              id: 'load-1',
              customer_rate: 2000,
              carrier_pay: 1700,
              tenant_id: 'org-1'
            }])
          },
          AccrualEntry: {
            create: jest.fn().mockResolvedValue({ id: 'accrual-1' })
          },
          AuditLog: {
            create: jest.fn().mockResolvedValue({ id: 'audit-1' })
          }
        }
      }
    };
    
    const result = await generateAccrualsForLoadEvent('load-1', 'DELIVERED', mockBase44);
    
    expect(result.ok).toBe(true);
    expect(mockBase44.asServiceRole.entities.AccrualEntry.create).toHaveBeenCalledTimes(2);
    
    const calls = mockBase44.asServiceRole.entities.AccrualEntry.create.mock.calls;
    expect(calls[0][0].accrual_type).toBe('AR_REVENUE');
    expect(calls[0][0].amount_cents).toBe(200000); // $2000 in cents
    expect(calls[1][0].accrual_type).toBe('AP_CARRIER_COST');
    expect(calls[1][0].amount_cents).toBe(170000); // $1700 in cents
  });
  
  test('Reverses accruals correctly', async () => {
    const mockBase44 = {
      asServiceRole: {
        entities: {
          AccrualEntry: {
            filter: jest.fn().mockResolvedValue([
              { id: 'accrual-1', accrual_status: 'OPEN' },
              { id: 'accrual-2', accrual_status: 'OPEN' }
            ]),
            update: jest.fn().mockResolvedValue({ id: 'accrual-1', accrual_status: 'REVERSED' })
          }
        }
      }
    };
    
    const result = await reverseAccruals('load-1', 'Load cancelled', mockBase44);
    
    expect(result.ok).toBe(true);
    expect(result.reversed_count).toBe(2);
  });
  
});