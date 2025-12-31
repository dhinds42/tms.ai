# Open Business Decisions
**TMS.ai Financial Math Implementation**

## 🔴 CRITICAL - Need Immediate Decision

### 1. Negative Margin Policy
**Question:** Are loads with negative margins allowed?

**Current Implementation:**
- Rejected by default
- Can be overridden by admin/broker with `margin_override_approved = true`
- No limit on how negative

**Options:**
A) **Strict Block** - Never allow negative margins
   - Pros: Protects profitability
   - Cons: May lose strategic customers/lanes
   
B) **Admin Override** (Current) - Allow with approval
   - Pros: Flexibility for strategic decisions
   - Cons: Could be abused
   
C) **Threshold-Based** - Allow up to -$500 or -10%
   - Pros: Controlled flexibility
   - Cons: Arbitrary limits

**Recommendation:** Option C with approval workflow for amounts beyond threshold

**Required Actions:**
- [ ] Define max negative margin threshold
- [ ] Create override approval UI
- [ ] Add override reason field (required)
- [ ] Notify finance team on overrides
- [ ] Monthly override report for management

---

### 2. Tax Calculation Support
**Question:** Does the system need to support sales tax?

**Current Implementation:** Not implemented

**If YES, need decisions on:**
- Tax calculation method (line-level vs invoice-level)
- Rounding rules for tax (round per-line or final?)
- Tax exemption handling
- Multiple tax jurisdictions?
- Tax-inclusive vs tax-exclusive display

**Recommendation:** Implement if required by customers; otherwise defer to P2+

**Required if implemented:**
- [ ] Tax rate table by state/jurisdiction
- [ ] Tax exemption certificate tracking
- [ ] Tax reporting requirements
- [ ] Compliance with state regulations

---

### 3. Credits & Chargebacks
**Question:** How are negative line items represented?

**Current Implementation:** Not explicitly supported

**Use Cases:**
- Customer disputes charge
- Service failure credit
- Pricing correction
- Promotional discount

**Options:**
A) **Separate Credit Memo Entity** - Create opposite invoice
B) **Negative Line Items** - Allow negative amounts in invoice
C) **Adjustment Field** - Separate adjustment tracking

**Recommendation:** Option A (separate credit memo entity) for audit clarity

**Required:**
- [ ] Credit memo approval workflow
- [ ] Link to original invoice
- [ ] Impact on balance due
- [ ] Reversal of margin/profit

---

### 4. Settlement Negative Net Pay
**Question:** Can driver/carrier owe money to the company?

**Current Implementation:**
- Allowed if net < -$1000
- Flagged for review with `requires_review = true`

**Options:**
A) **Block Negative** - Never allow
B) **Allow with Limit** (Current) - Max -$1000
C) **Carry Forward** - Add to next period
D) **Block Future Advances** - If net negative, no more advances

**Recommendation:** Option B + D hybrid

**Required:**
- [ ] Policy documentation
- [ ] Driver/carrier notification process
- [ ] Collection process for negative balances
- [ ] Legal review of deduction limits

---

### 5. Rounding Strategy
**Question:** Which rounding method should be used?

**Current Implementation:** HALF_UP (commercial rounding)

**Options:**
A) **HALF_UP** (Current) - 0.5 rounds up
   - Standard commercial practice
   
B) **HALF_EVEN** - 0.5 rounds to nearest even (banker's rounding)
   - Statistically unbiased
   - Banking industry standard
   
C) **Configurable** - Per customer/contract
   - Maximum flexibility
   - Complex to manage

**Sub-Questions:**
- Round per line item or final total?
- Round intermediate calculations or only final?
- Different rules for customer vs carrier side?

**Recommendation:** HALF_UP for customer-facing, can use HALF_EVEN internally

**Required:**
- [ ] Document rounding policy
- [ ] Customer communication if changed
- [ ] Test edge cases (0.005, 0.015, etc.)

---

## 🟡 HIGH PRIORITY - Need Decision Soon

### 6. Override Audit Trail
**Question:** How detailed should override logging be?

**Current Implementation:** Basic audit log

**Enhanced Options:**
- Separate override approval table
- Require override reason (free text)
- Require override justification category
- Manager approval workflow
- Time-limited overrides (expire after N days)

**Recommendation:** Require reason + category for compliance

---

### 7. Financial Lock Unlock Process
**Question:** Can locked records ever be unlocked?

**Current Implementation:** Admin can unlock

**Policy Needs:**
- Unlock reason required?
- Notification to accounting?
- Re-lock after edit?
- Audit trail for unlock events?

**Recommendation:** Allow unlock with mandatory reason + accounting notification

---

### 8. Margin Variance Tolerance
**Question:** What variance is acceptable before flagging?

**Use Case:** Comparing actual vs expected margin

**Options:**
- Absolute: ±$50
- Percentage: ±5%
- Hybrid: Greater of $50 or 5%

**Recommendation:** Hybrid approach

---

### 9. Customer Lifetime Value (CLV) Methodology
**Question:** How to project CLV accurately?

**Current Implementation:** Simple 12-month projection

**Enhanced Options:**
- Include churn probability
- Seasonality adjustments
- Growth trajectory
- Discount future value

**Recommendation:** Start simple, enhance over time

---

### 10. Compliance Expiration Actions
**Question:** Should actions be fully automated?

**Current Implementation:** Automated suspension/blocking

**Concerns:**
- False positives if document uploaded but not processed
- Grace period needed?
- Manual override process?

**Recommendation:** Automate with 3-day grace + manual override

---

## 🟢 MEDIUM PRIORITY - Can Decide Later

### 11. Multi-Currency Support
**Question:** Support CAD, MXN, EUR?

**Current Implementation:** USD only

**If needed:**
- Exchange rate source
- Conversion timing (booking vs delivery)
- Rounding rules per currency
- Display preferences

---

### 12. Invoice Payment Allocation
**Question:** How to allocate partial payments across line items?

**Options:**
- Pro-rata (proportional)
- Oldest first (FIFO)
- Largest first
- Manual allocation

**Recommendation:** FIFO with manual override option

---

### 13. Historical Rate Change Tracking
**Question:** Track all rate changes with effective dates?

**Current:** `LaneRateHistory` entity exists

**Enhancements needed:**
- Automatic versioning on rate change
- Effective dating
- Bulk rate updates
- Contract negotiation history

---

### 14. Performance vs Accuracy Trade-offs
**Question:** When to cache vs recalculate?

**Examples:**
- Dashboard KPIs (cache for 5 min?)
- Invoice totals (always recalc?)
- Settlement net (always recalc?)

**Recommendation:** 
- Critical fields (invoice, settlement): always recalc
- Analytics (KPIs, reports): cache 5-15 min

---

## Decision Log Template

When decisions are made, document here:

```markdown
### Decision: [Topic]
**Date:** YYYY-MM-DD
**Decided By:** [Name/Role]
**Decision:** [Chosen option]
**Rationale:** [Why this choice]
**Implementation:** [What changes needed]
**Review Date:** [When to revisit]
```

---

## Escalation Path

**Technical Decisions:** Engineering Lead → CTO
**Business Rules:** Product Manager → VP Operations
**Financial Policy:** Controller → CFO
**Legal/Compliance:** Legal Counsel → General Counsel

---

**Document Owner:** Product & Engineering Leadership
**Review Cadence:** Monthly during implementation, quarterly post-launch
**Last Updated:** 2025-12-31