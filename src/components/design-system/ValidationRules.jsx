/**
 * TMS.ai Validation Rules
 * Centralized validation logic for consistent field validation across all forms
 */

export const ValidationRules = {
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
    required: true
  },

  // Phone validation (US format)
  phone: {
    pattern: /^[\d\s\(\)\-\+\.]+$/,
    minLength: 10,
    maxLength: 20,
    message: "Please enter a valid phone number",
    required: true,
    format: (value) => {
      // Strip non-digits
      const cleaned = value.replace(/\D/g, '');
      // Format as (XXX) XXX-XXXX if 10 digits
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      return value;
    }
  },

  // MC Number validation
  mcNumber: {
    pattern: /^(MC[-\s]?)?(\d{5,7})$/i,
    message: "MC number must be 5-7 digits (e.g., MC123456)",
    required: true,
    normalize: (value) => {
      const digits = value.replace(/\D/g, '');
      return digits;
    }
  },

  // DOT Number validation
  dotNumber: {
    pattern: /^(DOT[-\s]?)?(\d{5,8})$/i,
    message: "DOT number must be 5-8 digits (e.g., DOT1234567)",
    required: true,
    normalize: (value) => {
      const digits = value.replace(/\D/g, '');
      return digits;
    }
  },

  // CDL Number validation
  cdlNumber: {
    pattern: /^[A-Z0-9]{8,15}$/i,
    message: "CDL number must be 8-15 alphanumeric characters",
    required: true
  },

  // ZIP Code validation
  zipCode: {
    pattern: /^\d{5}(-\d{4})?$/,
    message: "ZIP code must be 5 digits or 5+4 format",
    minLength: 5,
    maxLength: 10
  },

  // State code validation
  stateCode: {
    pattern: /^[A-Z]{2}$/,
    message: "State code must be 2 uppercase letters (e.g., CA, TX)",
    minLength: 2,
    maxLength: 2,
    transform: (value) => value.toUpperCase()
  },

  // Currency amount validation
  currency: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: "Please enter a valid amount (e.g., 1500.00)",
    min: 0,
    max: 999999999
  },

  // Weight validation (lbs)
  weight: {
    pattern: /^\d+$/,
    message: "Weight must be a positive number",
    min: 1,
    max: 100000,
    required: false
  },

  // Distance validation (miles)
  distance: {
    pattern: /^\d+$/,
    message: "Distance must be a positive number",
    min: 1,
    max: 10000,
    required: false
  },

  // Company name validation
  companyName: {
    minLength: 2,
    maxLength: 100,
    message: "Company name must be 2-100 characters",
    required: true
  },

  // Contact name validation
  contactName: {
    minLength: 2,
    maxLength: 50,
    message: "Name must be 2-50 characters",
    required: true
  },

  // Date validation
  date: {
    message: "Please select a valid date",
    required: false,
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }
  },

  // Future date validation
  futureDate: {
    message: "Date must be in the future",
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return date > new Date();
    }
  }
};

/**
 * Validate a single field
 */
export const validateField = (value, rules) => {
  if (!value && rules.required) {
    return { valid: false, message: rules.message || "This field is required" };
  }

  if (!value && !rules.required) {
    return { valid: true };
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    return { valid: false, message: rules.message };
  }

  // Length validation
  if (rules.minLength && value.length < rules.minLength) {
    return { valid: false, message: `Minimum ${rules.minLength} characters required` };
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return { valid: false, message: `Maximum ${rules.maxLength} characters allowed` };
  }

  // Numeric range validation
  const numValue = parseFloat(value);
  if (rules.min !== undefined && numValue < rules.min) {
    return { valid: false, message: `Minimum value is ${rules.min}` };
  }

  if (rules.max !== undefined && numValue > rules.max) {
    return { valid: false, message: `Maximum value is ${rules.max}` };
  }

  // Custom validation function
  if (rules.validate && !rules.validate(value)) {
    return { valid: false, message: rules.message };
  }

  return { valid: true };
};

/**
 * Validate entire form
 */
export const validateForm = (formData, fieldRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(fieldRules).forEach(fieldName => {
    const value = formData[fieldName];
    const result = validateField(value, fieldRules[fieldName]);
    
    if (!result.valid) {
      errors[fieldName] = result.message;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Common form field configurations
 */
export const FormFieldConfigs = {
  carrier: {
    company_name: { ...ValidationRules.companyName, label: "Company Name" },
    mc_number: { ...ValidationRules.mcNumber, label: "MC Number" },
    dot_number: { ...ValidationRules.dotNumber, label: "DOT Number" },
    contact_name: { ...ValidationRules.contactName, label: "Contact Name" },
    email: { ...ValidationRules.email, label: "Email" },
    phone: { ...ValidationRules.phone, label: "Phone" },
    insurance_expiration: { ...ValidationRules.date, required: true, label: "Insurance Expiration" }
  },
  
  driver: {
    full_name: { ...ValidationRules.contactName, label: "Full Name" },
    phone: { ...ValidationRules.phone, label: "Phone" },
    email: { ...ValidationRules.email, required: false, label: "Email" },
    cdl_number: { ...ValidationRules.cdlNumber, label: "CDL Number" },
    cdl_expiration: { ...ValidationRules.date, required: true, label: "CDL Expiration" },
    payment_rate: { ...ValidationRules.currency, required: true, label: "Payment Rate" }
  },

  shipper: {
    company_name: { ...ValidationRules.companyName, label: "Company Name" },
    contact_name: { ...ValidationRules.contactName, label: "Contact Name" },
    email: { ...ValidationRules.email, label: "Email" },
    phone: { ...ValidationRules.phone, label: "Phone" },
    credit_limit: { ...ValidationRules.currency, required: false, label: "Credit Limit" }
  },

  load: {
    pickup_location: { required: true, label: "Pickup Location" },
    dropoff_location: { required: true, label: "Delivery Location" },
    equipment_type: { required: true, label: "Equipment Type" },
    pickup_date: { ...ValidationRules.date, required: false, label: "Pickup Date" },
    delivery_date: { ...ValidationRules.date, required: false, label: "Delivery Date" },
    weight: { ...ValidationRules.weight, label: "Weight" },
    distance_miles: { ...ValidationRules.distance, label: "Distance" },
    customer_rate: { ...ValidationRules.currency, required: false, label: "Customer Rate" },
    carrier_pay: { ...ValidationRules.currency, required: false, label: "Carrier Pay" }
  }
};