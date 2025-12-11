# TMS.ai Import Schema & Implementation Notes

## Overview
Technical guide for implementing CSV import pipeline. Maps CSV templates to TMS.ai entity schemas with validation, error handling, and duplicate resolution strategies.

---

## Import Pipeline Algorithm

```javascript
async function importCSV(entityType, csvFile, options = {}) {
  const results = {
    totalRows: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };
  
  // 1. Parse & validate CSV structure
  const rows = await parseCSVWithValidation(csvFile);
  results.totalRows = rows.length;
  
  // 2. Get entity-specific validator and mapper
  const validator = getValidator(entityType);
  const mapper = getFieldMapper(entityType);
  
  // 3. Process rows with batching
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    
    for (const row of batch) {
      try {
        // Validate
        const errors = await validator(row);
        if (errors.length > 0) {
          results.failed++;
          results.errors.push({ row: i + 2, errors });
          continue;
        }
        
        // Map and resolve references
        const entityData = await mapper(row);
        
        // Check duplicates
        const duplicate = await checkDuplicate(entityType, entityData);
        
        if (duplicate) {
          if (options.duplicateMode === 'update') {
            await updateEntity(entityType, duplicate.id, entityData);
            results.imported++;
          } else {
            results.skipped++;
          }
        } else {
          await createEntity(entityType, entityData);
          results.imported++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push({ row: i + 2, errors: [err.message] });
      }
    }
  }
  
  return results;
}
```

---

## Entity-Specific Mappers

### Carrier Mapper
```javascript
async function mapCarrierRow(row) {
  return {
    company_name: row.carrier_name,
    mc_number: normalizeM CNumber(row.mc_number),
    dot_number: normalizeDOTNumber(row.dot_number),
    scac_code: row.scac?.toUpperCase(),
    primary_contact: row.primary_contact_name,
    email: row.primary_contact_email,
    phone: formatPhone(row.primary_contact_phone),
    address: {
      street: row.billing_address_line1,
      secondary: row.billing_address_line2,
      city: row.billing_city,
      state: row.billing_state?.toUpperCase(),
      zip: row.billing_postal_code,
      country: row.billing_country || 'USA'
    },
    equipment_types: parseList(row.equipment_types),
    insurance_expiration: row.insurance_expiry_date,
    insurance_cargo_limit: parseFloat(row.cargo_coverage_amount) || 100000,
    insurance_liability_limit: parseFloat(row.liability_coverage_amount) || 1000000,
    w9_received: parseBoolean(row.w9_on_file),
    carrier_agreement_signed: parseBoolean(row.contract_signed),
    payment_terms: row.payment_terms || 'net_30',
    is_active: parseBoolean(row.is_active, true),
    notes: row.notes
  };
}
```

### Driver Mapper
```javascript
async function mapDriverRow(row) {
  // Resolve carrier
  let carrierId = null;
  if (row.carrier_mc_number) {
    const carrier = await base44.entities.Carrier.filter({ 
      mc_number: normalizeMCNumber(row.carrier_mc_number) 
    });
    if (carrier.length > 0) carrierId = carrier[0].id;
  }
  if (!carrierId) {
    throw new Error(`Carrier not found: ${row.carrier_name || row.carrier_mc_number}`);
  }
  
  return {
    party_id: carrierId,
    first_name: row.driver_first_name,
    last_name: row.driver_last_name,
    email: row.email,
    phone: formatPhone(row.phone),
    cdl_number: row.cdl_number.toUpperCase(),
    cdl_state: row.cdl_state.toUpperCase(),
    cdl_class: row.cdl_class || 'A',
    cdl_expiration: row.cdl_expiration,
    endorsements: parseList(row.endorsements),
    medical_card_expiry: row.medical_card_expiration,
    home_terminal: {
      city: row.home_terminal_city,
      state: row.home_terminal_state?.toUpperCase()
    },
    payment_structure: row.payment_structure,
    payment_rate: parseFloat(row.payment_rate),
    is_owner_operator: parseBoolean(row.is_owner_operator),
    equipment_assigned: row.equipment_assigned,
    is_active: parseBoolean(row.is_active, true),
    notes: row.notes
  };
}
```

### Load Mapper
```javascript
async function mapLoadRow(row) {
  // Resolve customer
  let customerId = null;
  const customer = await base44.entities.Shipper.filter({ 
    company_name: row.customer_name 
  });
  
  if (customer.length > 0) {
    customerId = customer[0].id;
  } else if (options.autoCreateCustomer) {
    const newCustomer = await base44.entities.Shipper.create({
      company_name: row.customer_name,
      contact_name: 'Import',
      email: 'import@placeholder.com',
      phone: '000-000-0000'
    });
    customerId = newCustomer.id;
  } else {
    throw new Error(`Customer not found: ${row.customer_name}`);
  }
  
  // Resolve carrier (optional)
  let carrierId = null;
  if (row.carrier_name || row.carrier_mc_number) {
    const carrier = await base44.entities.Carrier.filter({ 
      mc_number: row.carrier_mc_number 
    });
    if (carrier.length > 0) carrierId = carrier[0].id;
  }
  
  return {
    load_number: row.load_reference,
    customer_id: customerId,
    carrier_id: carrierId,
    pickup_location: {
      address: row.origin_address,
      city: row.origin_city,
      state: row.origin_state?.toUpperCase(),
      zip: row.origin_postal_code,
      country: row.origin_country || 'USA'
    },
    dropoff_location: {
      address: row.destination_address,
      city: row.destination_city,
      state: row.destination_state?.toUpperCase(),
      zip: row.destination_postal_code,
      country: row.destination_country || 'USA'
    },
    pickup_date: combineDateAndTime(row.pickup_date, row.pickup_time_start),
    delivery_date: combineDateAndTime(row.delivery_date, row.delivery_time_start),
    equipment_type: row.equipment_type,
    commodity: row.commodity_description,
    weight: parseInt(row.weight_lbs),
    total_pieces: parseInt(row.total_pieces),
    total_pallets: parseInt(row.total_pallets),
    customer_rate: parseFloat(row.customer_rate),
    carrier_pay: parseFloat(row.carrier_pay),
    distance_miles: parseInt(row.distance_miles),
    status: row.status || 'available',
    special_instructions: row.special_instructions,
    temperature_min: parseFloat(row.temperature_min),
    temperature_max: parseFloat(row.temperature_max),
    hazmat_flag: parseBoolean(row.is_hazmat),
    hazmat_class: row.hazmat_class
  };
}
```

---

## Utility Functions

### Phone Formatting
```javascript
function formatPhone(phone) {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}
```

### MC/DOT Normalization
```javascript
function normalizeMCNumber(value) {
  return value.replace(/[^0-9]/g, '');
}

function normalizeDOTNumber(value) {
  return value.replace(/[^0-9]/g, '');
}
```

### List Parsing
```javascript
function parseList(value) {
  if (!value) return [];
  return value.split(',').map(v => v.trim()).filter(v => v);
}
```

### Boolean Parsing
```javascript
function parseBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const str = String(value).toLowerCase();
  return ['true', '1', 'yes', 'y'].includes(str);
}
```

---

## Validation Implementations

### Email Validator
```javascript
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}
```

### MC Number Validator
```javascript
function validateMCNumber(mc) {
  const cleaned = mc.replace(/[^0-9]/g, '');
  return cleaned.length >= 5 && cleaned.length <= 7;
}
```

### Future Date Validator
```javascript
function isFutureDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}
```

---

## Duplicate Check Strategies

### By Unique Business Key
```javascript
async function checkDuplicateCarrier(data) {
  // Check by MC number (unique)
  const existing = await base44.entities.Carrier.filter({ 
    mc_number: data.mc_number 
  });
  return existing.length > 0 ? existing[0] : null;
}

async function checkDuplicateDriver(data) {
  // Check by CDL number (unique)
  const existing = await base44.entities.Driver.filter({ 
    cdl_number: data.cdl_number 
  });
  return existing.length > 0 ? existing[0] : null;
}
```

---

## Error Handling

### Graceful Degradation
```javascript
try {
  const result = await importRow(row);
  results.imported++;
} catch (error) {
  // Log error but continue processing
  results.failed++;
  results.errors.push({
    row: rowNumber,
    data: row,
    error: error.message
  });
  // Don't throw - process remaining rows
}
```

### Rollback on Critical Failure
```javascript
// For transaction-critical imports
const transaction = await db.beginTransaction();

try {
  for (const row of rows) {
    await importRow(row, transaction);
  }
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw new Error('Import failed - all changes rolled back');
}
```

---

## Performance Considerations

### Batch Processing
```javascript
// Process in chunks of 100
const batchSize = 100;
for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  await base44.entities.Carrier.bulkCreate(batch);
}
```

### Caching Reference Lookups
```javascript
const carrierCache = new Map();

async function getCachedCarrier(mcNumber) {
  if (carrierCache.has(mcNumber)) {
    return carrierCache.get(mcNumber);
  }
  const carrier = await base44.entities.Carrier.filter({ mc_number: mcNumber });
  if (carrier.length > 0) {
    carrierCache.set(mcNumber, carrier[0]);
    return carrier[0];
  }
  return null;
}
```

---

## Security & Compliance

### Tenant Isolation
```javascript
// Always scope imports to user's tenant
async function importWithTenantIsolation(entityType, data, user) {
  const tenantId = user.tenant_id;
  
  return data.map(record => ({
    ...record,
    tenant_id: tenantId
  }));
}
```

### Audit Logging
```javascript
// Log all import actions
await base44.entities.AuditLog.create({
  action: 'csv_import',
  entity_type: entityType,
  user_id: user.id,
  records_imported: results.imported,
  records_failed: results.failed,
  file_name: csvFile.name,
  timestamp: new Date().toISOString()
});
```

---

## Testing Strategy

### Unit Tests
```javascript
describe('Carrier Row Validation', () => {
  test('rejects missing MC number', () => {
    const row = { carrier_name: 'ABC' };
    expect(validateCarrierRow(row)).toContain('mc_number is required');
  });
  
  test('rejects expired insurance', () => {
    const row = {
      carrier_name: 'ABC',
      mc_number: '123456',
      insurance_expiry_date: '2020-01-01'
    };
    expect(validateCarrierRow(row)).toContain('insurance must be future date');
  });
});
```

### Integration Tests
```javascript
describe('Full Import Flow', () => {
  test('imports valid carrier CSV', async () => {
    const csv = `carrier_name,mc_number,dot_number,email,phone,insurance_expiry_date
ABC Trucking,123456,1234567,test@abc.com,(555) 123-4567,2026-12-31`;
    
    const result = await importCSV('carrier', csv);
    expect(result.imported).toBe(1);
    expect(result.failed).toBe(0);
  });
});
```

---

## Future Enhancements

1. **Auto-Column Mapping** - Fuzzy match column names
2. **Preview Mode** - Show first 10 rows before committing
3. **Progress Tracking** - WebSocket updates for large imports
4. **FTP/SFTP Integration** - Scheduled automated imports
5. **Template Generator** - Export current data as template

---

**Version:** 1.0.0  
**Maintained By:** Backend Engineering