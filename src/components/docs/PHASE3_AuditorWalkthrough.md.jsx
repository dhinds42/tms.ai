# PHASE 3 — AUDITOR WALKTHROUGH SCRIPT
## Customer Pricing Module - SOC-2 Evidence

**System:** TMS.ai (Freight Pricing Engine)  
**Date:** January 2, 2026  
**Audience:** SOC-2 Auditors, Enterprise Security Reviewers

---

## 🎯 Executive Summary

This walkthrough demonstrates how TMS.ai enforces:
- **Server-authoritative pricing** (no client tampering)
- **Role-based access control** (least-privilege pricing visibility)
- **Audit trails** (all pricing changes logged)
- **Data integrity** (deterministic, recomputable pricing)

All pricing computations occur server-side. Customers cannot see broker margins. Carriers cannot see customer rates. All pricing events are auditable.

---

## 📋 System Architecture

```
Customer Request
    ↓
Quote Entity (beforeCreate hook)
    ↓
Server Pricing Dispatcher
    ↓
FSC Resolution (if enabled)
    ↓
Computed Total + Itemized Lines
    ↓
Pricing Snapshot Stored
    ↓
Audit Log Written
    ↓
Quote Returned (redacted per role)
    ↓
Load Execution
    ↓
Invoice Entity (beforeCreate hook)
    ↓
Variance Detection (vs Quote)
    ↓
Audit Log Written
```

---

## 🔐 SOC-2 Control Mapping

### CC6.1 — Logical Access Controls

**Implementation:**
- RBAC enforced on Customer, Lane, LaneRate entities
- User roles: admin, broker, carrier, driver, customer
- Access matrix defined in afterRead hooks

**Evidence Location:**
- `functions/entities/laneRate/afterRead.js` (lines 11-107)
- `functions/entities/quote/afterRead.js` (lines 12-16)
- `functions/entities/invoice/afterRead.js` (lines 8-16)

**Demo:**
```javascript
// Customer role sees:
{
  customer_rate: 5000,
  fsc_enabled: true,
  computed_total_cents: 550000
  // ❌ carrier_rate: REDACTED
  // ❌ broker_margin: REDACTED
}
```

---

### CC6.2 — Least Privilege

**Implementation:**
- Customers see ONLY customer-facing fields
- Carriers see ONLY carrier-relevant fields
- Drivers see ONLY driver pay
- Broker/Admin see ALL fields

**Evidence:**
```javascript
// laneRate/afterRead.js - Customer allowedFields
const allowedFields = [
  'customer_rate',
  'fsc_enabled',
  'fsc_handling',
  'computed_total_cents'
  // carrier_rate ❌ NOT IN LIST
  // broker_fee ❌ NOT IN LIST
];
```

**Test:** Query LaneRate as customer role → carrier_rate field absent in response.

---

### CC7.2 — Change Management

**Implementation:**
- All lane rate changes logged to AuditLog
- FSC table versions tracked in FSCTableVersion
- Before/after snapshots captured

**Evidence:**
- `functions/entities/laneRate/beforeCreate.js` (lines 91-103)
- `functions/entities/laneRate/beforeUpdate.js` (lines 33-45)

**Audit Record Example:**
```json
{
  "entity_type": "LaneRate",
  "action": "LANE_RATE_UPDATED",
  "actor_email": "broker@tms.ai",
  "metadata": {
    "updated_fields": ["fsc_cpm_cents", "fsc_method"],
    "fsc_enabled": true,
    "fsc_method": "FLAT_PER_MILE"
  },
  "created_date": "2026-01-02T10:30:00Z"
}
```

---

### CC7.3 — System Data Integrity

**Implementation:**
- Pricing computed server-side (client cannot override)
- Quote beforeCreate hook: `data.computed_total_cents = pricingResult.total_cents;`
- Deterministic: same inputs → same output
- Recomputable: stored explain_json allows verification

**Evidence:**
- `functions/entities/quote/beforeCreate.js` (lines 20-36)
- Pricing dispatcher always returns same result for same inputs

**Proof of Integrity:**
1. Submit quote with loaded_miles=500, rpm_cents=200
2. Server computes: 500 × 200 = 100,000 cents = $1,000
3. Client submits quoted_rate=5000 → **IGNORED**
4. Server overwrites: computed_total_cents=100000
5. Recompute at any time: same inputs → 100,000 cents

---

### CC8.1 — Audit Trails

**Implementation:**
- Every pricing event logged to AuditLog entity
- Pricing snapshots stored in explain_calculation_json

**Evidence:**
```javascript
// Quote snapshot
{
  "itemized_charges_json": {
    "lines": [
      {
        "line_type": "linehaul",
        "description": "Linehaul ($2.00/mi × 500 mi)",
        "rate_cents": 200,
        "amount_cents": 100000
      },
      {
        "line_type": "fuel_surcharge",
        "description": "Fuel Surcharge (10¢/mi)",
        "rate_cents": 10,
        "amount_cents": 5000
      }
    ],
    "subtotals": {
      "linehaul_cents": 100000,
      "fuel_surcharge_cents": 5000
    }
  },
  "explain_calculation_json": {
    "pricing_method": "FTL_RPM",
    "loaded_miles": 500,
    "rpm_cents": 200,
    "fsc": {
      "enabled": true,
      "handling": "SEPARATE",
      "method": "FLAT_PER_MILE",
      "fsc_cents": 5000
    }
  }
}
```

**Auditor Action:** Query AuditLog for entity_type='Quote' → see all pricing events.

---

### CC9.2 — Data Accuracy

**Implementation:**
- Quote → Invoice variance detection
- variance_cents = invoice_total - quote_total
- Significant variances flagged with variance_reason

**Evidence:**
- `entities/Invoice.json` (fields: variance_cents, variance_reason, quote_total_cents)

**Example:**
```json
{
  "quote_total_cents": 105000,
  "computed_total_cents": 108500,
  "variance_cents": 3500,
  "variance_reason": "Detention charge added post-quote ($35.00)"
}
```

**Workflow:**
1. Quote issued: $1,050
2. Load executes
3. Detention occurs
4. Invoice generated: $1,085
5. Variance auto-flagged: +$35

---

### A1.2 — System Availability

**Implementation:**
- Pricing is deterministic (no external API dependencies for core pricing)
- FSC table lookup failures → graceful degradation to 0 FSC
- Error handling prevents pricing failures from blocking quote creation

**Evidence:**
- `fscTableLookup.js` (lines 129-144) - try/catch with fallback

---

## 🧪 Demonstration Script for Auditors

### Step 1: Create Lane Rate with FSC

**API Call:**
```http
POST /api/entities/LaneRate
Authorization: Bearer {broker_token}

{
  "lane_id": "lane_123",
  "origin_city": "Chicago",
  "origin_state": "IL",
  "destination_city": "Dallas",
  "destination_state": "TX",
  "lane_miles": 925,
  "customer_rate": 2500,
  "fsc_enabled": true,
  "fsc_handling": "SEPARATE",
  "fsc_method": "FLAT_PER_MILE",
  "fsc_cpm_cents": 12
}
```

**Hook Execution:**
1. `beforeCreate` validates FSC config ✅
2. Inherits customer defaults if missing ✅
3. AuditLog entry created ✅

**Verification:**
```sql
SELECT * FROM AuditLog 
WHERE entity_type='LaneRate' 
  AND action='LANE_RATE_CREATED'
ORDER BY created_date DESC LIMIT 1;
```

---

### Step 2: Create Quote Using Lane Rate

**API Call:**
```http
POST /api/entities/Quote

{
  "pickup_location": {"city": "Chicago", "state": "IL"},
  "dropoff_location": {"city": "Dallas", "state": "TX"},
  "loaded_miles": 925,
  "transport_mode": "TRUCK",
  "pricing_method": "FTL_RPM",
  "rpm_cents": 250,
  "fsc_enabled": true,
  "fsc_handling": "SEPARATE",
  "fsc_method": "FLAT_PER_MILE",
  "fsc_cpm_cents": 12
}
```

**Server Processing:**
1. `beforeCreate` hook invoked
2. `calculateCustomerFreightQuote()` computes:
   - Linehaul: 925 mi × 250¢ = 231,250¢
   - FSC: 925 mi × 12¢ = 11,100¢
   - Total: 242,350¢ = $2,423.50
3. Server OVERWRITES any client-submitted total
4. Pricing snapshot stored

**Response (to broker):**
```json
{
  "computed_total_cents": 242350,
  "itemized_charges_json": {
    "lines": [
      {
        "line_type": "linehaul",
        "amount_cents": 231250
      },
      {
        "line_type": "fuel_surcharge",
        "description": "Fuel Surcharge (12¢/mi)",
        "amount_cents": 11100
      }
    ]
  },
  "explain_calculation_json": {
    "pricing_method": "FTL_RPM",
    "loaded_miles": 925,
    "rpm_cents": 250,
    "fsc": {
      "enabled": true,
      "handling": "SEPARATE",
      "method": "FLAT_PER_MILE",
      "fsc_cents": 11100
    }
  },
  "pricing_snapshot_version": "v1.0.0"
}
```

---

### Step 3: Query Quote as Customer Role

**API Call:**
```http
GET /api/entities/Quote/{quote_id}
Authorization: Bearer {customer_token}
```

**afterRead Hook Redaction:**
- ✅ Customer sees: computed_total_cents, itemized_charges_json
- ❌ Customer CANNOT see: estimated_cost, margin, margin_percentage

**Response (to customer):**
```json
{
  "quote_number": "Q-2026-001",
  "computed_total_cents": 242350,
  "itemized_charges_json": { ... },
  "pricing_snapshot_version": "v1.0.0"
  // ❌ estimated_cost: REDACTED
  // ❌ margin: REDACTED
}
```

**Auditor Verification:**
- Response contains NO broker margin fields
- Redaction enforced server-side (not UI filtering)

---

### Step 4: Create Invoice from Quote

**API Call:**
```http
POST /api/entities/Invoice

{
  "quote_id": "quote_123",
  "invoice_number": "INV-2026-001",
  "customer_party_id": "party_456",
  "total_amount": 2423.50
}
```

**beforeCreate Hook:**
1. Recomputes pricing (if shipment data changed)
2. Compares to quote total
3. Calculates variance_cents
4. Stores variance_reason if significant

**Variance Detection Example:**
```json
{
  "quote_total_cents": 242350,
  "computed_total_cents": 246350,
  "variance_cents": 4000,
  "variance_reason": "Detention added ($40.00)"
}
```

---

### Step 5: Audit Trail Verification

**Query:**
```sql
SELECT 
  entity_type,
  action,
  actor_email,
  actor_role,
  metadata,
  created_date
FROM AuditLog
WHERE entity_type IN ('LaneRate', 'Quote', 'Invoice')
  AND created_date >= '2026-01-01'
ORDER BY created_date DESC;
```

**Expected Results:**
- LANE_RATE_CREATED
- QUOTE_PRICING_COMPUTED
- INVOICE_PRICING_COMPUTED

Each entry includes:
- Who (actor_email, actor_role)
- What (entity_type, action)
- When (created_date)
- Details (metadata with pricing parameters)

---

## 🔍 Security Review Checklist

### ✅ Pricing Cannot Be Tampered
- [x] Client cannot override server-computed totals
- [x] beforeCreate hooks recompute all pricing
- [x] computed_total_cents is authoritative

### ✅ Customers Cannot See Internal Economics
- [x] carrier_rate hidden from customer role
- [x] broker margins hidden from customer role
- [x] Redaction enforced in afterRead hooks (server-side)

### ✅ Carriers Cannot See Customer Rates
- [x] customer_rate hidden from carrier role
- [x] broker_fee fields hidden from carrier role

### ✅ All Pricing Changes Audited
- [x] Lane rate creation logged
- [x] Lane rate updates logged
- [x] Quote pricing logged
- [x] Invoice pricing logged

### ✅ Pricing Is Deterministic
- [x] Same inputs → same output
- [x] explain_json allows recomputation
- [x] pricing_snapshot_version tracks engine version

---

## 📊 Evidence Package for Auditors

### Document 1: LaneRate Record
**Query:** `GET /api/entities/LaneRate/{id}` (as admin)

**Shows:**
- Complete FSC configuration
- Customer rate + carrier rate (admin only)
- Effective dates
- Approval status

---

### Document 2: Pricing Snapshot JSON
**Field:** `explain_calculation_json` in Quote/Invoice

**Shows:**
- Pricing method used
- All input parameters
- Step-by-step calculation
- FSC breakdown (if applicable)

**Example:**
```json
{
  "pricing_method": "FTL_RPM",
  "loaded_miles": 500,
  "rpm_cents": 200,
  "linehaul_cents": 100000,
  "fsc": {
    "enabled": true,
    "handling": "SEPARATE",
    "method": "TABLE_LOOKUP",
    "table_id": "fsc_table_xyz",
    "matched_row_id": "row_abc",
    "fsc_cents": 5000
  },
  "total_cents": 105000
}
```

---

### Document 3: AuditLog Entry
**Query:** `GET /api/entities/AuditLog?entity_type=Quote`

**Shows:**
- Timestamp of pricing computation
- User who triggered it
- Pricing parameters in metadata

---

### Document 4: Recompute Test Result
**Process:**
1. Retrieve Quote record
2. Extract explain_json
3. Call pricing dispatcher with same inputs
4. Verify: original total = recomputed total

**Code:**
```javascript
const original = quote.computed_total_cents;
const recomputed = calculateCustomerFreightQuote({
  ...quote.explain_calculation_json
}).total_cents;

assert(original === recomputed); // ✅ MUST PASS
```

---

## 🧾 Quote-to-Invoice Variance Workflow

### Normal Flow (No Variance)
1. Quote issued: $2,500
2. Load executes as planned
3. Invoice generated: $2,500
4. variance_cents = 0

### Variance Flow (Accessorial Added)
1. Quote issued: $2,500
2. Load detained at destination
3. Detention charge: $50
4. Invoice generated: $2,550
5. variance_cents = 5000 (cents)
6. variance_reason = "Detention at delivery (2 hours × $25/hr)"

**Auditor Verification:**
```sql
SELECT 
  invoice_number,
  quote_total_cents,
  computed_total_cents,
  variance_cents,
  variance_reason
FROM Invoice
WHERE variance_cents > 0;
```

---

## 🛡️ RBAC Enforcement Test Script

### Test 1: Customer Cannot See Carrier Rate

**Setup:**
1. Create LaneRate with customer_rate=2500, carrier_rate=2200
2. Query as customer role

**Expected:**
```json
{
  "customer_rate": 2500,
  "computed_total_cents": 250000
  // ❌ carrier_rate field absent
}
```

**Verification:** afterRead hook removes carrier_rate before response.

---

### Test 2: Carrier Cannot See Customer Rate

**Setup:**
1. Same LaneRate
2. Query as carrier role

**Expected:**
```json
{
  "carrier_rate": 2200
  // ❌ customer_rate field absent
  // ❌ broker_fee field absent
}
```

---

### Test 3: Admin Sees All Fields

**Setup:**
1. Same LaneRate
2. Query as admin role

**Expected:**
```json
{
  "customer_rate": 2500,
  "carrier_rate": 2200,
  "broker_fee_customer_side": 0,
  "total_margin": 300
}
```

---

## 🔄 FSC Handling Demonstration

### Scenario A: FSC OFF

**Input:**
```json
{
  "fsc_enabled": false
}
```

**Output:**
```json
{
  "total_cents": 100000,
  "itemized_lines": [
    {"line_type": "linehaul", "amount_cents": 100000}
  ]
  // ✅ No FSC line
}
```

---

### Scenario B: FSC INCLUDED

**Input:**
```json
{
  "fsc_enabled": true,
  "fsc_handling": "INCLUDED"
}
```

**Output:**
```json
{
  "total_cents": 100000,
  "itemized_lines": [
    {"line_type": "linehaul", "amount_cents": 100000}
  ],
  "explain_json": {
    "fsc": {
      "enabled": true,
      "handling": "INCLUDED",
      "note": "FSC included in base rate, not separately itemized"
    }
  }
  // ✅ FSC in explain_json, NOT itemized
}
```

---

### Scenario C: FSC SEPARATE (Flat Per Mile)

**Input:**
```json
{
  "fsc_enabled": true,
  "fsc_handling": "SEPARATE",
  "fsc_method": "FLAT_PER_MILE",
  "fsc_cpm_cents": 12,
  "loaded_miles": 500
}
```

**Output:**
```json
{
  "total_cents": 106000,
  "itemized_lines": [
    {"line_type": "linehaul", "amount_cents": 100000},
    {
      "line_type": "fuel_surcharge",
      "description": "Fuel Surcharge (Per Mile)",
      "quantity": 500,
      "rate_cents": 12,
      "amount_cents": 6000
    }
  ]
  // ✅ FSC itemized separately
}
```

---

### Scenario D: FSC TABLE_LOOKUP

**Input:**
```json
{
  "fsc_enabled": true,
  "fsc_handling": "SEPARATE",
  "fsc_method": "TABLE_LOOKUP",
  "fsc_table_id": "table_xyz",
  "loaded_miles": 500
}
```

**Server Process:**
1. Query CustomerFSCTable (id=table_xyz)
2. Check effective dates
3. Query CustomerFSCTableRow for matching range
4. Fuel price $3.75 → matches row: 3.50-4.00 → 15¢/mi
5. FSC = 500 mi × 15¢ = 7,500¢

**Output:**
```json
{
  "total_cents": 107500,
  "itemized_lines": [
    {"line_type": "linehaul", "amount_cents": 100000},
    {
      "line_type": "fuel_surcharge",
      "description": "FSC (15¢/mi)",
      "amount_cents": 7500
    }
  ],
  "explain_json": {
    "fsc": {
      "table_id": "table_xyz",
      "matched_row_id": "row_abc",
      "basis_value": 3.75,
      "computed_fsc_cents": 7500
    }
  }
}
```

---

## 📝 Key Evidence for Auditors

### Evidence 1: Server-Side Enforcement
**File:** `functions/entities/quote/beforeCreate.js`  
**Line 24:** `data.computed_total_cents = pricingResult.total_cents;`

**What This Proves:** Client cannot override pricing. Server is authoritative.

---

### Evidence 2: RBAC Redaction
**File:** `functions/entities/laneRate/afterRead.js`  
**Lines 16-43:** Customer allowedFields list

**What This Proves:** Customers cannot access carrier rates or margins.

---

### Evidence 3: Audit Logging
**File:** `functions/entities/laneRate/beforeCreate.js`  
**Lines 91-103:** AuditLog.create()

**What This Proves:** All pricing changes are logged with actor, timestamp, metadata.

---

### Evidence 4: Variance Tracking
**File:** `entities/Invoice.json`  
**Fields:** variance_cents, variance_reason, quote_total_cents

**What This Proves:** System detects quote-invoice mismatches.

---

## ✅ Auditor Checklist

- [x] **Server-authoritative pricing** → beforeCreate hooks override client values
- [x] **RBAC enforcement** → afterRead hooks redact per role
- [x] **Audit trails** → AuditLog entries for all pricing events
- [x] **Data integrity** → Pricing snapshots enable recomputation
- [x] **Variance detection** → Quote vs Invoice tracking implemented
- [x] **FSC correctness** → All handling modes tested
- [x] **Least privilege** → Customers see only customer-facing fields

---

## 🎓 Training for Security Reviewers

**Q: Can a customer manipulate their invoice total?**  
A: No. All totals computed server-side. Client submissions ignored.

**Q: Can a customer see what you pay carriers?**  
A: No. carrier_rate field redacted via afterRead hook.

**Q: How do you prove pricing accuracy?**  
A: explain_json allows deterministic recomputation. Same inputs always yield same output.

**Q: What if FSC table lookup fails?**  
A: Graceful fallback to 0 FSC + error logged. Quote creation does not fail.

**Q: Can pricing change between quote and invoice?**  
A: Only if shipment changes (e.g., detention, extra stops). Variance is auto-flagged with reason.

---

## 📞 Auditor Contact

For detailed code review or live demonstration:
- Request access to TMS.ai staging environment
- We can generate sample quotes/invoices with full audit trail
- All pricing snapshots are queryable and verifiable

---

**End of Auditor Walkthrough**  
**Prepared by:** TMS.ai Engineering  
**Version:** 1.0  
**Last Updated:** January 2, 2026