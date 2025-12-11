# Load / Shipment Import Fields Reference

## Overview
Import load/shipment records into TMS.ai for bulk load creation or historical data migration.

---

## Required Fields Summary
✅ customer_name  
✅ origin_city  
✅ origin_state  
✅ destination_city  
✅ destination_state  
✅ pickup_date  
✅ delivery_date  
✅ equipment_type  

---

## Field Definitions

### Load Reference
load_reference | customer_name ⭐ | customer_code | carrier_name | carrier_mc_number

### Origin (Pickup)
origin_address | origin_city ⭐ | origin_state ⭐ | origin_postal_code | origin_country (default: USA)

### Destination (Delivery)
destination_address | destination_city ⭐ | destination_state ⭐ | destination_postal_code | destination_country

### Dates & Times
pickup_date ⭐ (YYYY-MM-DD) | pickup_time_start (HH:MM) | pickup_time_end (HH:MM)  
delivery_date ⭐ (YYYY-MM-DD) | delivery_time_start (HH:MM) | delivery_time_end (HH:MM)

### Load Details
equipment_type ⭐ (dry_van|reefer|flatbed|etc) | commodity_description | weight_lbs | total_pieces | total_pallets

### Rates & Charges
customer_rate | carrier_pay | fuel_surcharge | currency (USD|CAD|MXN) | rate_type (flat|per_mile) | distance_miles

### Status & Special Handling
status (available|assigned|dispatched|in_transit|delivered) | special_instructions

### Reefer Loads
temperature_min (°F) | temperature_max (°F) - Required if equipment_type=reefer

### Hazmat Loads
is_hazmat (true/false) | hazmat_class (Class 3, Class 8, etc) - Required if is_hazmat=true

### References
reference_numbers (comma-separated: PO-12345,BOL-67890)

---

## Common Mistakes
❌ Pickup date after delivery date  
❌ Carrier pay > customer rate (negative margin)  
❌ Hazmat without hazmat_class  
❌ Reefer without temperature range  
❌ Customer not found (import customers first)  

---

## Sample Valid Row
```csv
load_reference,customer_name,origin_city,origin_state,destination_city,destination_state,pickup_date,delivery_date,equipment_type,weight_lbs,customer_rate,carrier_pay,distance_miles,status
LD-001,XYZ Manufacturing,Chicago,IL,Detroit,MI,2025-12-15,2025-12-16,dry_van,42000,1500,1200,280,available
``