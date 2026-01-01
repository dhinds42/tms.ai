# STEP 0 — INVENTORY REPORT
## Customer Onboarding + Lane/Rate Module
Date: 2026-01-01

---

## A) EXISTING CUSTOMER ENTITIES

### ✅ Found:
- **Quote** - Full entity with transport_mode, pricing_method, FSC fields, itemized_charges_json, explain_calculation_json
- **Invoice** - Full entity with itemized line items, variance tracking, computed_total_cents
- **InvoiceLineItem** - Line-level detail for invoices
- **QuoteLineItem** - Line-level detail for quotes
- **Load** - Shipment execution entity
- **LaneRate** - Extended with FSC fields (fsc_enabled, fsc_handling, fsc_method, fsc_cpm_cents, fsc_percent_bps, fsc_table_id)
- **Customer** (NEW) - Created with FSC defaults
- **Lane** (NEW) - Created with origin/dest, mode, equipment
- **CustomerFSCTable** (NEW) - Created for table-based FSC
- **CustomerFSCTableRow** (NEW) - Created for FSC table rows

### ❌ Missing:
- No BrokerageFeePolicy entity (optional, can defer)
- No CustomerContract entity (using Party + Customer)

---

## B) EXISTING FIELDS COVERAGE

### ✅ Present in Quote/Invoice/LaneRate:
- transport_mode (TRUCK|RAIL|BARGE|OCEAN|AIR)
- pricing_method (17 methods including FTL_RPM, FTL_FLAT, etc.)
- equipment_type
- commodity_type
- weight_value + weight_unit
- dims (length/width/height + unit)
- volume_value + volume_unit
- loaded_miles
- rpm_cents, flat_cents
- FSC fields (enabled, handling, method, cpm, percent, table_id)

---

## C) EXISTING QUOTE/INVOICE PRICING FLOW

### ✅ Quote Flow:
- `functions/entities/quote/beforeCreate.js` - Validates inputs, calls pricing dispatcher, persists computed totals and snapshots
- `functions/entities/quote/afterCreate.js` - Post-creation workflows
- `functions/entities/quote/afterRead.js` - RBAC redaction

### ✅ Invoice Flow:
- `functions/entities/invoice/beforeCreate.js` - Computes from load, calculates variance vs quote
- `functions/entities/invoice/beforeUpdate.js` - Revalidates on changes
- `functions/entities/invoice/afterRead.js` - RBAC redaction

### ✅ Pricing Dispatcher:
- `functions/shared/math/freight/pricingDispatcher.js` - Multi-mode dispatcher with FSC integration
- Supports 17 pricing methods
- FSC handling: INCLUDED vs SEPARATE
- FSC methods: FLAT_PER_MILE, PERCENT_OF_LINEHAUL, TABLE_LOOKUP (stub)

---

## D) EXISTING FSC LOGIC

### ✅ Implemented:
- FSC enabled/disabled toggle
- INCLUDED vs SEPARATE handling
- FLAT_PER_MILE calculation (miles × cpm_cents)
- PERCENT_OF_LINEHAUL calculation (linehaul × percent_bps / 10000)
- TABLE_LOOKUP infrastructure (CustomerFSCTable, CustomerFSCTableRow entities)
- `functions/shared/math/fscTableLookup.js` - Async table lookup with fuel_price and distance_band basis types

### ⚠️ Gaps:
- TABLE_LOOKUP integrated in dispatcher but uses stub (resolveFSCFromTableSync)
- Need to wire async fscTableLookup into quote/invoice hooks (dispatcher itself is synchronous)

---

## E) EXISTING AUDIT LOGGING

### ✅ Found:
- **AuditLog** entity with actor, role, entity_type, entity_id, action, metadata fields
- Used in laneRate/beforeCreate, laneRate/beforeUpdate
- Used in customerFSCTableRow/beforeCreate

### ⚠️ Gaps:
- Need comprehensive audit events for:
  - PRICING_SNAPSHOT_COMPUTED
  - QUOTE_VERSION_CREATED
  - INVOICE_VARIANCE_FLAGGED
  - FSC_TABLE_LOOKUP_PERFORMED

---

## F) EXISTING RBAC/REDACTION HOOKS

### ✅ Found:
- `functions/entities/quote/afterRead.js` - Redacts internal fields
- `functions/entities/invoice/afterRead.js` - Redacts internal fields
- `functions/shared/security/financialRedaction.js` - Redaction library

### ⚠️ Gaps:
- Need Customer afterRead hook for redaction
- Need LaneRate afterRead hook for redaction (customer should not see carrier_rate, margin, etc.)

---

## G) EXISTING TESTS

### ✅ Found:
- `functions/__tests__/freight/` - Pricing method tests
- `functions/__tests__/fsc/customerFSCTables.test.js` - FSC calculation tests
- Test coverage for: FLAT_PER_MILE, PERCENT_OF_LINEHAUL, INCLUDED vs SEPARATE

### ⚠️ Gaps:
- Need TABLE_LOOKUP integration tests with actual database queries
- Need quote/invoice FSC integration tests
- Need RBAC redaction tests
- Need overlap detection tests for FSC table rows

---

## GAPS TO FILL

### 🔴 Critical:
1. Wire async fscTableLookup into quote/invoice hooks (dispatcher can't be async)
2. Add Customer afterRead redaction hook
3. Add LaneRate afterRead redaction hook
4. Comprehensive audit logging for all pricing snapshots

### 🟡 Important:
5. Customer onboarding wizard UI
6. Enhanced lane rate preview panel with itemized breakdown
7. Complete test harness for TABLE_LOOKUP with database
8. Quote/Invoice FSC integration tests

### 🟢 Optional:
9. BrokerageFeePolicy entity (defer)
10. INDEX_LINKED FSC method (defer)

---

## WHICH ENTITIES WILL BE EXTENDED VS CREATED

### Extended:
- ✅ LaneRate (added FSC fields)
- ✅ Quote (already has FSC fields and snapshots)
- ✅ Invoice (already has variance tracking)

### Created New:
- ✅ Customer
- ✅ Lane
- ✅ CustomerFSCTable
- ✅ CustomerFSCTableRow

### No Changes Needed:
- InvoiceLineItem (already correct)
- QuoteLineItem (already correct)
- AuditLog (already correct)

---

## SUMMARY

**READY:** Core entities, FSC infrastructure, basic hooks, UI screens, basic tests
**GAPS:** Async FSC resolution in quotes/invoices, comprehensive redaction, full test coverage, customer portal wizard

**PROCEED TO:** Fill critical gaps (items 1-4), then important items (5-8), final report.