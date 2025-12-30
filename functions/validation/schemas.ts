/**
 * Server-Side Validation Schemas
 * Enforces data integrity at API boundary
 */

export const VALIDATION_SCHEMAS = {
  Load: {
    required: ['pickup_location', 'dropoff_location', 'equipment_type'],
    rules: {
      customer_rate: {
        type: 'number',
        min: 0,
        message: 'Customer rate must be positive'
      },
      carrier_pay: {
        type: 'number',
        min: 0,
        message: 'Carrier pay must be positive'
      },
      pickup_date: {
        type: 'date',
        message: 'Valid pickup date required'
      },
      delivery_date: {
        type: 'date',
        message: 'Valid delivery date required'
      },
      status: {
        type: 'enum',
        values: ['quote', 'available', 'tendered', 'assigned', 'dispatched', 'picked_up', 'in_transit', 'delivered', 'invoiced', 'closed', 'cancelled'],
        message: 'Invalid load status'
      },
      equipment_type: {
        type: 'enum',
        values: ['cargo_van', 'sprinter', 'box_truck', 'dry_van', 'reefer', 'flatbed', 'step_deck', 'lowboy', 'container', 'tanker', 'hopper'],
        message: 'Invalid equipment type'
      }
    },
    businessLogic: (data, context) => {
      const errors = [];
      
      // Negative margin check
      if (data.customer_rate && data.carrier_pay) {
        if (data.carrier_pay > data.customer_rate && !context.allowNegativeMargin) {
          errors.push({
            field: 'carrier_pay',
            code: 'NEGATIVE_MARGIN',
            message: 'Carrier pay cannot exceed customer rate (negative margin). Contact admin for override.'
          });
        }
      }
      
      // Date logic
      if (data.pickup_date && data.delivery_date) {
        const pickup = new Date(data.pickup_date);
        const delivery = new Date(data.delivery_date);
        if (delivery < pickup) {
          errors.push({
            field: 'delivery_date',
            code: 'INVALID_DATE_SEQUENCE',
            message: 'Delivery date cannot be before pickup date'
          });
        }
      }
      
      // Hazmat requires class
      if (data.hazmat_flag && !data.hazmat_class) {
        errors.push({
          field: 'hazmat_class',
          code: 'MISSING_HAZMAT_CLASS',
          message: 'Hazmat class required when hazmat_flag is true'
        });
      }
      
      // Reefer requires temperature
      if (data.equipment_type === 'reefer' && !data.temperature_min && !data.temperature_max) {
        errors.push({
          field: 'temperature_min',
          code: 'MISSING_TEMPERATURE',
          message: 'Temperature range required for reefer loads'
        });
      }
      
      return errors;
    }
  },
  
  Carrier: {
    required: ['company_name', 'mc_number', 'dot_number', 'email', 'phone', 'insurance_expiration'],
    rules: {
      mc_number: {
        type: 'string',
        pattern: /^\d{5,7}$/,
        message: 'MC number must be 5-7 digits'
      },
      dot_number: {
        type: 'string',
        pattern: /^\d{5,8}$/,
        message: 'DOT number must be 5-8 digits'
      },
      email: {
        type: 'email',
        message: 'Valid email required'
      },
      phone: {
        type: 'phone',
        message: 'Valid phone number required'
      },
      insurance_expiration: {
        type: 'date',
        futureOnly: true,
        message: 'Insurance expiration must be a future date'
      },
      scac_code: {
        type: 'string',
        pattern: /^[A-Z]{2,4}$/,
        optional: true,
        message: 'SCAC must be 2-4 uppercase letters'
      }
    },
    businessLogic: (data, context) => {
      const errors = [];
      
      // Insurance expiration check
      if (data.insurance_expiration) {
        const expDate = new Date(data.insurance_expiration);
        if (expDate < new Date()) {
          errors.push({
            field: 'insurance_expiration',
            code: 'EXPIRED_INSURANCE',
            message: 'Insurance has expired - cannot activate carrier'
          });
        }
      }
      
      return errors;
    }
  },
  
  Driver: {
    required: ['first_name', 'last_name', 'phone', 'cdl_number', 'cdl_state', 'cdl_expiration', 'medical_card_expiry', 'payment_structure', 'payment_rate'],
    rules: {
      cdl_number: {
        type: 'string',
        pattern: /^[A-Z0-9]{8,15}$/i,
        message: 'CDL must be 8-15 alphanumeric characters'
      },
      cdl_state: {
        type: 'string',
        pattern: /^[A-Z]{2}$/,
        message: 'CDL state must be 2-letter code'
      },
      cdl_expiration: {
        type: 'date',
        futureOnly: true,
        message: 'CDL expiration must be future date'
      },
      medical_card_expiry: {
        type: 'date',
        futureOnly: true,
        message: 'Medical card must not be expired'
      },
      payment_rate: {
        type: 'number',
        min: 0.01,
        message: 'Payment rate must be greater than 0'
      },
      payment_structure: {
        type: 'enum',
        values: ['percentage', 'per_mile', 'per_load', 'hourly'],
        message: 'Invalid payment structure'
      }
    },
    businessLogic: (data, context) => {
      const errors = [];
      
      // CDL expiration
      if (data.cdl_expiration && new Date(data.cdl_expiration) < new Date()) {
        errors.push({
          field: 'cdl_expiration',
          code: 'EXPIRED_CDL',
          message: 'CDL has expired - driver cannot be activated'
        });
      }
      
      // Medical card expiration
      if (data.medical_card_expiry && new Date(data.medical_card_expiry) < new Date()) {
        errors.push({
          field: 'medical_card_expiry',
          code: 'EXPIRED_MEDICAL',
          message: 'Medical card has expired - driver cannot be activated'
        });
      }
      
      return errors;
    }
  },
  
  Shipper: {
    required: ['company_name', 'contact_name', 'email', 'phone'],
    rules: {
      email: {
        type: 'email',
        message: 'Valid email required'
      },
      phone: {
        type: 'phone',
        message: 'Valid phone required'
      },
      credit_limit: {
        type: 'number',
        min: 0,
        optional: true,
        message: 'Credit limit must be positive'
      }
    }
  },
  
  Invoice: {
    required: ['invoice_number', 'amount', 'due_date'],
    rules: {
      amount: {
        type: 'number',
        min: 0,
        message: 'Invoice amount must be positive'
      },
      invoice_number: {
        type: 'string',
        message: 'Invoice number required'
      }
    },
    businessLogic: (data, context) => {
      const errors = [];
      
      if (data.amount < 0) {
        errors.push({
          field: 'amount',
          code: 'NEGATIVE_AMOUNT',
          message: 'Invoice amount cannot be negative'
        });
      }
      
      return errors;
    }
  }
};

/**
 * Validate data against schema
 */
export function validate(entityType, data, context = {}) {
  const schema = VALIDATION_SCHEMAS[entityType];
  if (!schema) {
    return { valid: true, errors: [] };
  }
  
  const errors = [];
  
  // Check required fields
  schema.required?.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push({
        field,
        code: 'REQUIRED_FIELD',
        message: `${field} is required`
      });
    }
  });
  
  // Validate field rules
  Object.keys(schema.rules || {}).forEach(field => {
    const rule = schema.rules[field];
    const value = data[field];
    
    if (rule.optional && !value) return;
    if (!value && !rule.optional) {
      if (!schema.required?.includes(field)) {
        errors.push({
          field,
          code: 'REQUIRED_FIELD',
          message: rule.message || `${field} is required`
        });
      }
      return;
    }
    
    // Type validation
    if (rule.type === 'number' && isNaN(parseFloat(value))) {
      errors.push({ field, code: 'INVALID_TYPE', message: rule.message });
    }
    
    if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push({ field, code: 'INVALID_EMAIL', message: rule.message });
    }
    
    if (rule.type === 'phone' && !/^[\d\s\(\)\-\+\.]{10,}$/.test(value)) {
      errors.push({ field, code: 'INVALID_PHONE', message: rule.message });
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({ field, code: 'INVALID_FORMAT', message: rule.message });
    }
    
    // Enum validation
    if (rule.type === 'enum' && !rule.values.includes(value)) {
      errors.push({ field, code: 'INVALID_ENUM', message: rule.message });
    }
    
    // Min/max validation
    if (rule.min !== undefined && parseFloat(value) < rule.min) {
      errors.push({ field, code: 'OUT_OF_RANGE', message: rule.message });
    }
    
    // Future date validation
    if (rule.futureOnly && new Date(value) < new Date()) {
      errors.push({ field, code: 'PAST_DATE', message: rule.message });
    }
  });
  
  // Business logic validation
  if (schema.businessLogic) {
    const businessErrors = schema.businessLogic(data, context);
    errors.push(...businessErrors);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}