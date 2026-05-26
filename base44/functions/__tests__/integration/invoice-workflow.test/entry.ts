/**
 * Invoice Workflow Integration Tests
 */

import beforeCreate from '../../entities/invoice/beforeCreate';
import afterRead from '../../entities/invoice/afterRead';

describe('Invoice Workflow', () => {
  
  const mockBase44 = {
    asServiceRole: {
      entities: {
        Invoice: { filter: async () => [] }
      }
    }
  };
  
  test('creates invoice with calculated total', async () => {
    const result = await beforeCreate({
      data: {
        line_items: [
          { amount: 500, description: 'Freight' },
          { amount: 100, description: 'FSC' }
        ],
        payment_terms: 30,
        invoice_date: '2025-01-01'
      },
      user: { role: 'broker', id: 'user_1', email: 'broker@test.com' },
      base44: mockBase44
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.invoice_total).toBe(600);
    expect(result.data.balance_due).toBe(600);
  });
  
  test('rejects duplicate invoice', async () => {
    const mockBase44WithExisting = {
      asServiceRole: {
        entities: {
          Invoice: { 
            filter: async () => [{ load_id: 'load_1', invoice_number: 'INV-001' }] 
          }
        }
      }
    };
    
    const result = await beforeCreate({
      data: {
        load_id: 'load_1',
        line_items: [{ amount: 500 }]
      },
      user: { role: 'broker', id: 'user_1', email: 'test@test.com' },
      base44: mockBase44WithExisting
    });
    
    expect(result.ok).toBe(false);
    expect(result.errors[0].code).toBe('DUPLICATE');
  });
  
  test('customer can read own invoice', async () => {
    const invoice = {
      id: 'inv_1',
      customer_id: 'cust_1',
      invoice_total: 1000,
      internal_notes: 'Confidential'
    };
    
    const result = await afterRead({
      data: invoice,
      user: { role: 'customer', id: 'cust_1', email: 'customer@test.com' }
    });
    
    expect(result.ok).toBe(true);
    expect(result.data.invoice_total).toBe(1000);
    expect(result.data.internal_notes).toBeUndefined();
  });
});