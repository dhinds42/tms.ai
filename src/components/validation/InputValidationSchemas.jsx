/**
 * Input Validation Schemas
 * 
 * Validation schemas for Load, Carrier, and Driver entities
 * with comprehensive field validation rules.
 */

// Validation result type
export const ValidationResult = {
  valid: true,
  errors: []
};

// Common regex patterns
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?1?\d{10,14}$/,
  MC_NUMBER: /^MC-?\d{5,7}$/i,
  DOT_NUMBER: /^\d{5,8}$/,
  CDL_NUMBER: /^[A-Z0-9]{5,15}$/i,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  STATE_CODE: /^[A-Z]{2}$/i,
  LOAD_NUMBER: /^[A-Z0-9-]{3,20}$/i
};

// US States
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

/**
 * Base Validator Class
 */
class Validator {
  constructor() {
    this.errors = [];
  }

  required(value, field) {
    if (value === undefined || value === null || value === '') {
      this.errors.push({ field, message: `${field} is required`, code: 'REQUIRED' });
      return false;
    }
    return true;
  }

  string(value, field, { minLength, maxLength, pattern, patternName } = {}) {
    if (value === undefined || value === null) return true;
    
    if (typeof value !== 'string') {
      this.errors.push({ field, message: `${field} must be a string`, code: 'INVALID_TYPE' });
      return false;
    }
    if (minLength && value.length < minLength) {
      this.errors.push({ field, message: `${field} must be at least ${minLength} characters`, code: 'MIN_LENGTH' });
      return false;
    }
    if (maxLength && value.length > maxLength) {
      this.errors.push({ field, message: `${field} must be at most ${maxLength} characters`, code: 'MAX_LENGTH' });
      return false;
    }
    if (pattern && !pattern.test(value)) {
      this.errors.push({ field, message: `${field} format is invalid${patternName ? ` (expected ${patternName})` : ''}`, code: 'INVALID_FORMAT' });
      return false;
    }
    return true;
  }

  number(value, field, { min, max } = {}) {
    if (value === undefined || value === null) return true;
    
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) {
      this.errors.push({ field, message: `${field} must be a number`, code: 'INVALID_TYPE' });
      return false;
    }
    if (min !== undefined && num < min) {
      this.errors.push({ field, message: `${field} must be at least ${min}`, code: 'MIN_VALUE' });
      return false;
    }
    if (max !== undefined && num > max) {
      this.errors.push({ field, message: `${field} must be at most ${max}`, code: 'MAX_VALUE' });
      return false;
    }
    return true;
  }

  enum(value, field, allowedValues) {
    if (value === undefined || value === null) return true;
    
    if (!allowedValues.includes(value)) {
      this.errors.push({ field, message: `${field} must be one of: ${allowedValues.join(', ')}`, code: 'INVALID_ENUM' });
      return false;
    }
    return true;
  }

  date(value, field, { future, past } = {}) {
    if (value === undefined || value === null) return true;
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      this.errors.push({ field, message: `${field} must be a valid date`, code: 'INVALID_DATE' });
      return false;
    }
    if (future && date <= new Date()) {
      this.errors.push({ field, message: `${field} must be in the future`, code: 'DATE_NOT_FUTURE' });
      return false;
    }
    if (past && date >= new Date()) {
      this.errors.push({ field, message: `${field} must be in the past`, code: 'DATE_NOT_PAST' });
      return false;
    }
    return true;
  }

  object(value, field) {
    if (value === undefined || value === null) return true;
    
    if (typeof value !== 'object' || Array.isArray(value)) {
      this.errors.push({ field, message: `${field} must be an object`, code: 'INVALID_TYPE' });
      return false;
    }
    return true;
  }

  getResult() {
    return {
      valid: this.errors.length === 0,
      errors: this.errors
    };
  }
}

/**
 * Load Creation/Update Validation Schema
 */
export function validateLoad(data, isUpdate = false) {
  const v = new Validator();

  // Required fields for creation
  if (!isUpdate) {
    v.required(data.pickup_location, 'pickup_location');
    v.required(data.dropoff_location, 'dropoff_location');
    v.required(data.equipment_type, 'equipment_type');
  }

  // Pickup location validation
  if (data.pickup_location) {
    v.object(data.pickup_location, 'pickup_location');
    if (typeof data.pickup_location === 'object') {
      v.string(data.pickup_location.city, 'pickup_location.city', { minLength: 2, maxLength: 100 });
      v.string(data.pickup_location.state, 'pickup_location.state', { pattern: PATTERNS.STATE_CODE, patternName: '2-letter state code' });
      v.string(data.pickup_location.zip, 'pickup_location.zip', { pattern: PATTERNS.ZIP_CODE, patternName: 'ZIP code' });
    }
  }

  // Dropoff location validation
  if (data.dropoff_location) {
    v.object(data.dropoff_location, 'dropoff_location');
    if (typeof data.dropoff_location === 'object') {
      v.string(data.dropoff_location.city, 'dropoff_location.city', { minLength: 2, maxLength: 100 });
      v.string(data.dropoff_location.state, 'dropoff_location.state', { pattern: PATTERNS.STATE_CODE, patternName: '2-letter state code' });
      v.string(data.dropoff_location.zip, 'dropoff_location.zip', { pattern: PATTERNS.ZIP_CODE, patternName: 'ZIP code' });
    }
  }

  // Equipment type
  v.enum(data.equipment_type, 'equipment_type', [
    'cargo_van', 'sprinter', 'box_truck', 'dry_van', 'reefer', 
    'flatbed', 'step_deck', 'lowboy', 'container', 'tanker', 'hopper'
  ]);

  // Status
  if (data.status) {
    v.enum(data.status, 'status', [
      'quote', 'available', 'tendered', 'assigned', 'dispatched',
      'picked_up', 'in_transit', 'delivered', 'invoiced', 'closed', 'cancelled'
    ]);
  }

  // Rates (must be positive)
  v.number(data.customer_rate, 'customer_rate', { min: 0, max: 1000000 });
  v.number(data.carrier_pay, 'carrier_pay', { min: 0, max: 1000000 });
  v.number(data.weight, 'weight', { min: 0, max: 200000 });
  v.number(data.distance_miles, 'distance_miles', { min: 0, max: 10000 });

  // Dates
  v.date(data.pickup_date, 'pickup_date');
  v.date(data.delivery_date, 'delivery_date');

  // Validate delivery after pickup
  if (data.pickup_date && data.delivery_date) {
    if (new Date(data.delivery_date) < new Date(data.pickup_date)) {
      v.errors.push({ field: 'delivery_date', message: 'Delivery date must be after pickup date', code: 'DATE_ORDER' });
    }
  }

  // Temperature for reefer
  if (data.equipment_type === 'reefer') {
    if (data.temperature_min !== undefined && data.temperature_max !== undefined) {
      if (data.temperature_min > data.temperature_max) {
        v.errors.push({ field: 'temperature_min', message: 'Min temperature cannot exceed max temperature', code: 'TEMP_RANGE' });
      }
    }
  }

  // Hazmat validation
  if (data.is_hazmat || data.hazmat_flag) {
    v.required(data.hazmat_class, 'hazmat_class');
    v.string(data.hazmat_un_number, 'hazmat_un_number', { pattern: /^UN\d{4}$/i, patternName: 'UN number (e.g., UN1234)' });
  }

  return v.getResult();
}

/**
 * Carrier Onboarding Validation Schema
 */
export function validateCarrier(data, isUpdate = false) {
  const v = new Validator();

  // Required fields
  if (!isUpdate) {
    v.required(data.company_name, 'company_name');
    v.required(data.mc_number, 'mc_number');
    v.required(data.dot_number, 'dot_number');
    v.required(data.contact_email, 'contact_email');
    v.required(data.contact_phone, 'contact_phone');
  }

  // Company info
  v.string(data.company_name, 'company_name', { minLength: 2, maxLength: 200 });
  v.string(data.mc_number, 'mc_number', { pattern: PATTERNS.MC_NUMBER, patternName: 'MC number (e.g., MC-123456)' });
  v.string(data.dot_number, 'dot_number', { pattern: PATTERNS.DOT_NUMBER, patternName: 'DOT number (5-8 digits)' });

  // Contact info
  v.string(data.contact_email, 'contact_email', { pattern: PATTERNS.EMAIL, patternName: 'email address' });
  v.string(data.contact_phone, 'contact_phone', { pattern: PATTERNS.PHONE, patternName: 'phone number' });

  // Address
  if (data.address) {
    v.object(data.address, 'address');
    if (typeof data.address === 'object') {
      v.string(data.address.city, 'address.city', { minLength: 2, maxLength: 100 });
      v.string(data.address.state, 'address.state', { pattern: PATTERNS.STATE_CODE });
      v.string(data.address.zip, 'address.zip', { pattern: PATTERNS.ZIP_CODE });
    }
  }

  // Insurance
  v.date(data.insurance_expiration, 'insurance_expiration', { future: true });
  v.number(data.insurance_coverage, 'insurance_coverage', { min: 100000 });

  // Fleet size
  v.number(data.fleet_size, 'fleet_size', { min: 1, max: 10000 });

  // Safety rating
  if (data.safety_rating) {
    v.enum(data.safety_rating, 'safety_rating', ['satisfactory', 'conditional', 'unsatisfactory', 'none']);
  }

  // Status
  if (data.status) {
    v.enum(data.status, 'status', ['pending', 'active', 'suspended', 'inactive', 'blacklisted']);
  }

  return v.getResult();
}

/**
 * Driver Registration Validation Schema
 */
export function validateDriver(data, isUpdate = false) {
  const v = new Validator();

  // Required fields
  if (!isUpdate) {
    v.required(data.first_name, 'first_name');
    v.required(data.last_name, 'last_name');
    v.required(data.phone, 'phone');
    v.required(data.cdl_number, 'cdl_number');
    v.required(data.cdl_state, 'cdl_state');
    v.required(data.cdl_expiration, 'cdl_expiration');
  }

  // Name
  v.string(data.first_name, 'first_name', { minLength: 1, maxLength: 50 });
  v.string(data.last_name, 'last_name', { minLength: 1, maxLength: 50 });

  // Contact
  v.string(data.phone, 'phone', { pattern: PATTERNS.PHONE, patternName: 'phone number' });
  v.string(data.email, 'email', { pattern: PATTERNS.EMAIL, patternName: 'email address' });

  // CDL
  v.string(data.cdl_number, 'cdl_number', { pattern: PATTERNS.CDL_NUMBER, patternName: 'CDL number' });
  v.enum(data.cdl_state, 'cdl_state', US_STATES);
  v.enum(data.cdl_class, 'cdl_class', ['A', 'B', 'C']);
  v.date(data.cdl_expiration, 'cdl_expiration', { future: true });

  // Medical card
  v.date(data.medical_card_expiration, 'medical_card_expiration', { future: true });

  // Endorsements
  if (data.endorsements && Array.isArray(data.endorsements)) {
    const validEndorsements = ['H', 'N', 'X', 'T', 'P', 'S'];
    data.endorsements.forEach((e, i) => {
      if (!validEndorsements.includes(e)) {
        v.errors.push({ field: `endorsements[${i}]`, message: `Invalid endorsement: ${e}`, code: 'INVALID_ENDORSEMENT' });
      }
    });
  }

  // Payment structure
  if (data.payment_structure) {
    v.enum(data.payment_structure, 'payment_structure', ['percentage', 'per_mile', 'per_load', 'hourly']);
  }
  v.number(data.payment_rate, 'payment_rate', { min: 0 });

  // Status
  if (data.status) {
    v.enum(data.status, 'status', ['active', 'available', 'assigned', 'on_load', 'off_duty', 'on_leave', 'terminated', 'suspended']);
  }

  return v.getResult();
}

/**
 * Generic validation function
 */
export function validate(entityType, data, isUpdate = false) {
  switch (entityType) {
    case 'Load':
      return validateLoad(data, isUpdate);
    case 'Carrier':
      return validateCarrier(data, isUpdate);
    case 'Driver':
      return validateDriver(data, isUpdate);
    default:
      return { valid: false, errors: [{ field: 'entityType', message: `Unknown entity type: ${entityType}`, code: 'UNKNOWN_ENTITY' }] };
  }
}

export default { validateLoad, validateCarrier, validateDriver, validate };