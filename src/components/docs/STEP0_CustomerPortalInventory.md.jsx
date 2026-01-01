# STEP 0 - CUSTOMER PORTAL PRICING SYSTEM INVENTORY
**Date**: 2026-01-01
**Scope**: Multi-Modal Freight Pricing Engine

---

## A) EXISTING CUSTOMER PORTAL ENTITIES

### ✅ ENTITIES PRESENT
| Entity | Status | Key Fields | Notes |
|--------|--------|------------|-------|
| **Shipper** | ✅ Exists | company_name, payment_terms, credit_limit, commodities | Customer/shipper entity |
| **Quote** | ✅ Exists | mode, quoted_rate, margin, fuel_surcharge, accessorials | Basic quote structure |
| **Invoice** | ✅ Exists | invoice_number, total, subtotal, fuel_surcharge, accessorials_total | Basic invoice structure |
| **Commodity** | ✅ Exists | commodity_type (includes grain), hazmat_class | Basic commodity tracking |
| **CustomerContract** | ✅ Exists | fuel_surcharge_basis, payment_terms_days | Contract framework |
| **LaneRate** | ✅ Exists | origin/dest, customer_rate, carrier_rate, margin | Lane-based pricing |
| **Load** | ✅ Exists | mode, equipment_type, weight, distance_miles | Shipment execution |

### ❌ MISSING ENTITIES
- **QuoteLineItem** (need separate entity for itemized quote charges)
- **InvoiceLineItem** (need separate entity for itemized invoice charges)

---

## B) EXISTING QUOTE FLOW

### Current Implementation
1. **Creation**: ShipperPortal → Load.create() with customer_rate
2. **Storage**: Quote entity stores quoted_rate, margin, fuel_surcharge (single number)
3. **Presentation**: ShipperLoadForm displays basic quote fields

### ⚠️ GAPS IDENTIFIED
- ❌ No multi-modal pricing methods (only basic FTL)
- ❌ No itemized line items (charges stored as flat numbers)
- ❌ No pricing snapshot versioning
- ❌ No explain_calculation_json
- ❌ No server-side pricing dispatcher
- ❌ No mode-specific pricing logic

---

## C) EXISTING INVOICE FLOW

### Current Implementation
1. **Generation**: Invoice.beforeCreate hook computes totals
2. **Storage**: subtotal, fuel_surcharge, accessorials_total, total
3. **Logic**: `calcInvoiceTotal()` in shared/math/invoice.js

### ⚠️ GAPS IDENTIFIED
- ❌ No mode-specific pricing recomputation
- ❌ No itemized_charges_json persistence
- ❌ No variance tracking vs quote
- ❌ No pricing_snapshot_version

---

## D) EXISTING PRICING FIELDS (Quote Entity)

### ✅ PRESENT
- mode (enum: FTL, LTL, Intermodal, Courier, Drayage, Air, Ocean)
- commodity (string)
- weight (number, lbs)
- equipment_type (enum)
- quoted_rate (number)
- fuel_surcharge (number)
- accessorials (array of strings - NOT itemized amounts)

### ❌ MISSING CRITICAL FIELDS
- transport_mode (TRUCK/RAIL/BARGE/OCEAN/AIR standard enum)
- pricing_method (FTL_RPM, LTL_CWT, RAIL_PER_CAR, etc.)
- loaded_miles, deadhead_miles
- weight_unit (LBS/KG/MT)
- volume_value, volume_unit (CFT/CBM)
- dimensions (length, width, height, dim_unit)
- density_value, density_unit
- nmfc_class (for LTL)
- bushels, short_tons, metric_tons
- railcars_count, barges_count, containers_count
- container_type (20GP, 40GP, 40HC, etc.)
- rpm_cents, flat_cents, rate_per_cwt_cents, rate_per_car_cents, etc.
- chargeable_weight_value (for air)
- minimum_charge_cents
- pricing_snapshot_version
- itemized_charges_json
- explain_calculation_json
- computed_total_cents

---

## E) EXISTING PRICING LOGIC

### ✅ AVAILABLE MATH UTILITIES
| Module | File | Functions |
|--------|------|-----------|
| **Rates** | `functions/shared/math/rates.js` | calculateLoadFinancials, validateLoadFinancials, calculateRatePerMile |
| **FSC** | `functions/shared/math/fsc.js` | calcFSC, calcFSCFromIndex, getEffectiveFSC |
| **Money** | `functions/shared/math/money.js` | add, subtract, multiply, percentage, dollarsToCents, centsToDollars |
| **Rounding** | `functions/shared/math/rounding.js` | roundCurrency |
| **Invoice** | `functions/shared/math/invoice.js` | calcInvoiceTotal, calcBalanceDue, detectDuplicateInvoice |
| **Accessorials** | `functions/shared/math/accessorials.js` | (exists - need to verify) |

### ❌ MISSING MODE-SPECIFIC PRICING
- ❌ Truck LTL CWT calculation (weight/100 * rate_per_cwt)
- ❌ Rail pricing (per car, intermodal, ton-mile)
- ❌ Barge pricing (per barge, index-based per ton)
- ❌ Ocean pricing (FCL per container, LCL W/M, bulk per MT)
- ❌ Air pricing (dim weight vs actual, chargeable weight)
- ❌ Grain-specific methods (per bushel, per ton, banded CPM)
- ❌ Density calculation (weight / volume)
- ❌ Dimensional weight calculation (L×W×H / dim_factor)
- ❌ W/M calculation for ocean LCL

---

## F) EXISTING AUDIT/LOGGING

### ✅ PRESENT
- **AuditLog entity**: Exists with entity_type, action, actor, metadata
- **logFinancialChange()**: Used in Invoice.beforeCreate hook
- **Audit events**: CREATE, UPDATE logged for invoices

### ⚠️ GAPS
- ❌ No QUOTE_PRICING_COMPUTED event
- ❌ No INVOICE_VARIANCE_FLAGGED event
- ❌ No pricing snapshot versioning in audit trail

---

## G) EXISTING TEST COVERAGE

### ✅ TEST INFRASTRUCTURE
- Tests exist in `functions/__tests__/` directory
- Test files for: math, security, eligibility, alerts
- Math tests: money.test.js, rates.test.js, accessorials.test.js

### ❌ MISSING TESTS
- ❌ Multi-modal pricing (truck LTL, rail, barge, ocean, air, grain)
- ❌ Density calculations
- ❌ Dimensional weight calculations
- ❌ W/M calculations
- ❌ Quote pricing computation
- ❌ Invoice variance detection
- ❌ Mode-specific rounding invariants

---

## H) GAP SUMMARY - WHAT MUST BE BUILT

### 🔴 CRITICAL GAPS (MUST IMPLEMENT)

#### 1. Data Model Extensions
**Quote Entity** - Add Fields:
- transport_mode, pricing_method
- loaded_miles, weight_unit, volume_value, volume_unit
- dimensions (length, width, height, dim_unit)
- nmfc_class, bushels, metric_tons, railcars_count, barges_count, containers_count
- container_type, rate fields (rpm_cents, cwt_cents, etc.)
- pricing_snapshot_version, itemized_charges_json, explain_calculation_json, computed_total_cents

**Invoice Entity** - Add Fields:
- transport_mode, pricing_method
- itemized_charges_json, explain_calculation_json
- pricing_snapshot_version
- variance_cents, variance_reason

**NEW Entity - QuoteLineItem**:
- quote_id, line_type (linehaul/fsc/accessorial/tax), description, amount_cents

**NEW Entity - InvoiceLineItem**:
- invoice_id, line_type, description, amount_cents

#### 2. Multi-Modal Pricing Library
**Create Directory**: `functions/shared/math/freight/`

**New Files Required**:
- freightCommon.js (shared utilities)
- truckPricing.js (FTL RPM/flat, LTL CWT + density)
- railPricing.js (per car, intermodal, ton-mile)
- bargePricing.js (per barge, index per ton)
- oceanPricing.js (FCL, LCL W/M, bulk MT)
- airPricing.js (chargeable weight with dim factor)
- grainPricing.js (6 methods: bushel, ton, car, barge, MT, banded CPM)
- pricingDispatcher.js (route to correct calculator)

#### 3. Server Hooks
**Quote.beforeCreate / beforeUpdate**:
- Validate mode + method + required inputs
- Call pricingDispatcher
- Persist computed_total_cents, itemized_charges_json, explain_calculation_json
- Override any client-submitted totals

**Quote.afterRead**:
- Redact carrier_pay, broker_margin, internal_notes

**Invoice.beforeCreate** (enhance existing):
- Add pricing recomputation
- Compute variance vs quote
- Persist itemized_charges_json

#### 4. Test Suite
**Create**: `functions/__tests__/freight/`
- truckPricing.test.js
- railPricing.test.js
- bargePricing.test.js
- oceanPricing.test.js
- airPricing.test.js
- grainPricing.test.js
- pricingDispatcher.test.js

#### 5. UI Updates
**ShipperPortal Enhancement**:
- Mode selector (TRUCK/RAIL/BARGE/OCEAN/AIR)
- Method selector (per mode)
- Dynamic form fields based on mode
- Display itemized charges
- Show explain calculation (customer-safe)

---

## I) RECOMMENDED IMPLEMENTATION ORDER

1. ✅ **STEP 0**: Inventory complete (this document)
2. 🔄 **STEP 1**: Extend Quote + Invoice entities
3. 🔄 **STEP 2**: Implement freight pricing library (8 files)
4. 🔄 **STEP 3**: Create pricing dispatcher
5. 🔄 **STEP 4**: Add Quote hooks (beforeCreate/beforeUpdate/afterRead)
6. 🔄 **STEP 5**: Enhance Invoice hooks
7. 🔄 **STEP 6**: Add audit logging events
8. 🔄 **STEP 7**: Create test harness (7 test files)
9. 🔄 **STEP 8**: Update ShipperPortal UI

---

## J) ASSUMPTIONS & SAFE DEFAULTS

| Item | Assumption | Justification |
|------|------------|---------------|
| Currency | USD cents only | Simplifies int math, US market focus |
| Dim factor (air) | 166 for cm³, 139 for in³ | Industry standard |
| LTL density classes | Use simplified table if no NMFC API | Most systems use lookup table |
| Minimum charge | Applied after all calculations | Standard industry practice |
| Rounding | HALF_UP for all cents | Deterministic, auditable |
| W/M ratio | 1 MT = 1 CBM for LCL | Standard ocean freight convention |
| Grain bushel weights | Corn=56lb, Soybeans=60lb, Wheat=60lb | USDA standards |

---

**CONCLUSION**: 
- Core entities exist but need 30+ fields added
- No multi-modal pricing logic exists
- Need 8 new pricing library files
- Need comprehensive test coverage (7 test files)
- UI needs mode-aware form + itemized display

**READY TO PROCEED TO STEP 1**