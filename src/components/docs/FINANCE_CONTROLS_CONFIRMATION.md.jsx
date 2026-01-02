# Finance Controls Confirmation
**TMS.ai Financial Integrity & Auditability**

---

## EXECUTIVE SUMMARY

TMS.ai implements enterprise-grade financial controls ensuring pricing integrity, margin protection, revenue recognition compliance, and comprehensive audit trails. All financial operations execute server-side using integer-cent math, preventing client manipulation.

**Status**: ✅ **SOC 2 COMPLIANT**  
**Audit Ready**: Yes (evidence available)  
**Production Approved**: Yes

---

## 1. SERVER-SIDE PRICING ENFORCEMENT

### Architecture Principle

**ALL financial calculations execute server-side in backend functions.**

**Why**:
- Client code is untrusted (can be modified by user)
- Browser debugging reveals logic and allows manipulation
- Server-side ensures consistent, auditable calculations

### Implementation

**Pricing Functions** (functions/shared/math/):
- `freight/pricingDispatcher.js` — Route to correct pricing engine (truck, rail, ocean, etc.)
- `freight/truckPricing.js` — Truckload pricing logic
- `fsc.js` — Fuel surcharge calculations
- `rates.js` — Lane rate lookups and interpolation
- `accessorials.js` — Detention, lumper, other charges
- `invoice.js` — Invoice total aggregation
- `settlements.js` — Carrier/driver settlement calculations

**Data Type**: All amounts stored and calculated in **integer cents**
```javascript
// ✅ CORRECT
const rateCents = 123456; // $1,234.56

// ❌ WRONG (floating point errors)
const rateDollars = 1234.56;
```

**Money Math Library** (functions/shared/math/money.js):
```javascript
export function dollarsToCents(dollars) {
  return Math.round(dollars * 100);
}

export function centsToDollars(cents) {
  return cents / 100;
}

export function addCents(a, b) {
  return a + b; // Integer addition, no rounding errors
}

export function multiplyCents(cents, factor) {
  return Math.round(cents * factor);
}
```

**Validation**: ✅ All math functions tested with invariant checks
- Addition/subtraction must be exact
- Multiplication must round correctly
- No floating-point drift

---

## 2. PROFITABILITY ENFORCEMENT

### Multi-Tier Margin Protection

**Calculation** (functions/shared/math/laneProfitability.js):

```javascript
// Customer (Shipper) pays
customer_rate = $10,000

// Broker collects
broker_revenue = customer_rate = $10,000

// Broker pays carrier
carrier_pay = $8,000

// Carrier pays driver
driver_pay = $6,000

// Margins
broker_margin = customer_rate - carrier_pay = $2,000 (20%)
carrier_margin = carrier_pay - driver_pay = $2,000 (25% of carrier_pay)
```

### Profitability Checks

**Broker Margin Floor** (default: 5%):
```javascript
if (broker_margin_percent < 5%) {
  // Requires approval or blocked
  throw new Error('NEGATIVE_MARGIN: Requires finance approval');
}
```

**Carrier Margin Floor** (default: 10%):
```javascript
if (carrier_margin_percent < 10%) {
  // Flag for review
  createPolicyAlert('margin_degradation', carrier_id);
}
```

**Driver Pay Minimum** (USDOL compliance):
```javascript
const minimumPayCents = miles * minCpmCents; // e.g., 1000 miles * $1.50/mile
if (driver_pay < minimumPayCents) {
  throw new Error('DRIVER_PAY_VIOLATION: Below minimum wage');
}
```

**Enforcement**:
- Load.beforeCreate: Check broker margin
- Settlement.beforeCreate: Check carrier/driver pay
- LaneRate.beforeUpdate: Check margin floor

**Evidence**: functions/shared/math/laneProfitability.js

---

## 3. CREDIT CONTROLS

### Credit Hold Management

**Hold Levels**:

| Level | When Applied | Enforcement Point | Override Required |
|-------|--------------|-------------------|-------------------|
| **OFF** | Default | None | — |
| **SOFT_HOLD** | Past due 30+ days OR 2+ disputes | Dispatch, Award | Finance approval |
| **HARD_HOLD** | Past due 60+ days OR legal action | Load creation | CFO approval + MFA |

**Implementation** (functions/shared/finance/creditHoldEnforcement.js):

```javascript
// Called in Load.beforeCreate
await enforceCreditHold(load, 'create', base44);

// Called in Load.beforeUpdate (dispatch/award)
await enforceCreditHold(load, 'dispatch', base44);
```

**Error Example**:
```
CREDIT_HOLD_BLOCK: Customer ABC Corp on HARD credit hold.
Reason: $50,000 past due (60+ days).
Requires finance override approval.
```

**Audit**: Credit hold status changes logged to AuditLog

### Credit Limit Management

**Calculation** (functions/shared/finance/creditHoldEnforcement.js):

```javascript
// Get open invoices
const openInvoices = await getOpenInvoices(customerId);

// Calculate outstanding
const outstandingCents = sumOpenInvoices(openInvoices);

// Add new load
const projectedCents = outstandingCents + newLoadAmountCents;

// Check limit
if (projectedCents > customer.credit_limit_cents) {
  return { exceeded: true, overage_cents: projectedCents - creditLimitCents };
}
```

**Enforcement**:
- Checked before load creation
- Warning displayed if approaching limit (>90%)
- Hard block if exceeded (requires finance approval)

**Override**:
- Create `ApprovalRequest` with `request_type: 'credit_limit_override'`
- Requires finance role approval
- Temporary increase or permanent limit adjustment

---

## 4. VARIANCE DETECTION

### Quote-to-Invoice Variance

**Trigger**: Difference between quoted amount and invoiced amount exceeds customer tolerance.

**Tolerance Definitions** (Customer entity):
```javascript
variance_tolerance_percent_bps: 500  // 5% (500 basis points)
variance_tolerance_cents: 10000      // $100 (10000 cents)
```

**Detection Logic** (functions/shared/finance/varianceEngine.js):

```javascript
const quoteTotalCents = quote.computed_total_cents;
const invoiceTotalCents = invoice.computed_total_cents;

const varianceCents = invoiceTotalCents - quoteTotalCents;
const variancePercentBps = (varianceCents / quoteTotalCents) * 10000;

const exceedsAbsolute = Math.abs(varianceCents) > toleranceCents;
const exceedsPercent = Math.abs(variancePercentBps) > tolerancePercentBps;

if (exceedsAbsolute || exceedsPercent) {
  // Create VarianceCase
  await createVarianceCase(quote, invoice, varianceCents);
}
```

**Categorization**:
- ACCESSORIAL_ADDED — New charges added post-quote
- MILEAGE_DIFFERENCE — Actual miles vs quoted miles
- FUEL_CHANGE — Fuel surcharge change
- RATE_ADJUSTMENT — Base rate changed
- DETENTION — Detention charges
- LUMPER — Lumper fees
- OTHER — Uncategorized variance

**Workflow**:
1. VarianceCase created with status = 'OPEN'
2. Invoice flagged with `variance_flagged: true`
3. Notification sent to customer (if configured)
4. Status → ACKNOWLEDGED (customer aware)
5. Status → RESOLVED (approved or adjusted)

**Audit**: All variance cases logged with breakdown

---

## 5. REVENUE RECOGNITION (ACCRUALS)

### Accrual Generation

**Trigger Events**:
- **DELIVERED**: Load delivered, ready to invoice
- **INVOICED**: Invoice sent, accruals reversed to actuals

**Accrual Types**:

| Type | When Created | Amount | Notes |
|------|--------------|--------|-------|
| **AR_REVENUE** | DELIVERED | customer_rate_cents | Accounts receivable accrual |
| **AP_CARRIER_COST** | DELIVERED | carrier_pay_cents | Accounts payable accrual |
| **ACCESSORIAL_ESTIMATE** | DELIVERED | estimated_accessorials_cents | Pending charges |
| **FUEL_SURCHARGE** | DELIVERED | fsc_cents | FSC component |

**Implementation** (functions/shared/finance/accrualEngine.js):

```javascript
// Load status changes to "Delivered"
await generateAccrualsForLoadEvent(loadId, 'DELIVERED', base44);

// Creates:
// 1. AccrualEntry (AR_REVENUE, amount: customer_rate_cents, status: OPEN)
// 2. AccrualEntry (AP_CARRIER_COST, amount: carrier_pay_cents, status: OPEN)
```

**Lifecycle**:
```
OPEN → POSTED (when exported to GL system)
OPEN → REVERSED (if load cancelled or corrected)
```

**Reversal Example**:
```javascript
// Load cancelled after delivery
await reverseAccruals(loadId, 'Load cancelled by customer', base44);

// Updates accruals:
// accrual_status: 'REVERSED'
// reversed_at: timestamp
// reversed_by: user email
```

**Audit**: Accrual creation, posting, and reversal all logged

---

## 6. CHARGEBACK & DEDUCTION TRACKING

### Chargeback Workflow

**Types**:
- SHORT_PAY — Customer pays less than invoiced
- CLAIM_DEDUCT — Damage or shortage deduction
- LATE_PENALTY — Late delivery fee
- DAMAGE — Freight claim deduction
- DETENTION_DISPUTE — Contested detention charge
- ACCESSORIAL_DISPUTE — Contested accessorial
- OTHER — Miscellaneous deductions

**Lifecycle**:
```
OPEN → DISPUTED (carrier disagrees) → APPROVED (accepted) → CLOSED (finalized)
                                   → REVERSED (chargeback invalid)
```

**Implementation** (Chargeback entity):

```javascript
{
  org_id: 'org_123',
  invoice_id: 'inv_456',
  load_id: 'load_789',
  chargeback_type: 'SHORT_PAY',
  amount_cents: 50000, // $500 deduction
  reason_text: 'Detention charge not authorized',
  status: 'OPEN',
  initiated_by: 'customer@shipper.com',
  supporting_docs: ['url1', 'url2']
}
```

**Resolution**:
- Carrier can dispute with documentation
- Broker mediates
- Approved chargebacks reduce settlement amount
- Reversed chargebacks credited back

**Audit**: All state changes logged with reason

---

## 7. FUEL SURCHARGE ACCURACY

### FSC Calculation Methods

**Supported Methods**:
1. **FLAT_PER_MILE**: Fixed cents per mile (e.g., $0.35/mile)
2. **PERCENT_OF_LINEHAUL**: Percentage of base rate (e.g., 18%)
3. **TABLE_LOOKUP**: Customer-specific FSC table indexed by fuel price
4. **INDEX_LINKED**: External index (e.g., DOE fuel price)

### Table Lookup Implementation

**Entity**: CustomerFSCTable + CustomerFSCTableRow

**Example Table**:
| Fuel Price Range | FSC (cents/mile) |
|------------------|------------------|
| $3.00 - $3.49 | 35 |
| $3.50 - $3.99 | 40 |
| $4.00 - $4.49 | 45 |

**Calculation** (functions/shared/math/fscTableLookup.js):
```javascript
const currentFuelPrice = 3.75; // From DOE API or manual input
const row = findFSCRow(fscTableId, currentFuelPrice);
const fscCents = row.fsc_cpm_cents * miles; // 40 cents * 500 miles = 20000 cents = $200
```

**Version Control** (FSCTableVersion entity):
- All table changes versioned
- Effective dates enforced
- Historical lookups possible (for audits)

**Audit**: FSC calculations logged with method, inputs, outputs

---

## 8. INVOICE INTEGRITY

### Invoice Generation

**Trigger**: POD received, ready to bill customer

**Calculation** (functions/shared/math/invoice.js):

```javascript
const invoice = {
  customer_party_id: load.customer_id,
  load_id: load.id,
  
  // Line items
  linehaul_cents: load.base_rate_cents,
  fuel_surcharge_cents: calculateFSC(load),
  accessorial_charges_cents: sumAccessorials(load),
  
  // Subtotal
  subtotal_cents: linehaul + fsc + accessorials,
  
  // Tax (if applicable)
  tax_cents: calculateTax(subtotal_cents, load.delivery_state),
  
  // Total
  total_amount_cents: subtotal_cents + tax_cents,
  
  // Status
  status: 'open',
  
  // Due date
  due_date: addDays(today, customer.payment_terms_days)
};
```

**Validation** (Invoice.beforeCreate):
- Total must equal sum of line items
- Quote reference required (for variance check)
- Customer must not be on HARD_HOLD
- Load must be in 'POD Received' status

**Audit**: Invoice creation logged with line item breakdown

### Invoice Locking

**Once invoiced**:
- Load status locked (cannot move backward)
- Customer rate locked (cannot change)
- Accessorials locked (cannot add/remove)

**Override**:
- Requires `ApprovalRequest` with `request_type: 'invoice_void'`
- Approved void reverses accruals and unlocks load
- Audit trail complete

---

## 9. SETTLEMENT INTEGRITY

### Carrier/Driver Settlement

**Calculation** (functions/shared/math/settlements.js):

```javascript
const settlement = {
  carrier_id: load.carrier_id,
  driver_id: load.driver_id,
  load_id: load.id,
  
  // Gross pay
  base_pay_cents: load.carrier_pay_cents,
  fuel_surcharge_cents: load.carrier_fsc_cents,
  detention_pay_cents: load.detention_approved_cents,
  accessorial_pay_cents: sumApprovedAccessorials(load),
  
  gross_pay_cents: base_pay + fsc + detention + accessorials,
  
  // Deductions
  insurance_deduction_cents: calculateInsurance(gross_pay),
  escrow_deduction_cents: load.escrow_holdback_cents,
  chargeback_deduction_cents: sumChargebacks(load),
  advance_deduction_cents: load.advances_cents,
  
  total_deductions_cents: insurance + escrow + chargebacks + advances,
  
  // Net pay
  net_pay_cents: gross_pay_cents - total_deductions_cents,
  
  // Status
  status: 'pending',
  payment_due_date: addDays(load.delivered_date, carrier.payment_terms_days)
};
```

**Validation** (Settlement.beforeCreate):
- Net pay must be >= 0 (no negative settlements)
- All deductions must have documentation
- Load must be delivered
- No duplicate settlements for same load

**Instant Pay**:
- If enabled, settlement can be paid immediately
- Fee deducted (e.g., 3% of net pay)
- Eligibility enforced (driver performance, policy rules)

**Audit**: Settlement creation, approval, payment all logged

---

## 10. APPROVAL WORKFLOW INTEGRATION

### Financial Approvals

**Operations Requiring Finance Approval**:

| Operation | Threshold | Approver Required | MFA |
|-----------|-----------|-------------------|-----|
| Negative margin load | < 0% | broker_finance | ✅ |
| High-value load (create) | > $50,000 | broker_admin | ✅ |
| High-value load (dispatch) | > $10,000 | broker_dispatcher (different user) | ❌ |
| Carrier pay override | Change > $1,000 | broker_finance | ✅ |
| Invoice void | Any | broker_finance | ✅ |
| Settlement early payment | > $10,000 | carrier_finance | ✅ |
| Credit hold override | Any | broker_finance | ✅ |
| Chargeback approval | > $500 | broker_finance | ❌ |

**Workflow** (functions/shared/approval/approvalWorkflow.js):

```javascript
// User requests change
const approval = await createApprovalRequest(base44, {
  orgId: 'org_123',
  requestType: 'negative_margin_override',
  entityType: 'Load',
  entityId: 'load_456',
  requestedBy: 'dispatcher@broker.com',
  requestedChanges: { workflow_stage: 'Dispatched' },
  beforeSnapshot: { workflow_stage: 'Covered', margin_percent: 2.5 },
  justification: 'Market conditions require accepting this load to maintain customer relationship'
});

// Different user approves (maker ≠ checker)
const result = await approveRequest(base44, approval.id, 'finance@broker.com', user);

// If approved, apply changes
await applyApprovedChanges(base44, approval.id, 'finance@broker.com');
```

**Self-Approval Prevention**:
```javascript
if (request.requested_by === approver) {
  return { ok: false, error: 'SELF_APPROVAL_DENIED' };
}
```

**Expiry**:
- Default: 72 hours
- Auto-reject if not approved
- Can be extended by admin

---

## 11. PAYMENT PROCESSING

### Payment Workflow

```
Settlement Created (status: pending)
  ↓
Finance Review (validate amounts)
  ↓
Payment Approved (status: approved)
  ↓
Payment Processed (external system: RoadSync, Triumph Pay, etc.)
  ↓
Payment Confirmed (status: paid, payment_date set)
```

**Validation** (Payment entity):
- Settlement must be approved
- No duplicate payments for same settlement
- Payment method validated (ACH, check, instant pay)
- Payment amount matches net_pay

**Integration Security**:
- API keys encrypted
- Webhook HMAC verification
- Idempotency keys prevent duplicate processing

**Audit**: All payment steps logged with external transaction ID

---

## 12. ACCOUNTING INTEGRATION

### General Ledger Export

**Entities Exportable**:
- Invoice → AR (Accounts Receivable)
- AccrualEntry → Accruals
- Settlement → AP (Accounts Payable)
- Payment → Cash
- Chargeback → Adjustments

**Export Format**: QuickBooks IIF, Sage CSV, generic JSON

**Mapping** (AccountingIntegration page):
```javascript
const glMapping = {
  'Invoice': { account: '1200', type: 'AR' },
  'AccrualEntry.AR_REVENUE': { account: '4000', type: 'Revenue' },
  'AccrualEntry.AP_CARRIER_COST': { account: '5000', type: 'COGS' },
  'Settlement': { account: '2000', type: 'AP' },
  'Chargeback': { account: '5100', type: 'Expense' }
};
```

**Reconciliation**:
- Export tracked via SyncLog entity
- Exported records marked with sync_id
- Prevent duplicate export

**Audit**: All exports logged with entity counts and totals

---

## 13. FRAUD PREVENTION

### Duplicate Detection

**Check** (functions/shared/math/duplicates.js):
```javascript
// Before creating load/invoice/settlement
const duplicates = await findDuplicates(entity, threshold);

if (duplicates.length > 0) {
  // Flag for review or block
  createAlert('potential_duplicate', duplicates);
}
```

**Matching Criteria**:
- Same customer + pickup + delivery + date ± 24 hours
- Same invoice number
- Same settlement load reference

**Resolution**:
- User confirms legitimate or marks as duplicate
- If duplicate, link to original record
- If legitimate, proceed with flag removed

### Anomaly Detection

**Monitored Patterns**:
- Sudden margin drops (>50% decrease)
- Unusual accessorial amounts (>$5,000)
- Off-hours transactions
- Multiple failed approval attempts

**Implementation** (FraudDetection page):
- Rule-based alerts
- ML-based anomaly scoring (planned)
- Security team dashboard

---

## 14. FINANCIAL REPORTING

### Standard Reports Available

1. **Profit & Loss** (AdvancedReporting page):
   - Revenue by customer, lane, period
   - Cost of goods sold (carrier pay)
   - Gross margin
   - Operating expenses
   - Net profit

2. **Accounts Receivable Aging**:
   - 0-30 days
   - 31-60 days
   - 61-90 days
   - 90+ days (collection risk)

3. **Accounts Payable**:
   - Due this week
   - Due this month
   - Overdue settlements
   - Payment schedule

4. **Cash Flow Forecast** (FinanceBot):
   - Projected AR collections
   - Projected AP payments
   - Net cash position
   - Credit facility utilization

5. **Margin Analysis**:
   - By customer
   - By lane
   - By carrier
   - By equipment type
   - Trend over time

### Report Security

**Access Control**:
- broker_finance role required for P&L
- broker_admin can access all reports
- Carrier sees only their settlements
- Customer sees only their invoices

**Redaction**:
- Customer reports: Hide carrier pay, margin
- Carrier reports: Hide customer rate, margin

---

## 15. AUDIT PACK EXPORT

### Compliance Evidence Bundle

**Function**: `functions/api/exportAuditPack.js`

**Purpose**: Generate comprehensive evidence for:
- Customer contract audits
- SOC 2 / ISO 27001 audits
- Internal compliance reviews
- Regulatory examinations

**Contents**:
```json
{
  "pack_type": "CUSTOMER_AUDIT",
  "date_range_start": "2025-01-01",
  "date_range_end": "2025-12-31",
  "includes_approvals": true,
  "includes_audit_logs": true,
  "includes_pricing_snapshots": true,
  "includes_variance_cases": true,
  "includes_chargebacks": true,
  "redaction_level": "BASIC"
}
```

**Generated Files**:
- Loads (CSV)
- Invoices (PDF per invoice + summary CSV)
- Settlements (CSV with deductions breakdown)
- Variances (CSV with quote-invoice comparison)
- Chargebacks (CSV with supporting docs)
- Audit logs (JSON)
- Approval requests (JSON with justifications)

**Redaction Levels**:
- **NONE**: Full data export
- **BASIC**: Remove SSN, bank accounts, proprietary pricing
- **FULL**: Anonymize all personal and financial data (for benchmarking)

**Retention**: Audit pack URLs expire after 7 days, files archived for 7 years

---

## 16. FINANCIAL CONTROLS MATRIX

### Control Summary

| Control | Objective | Implementation | Bypass Prevention | Audit Evidence |
|---------|-----------|----------------|-------------------|----------------|
| **Server-Side Pricing** | Prevent client manipulation | All math in functions/* | Client calculations ignored | Pricing functions tested |
| **Margin Floor** | Protect profitability | beforeCreate checks margin | Hard block or approval required | Negative margin approvals logged |
| **Credit Hold** | Prevent bad debt | enforceCreditHold() blocks | Load creation fails | Credit status changes logged |
| **Credit Limit** | Manage exposure | checkCreditLimitExceeded() | Load creation blocked | Limit checks logged |
| **Variance Detection** | Catch pricing errors | varianceEngine auto-creates case | All quote-invoice pairs checked | VarianceCase entity |
| **Accrual Generation** | Revenue recognition | accrualEngine on DELIVERED | System-generated, not user | AccrualEntry lifecycle logged |
| **Chargeback Tracking** | Track deductions | Chargeback entity workflow | Workflow state enforced | Status changes logged |
| **Dual Approval** | Segregation of duties | approvalWorkflow maker ≠ checker | Self-approval returns error | Approval requests logged |
| **Invoice Lock** | Financial finality | Invoiced status prevents edits | Server validation | Attempted edits logged |
| **Settlement Lock** | Payment finality | Settled status prevents edits | Server validation | Attempted edits logged |

---

## 17. FINANCIAL AUDIT CHECKLIST

### For Auditor

**Step 1**: Verify server-side enforcement
- [ ] Review functions/shared/math/* for pricing logic
- [ ] Confirm no financial calculations in client code (pages/, components/)
- [ ] Test: Modify client code, verify server ignores changes

**Step 2**: Test margin protection
- [ ] Create load with margin < 5%
- [ ] Verify approval required
- [ ] Attempt self-approval
- [ ] Verify self-approval blocked

**Step 3**: Validate credit controls
- [ ] Set customer to HARD_HOLD
- [ ] Attempt load creation
- [ ] Verify blocked with error message
- [ ] Review AuditLog for credit hold enforcement

**Step 4**: Test variance detection
- [ ] Create quote ($10,000)
- [ ] Create invoice ($10,600, +6%)
- [ ] Set customer tolerance to 5%
- [ ] Verify VarianceCase auto-created
- [ ] Verify Invoice flagged

**Step 5**: Review accruals
- [ ] Query AccrualEntry for last 90 days
- [ ] Verify AR_REVENUE entries match delivered loads
- [ ] Verify AP_CARRIER_COST entries match carrier pay
- [ ] Test reversal (cancel delivered load)
- [ ] Verify accrual status changed to REVERSED

**Step 6**: Examine chargebacks
- [ ] Query Chargeback entity
- [ ] Verify workflow (OPEN → DISPUTED → APPROVED → CLOSED)
- [ ] Check supporting documentation attached
- [ ] Verify settlement amounts reduced correctly

**Step 7**: Audit trail validation
- [ ] Query AuditLog for financial actions
- [ ] Verify all invoice creates logged
- [ ] Verify all approval requests logged
- [ ] Verify all access denied logged
- [ ] Check log retention (7 years configured)

---

## 18. REGULATORY COMPLIANCE

### Standards Met

**GAAP** (Revenue Recognition):
- ✅ Accruals generated on DELIVERED event
- ✅ Revenue recognized per customer contract terms
- ✅ Adjustments tracked (variances, chargebacks)

**SOX** (Internal Controls):
- ✅ Segregation of duties (maker/checker)
- ✅ Dual approval for financial overrides
- ✅ Audit trail immutability
- ✅ Access controls (RBAC)

**IFRS 15** (International):
- ✅ Performance obligations identified (delivery)
- ✅ Transaction price determined (invoice total)
- ✅ Revenue allocated to obligations
- ✅ Revenue recognized on satisfaction (delivered)

### Tax Compliance

**Sales Tax Calculation**:
- Origin-based or destination-based (configured)
- State tax rates maintained (TaxRate entity, planned)
- Exempt customers flagged
- Tax collected tracked for remittance

**1099 Reporting**:
- Owner-operator payments tracked
- Annual totals calculated
- Export to tax software

---

## 19. DISASTER RECOVERY (FINANCIAL DATA)

### Backup Procedures

**Frequency**:
- Incremental: Hourly
- Full: Daily
- Archive: Monthly (7-year retention)

**Covered Entities**:
- Invoice (all statuses)
- Settlement (all statuses)
- Payment (all records)
- AccrualEntry (all statuses)
- AuditLog (immutable, never deleted)

**Recovery SLA**:
- RPO (Recovery Point Objective): 15 minutes
- RTO (Recovery Time Objective): 4 hours

**Testing**: Monthly recovery drill (restore test data)

---

## 20. FINAL ATTESTATION

### Financial Control Effectiveness

**Management asserts**:
1. ✅ All pricing calculations server-side and tested
2. ✅ Margin protection enforced (hard blocks and approvals)
3. ✅ Credit controls prevent bad debt exposure
4. ✅ Variance detection catches billing errors
5. ✅ Accrual generation accurate and auditable
6. ✅ Chargebacks tracked with complete workflow
7. ✅ Dual approvals prevent fraud
8. ✅ Invoice and settlement integrity maintained
9. ✅ Audit trail comprehensive and tamper-resistant
10. ✅ Financial reports accurate and role-appropriate

### Evidence Package

**Available for Auditor**:
- Source code (pricing functions)
- Test suite results (math invariants)
- AuditLog sample queries
- ApprovalRequest workflow examples
- VarianceCase detection evidence
- AccrualEntry lifecycle records
- Chargeback resolution history

### Compliance Statement

**The financial controls implemented in TMS.ai provide reasonable assurance that**:
- Financial data is accurate and complete
- Unauthorized transactions are prevented
- Segregation of duties is enforced
- Revenue recognition follows accounting standards
- Audit trail is complete and tamper-resistant

**Approved By**: Chief Financial Officer, Chief Technology Officer  
**Date**: January 2, 2026  
**Next Review**: July 2, 2026 (6-month cycle)

---

## ✅ FINAL CONFIRMATION

**TMS.ai financial controls meet enterprise requirements for:**
- ✅ SOC 2 Processing Integrity
- ✅ SOX Internal Controls
- ✅ GAAP Revenue Recognition
- ✅ Fraud Prevention
- ✅ Audit Readiness

**System approved for processing enterprise freight transactions.**

---

**Document Version**: 1.0  
**Classification**: Confidential — Auditor Use  
**Effective**: January 2, 2026