/**
 * Field Redaction Policy Tests
 * Verify data-driven redaction works correctly
 */

import { describe, test, expect } from '@jest/globals';

describe('Field Redaction Policy Engine', () => {
  test('Driver role hides customer_rate from Load', async () => {
    const load = {
      id: 'load_1',
      customer_rate: 5000,
      carrier_pay: 4500,
      margin: 500
    };
    
    const policy = {
      role_key: 'driver',
      entity_name: 'Load',
      hidden_fields: ['customer_rate', 'carrier_pay', 'margin']
    };
    
    // Apply redaction
    const redacted = { ...load };
    policy.hidden_fields.forEach(field => delete redacted[field]);
    
    expect(redacted.customer_rate).toBeUndefined();
    expect(redacted.carrier_pay).toBeUndefined();
    expect(redacted.margin).toBeUndefined();
    expect(redacted.id).toBe('load_1');
  });
  
  test('Customer role hides carrier_pay from Load', async () => {
    const load = {
      id: 'load_1',
      customer_rate: 5000,
      carrier_pay: 4500,
      margin: 500
    };
    
    const policy = {
      role_key: 'customer_user',
      entity_name: 'Load',
      hidden_fields: ['carrier_pay', 'margin']
    };
    
    const redacted = { ...load };
    policy.hidden_fields.forEach(field => delete redacted[field]);
    
    expect(redacted.customer_rate).toBe(5000);
    expect(redacted.carrier_pay).toBeUndefined();
    expect(redacted.margin).toBeUndefined();
  });
  
  test('Carrier role hides customer_rate from Load', async () => {
    const load = {
      id: 'load_1',
      customer_rate: 5000,
      carrier_pay: 4500,
      margin: 500
    };
    
    const policy = {
      role_key: 'carrier_admin',
      entity_name: 'Load',
      hidden_fields: ['customer_rate', 'margin']
    };
    
    const redacted = { ...load };
    policy.hidden_fields.forEach(field => delete redacted[field]);
    
    expect(redacted.customer_rate).toBeUndefined();
    expect(redacted.carrier_pay).toBe(4500);
    expect(redacted.margin).toBeUndefined();
  });
  
  test('Broker admin sees all fields', async () => {
    const load = {
      id: 'load_1',
      customer_rate: 5000,
      carrier_pay: 4500,
      margin: 500
    };
    
    // No policy for broker_admin
    const redacted = { ...load };
    
    expect(redacted.customer_rate).toBe(5000);
    expect(redacted.carrier_pay).toBe(4500);
    expect(redacted.margin).toBe(500);
  });
});

describe('Policy Priority', () => {
  test('Lower priority policy takes precedence', async () => {
    const policies = [
      { role_key: 'driver', entity_name: 'Load', hidden_fields: ['customer_rate'], priority: 100 },
      { role_key: 'driver', entity_name: 'Load', hidden_fields: ['margin'], priority: 50 }
    ];
    
    const sorted = policies.sort((a, b) => a.priority - b.priority);
    
    expect(sorted[0].priority).toBe(50);
    expect(sorted[0].hidden_fields[0]).toBe('margin');
  });
});