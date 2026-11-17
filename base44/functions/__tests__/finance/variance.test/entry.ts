/**
 * Variance Engine Tests
 */

import { detectAndFlagVariance, categorizeVariance } from '../../../shared/finance/varianceEngine';

describe('Variance Detection Engine', () => {
  
  test('Creates variance case when tolerance exceeded', async () => {
    const mockBase44 = {
      asServiceRole: {
        entities: {
          Quote: {
            filter: jest.fn().mockResolvedValue([{
              id: 'quote-1',
              computed_total_cents: 200000 // $2000
            }])
          },
          Customer: {
            filter: jest.fn().mockResolvedValue([{
              party_id: 'customer-1',
              variance_tolerance_percent_bps: 500, // 5%
              variance_tolerance_cents: 10000 // $100
            }])
          },
          VarianceCase: {
            create: jest.fn().mockResolvedValue({ id: 'variance-1' })
          },
          Invoice: {
            update: jest.fn().mockResolvedValue({ id: 'invoice-1' })
          },
          AuditLog: {
            create: jest.fn().mockResolvedValue({ id: 'audit-1' })
          }
        }
      }
    };
    
    const invoice = {
      id: 'invoice-1',
      quote_id: 'quote-1',
      customer_party_id: 'customer-1',
      computed_total_cents: 225000 // $2250, +12.5% variance
    };
    
    const result = await detectAndFlagVariance(invoice, mockBase44);
    
    expect(result.variance_detected).toBe(true);
    expect(result.variance_cents).toBe(25000);
    expect(mockBase44.asServiceRole.entities.VarianceCase.create).toHaveBeenCalled();
  });
  
  test('No variance case when within tolerance', async () => {
    const mockBase44 = {
      asServiceRole: {
        entities: {
          Quote: {
            filter: jest.fn().mockResolvedValue([{
              id: 'quote-2',
              computed_total_cents: 200000 // $2000
            }])
          },
          Customer: {
            filter: jest.fn().mockResolvedValue([{
              party_id: 'customer-2',
              variance_tolerance_percent_bps: 500, // 5%
              variance_tolerance_cents: 10000 // $100
            }])
          }
        }
      }
    };
    
    const invoice = {
      id: 'invoice-2',
      quote_id: 'quote-2',
      customer_party_id: 'customer-2',
      computed_total_cents: 205000 // $2050, +2.5% variance (within 5% tolerance)
    };
    
    const result = await detectAndFlagVariance(invoice, mockBase44);
    
    expect(result.variance_detected).toBe(false);
    expect(result.within_tolerance).toBe(true);
  });
  
});