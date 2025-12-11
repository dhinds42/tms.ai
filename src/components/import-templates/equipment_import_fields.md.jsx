# Equipment / Assets Import Fields Reference

## Overview
Import trucks, trailers, and assets into TMS.ai fleet management.

---

## Required Fields Summary
✅ unit_number  
✅ equipment_type  

---

## Field Definitions

### Basic Info
unit_number ⭐ (unique) | equipment_type ⭐ (tractor|trailer_dry_van|trailer_reefer|etc)

### Registration
license_plate | license_state (2-letter) | vin (17 chars) | year (1990-2030)

### Specifications
make | model | fuel_type (diesel|gasoline|electric|n/a) | gross_vehicle_weight | trailer_length_ft

### Ownership
owner_type (company|owner_operator|leased) | owner_name | owner_carrier_mc

### Accounting
purchase_date (YYYY-MM-DD) | purchase_price | current_odometer

### Status
is_active | notes

---

## Valid Equipment Types
`tractor`, `trailer_dry_van`, `trailer_reefer`, `trailer_flatbed`, `trailer_step_deck`, `trailer_lowboy`, `trailer_tanker`, `straight_truck`, `cargo_van`, `sprinter`

---

## Sample Valid Rows
```csv
unit_number,equipment_type,license_plate,license_state,vin,year,make,model,owner_type,owner_carrier_mc,is_active
TRUCK-101,tractor,ABC1234,TX,1HGBH41JXMN109186,2020,Freightliner,Cascadia,company,123456,true
TRL-456,trailer_dry_van,XYZ5678,TX,1GTG5BE38CF123456,2019,Great Dane,Everest,company,123456,true
``