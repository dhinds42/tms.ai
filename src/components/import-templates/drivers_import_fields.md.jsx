# Driver Import Fields Reference

## Overview
Import driver records into TMS.ai. Each row represents one driver associated with a carrier.

---

## Required Fields Summary
✅ driver_first_name  
✅ driver_last_name  
✅ phone  
✅ cdl_number  
✅ cdl_state  
✅ cdl_expiration  
✅ medical_card_expiration  
✅ payment_structure  
✅ payment_rate  

---

## Field Definitions

### Basic Info
driver_first_name ⭐ | driver_last_name ⭐ | driver_code | email | phone ⭐

### Carrier Association  
carrier_name | carrier_mc_number (one required to link driver to carrier)

### CDL Information
cdl_number ⭐ (8-15 chars) | cdl_state ⭐ (2-letter) | cdl_class (A/B/C) | cdl_expiration ⭐ (YYYY-MM-DD) | endorsements (H,N,X,T,P,S)

### Medical & Terminal
medical_card_expiration ⭐ (YYYY-MM-DD, future date) | home_terminal_city | home_terminal_state

### Payment
payment_structure ⭐ (percentage|per_mile|per_load|hourly) | payment_rate ⭐ (> 0)

### Status
is_owner_operator | equipment_assigned | is_active | notes

---

## Common Mistakes
❌ Using full_name instead of first_name + last_name  
❌ Expired CDL or medical card dates  
❌ Missing carrier association  
❌ Invalid CDL format  

---

## Sample Valid Row
```csv
driver_first_name,driver_last_name,phone,carrier_mc_number,cdl_number,cdl_state,cdl_expiration,medical_card_expiration,payment_structure,payment_rate,is_active
John,Smith,(555) 234-5678,123456,S123456789,TX,2027-03-15,2026-12-31,per_mile,0.50,true
``