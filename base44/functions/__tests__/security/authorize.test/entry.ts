/**
 * Authorization Framework Tests
 */

import { hasPermission, authorize } from '../../shared/security/authorize';

describe('Authorization', () => {
  
  test('admin has all permissions', () => {
    const user = { role: 'admin', id: 'admin_1', email: 'admin@test.com' };
    
    expect(hasPermission(user, { resource: 'load', action: 'delete' })).toBe(true);
    expect(hasPermission(user, { resource: 'invoice', action: 'update' })).toBe(true);
  });
  
  test('broker can create loads', () => {
    const user = { role: 'broker', id: 'broker_1', email: 'broker@test.com' };
    expect(hasPermission(user, { resource: 'load', action: 'create' })).toBe(true);
  });
  
  test('carrier can only read own loads', () => {
    const user = { role: 'carrier', id: 'carrier_1', email: 'carrier@test.com' };
    
    expect(hasPermission(user, { resource: 'load', action: 'read' }, { carrier_id: 'carrier_1' })).toBe(true);
    expect(hasPermission(user, { resource: 'load', action: 'read' }, { carrier_id: 'other' })).toBe(false);
  });
  
  test('driver cannot create loads', () => {
    const user = { role: 'driver', id: 'driver_1', email: 'driver@test.com' };
    expect(hasPermission(user, { resource: 'load', action: 'create' })).toBe(false);
  });
  
  test('authorize logs denied attempts', async () => {
    const user = { role: 'carrier', id: 'carrier_1', email: 'carrier@test.com' };
    
    const result = await authorize(user, { resource: 'load', action: 'delete' });
    expect(result.authorized).toBe(false);
  });
});