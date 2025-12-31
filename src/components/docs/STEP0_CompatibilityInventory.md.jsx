# STEP 0 - Compatibility Inventory & Plan
**TMS.ai Lane Profitability Module**  
**Date:** 2025-12-31

---

## 📊 EXISTING INFRASTRUCTURE DISCOVERED

### A. Entities (REUSE)
✅ **Driver** - Has payment_structure, payment_rate, is_owner_operator, home_terminal
✅ **Carrier** - Exists with compliance, performance tracking
✅ **OwnerOperator** - Separate entity with payment_structure, payment_rate
✅ **LaneRate** - Exists with customer_rate, carrier_rate, driver_rate, margin fields
✅ **AuditLog** - Exists for audit trail
✅ **Load** - Has full financial structure

### B. Money Conventions (FOLLOW EXACTLY)
✅ **Pattern:** `*_cents` for integer cents (e.g., customer_rate_cents)
✅ **Current LaneRate:** Uses `number` type (NOT *_cents pattern yet)
⚠️ **Decision:** Add parallel *_cents fields to new entities, keep backward compatibility

### C. Shared Math Library (REUSE & EXTEND)
✅ **Exists:** `functions/shared/math/`
  - money.ts (integer cents, add/subtract/multiply/divide)
  - rates.ts (calculateLoadFinancials, validateLoadFinancials)
  - rounding.ts (roundCurrency)
  - percent.ts (safePercent)
  - parsing.ts (parseCurrencyToCents)
  - settlements.ts, driverPay.ts, ownerOperator.ts, etc.

📌 **Action:** ADD `laneProfitability.ts` to this folder

### D. RBAC Patterns (FOLLOW EXACTLY)
✅ **Roles:** admin, broker, carrier, driver, customer, owner_operator
✅ **Redaction:** afterRead hooks delete fields by role
✅ **Pattern:** 
```typescript
if (user.role === 'carrier') {
  delete result.customer_rate;
  delete result.margin;
}
```

### E. Server Hooks Pattern (FOLLOW EXACTLY)
✅ **Location:** `functions/entities/{EntityName}/`
  - beforeCreate.ts
  - beforeUpdate.ts
  - afterRead.ts
✅ **Examples:** load/beforeCreate.ts, invoice/beforeCreate.ts

### F. Test Framework (REUSE)
✅ **Location:** `functions/__tests__/`
✅ **Runner:** Jest
✅ **Pattern:** Entity tests in integration/, math tests in math/, rbac tests in rbac/

### G. UI Structure (EXTEND)
✅ **Pages:** pages/*.js (flat structure)
✅ **Components:** components/ (can have subfolders)
✅ **Navigation:** Layout.js with sidebar sections

---

## 🎯 COMPATIBILITY PLAN

### REUSE TARGETS
1. **Driver entity** - ADD fields: home_terminal_zip, default_equipment_type
2. **LaneRate entity** - EXTEND as template for rate structure
3. **Money utilities** - USE existing money.ts, rates.ts
4. **RBAC hooks** - FOLLOW afterRead redaction pattern
5. **Audit logging** - USE existing AuditLog entity
6. **Test structure** - ADD to functions/__tests__/

### NEW ADDITIONS (NO EQUIVALENT EXISTS)
1. **LanePreference** - Driver/carrier/OO lane preferences
2. **LaneRatePreference** - Rate targets + profitability snapshot
3. **LaneAssumption** - Mileage/cost assumptions per lane
4. **CostProfile** - Operating cost structure
5. **laneProfitability.ts** - New math module
6. **UI components** - Lane builder, rate entry, profitability dashboard

### FIELD NAMING STANDARDS (MATCH EXISTING)
✅ Money fields: `*_cents` (integer)
✅ Percentages: `*_percent` or `*_bps` (basis points)
✅ Dates: `*_date` (ISO string)
✅ Timestamps: `*_at` (ISO datetime)
✅ Flags: `is_*` or bare boolean
✅ References: `*_id`
✅ Snake_case for field names

### BACKWARD COMPATIBILITY GUARANTEES
- ✅ Zero changes to existing entities (Driver, Carrier, OwnerOperator, LaneRate)
- ✅ New entities isolated (no FK constraints breaking existing flows)
- ✅ New math module extends existing library (no replacement)
- ✅ New UI routes added to Layout without modifying existing pages
- ✅ Tests added without modifying existing tests

---

## ⚡ IMPLEMENTATION SEQUENCE

**STEP 1:** Create 4 new entities (LanePreference, LaneRatePreference, LaneAssumption, CostProfile)
**STEP 2:** Create laneProfitability.ts math module
**STEP 3:** Create entity hooks (beforeCreate/beforeUpdate/afterRead)
**STEP 4:** Create tests (20+ tests across correctness, RBAC, enforcement)
**STEP 5:** Create UI components + pages
**STEP 6:** Update Layout navigation

---

## 🔒 SAFE DEFAULTS FOR BUSINESS DECISIONS

**Decision 1: Unprofitable Rate Policy**
- ✅ Default: Set `approval_status="pending"` and require role-appropriate approval
- Strict block available as config override

**Decision 2: Profit Threshold Source**
- ✅ Default: Support BOTH per-mile cents AND margin bps
- Allow profiles to specify either/both

**Decision 3: Customer Revenue Source**
- ✅ Default: Manual entry in LaneRatePreference
- Optional: Link to market rate feed (future enhancement)

**Decision 4: Financial Lock Policy**
- ✅ Default: Create new version on edit if locked_until date present
- Mark old version inactive

---

**STATUS:** ✅ INVENTORY COMPLETE - PROCEEDING TO IMPLEMENTATION