/**
 * RBAC Authorization Tests
 * Test role-based access control and data redaction
 */

import { hasPermission, getUserRole, redactForRole } from '../auth/permissions.js';

describe('RBAC Permissions', () => {
  test('admin has all permissions', () => {
    const user = { role: 'admin' };
    expect(hasPermission(user, 'load.read.all')).toBe(true);
    expect(hasPermission(user, 'load.update.rates')).toBe(true);
    expect(hasPermission(user, 'carrier.delete')).toBe(true);
  });
  
  test('broker can read customer rates', () => {
    const user = { role: 'user' };
    const context = { operatingMode: 'broker' };
    expect(hasPermission(user, 'load.read.customer_rate', context)).toBe(true);
  });
  
  test('carrier CANNOT read customer rates', () => {
    const user = { role: 'user' };
    const context = { operatingMode: 'carrier' };
    expect(hasPermission(user, 'load.read.customer_rate', context)).toBe(false);
  });
  
  test('carrier can read own loads only', () => {
    const user = { role: 'user' };
    const context = { operatingMode: 'carrier' };
    expect(hasPermission(user, 'load.read.assigned', context)).toBe(true);
    expect(hasPermission(user, 'load.read.all', context)).toBe(false);
  });
  
  test('driver can update load status but not rates', () => {
    const user = { role: 'user' };
    const context = { operatingMode: 'driver' };
    expect(hasPermission(user, 'load.update.status', context)).toBe(true);
    expect(hasPermission(user, 'load.update.rates', context)).toBe(false);
  });
});

describe('Data Redaction', () => {
  test('redacts customer_rate and margin for carrier', () => {
    const load = {
      id: '123',
      load_number: 'LD-001',
      customer_rate: 1500,
      carrier_pay: 1200,
      margin: 300,
      pickup_location: { city: 'Chicago' }
    };
    
    const redacted = redactForRole('Load', load, 'carrier');
    
    expect(redacted.customer_rate).toBeUndefined();
    expect(redacted.margin).toBeUndefined();
    expect(redacted.carrier_pay).toBe(1200); // Carrier should see their pay
    expect(redacted.pickup_location.city).toBe('Chicago'); // Non-sensitive kept
  });
  
  test('redacts carrier_pay for customer', () => {
    const load = {
      id: '123',
      customer_rate: 1500,
      carrier_pay: 1200,
      margin: 300
    };
    
    const redacted = redactForRole('Load', load, 'customer');
    
    expect(redacted.customer_rate).toBe(1500); // Customer sees their rate
    expect(redacted.carrier_pay).toBeUndefined();
    expect(redacted.margin).toBeUndefined();
  });
  
  test('does not redact for broker', () => {
    const load = {
      id: '123',
      customer_rate: 1500,
      carrier_pay: 1200,
      margin: 300
    };
    
    const redacted = redactForRole('Load', load, 'broker');
    
    expect(redacted.customer_rate).toBe(1500);
    expect(redacted.carrier_pay).toBe(1200);
    expect(redacted.margin).toBe(300);
  });
});

describe('User Role Resolution', () => {
  test('resolves admin role', () => {
    const user = { role: 'admin' };
    expect(getUserRole(user, 'broker')).toBe('admin');
  });
  
  test('uses operating mode for non-admin', () => {
    const user = { role: 'user' };
    expect(getUserRole(user, 'carrier')).toBe('carrier');
    expect(getUserRole(user, 'broker')).toBe('broker');
  });
});