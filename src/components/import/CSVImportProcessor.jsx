/**
 * CSV Import Processor
 * Client-side CSV parsing, validation, and bulk import engine
 */

import { base44 } from '@/api/base44Client';
import { ValidationRules, validateField } from '@/components/design-system/ValidationRules';

/**
 * Parse CSV file to rows
 */
export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let text = e.target.result;
        
        // Remove BOM if present
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1);
        }
        
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have a header row and at least one data row'));
          return;
        }
        
        // Parse header
        const headers = parseCSVLine(lines[0]);
        const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
        
        // Parse data rows
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row = { _rowNumber: i + 1 };
          
          headers.forEach((header, idx) => {
            row[header.trim()] = values[idx] || '';
          });
          
          rows.push(row);
        }
        
        resolve({ headers, rows });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

/**
 * Entity-specific validation schemas
 */
const ENTITY_SCHEMAS = {
  Carrier: {
    requiredFields: ['carrier_name', 'mc_number', 'dot_number', 'primary_contact_email', 'primary_contact_phone', 'insurance_expiry_date'],
    uniqueKey: 'mc_number',
    validations: {
      carrier_name: { ...ValidationRules.companyName, required: true },
      mc_number: { ...ValidationRules.mcNumber, required: true },
      dot_number: { ...ValidationRules.dotNumber, required: true },
      primary_contact_email: { ...ValidationRules.email, required: true },
      primary_contact_phone: { ...ValidationRules.phone, required: true },
      insurance_expiry_date: { ...ValidationRules.futureDate, required: true },
      equipment_types: { 
        validate: (val) => {
          if (!val) return true;
          const types = val.split(',').map(t => t.trim());
          const valid = ['dry_van', 'reefer', 'flatbed', 'step_deck', 'lowboy', 'tanker'];
          return types.every(t => valid.includes(t));
        },
        message: 'Invalid equipment type'
      },
      is_active: { type: 'boolean' }
    },
    mapper: (row) => ({
      company_name: row.carrier_name,
      mc_number: row.mc_number?.replace(/[^0-9]/g, ''),
      dot_number: row.dot_number?.replace(/[^0-9]/g, ''),
      scac_code: row.scac?.toUpperCase(),
      primary_contact: row.primary_contact_name,
      email: row.primary_contact_email,
      phone: row.primary_contact_phone,
      equipment_types: row.equipment_types?.split(',').map(t => t.trim()).filter(Boolean),
      insurance_expiration: row.insurance_expiry_date,
      is_active: parseBoolean(row.is_active, true)
    })
  },
  
  Shipper: {
    requiredFields: ['customer_name', 'primary_contact_name', 'primary_contact_email', 'primary_contact_phone'],
    uniqueKey: 'customer_code',
    fallbackKey: 'company_name',
    validations: {
      customer_name: { ...ValidationRules.companyName, required: true },
      primary_contact_name: { ...ValidationRules.contactName, required: true },
      primary_contact_email: { ...ValidationRules.email, required: true },
      primary_contact_phone: { ...ValidationRules.phone, required: true },
      credit_limit: { ...ValidationRules.currency, required: false },
      is_active: { type: 'boolean' }
    },
    mapper: (row) => ({
      company_name: row.customer_name,
      customer_code: row.customer_code,
      contact_name: row.primary_contact_name,
      email: row.primary_contact_email,
      phone: row.primary_contact_phone,
      credit_limit: parseFloat(row.credit_limit) || 0,
      is_active: parseBoolean(row.is_active, true)
    })
  },
  
  Driver: {
    requiredFields: ['driver_first_name', 'driver_last_name', 'phone', 'cdl_number', 'cdl_state', 'cdl_expiration', 'medical_card_expiration', 'payment_structure', 'payment_rate'],
    uniqueKey: 'cdl_number',
    validations: {
      driver_first_name: { ...ValidationRules.contactName, required: true },
      driver_last_name: { ...ValidationRules.contactName, required: true },
      phone: { ...ValidationRules.phone, required: true },
      email: { ...ValidationRules.email, required: false },
      cdl_number: { ...ValidationRules.cdlNumber, required: true },
      cdl_state: { ...ValidationRules.stateCode, required: true },
      cdl_expiration: { ...ValidationRules.futureDate, required: true },
      medical_card_expiration: { ...ValidationRules.futureDate, required: true },
      payment_rate: { ...ValidationRules.currency, required: true },
      is_active: { type: 'boolean' }
    },
    mapper: (row) => ({
      first_name: row.driver_first_name,
      last_name: row.driver_last_name,
      phone: row.phone,
      email: row.email,
      cdl_number: row.cdl_number?.toUpperCase(),
      cdl_state: row.cdl_state?.toUpperCase(),
      cdl_expiration: row.cdl_expiration,
      medical_card_expiry: row.medical_card_expiration,
      payment_structure: row.payment_structure || 'per_load',
      payment_rate: parseFloat(row.payment_rate),
      is_owner_operator: parseBoolean(row.is_owner_operator, false),
      is_active: parseBoolean(row.is_active, true)
    })
  },
  
  Load: {
    requiredFields: ['customer_name', 'origin_city', 'origin_state', 'destination_city', 'destination_state', 'pickup_date', 'delivery_date', 'equipment_type'],
    uniqueKey: 'load_reference',
    validations: {
      customer_name: { required: true },
      origin_city: { required: true },
      origin_state: { ...ValidationRules.stateCode, required: true },
      destination_city: { required: true },
      destination_state: { ...ValidationRules.stateCode, required: true },
      pickup_date: { ...ValidationRules.date, required: true },
      delivery_date: { ...ValidationRules.date, required: true },
      equipment_type: { required: true },
      weight_lbs: { ...ValidationRules.weight, required: false },
      customer_rate: { ...ValidationRules.currency, required: false },
      carrier_pay: { ...ValidationRules.currency, required: false }
    },
    mapper: (row) => ({
      load_number: row.load_reference,
      pickup_location: {
        city: row.origin_city,
        state: row.origin_state?.toUpperCase(),
        zip: row.origin_postal_code
      },
      dropoff_location: {
        city: row.destination_city,
        state: row.destination_state?.toUpperCase(),
        zip: row.destination_postal_code
      },
      pickup_date: row.pickup_date,
      delivery_date: row.delivery_date,
      equipment_type: row.equipment_type,
      commodity: row.commodity_description,
      weight: parseInt(row.weight_lbs) || 0,
      customer_rate: parseFloat(row.customer_rate) || 0,
      carrier_pay: parseFloat(row.carrier_pay) || 0,
      status: row.status || 'available'
    })
  }
};

/**
 * Validate a single row against entity schema
 */
export function validateRow(entityType, row) {
  const schema = ENTITY_SCHEMAS[entityType];
  if (!schema) {
    throw new Error(`Unknown entity type: ${entityType}`);
  }
  
  const errors = [];
  const warnings = [];
  
  // Check required fields
  schema.requiredFields.forEach(field => {
    if (!row[field] || row[field].toString().trim() === '') {
      errors.push({
        field,
        message: `${field} is required`
      });
    }
  });
  
  // Run field-specific validations
  Object.keys(schema.validations).forEach(field => {
    const validation = schema.validations[field];
    const value = row[field];
    
    if (!value && !validation.required) return;
    
    const result = validateField(value, validation);
    if (!result.valid) {
      errors.push({
        field,
        message: result.message
      });
    }
  });
  
  // Business logic validations
  if (entityType === 'Load') {
    const pickupDate = new Date(row.pickup_date);
    const deliveryDate = new Date(row.delivery_date);
    if (deliveryDate < pickupDate) {
      errors.push({
        field: 'delivery_date',
        message: 'Delivery date cannot be before pickup date'
      });
    }
    
    const customerRate = parseFloat(row.customer_rate);
    const carrierPay = parseFloat(row.carrier_pay);
    if (customerRate > 0 && carrierPay > customerRate) {
      warnings.push({
        field: 'carrier_pay',
        message: 'Carrier pay exceeds customer rate (negative margin)'
      });
    }
  }
  
  return { errors, warnings };
}

/**
 * Dry run - validate all rows without committing
 */
export async function dryRun(entityType, rows) {
  const results = {
    totalRows: rows.length,
    validRows: 0,
    invalidRows: 0,
    errors: [],
    warnings: []
  };
  
  rows.forEach((row, idx) => {
    const { errors, warnings } = validateRow(entityType, row);
    
    if (errors.length > 0) {
      results.invalidRows++;
      errors.forEach(err => {
        results.errors.push({
          row: row._rowNumber || idx + 2,
          field: err.field,
          message: err.message
        });
      });
    } else {
      results.validRows++;
    }
    
    warnings.forEach(warn => {
      results.warnings.push({
        row: row._rowNumber || idx + 2,
        field: warn.field,
        message: warn.message
      });
    });
  });
  
  return results;
}

/**
 * Commit import - validate and create/update entities
 */
export async function commitImport(entityType, rows, options = {}) {
  const { mode = 'upsert', strict = false } = options;
  
  const results = {
    totalRows: rows.length,
    validRows: 0,
    invalidRows: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    warnings: []
  };
  
  // First pass - validate all rows
  const validatedRows = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { errors, warnings } = validateRow(entityType, row);
    
    if (errors.length > 0) {
      results.invalidRows++;
      errors.forEach(err => {
        results.errors.push({
          row: row._rowNumber || i + 2,
          field: err.field,
          message: err.message
        });
      });
      
      if (strict) {
        return results; // Stop immediately in strict mode
      }
    } else {
      results.validRows++;
      validatedRows.push(row);
    }
    
    warnings.forEach(warn => {
      results.warnings.push({
        row: row._rowNumber || i + 2,
        field: warn.field,
        message: warn.message
      });
    });
  }
  
  // If strict mode and any errors, stop
  if (strict && results.invalidRows > 0) {
    return results;
  }
  
  // Second pass - map and commit valid rows
  const schema = ENTITY_SCHEMAS[entityType];
  const toCreate = [];
  const toUpdate = [];
  
  for (const row of validatedRows) {
    try {
      const entityData = schema.mapper(row);
      
      // Check for duplicates if upsert/update mode
      if (mode === 'upsert' || mode === 'update') {
        const uniqueValue = row[schema.uniqueKey];
        if (uniqueValue) {
          const existing = await base44.entities[entityType].filter({ 
            [schema.uniqueKey]: uniqueValue 
          });
          
          if (existing.length > 0) {
            if (mode === 'upsert' || mode === 'update') {
              toUpdate.push({ id: existing[0].id, data: entityData });
            } else {
              results.skipped++;
            }
            continue;
          }
        }
      }
      
      toCreate.push(entityData);
    } catch (err) {
      results.errors.push({
        row: row._rowNumber,
        field: 'mapping',
        message: err.message
      });
    }
  }
  
  // Bulk create
  if (toCreate.length > 0) {
    try {
      const created = await base44.entities[entityType].bulkCreate(toCreate);
      results.created = created.length;
    } catch (err) {
      results.errors.push({
        row: 0,
        field: 'bulk_create',
        message: err.message
      });
    }
  }
  
  // Bulk update
  for (const update of toUpdate) {
    try {
      await base44.entities[entityType].update(update.id, update.data);
      results.updated++;
    } catch (err) {
      results.errors.push({
        row: 0,
        field: 'update',
        message: err.message
      });
    }
  }
  
  return results;
}

/**
 * Helper: parse boolean values
 */
function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const str = String(value).toLowerCase().trim();
  return ['true', '1', 'yes', 'y'].includes(str);
}