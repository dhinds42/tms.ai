/**
 * Server-Side Validation Tests
 * Test suite for validation schemas and business rules
 */

import { validate } from '../validation/schemas.js';

describe('Load Validation', () => {
  test('rejects negative margin without override', () => {
    const data = {
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'dry_van',
      customer_rate: 1000,
      carrier_pay: 1500 // Negative margin!
    };
    
    const context = { allowNegativeMargin: false };
    const result = validate('Load', data, context);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'NEGATIVE_MARGIN')).toBe(true);
  });
  
  test('allows negative margin for admin', () => {
    const data = {
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'dry_van',
      customer_rate: 1000,
      carrier_pay: 1500
    };
    
    const context = { allowNegativeMargin: true }; // Admin override
    const result = validate('Load', data, context);
    
    // Should still be invalid for other reasons if missing required fields
    // but negative margin error should NOT be present
    expect(result.errors.some(e => e.code === 'NEGATIVE_MARGIN')).toBe(false);
  });
  
  test('rejects delivery before pickup', () => {
    const data = {
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'dry_van',
      pickup_date: '2025-12-20',
      delivery_date: '2025-12-19' // Before pickup!
    };
    
    const result = validate('Load', data, {});
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_DATE_SEQUENCE')).toBe(true);
  });
  
  test('rejects invalid status', () => {
    const data = {
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'dry_van',
      status: 'invalid_status'
    };
    
    const result = validate('Load', data, {});
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'status')).toBe(true);
  });
  
  test('requires temperature for reefer loads', () => {
    const data = {
      pickup_location: { city: 'Chicago', state: 'IL' },
      dropoff_location: { city: 'Detroit', state: 'MI' },
      equipment_type: 'reefer'
      // Missing temperature_min/max
    };
    
    const result = validate('Load', data, {});
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_TEMPERATURE')).toBe(true);
  });
});

describe('Carrier Validation', () => {
  test('rejects invalid MC number format', () => {
    const data = {
      company_name: 'ABC Trucking',
      mc_number: '123', // Too short
      dot_number: '1234567',
      email: 'test@abc.com',
      phone: '5551234567',
      insurance_expiration: '2026-12-31'
    };
    
    const result = validate('Carrier', data, {});
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'mc_number')).toBe(true);
  });
  
  test('rejects expired insurance', () => {
    const data = {
      company_name: 'ABC Trucking',
      mc_number: '123456',
      dot_number: '1234567',
      email: 'test@abc.com',
      phone: '5551234567',
      insurance_expiration: '2020-01-01' // Expired!
    };
    
    const result = validate('Carrier', data, {});
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'EXPIRED_INSURANCE')).toBe(true);
  });
  
  test('accepts valid carrier', () => {
    const data = {
      company_name: 'ABC Trucking LLC',
      mc_number: '123456',
      dot_number: '1234567',
      email: 'dispatch@abc.com',
      phone: '5551234567',
      insurance_expiration: '2026-12-31'
    };
    
    const result = validate('Carrier', data, {});
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Driver Validation', () => {
  test('rejects expired CDL', () => {
    const data = {
      first_name: 'John',
      last_name: 'Smith',
      phone: '5551234567',
      cdl_number: 'S123456789',
      cdl_state: 'TX',
      cdl_expiration: '2020-01-01', // Expired!
      medical_card_expiry: '2026-12-31',
      payment_structure: 'per_mile',
      payment_rate: 0.50
    };
    
    const result = validate('Driver', data, {});
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'EXPIRED_CDL')).toBe(true);
  });
  
  test('rejects zero payment rate', () => {
    const data = {
      first_name: 'John',
      last_name: 'Smith',
      phone: '5551234567',
      cdl_number: 'S123456789',
      cdl_state: 'TX',
      cdl_expiration: '2027-01-01',
      medical_card_expiry: '2026-12-31',
      payment_structure: 'per_mile',
      payment_rate: 0 // Invalid!
    };
    
    const result = validate('Driver', data, {});
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'payment_rate')).toBe(true);
  });
});