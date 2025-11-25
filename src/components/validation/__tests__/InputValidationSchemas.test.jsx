/**
 * Tests for Input Validation Schemas
 */

import { validateLoad, validateCarrier, validateDriver, validate } from '../InputValidationSchemas';

describe('Load Validation', () => {
  
  const validLoad = {
    pickup_location: { city: 'Chicago', state: 'IL', zip: '60601' },
    dropoff_location: { city: 'Detroit', state: 'MI', zip: '48201' },
    equipment_type: 'dry_van',
    customer_rate: 1500,
    carrier_pay: 1200,
    pickup_date: '2025-12-01',
    delivery_date: '2025-12-02'
  };

  test('should accept valid load', () => {
    const result = validateLoad(validLoad);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject missing pickup_location', () => {
    const { pickup_location, ...invalid } = validLoad;
    const result = validateLoad(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'pickup_location')).toBe(true);
  });

  test('should reject missing dropoff_location', () => {
    const { dropoff_location, ...invalid } = validLoad;
    const result = validateLoad(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'dropoff_location')).toBe(true);
  });

  test('should reject missing equipment_type', () => {
    const { equipment_type, ...invalid } = validLoad;
    const result = validateLoad(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'equipment_type')).toBe(true);
  });

  test('should reject invalid equipment_type', () => {
    const result = validateLoad({ ...validLoad, equipment_type: 'invalid_type' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'equipment_type' && e.code === 'INVALID_ENUM')).toBe(true);
  });

  test('should reject invalid state code', () => {
    const result = validateLoad({
      ...validLoad,
      pickup_location: { city: 'Chicago', state: 'ILLINOIS', zip: '60601' }
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'pickup_location.state')).toBe(true);
  });

  test('should reject invalid ZIP code', () => {
    const result = validateLoad({
      ...validLoad,
      pickup_location: { city: 'Chicago', state: 'IL', zip: 'invalid' }
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'pickup_location.zip')).toBe(true);
  });

  test('should reject negative customer_rate', () => {
    const result = validateLoad({ ...validLoad, customer_rate: -100 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'customer_rate')).toBe(true);
  });

  test('should reject delivery_date before pickup_date', () => {
    const result = validateLoad({
      ...validLoad,
      pickup_date: '2025-12-05',
      delivery_date: '2025-12-01'
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'delivery_date' && e.code === 'DATE_ORDER')).toBe(true);
  });

  test('should require hazmat fields when is_hazmat is true', () => {
    const result = validateLoad({ ...validLoad, is_hazmat: true });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'hazmat_class')).toBe(true);
  });

  test('should reject invalid hazmat UN number', () => {
    const result = validateLoad({
      ...validLoad,
      is_hazmat: true,
      hazmat_class: '3',
      hazmat_un_number: 'invalid'
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'hazmat_un_number')).toBe(true);
  });

  test('should accept valid hazmat load', () => {
    const result = validateLoad({
      ...validLoad,
      is_hazmat: true,
      hazmat_class: '3',
      hazmat_un_number: 'UN1234'
    });
    expect(result.valid).toBe(true);
  });

  test('should reject invalid status', () => {
    const result = validateLoad({ ...validLoad, status: 'invalid_status' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'status')).toBe(true);
  });

  test('should skip required validation on update', () => {
    const result = validateLoad({ customer_rate: 2000 }, true);
    expect(result.valid).toBe(true);
  });
});

describe('Carrier Validation', () => {
  
  const validCarrier = {
    company_name: 'ABC Trucking LLC',
    mc_number: 'MC-123456',
    dot_number: '1234567',
    contact_email: 'dispatch@abctrucking.com',
    contact_phone: '5551234567',
    insurance_expiration: '2026-12-31',
    insurance_coverage: 1000000,
    fleet_size: 25
  };

  test('should accept valid carrier', () => {
    const result = validateCarrier(validCarrier);
    expect(result.valid).toBe(true);
  });

  test('should reject missing company_name', () => {
    const { company_name, ...invalid } = validCarrier;
    const result = validateCarrier(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'company_name')).toBe(true);
  });

  test('should reject invalid MC number format', () => {
    const result = validateCarrier({ ...validCarrier, mc_number: 'invalid' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'mc_number')).toBe(true);
  });

  test('should reject invalid DOT number format', () => {
    const result = validateCarrier({ ...validCarrier, dot_number: 'abc' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'dot_number')).toBe(true);
  });

  test('should reject invalid email', () => {
    const result = validateCarrier({ ...validCarrier, contact_email: 'not-an-email' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'contact_email')).toBe(true);
  });

  test('should reject invalid phone', () => {
    const result = validateCarrier({ ...validCarrier, contact_phone: '123' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'contact_phone')).toBe(true);
  });

  test('should reject past insurance_expiration', () => {
    const result = validateCarrier({ ...validCarrier, insurance_expiration: '2020-01-01' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'insurance_expiration')).toBe(true);
  });

  test('should reject insurance_coverage below minimum', () => {
    const result = validateCarrier({ ...validCarrier, insurance_coverage: 50000 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'insurance_coverage')).toBe(true);
  });

  test('should reject invalid safety_rating', () => {
    const result = validateCarrier({ ...validCarrier, safety_rating: 'excellent' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'safety_rating')).toBe(true);
  });

  test('should accept valid safety_rating', () => {
    const result = validateCarrier({ ...validCarrier, safety_rating: 'satisfactory' });
    expect(result.valid).toBe(true);
  });
});

describe('Driver Validation', () => {
  
  const validDriver = {
    first_name: 'John',
    last_name: 'Doe',
    phone: '5551234567',
    email: 'john.doe@example.com',
    cdl_number: 'D1234567',
    cdl_state: 'IL',
    cdl_class: 'A',
    cdl_expiration: '2027-06-15',
    medical_card_expiration: '2026-06-15',
    payment_structure: 'per_mile',
    payment_rate: 0.55
  };

  test('should accept valid driver', () => {
    const result = validateDriver(validDriver);
    expect(result.valid).toBe(true);
  });

  test('should reject missing first_name', () => {
    const { first_name, ...invalid } = validDriver;
    const result = validateDriver(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'first_name')).toBe(true);
  });

  test('should reject missing cdl_number', () => {
    const { cdl_number, ...invalid } = validDriver;
    const result = validateDriver(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'cdl_number')).toBe(true);
  });

  test('should reject invalid CDL number format', () => {
    const result = validateDriver({ ...validDriver, cdl_number: 'AB' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'cdl_number')).toBe(true);
  });

  test('should reject invalid state code', () => {
    const result = validateDriver({ ...validDriver, cdl_state: 'ILLINOIS' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'cdl_state')).toBe(true);
  });

  test('should reject invalid CDL class', () => {
    const result = validateDriver({ ...validDriver, cdl_class: 'D' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'cdl_class')).toBe(true);
  });

  test('should reject past CDL expiration', () => {
    const result = validateDriver({ ...validDriver, cdl_expiration: '2020-01-01' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'cdl_expiration')).toBe(true);
  });

  test('should reject past medical card expiration', () => {
    const result = validateDriver({ ...validDriver, medical_card_expiration: '2020-01-01' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'medical_card_expiration')).toBe(true);
  });

  test('should reject invalid endorsement', () => {
    const result = validateDriver({ ...validDriver, endorsements: ['H', 'Z'] });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_ENDORSEMENT')).toBe(true);
  });

  test('should accept valid endorsements', () => {
    const result = validateDriver({ ...validDriver, endorsements: ['H', 'N', 'X'] });
    expect(result.valid).toBe(true);
  });

  test('should reject negative payment_rate', () => {
    const result = validateDriver({ ...validDriver, payment_rate: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'payment_rate')).toBe(true);
  });

  test('should reject invalid status', () => {
    const result = validateDriver({ ...validDriver, status: 'invalid' });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'status')).toBe(true);
  });
});

describe('Generic validate function', () => {
  
  test('should route to correct validator', () => {
    const loadResult = validate('Load', { pickup_location: {}, dropoff_location: {}, equipment_type: 'dry_van' });
    expect(loadResult).toBeDefined();
    
    const carrierResult = validate('Carrier', { company_name: 'Test' });
    expect(carrierResult).toBeDefined();
    
    const driverResult = validate('Driver', { first_name: 'John' });
    expect(driverResult).toBeDefined();
  });

  test('should return error for unknown entity type', () => {
    const result = validate('Unknown', {});
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'UNKNOWN_ENTITY')).toBe(true);
  });
});