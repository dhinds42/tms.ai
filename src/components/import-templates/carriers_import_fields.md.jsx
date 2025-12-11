# Carrier Import Fields Reference

## Overview
Import carrier/vendor records into TMS.ai for broker operations. Each row represents one carrier company.

---

## Field Definitions

### **carrier_name** ⭐ REQUIRED
- **Type:** String
- **Max Length:** 100 characters
- **Description:** Legal company name of the carrier
- **Example:** `ABC Trucking LLC`
- **Validation:** Must be unique, 2-100 characters

### **mc_number** ⭐ REQUIRED
- **Type:** String (numeric)
- **Format:** 5-7 digits
- **Description:** FMCSA Motor Carrier number
- **Example:** `123456` or `MC123456`
- **Validation:** Numeric only, 5-7 digits, must be valid with FMCSA

### **dot_number** ⭐ REQUIRED
- **Type:** String (numeric)
- **Format:** 5-8 digits
- **Description:** USDOT number
- **Example:** `1234567` or `DOT1234567`
- **Validation:** Numeric only, 5-8 digits

### **scac**
- **Type:** String
- **Format:** 2-4 uppercase letters
- **Description:** Standard Carrier Alpha Code
- **Example:** `ABCT`
- **Validation:** 2-4 uppercase letters, optional

### **primary_contact_name** ⭐ REQUIRED
- **Type:** String
- **Max Length:** 50 characters
- **Description:** Main contact person at carrier
- **Example:** `John Smith`

### **primary_contact_email** ⭐ REQUIRED
- **Type:** Email
- **Description:** Primary email for dispatch communication
- **Example:** `dispatch@abctrucking.com`
- **Validation:** Must be valid email format

### **primary_contact_phone** ⭐ REQUIRED
- **Type:** Phone
- **Format:** US phone number
- **Description:** Primary phone for carrier contact
- **Example:** `(555) 123-4567` or `555-123-4567`
- **Validation:** 10 digits minimum

### **billing_address_line1**
- **Type:** String
- **Description:** Street address line 1
- **Example:** `123 Industrial Parkway`

### **billing_address_line2**
- **Type:** String
- **Description:** Suite, unit, building number
- **Example:** `Suite 200`

### **billing_city**
- **Type:** String
- **Description:** City name
- **Example:** `Dallas`

### **billing_state**
- **Type:** String
- **Format:** 2-letter state code
- **Description:** US state abbreviation
- **Example:** `TX`
- **Validation:** Must be valid US state code (uppercase)

### **billing_postal_code**
- **Type:** String
- **Format:** 5 or 9 digits
- **Description:** ZIP or ZIP+4
- **Example:** `75201` or `75201-1234`

### **billing_country**
- **Type:** String
- **Default:** `USA`
- **Description:** Country code
- **Example:** `USA`, `CAN`, `MEX`

### **equipment_types**
- **Type:** Comma-separated list
- **Description:** Types of equipment carrier operates
- **Example:** `dry_van,reefer,flatbed`
- **Valid Values:** `dry_van`, `reefer`, `flatbed`, `step_deck`, `lowboy`, `tanker`, `auto_carrier`, `dump_truck`, `box_truck`, `cargo_van`, `hotshot`, `container_ship`

### **insurance_expiry_date** ⭐ REQUIRED
- **Type:** Date
- **Format:** YYYY-MM-DD
- **Description:** Liability insurance expiration date
- **Example:** `2026-06-30`
- **Validation:** Must be future date

### **cargo_coverage_amount**
- **Type:** Number (decimal)
- **Description:** Cargo insurance coverage limit
- **Example:** `100000.00`
- **Default:** `100000`

### **liability_coverage_amount**
- **Type:** Number (decimal)
- **Description:** Liability insurance coverage limit
- **Example:** `1000000.00`
- **Default:** `1000000`

### **w9_on_file**
- **Type:** Boolean
- **Description:** Whether W9 form is on file
- **Example:** `true` or `false`
- **Default:** `false`

### **contract_signed**
- **Type:** Boolean
- **Description:** Whether carrier contract is signed
- **Example:** `true` or `false`
- **Default:** `false`

### **payment_terms**
- **Type:** Enum
- **Valid Values:** `quick_pay`, `net_15`, `net_30`, `net_45`, `net_60`
- **Description:** Payment terms for this carrier
- **Example:** `net_30`
- **Default:** `net_30`

### **is_active**
- **Type:** Boolean
- **Description:** Whether carrier is currently active
- **Example:** `true` or `false`
- **Default:** `true`

### **notes**
- **Type:** String (long text)
- **Description:** Additional notes or comments
- **Example:** `Preferred carrier for Midwest lanes`

---

## Required Fields Summary
✅ carrier_name  
✅ mc_number  
✅ dot_number  
✅ primary_contact_name  
✅ primary_contact_email  
✅ primary_contact_phone  
✅ insurance_expiry_date  

---

## Common Mistakes to Avoid

1. ❌ **Missing MC/DOT numbers** - These are federally required for carrier authority
2. ❌ **Invalid email format** - Must include @ and domain
3. ❌ **Phone without area code** - Must have 10 digits
4. ❌ **Expired insurance dates** - Date must be in the future
5. ❌ **Invalid state codes** - Use 2-letter abbreviations (TX not Texas)
6. ❌ **Equipment types typos** - Use exact values from valid list above

---

## Sample Valid Row
```csv
carrier_name,mc_number,dot_number,scac,primary_contact_name,primary_contact_email,primary_contact_phone,billing_address_line1,billing_city,billing_state,billing_postal_code,billing_country,equipment_types,insurance_expiry_date,cargo_coverage_amount,liability_coverage_amount,w9_on_file,contract_signed,payment_terms,is_active,notes
ABC Trucking LLC,123456,1234567,ABCT,John Smith,dispatch@abctrucking.com,(555) 123-4567,123 Industrial Pkwy,Dallas,TX,75201,USA,"dry_van,reefer",2026-06-30,100000,1000000,true,true,net_30,true,Preferred carrier for Midwest lanes
``