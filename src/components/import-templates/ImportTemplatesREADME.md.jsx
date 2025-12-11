# TMS.ai Data Import Templates

## Overview
Pre-formatted CSV templates for bulk importing data into TMS.ai. Use these templates to migrate existing data or onboard carriers, customers, drivers, equipment, and loads at scale.

---

## Available Templates

| Module | Template File | Required Fields |
|--------|---------------|-----------------|
| **Carriers** | `carriers_import_template.csv` | carrier_name, mc_number, dot_number, email, phone, insurance_expiry_date |
| **Customers** | `customers_import_template.csv` | customer_name, contact_name, email, phone |
| **Drivers** | `drivers_import_template.csv` | first_name, last_name, phone, cdl_number, cdl_expiration, medical_card_expiration |
| **Equipment** | `equipment_import_template.csv` | unit_number, equipment_type |
| **Loads** | `loads_import_template.csv` | origin_city, origin_state, destination_city, destination_state, pickup_date, equipment_type |

---

## Quick Start Guide

### Step 1: Download Template
Download the CSV template file for the entity you want to import (from components/import-templates/)

### Step 2: Fill in Your Data
- **Keep the header row** (first row with column names)
- **Add your data** starting from row 2
- **Follow format requirements** below

### Step 3: Save as UTF-8 CSV
- In Excel: File → Save As → CSV UTF-8 (Comma delimited)
- In Google Sheets: File → Download → Comma-separated values (.csv)

### Step 4: Import via Dashboard
1. Go to TMS.ai Dashboard → Entity Manager
2. Select the entity (Carriers, Customers, etc.)
3. Click **Import** button
4. Upload your CSV file
5. Review validation results

---

## File Format Requirements

### ✅ Valid CSV Format
```csv
carrier_name,mc_number,dot_number,primary_contact_email,primary_contact_phone,insurance_expiry_date
ABC Trucking LLC,123456,1234567,dispatch@abctrucking.com,(555) 123-4567,2026-06-30
XYZ Transport Inc,654321,7654321,contact@xyz.com,(555) 987-6543,2026-08-15
```

**Requirements:**
- ✅ Header row with exact column names (case-sensitive)
- ✅ Comma-delimited fields
- ✅ UTF-8 encoding
- ✅ One record per row
- ✅ No empty rows between data

### ❌ Common CSV Errors
```
❌ Semicolon delimiters (use commas)
❌ Pipe delimiters (use commas)  
❌ Empty file (must have header + data)
❌ Wrong encoding (must be UTF-8)
❌ Modified header names (must match template exactly)
```

---

## Field Value Formatting

### Dates
- **Format:** `YYYY-MM-DD`
- **Valid:** `2025-12-31`, `2026-01-15`
- **Invalid:** `12/31/2025`, `31-Dec-2025`

### Times
- **Format:** `HH:MM` (24-hour)
- **Valid:** `08:00`, `14:30`, `23:59`
- **Invalid:** `8am`, `2:30 PM`

### Booleans
- **Valid:** `true`, `false` (lowercase)
- **Invalid:** `True`, `FALSE`, `1`, `0`, `yes`, `no`

### Phone Numbers
- **Valid:** `(555) 123-4567`, `555-123-4567`, `5551234567`
- **Must include area code** (10+ digits)

### Email
- **Valid:** `user@company.com`
- **Invalid:** Missing @ or domain

### State Codes
- **Valid:** `TX`, `CA`, `IL` (2-letter uppercase)
- **Invalid:** `Texas`, `tx`

### Currency
- **Format:** Number without $ symbol
- **Valid:** `1500.00`, `1500`
- **Invalid:** `$1,500.00`

### Comma-Separated Lists
- **Format:** Items separated by commas (no spaces)
- **Valid:** `dry_van,reefer,flatbed`
- **Invalid:** `dry_van, reefer` (spaces after commas)

---

## Required vs Optional Fields

### Carriers Import - Required Fields ⭐
```
✅ carrier_name
✅ mc_number  
✅ dot_number
✅ primary_contact_name
✅ primary_contact_email
✅ primary_contact_phone
✅ insurance_expiry_date
```

### Customers Import - Required Fields ⭐
```
✅ customer_name
✅ primary_contact_name
✅ primary_contact_email
✅ primary_contact_phone
```

### Drivers Import - Required Fields ⭐
```
✅ driver_first_name
✅ driver_last_name
✅ phone
✅ cdl_number
✅ cdl_state
✅ cdl_expiration
✅ medical_card_expiration
✅ payment_structure
✅ payment_rate
```

### Equipment Import - Required Fields ⭐
```
✅ unit_number
✅ equipment_type
```

### Loads Import - Required Fields ⭐
```
✅ customer_name
✅ origin_city
✅ origin_state
✅ destination_city
✅ destination_state
✅ pickup_date
✅ delivery_date
✅ equipment_type
```

---

## Validation & Error Handling

### Pre-Import Checks
The system validates:
1. ✅ File is valid CSV (comma-delimited, UTF-8)
2. ✅ Header row matches template
3. ✅ At least one data row exists
4. ✅ No completely empty rows

### Row Validation
Each row is checked for:
- ✅ Required fields populated
- ✅ Correct data types (numbers, dates, booleans)
- ✅ Valid enum values
- ✅ Format compliance (email, phone, date)
- ✅ Business logic (expiration dates in future, carrier pay < customer rate)

### Error Report Example
```
Import Results:
✅ 95 rows imported successfully
⚠️ 3 rows skipped (duplicates)
❌ 2 rows failed validation

Failed Rows:
Row 5: mc_number must be 5-7 digits (got '12')
Row 8: insurance_expiry_date is required
Row 12: Duplicate MC number: 999999
```

---

## Handling Duplicates

### Duplicate Detection Keys
- **Carriers:** MC number
- **Customers:** Customer name or customer code
- **Drivers:** CDL number
- **Equipment:** Unit number
- **Loads:** Load reference (if provided)

### Duplicate Resolution Options
1. **Skip** - Keep existing record, ignore import row
2. **Update** - Overwrite existing record with new data
3. **Fail** - Reject entire import if any duplicate found

**Default behavior:** Skip duplicates

---

## Import Order & Dependencies

### Recommended Sequence
```
1. Carriers (if broker mode)
   └─ Create carrier records first
   
2. Customers  
   └─ Create customer records
   
3. Drivers
   └─ Requires existing carrier (lookup by MC or name)
   
4. Equipment
   └─ Requires existing carrier or owner-operator
   
5. Loads
   └─ Requires existing customer
   └─ Optional: existing carrier (for pre-assigned loads)
```

**Why order matters:**
- Drivers need carriers to exist (foreign key)
- Loads need customers to exist (foreign key)
- Equipment needs owners to exist (foreign key)

---

## Common Import Scenarios

### Scenario 1: Onboarding New Broker Customer with Historical Loads

**Step 1:** Import customer
```csv
customer_name,primary_contact_name,primary_contact_email,primary_contact_phone,payment_terms
ACME Manufacturing,Bob Johnson,shipping@acme.com,(555) 111-2222,net_30
```

**Step 2:** Import historical loads
```csv
load_reference,customer_name,origin_city,origin_state,destination_city,destination_state,pickup_date,delivery_date,equipment_type,customer_rate,status
LD-001,ACME Manufacturing,Chicago,IL,Detroit,MI,2025-11-01,2025-11-02,dry_van,1500,delivered
LD-002,ACME Manufacturing,Dallas,TX,Houston,TX,2025-11-15,2025-11-16,reefer,2000,delivered
```

### Scenario 2: Carrier Fleet Import

**Step 1:** Import carrier
```csv
carrier_name,mc_number,dot_number,primary_contact_email,primary_contact_phone,insurance_expiry_date
ABC Trucking,123456,1234567,dispatch@abc.com,(555) 123-4567,2026-12-31
```

**Step 2:** Import equipment
```csv
unit_number,equipment_type,owner_carrier_mc,year,make,model
TRUCK-101,tractor,123456,2020,Freightliner,Cascadia
TRL-201,trailer_dry_van,123456,2019,Great Dane,Everest
```

**Step 3:** Import drivers
```csv
driver_first_name,driver_last_name,carrier_mc_number,cdl_number,cdl_state,cdl_expiration,medical_card_expiration,payment_structure,payment_rate
John,Smith,123456,S123456789,TX,2027-06-30,2026-12-31,per_mile,0.50
```

---

## Troubleshooting Guide

### Error: "CSV Parsing Error - Unable to detect dialect"
**Cause:** File is empty, wrong encoding, or wrong delimiter  
**Solution:**
1. Open file in text editor - should see comma-separated values
2. Check file is not empty
3. Re-save as UTF-8 CSV
4. Ensure commas are delimiters, not semicolons

### Error: "Required field missing"
**Cause:** Blank required field  
**Solution:** Fill in all required fields (marked with ⭐)

### Error: "Invalid email format"
**Cause:** Email doesn't match pattern  
**Solution:** Use format: `user@domain.com`

### Error: "Carrier not found"
**Cause:** Referenced carrier doesn't exist (driver/equipment import)  
**Solution:** Import carriers first, ensure MC number or name matches exactly

### Error: "Duplicate MC number"
**Cause:** Carrier with same MC already exists  
**Solution:** Choose "Update" mode or "Skip" duplicates

### Error: "Date must be in future"
**Cause:** Expiration date is in the past  
**Solution:** Use future date for insurance/CDL/medical card expiration

---

## Best Practices

1. **Test with sample data first** - Import 5-10 rows to verify format
2. **Keep backups** - Save original CSV before modifications
3. **Use consistent formats** - Standardize phone, date, state codes
4. **Clean data before import** - Remove duplicates, fix typos
5. **Import in stages** - Do carriers → customers → drivers → loads
6. **Review error logs** - Fix failed rows and re-import
7. **Validate addresses** - Use USPS validation before import (if possible)

---

## Template Downloads

All templates are located in: `components/import-templates/`

- `carriers_import_template.csv`
- `customers_import_template.csv`
- `drivers_import_template.csv`
- `equipment_import_template.csv`
- `loads_import_template.csv`

**Field Documentation:**
- See individual `*_import_fields.md` files for detailed field descriptions
- See `import_schema_notes.md` for technical implementation details

---

## Support

For import assistance:
- 📖 Review template documentation
- 🔧 Check error logs for specific row failures
- 📧 Contact support with CSV file and error report

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-11