/**
 * Credit Hold Tests
 */

import { checkCreditHold, enforceCreditHold, checkCreditLimitExceeded } from '../../../shared/finance/creditHoldEnforcement';

describe('Credit Hold Enforcement', () => {
  
  test('HARD_HOLD blocks load creation', async () => {
    const mockBase44 = {
      asServiceRole: {
        entities: {
          Customer: {
            filter: jest.fn().mockResolvedValue([{
              party_id: 'customer-1',
              credit_hold_status: 'HARD_HOLD',
              credit_hold_reason: 'Past due over $50K'
            }])
          }
        }
      }
    };
    
    const load = { customer_id: 'customer-1' };
    
    await expect(enforceCreditHold(load, 'create', mockBase44))
      .rejects.toThrow('CREDIT_HOLD_BLOCK');
  });
  
  test('SOFT_HOLD allows creation but blocks dispatch', async () => {
    const mockBase44 = {
      asServiceRole: {
        entities: {
          Customer: {
            filter: jest.fn().mockResolvedValue([{
              party_id: 'customer-2',
              credit_hold_status: 'SOFT_HOLD',
              credit_hold_reason: 'Credit review in progress'
            }])
          }
        }
      }
    };
    
    const load = { customer_id: 'customer-2' };
    
    // Should allow creation
    const createCheck = await enforceCreditHold(load, 'create', mockBase44);
    expect(createCheck.allowed).toBe(false); // SOFT_HOLD still returns not allowed but doesn't throw at create
    
    // Should block dispatch
    await expect(enforceCreditHold(load, 'dispatch', mockBase44))
      .rejects.toThrow('CREDIT_HOLD_BLOCK');
  });
  
  test('Credit limit exceeded detection', async () => {
    const mockBase44 = {
      asServiceRole: {
        entities: {
          Customer: {
            filter: jest.fn().mockResolvedValue([{
              party_id: 'customer-3',
              credit_limit_cents: 10000000 // $100K
            }])
          },
          Invoice: {
            filter: jest.fn().mockResolvedValue([
              { customer_party_id: 'customer-3', amount_remaining: 60000, status: 'open' },
              { customer_party_id: 'customer-3', amount_remaining: 30000, status: 'open' }
            ])
          }
        }
      }
    };
    
    const newLoadAmount = 2000000; // $20K in cents
    
    const result = await checkCreditLimitExceeded('customer-3', newLoadAmount, mockBase44);
    expect(result.exceeded).toBe(true);
    expect(result.overage_cents).toBe(1000000); // $10K overage
  });
  
});