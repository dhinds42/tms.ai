/**
 * Load Workflow Integration Tests
 * End-to-end workflow validation
 */

describe('Load Creation Workflow', () => {
  test('prevents negative margin load creation', async () => {
    const mockUser = { id: 'user-1', email: 'broker@test.com', role: 'user' };
    const mockRequest = {
      body: {
        pickup_location: { city: 'Chicago', state: 'IL' },
        dropoff_location: { city: 'Detroit', state: 'MI' },
        equipment_type: 'dry_van',
        customer_rate: 1000,
        carrier_pay: 1500 // NEGATIVE MARGIN
      },
      headers: { 'x-operating-mode': 'broker' }
    };
    
    const { default: createLoad } = await import('../../entities/createLoad.js');
    
    const response = await createLoad(mockRequest, { user: mockUser });
    
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.some(e => e.code === 'NEGATIVE_MARGIN')).toBe(true);
  });
  
  test('allows admin to override negative margin', async () => {
    const mockUser = { id: 'admin-1', email: 'admin@test.com', role: 'admin' };
    const mockRequest = {
      body: {
        pickup_location: { city: 'Chicago', state: 'IL' },
        dropoff_location: { city: 'Detroit', state: 'MI' },
        equipment_type: 'dry_van',
        customer_rate: 1000,
        carrier_pay: 1500,
        pickup_date: '2025-12-20',
        delivery_date: '2025-12-21'
      },
      headers: { 'x-operating-mode': 'broker' }
    };
    
    // Mock base44.asServiceRole
    global.base44 = {
      asServiceRole: {
        entities: {
          Load: {
            create: jest.fn().mockResolvedValue({ 
              id: 'load-123', 
              ...mockRequest.body 
            })
          },
          AuditLog: {
            create: jest.fn()
          }
        }
      }
    };
    
    const { default: createLoad } = await import('../../entities/createLoad.js');
    
    const response = await createLoad(mockRequest, { user: mockUser });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
  });
});

describe('Carrier Onboarding Workflow', () => {
  test('prevents duplicate MC number', async () => {
    // Mock existing carrier
    global.base44 = {
      asServiceRole: {
        entities: {
          Carrier: {
            filter: jest.fn().mockResolvedValue([
              { id: 'carrier-1', mc_number: '123456' }
            ])
          }
        }
      }
    };
    
    const { checkDuplicates } = await import('../../middleware/validateEntity.js');
    
    const data = { mc_number: '123456', company_name: 'New Carrier' };
    
    await expect(
      checkDuplicates('Carrier', data, global.base44.asServiceRole)
    ).rejects.toMatchObject({
      statusCode: 409,
      error: 'Duplicate Record'
    });
  });
});