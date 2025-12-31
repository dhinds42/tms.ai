# Math Rules Registry
**TMS.ai Platform**

## Purpose
Maps business rules → math functions → entity hooks for traceability

---

## LOAD FINANCIAL RULES

### Rule: Customer Total Charge
**Formula:** `total_customer_charge = customer_rate + fuel_surcharge + sum(accessorials)`
**Function:** `calculateLoadFinancials()` in `rates.ts`
**Enforced:** `load/beforeCreate.ts`, `load/beforeUpdate.ts`
**Tests:** `rates.test.ts`

### Rule: Carrier Total Cost
**Formula:** `total_carrier_cost = carrier_pay + sum(carrier_accessorials)`
**Function:** `calculateLoadFinancials()` in `rates.ts`
**Enforced:** `load/beforeCreate.ts`, `load/beforeUpdate.ts`
**Tests:** `rates.test.ts`

### Rule: Gross Margin
**Formula:** `margin = total_customer_charge - total_carrier_cost`
**Function:** `calculateLoadFinancials()` in `rates.ts`
**Enforced:** `load/beforeCreate.ts`, `load/beforeUpdate.ts`
**Tests:** `rates.test.ts`

### Rule: Margin Percentage
**Formula:** `margin_percent = (margin / total_customer_charge) * 100`
**Function:** `calculateLoadFinancials()` in `rates.ts`
**Enforced:** `load/beforeCreate.ts`, `load/beforeUpdate.ts`
**Tests:** `rates.test.ts`
**Edge Case:** Returns 0 if total_customer_charge = 0

### Rule: Minimum Margin Policy
**Policy:** Margin must be >= 5% unless admin override
**Function:** `validateLoadFinancials()` in `rates.ts`
**Enforced:** `load/beforeCreate.ts` checks `margin_override_approved` + `user.role === 'admin'`
**Tests:** `rates.test.ts`, `load-workflow.test.ts`

### Rule: Non-Negative Rates
**Policy:** `customer_rate >= 0` and `carrier_pay >= 0`
**Function:** `validateLoadFinancials()` in `rates.ts`
**Enforced:** `load/beforeCreate.ts`
**Tests:** `rates.test.ts`

### Rule: Pickup Before Delivery
**Policy:** `pickup_date <= delivery_date`
**Function:** Date validation in `beforeCreate.ts`
**Enforced:** `load/beforeCreate.ts`
**Tests:** `load-workflow.test.ts`

---

## INVOICE RULES

### Rule: Invoice Total
**Formula:** `invoice_total = sum(line_items.amount)`
**Function:** `calcInvoiceTotal()` in `invoice.ts`
**Enforced:** `invoice/beforeCreate.ts`
**Tests:** `invoice.test.ts`

### Rule: Balance Due
**Formula:** `balance_due = invoice_total - sum(payments_applied)`
**Function:** `calcBalanceDue()` in `invoice.ts`
**Enforced:** `invoice/beforeCreate.ts`
**Tests:** `invoice.test.ts`

### Rule: Due Date Calculation
**Formula:** `due_date = invoice_date + payment_terms (days)`
**Function:** `calcDueDate()` in `invoice.ts`
**Enforced:** `invoice/beforeCreate.ts`
**Tests:** `invoice.test.ts`

### Rule: No Duplicate Invoices
**Policy:** One invoice per load
**Function:** `detectDuplicateInvoice()` in `invoice.ts`
**Enforced:** `invoice/beforeCreate.ts`
**Tests:** `invoice.test.ts`

---

## SETTLEMENT RULES

### Rule: Gross Pay
**Formula:** `gross_pay = sum(load_pays)`
**Function:** `calculateSettlement()` in `settlements.ts`
**Enforced:** `settlement/beforeCreate.ts`
**Tests:** `settlements.test.ts`

### Rule: Total Deductions
**Formula:** `total_deductions = sum(advances) + sum(fuel_advances) + sum(deductions)`
**Function:** `calculateSettlement()` in `settlements.ts`
**Enforced:** `settlement/beforeCreate.ts`
**Tests:** `settlements.test.ts`

### Rule: Net Pay
**Formula:** `net_pay = gross_pay - total_deductions`
**Function:** `calculateSettlement()` in `settlements.ts`
**Enforced:** `settlement/beforeCreate.ts`
**Tests:** `settlements.test.ts`

### Rule: Negative Net Policy
**Policy:** Negative net allowed if <= -$1000 (configurable)
**Function:** `validateSettlement()` in `settlements.ts`
**Enforced:** `settlement/beforeCreate.ts`
**Tests:** `settlements.test.ts`

---

## ACCESSORIAL RULES

### Rule: Detention Charge
**Formula:** `(total_time - free_time) / increment * rate_per_increment`
**Function:** `calcDetention()` in `accessorials.ts`
**Enforced:** Manual application (future: auto-calculate in hook)
**Tests:** `accessorials.test.ts`

### Rule: Detention Eligibility
**Policy:** Must have actual times and status = 'delivered'
**Function:** `isDetentionEligible()` in `accessorials.ts`
**Enforced:** Application logic (future: hook validation)
**Tests:** `accessorials.test.ts`

### Rule: TONU Charge
**Formula:** `base_rate * tonu_percent (default 50%)`
**Function:** `calcTONU()` in `accessorials.ts`
**Enforced:** Manual application
**Tests:** `accessorials.test.ts`

### Rule: Lumper Validation
**Policy:** Requires receipt URL and <= $500
**Function:** `validateLumper()` in `accessorials.ts`
**Enforced:** Manual validation (future: hook)
**Tests:** `accessorials.test.ts`

### Rule: No Duplicate Accessorials
**Policy:** Same type cannot be charged twice per load
**Function:** `detectDuplicateAccessorial()` in `accessorials.ts`
**Enforced:** Future hook implementation
**Tests:** `accessorials.test.ts`

---

## COMPLIANCE RULES

### Rule: Days Until Expiry
**Formula:** `Math.ceil((expiry_date - now) / ms_per_day)`
**Function:** `daysUntil()` in `compliance.ts`
**Enforced:** `DocumentExpirationCascade` component
**Tests:** Future compliance.test.ts

### Rule: Expiration Action Cascade
**Policy:**
- 90 days: Alert
- 60 days: Escalate
- 30 days: Suspend
- 0 days: Block
**Function:** `getComplianceActionLevel()` in `compliance.ts`
**Enforced:** `DocumentExpirationCascade` component
**Tests:** Future compliance.test.ts

---

## RBAC RULES

### Rule: Broker/Admin Access
**Policy:** Full access to all financial fields
**Function:** `redactFinancialsByRole()` in `financialRedaction.ts`
**Enforced:** All `afterRead` hooks
**Tests:** `loadRedaction.test.ts`

### Rule: Carrier/Owner-Op Access
**Policy:** See carrier_pay, NOT customer_rate or margin
**Fields Redacted:** customer_rate, margin, margin_percent, total_revenue, internal_notes
**Function:** `redactFinancialsByRole()` in `financialRedaction.ts`
**Enforced:** `load/afterRead.ts`, `laneRate/afterRead.ts`
**Tests:** `loadRedaction.test.ts`

### Rule: Driver Access
**Policy:** NO financial data (operational only)
**Fields Redacted:** ALL pricing fields
**Function:** `redactFinancialsByRole()` in `financialRedaction.ts`
**Enforced:** All `afterRead` hooks
**Tests:** `loadRedaction.test.ts`

### Rule: Customer Access
**Policy:** See invoice totals, NOT carrier pay or margin
**Fields Redacted:** carrier_pay, margin, margin_percent, internal_notes
**Function:** `redactFinancialsByRole()` in `financialRedaction.ts`
**Enforced:** `load/afterRead.ts`, `invoice/afterRead.ts`
**Tests:** `loadRedaction.test.ts`

---

## OVERRIDE RULES

### Rule: Margin Override Permission
**Policy:** Only admin/broker can approve negative margin
**Function:** `canOverrideMargin()` in `overridePolicy.ts`
**Enforced:** `load/beforeCreate.ts` checks role + `margin_override_approved` flag
**Tests:** `load-workflow.test.ts`

### Rule: Financial Lock Override
**Policy:** Only admin can edit after invoiced/settled
**Function:** `canOverrideLock()` in `overridePolicy.ts`
**Enforced:** `load/beforeUpdate.ts` calls `enforceLock()`
**Tests:** Future lock.test.ts

---

## AUDIT RULES

### Rule: Immutable Audit Trail
**Policy:** All financial changes logged with diffs
**Function:** `logFinancialChange()` in `auditLogger.ts`
**Enforced:** All `beforeCreate/beforeUpdate` hooks
**Entity:** AuditLog (append-only)

### Rule: Field-Level Diff Tracking
**Policy:** Track before/after values for all financial fields
**Function:** `diffFinancialFields()` in `auditMath.ts`
**Enforced:** Audit logger calls this automatically
**Tests:** Future audit.test.ts

### Rule: Calculation Explanation
**Policy:** Store human-readable calc breakdown
**Function:** `explainCalculation()` in `auditMath.ts`
**Enforced:** Logged with each audit entry

---

## VALIDATION RULES

### Rule: Invariant Checking
**Policy:** Derived fields must match recomputed values
**Function:** `assertInvariants()` in `auditMath.ts`
**Enforced:** Can be called in hooks or scheduled jobs
**Tests:** Future invariants.test.ts

### Rule: Recompute Verification
**Policy:** Server can recompute any derived field
**Function:** `recomputeDerivedFields()` in `auditMath.ts`
**Use Case:** Data integrity audits, migration verification

---

## IMPORT RULES

### Rule: Strict Numeric Parsing
**Policy:** Invalid numbers = error, never coerce to 0
**Function:** `parseNumberStrict()` in `imports.ts`
**Enforced:** Import processors
**Tests:** Future imports.test.ts

### Rule: Currency Parsing
**Policy:** Handle "$1,234.56", "1234.56", etc.
**Function:** `parseCurrency()` in `parsing.ts`
**Enforced:** All hooks + import processors
**Tests:** `parsing.test.ts`

### Rule: Outlier Detection
**Policy:** Flag rates outside typical ranges
**Function:** `validateRateSanity()` in `imports.ts`
**Enforced:** Import validation + manual rate entry
**Tests:** Future imports.test.ts

---

## ROUNDING RULES

### Rule: Currency Rounding Strategy
**Strategy:** HALF_UP (commercial rounding)
**Policy:** 0.005 rounds to 0.01
**Function:** `roundCurrency()` in `rounding.ts`
**Enforced:** Everywhere via money.ts
**Tests:** `money.test.ts`

### Rule: Penny-Perfect Allocation
**Policy:** When splitting $1.00 three ways: $0.33, $0.33, $0.34 (no penny loss)
**Function:** `allocateCents()` in `money.ts`
**Enforced:** Multi-stop allocation, settlements
**Tests:** `money.test.ts`

---

**Registry Maintainer:** TMS.ai Engineering
**Last Updated:** 2025-12-31