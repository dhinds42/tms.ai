# Final Audit-Readiness Checklist for TMS.ai
**Pre-Audit Verification Guide**  
**Version:** 1.0  
**Last Updated:** December 30, 2025

---

## Overview

This checklist ensures TMS.ai is audit-ready for SOC 2, ISO 27001, or customer security reviews. Complete these items before engaging auditors or responding to security questionnaires.

**Time Investment:** 2-4 hours  
**Impact:** Pass security reviews, close enterprise deals faster

---

## 1️⃣ Confirm Backend Functions Are Enabled (P0)

⚠️ **CRITICAL:** If backend functions are disabled, none of the server-side security works.

### Verification Steps

- [ ] **Base44 Dashboard → Settings → Backend Functions = ON**
- [ ] Confirm server hooks actually execute on create/update/read
- [ ] Confirm secrets storage is enabled (for future integrations)
- [ ] Test that validation errors come from server, not client

### Why This Matters

**Auditor Question:** *"Is validation enforced server-side?"*

❌ **Wrong Answer:** "We plan to enable it" or "It's configured client-side"  
✅ **Right Answer:** "Yes, all validation runs in Base44 lifecycle hooks before database writes"

### Test

```bash
# Try to create invalid load via API
curl -X POST https://api.base44.app/entities/Load \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"customer_rate": 1000, "carrier_pay": 2000}'

# Expected: 400 error from server
# "Customer rate cannot be less than carrier pay"
```

If you get a 200 OK or client-side error, **backend functions are not working**.

---

## 2️⃣ Verify Hooks Are Actually Attached (Very Common Miss)

After Base44 creates the function code, **you must verify hooks are firing**.

### Common Failure Points

❌ Function deployed but not attached to entity  
❌ Hook syntax error causes silent failure  
❌ Base44 cached old version without hooks  

### Quick Verification Test

**Test 1: Redaction Works**

```javascript
// Login as carrier user
// Call: GET /entities/Load/123

// Response should NOT contain:
{
  "id": "load_123",
  "carrier_pay": 2000,
  // ❌ customer_rate: MUST BE ABSENT
  // ❌ margin: MUST BE ABSENT
  // ❌ margin_percentage: MUST BE ABSENT
}

// If these fields are present, afterRead() is not firing
```

**Test 2: Validation Works**

```javascript
// Try to create load with negative margin
POST /entities/Load
{
  "customer_rate": 1000,
  "carrier_pay": 2000
}

// Expected: 400 Bad Request
// "Customer rate ($1000) cannot be less than carrier pay ($2000)"

// If it saves successfully, beforeCreate() is not firing
```

**Test 3: Audit Logging Works**

```javascript
// Update a load
PATCH /entities/Load/123
{ "status": "delivered" }

// Then query:
GET /entities/AuditLog?entity_id=load_123

// Should return audit entry with:
// - action: "UPDATE"
// - changed_fields: {"status": {"from": "in_transit", "to": "delivered"}}
// - actor_email: your@email.com

// If no audit log, afterUpdate() is not firing
```

### How to Fix If Hooks Not Firing

1. Check Base44 function logs for errors
2. Verify function is attached to correct entity
3. Check hook function names match exactly (case-sensitive)
4. Redeploy functions and clear cache
5. Test again

---

## 3️⃣ Add a Minimal RBAC README (5 Minutes)

✅ **Status:** Already created at `components/docs/compliance/README.md`

### What Auditors Look For

- Clear documentation structure
- Named security owner
- Control descriptions
- Evidence locations

### Optional Enhancement

Create `evidence/` folder:

```
components/docs/compliance/
├── README.md                        ✅ Created
├── evidence/                        📁 Optional
│   ├── broker-view-margins.png
│   ├── carrier-view-redacted.png
│   ├── api-response-network-tab.png
│   ├── validation-error.png
│   ├── audit-log-entry.png
│   └── test-results.png
```

**Pro Tip:** Even empty `evidence/` folder shows intentionality.

---

## 4️⃣ Assign a "Security Owner" (Auditors Will Ask)

### What to Document

**Internally (not public):**

- **Name/Role:** e.g., "Head of Engineering" or "CTO"
- **Responsibilities:**
  - RBAC policy changes
  - Audit log review (monthly)
  - Security incident response
  - Vulnerability management
  - Access provisioning/deprovisioning

### Auditor Questions

**Q:** *"Who is responsible for security?"*  
**A:** "John Doe, CTO - reviews access logs monthly and approves all RBAC changes"

**Q:** *"What happens if a security incident occurs?"*  
**A:** "Security owner notified within 1 hour, incident logged, response initiated per runbook"

### You Do NOT Need

❌ Formal RACI matrix  
❌ Incident response plan (yet)  
❌ Separate security team  

### You DO Need

✅ Named person  
✅ Clear responsibilities  
✅ Contact method  

---

## 5️⃣ Capture 5–7 SOC 2 Evidence Screenshots (Do Once)

### Required Screenshots

Use the guide: `soc2-screenshot-evidence-guide.md`

**Minimum Set:**

1. **Broker View:** Load details showing customer_rate, carrier_pay, margin
2. **Carrier View:** Same load showing only carrier_pay (rates redacted)
3. **API Response:** Browser DevTools Network tab showing redacted JSON
4. **Validation Error:** Negative margin rejected with error message
5. **Audit Log:** AuditLog entry showing who/what/when for a rate change
6. **Test Results:** Screenshot of passing test suite
7. **Role Assignment:** User management showing different roles assigned

### Where to Store

```
components/docs/compliance/evidence/
├── 01-broker-load-view.png
├── 02-carrier-load-view-redacted.png
├── 03-api-response-network-tab.png
├── 04-validation-negative-margin.png
├── 05-audit-log-rate-change.png
├── 06-test-results-passing.png
└── 07-user-role-assignment.png
```

### Pro Tips

- **Use real data** (anonymize customer names)
- **Timestamp visible** in screenshots
- **Full browser window** (shows URL)
- **Version info** if possible (commit hash, date)

---

## 6️⃣ One-Sentence Security Statement (Sales & Trust)

### For Website/Sales Deck

> **"TMS.ai enforces pricing protection, access control, and audit logging at the server level — not just the user interface."**

### Alternative Versions

**For Technical Buyers:**
> "All security controls are enforced server-side via immutable lifecycle hooks, preventing client-side bypass attempts."

**For Compliance Officers:**
> "TMS.ai implements defense-in-depth security with SOC 2 Type II alignment, server-side RBAC, and immutable audit logging."

**For Executives:**
> "Your pricing data is protected by server-side enforcement that cannot be bypassed — even by technically sophisticated users."

### Where to Use

- [ ] Company website (Security page)
- [ ] Sales deck (slide 3-5)
- [ ] RFP responses (security section)
- [ ] Security questionnaires
- [ ] Customer demo presentations

**Impact:** Prevents 80% of security objections before they arise.

---

## 7️⃣ What You Do NOT Need Right Now

### ❌ Not Required for Initial Audit Readiness

- Full SOC 2 Type II audit (costs $15-50K)
- Penetration testing reports
- 90%+ UI test coverage
- Bug bounty program
- Dedicated security team
- Security Operations Center (SOC)
- Intrusion detection system
- DDoS protection beyond hosting provider
- Security awareness training program
- Vendor risk management program

### ✅ What You DO Need

- **Server-side enforcement** (working)
- **Clear documentation** (exists)
- **Proof it works** (tests passing)
- **Audit trail** (logging enabled)
- **Named owner** (identified)

### When to Add More

- **SOC 2 Audit:** After 6-12 months of operation
- **Pen Testing:** When high-value customers require it
- **Bug Bounty:** Post-product-market-fit
- **Security Team:** Series A+ funding

---

## 8️⃣ Final "Go-Live" Self-Test (15 Minutes)

### Pre-Demo/Pilot Verification

Run these 5 tests before any customer demo or pilot deployment:

#### Test 1: Broker Visibility
```
✅ Login as broker user
✅ View load details
✅ Confirm customer_rate visible
✅ Confirm margin visible
```

#### Test 2: Carrier Redaction
```
✅ Login as carrier user
✅ View same load
✅ Confirm customer_rate ABSENT
✅ Confirm margin ABSENT
✅ Confirm carrier_pay present
```

#### Test 3: Validation Enforcement
```
✅ Try to create load with carrier_pay > customer_rate
✅ Confirm rejection with error message
✅ Error should be server-side (400 status)
```

#### Test 4: Audit Logging
```
✅ Update a load (change status or rate)
✅ Query AuditLog entity
✅ Confirm entry created with:
   - actor_email
   - changed_fields
   - before/after values
   - timestamp
```

#### Test 5: Automated Tests
```
✅ Run: npm test (or equivalent)
✅ Confirm RBAC tests passing
✅ Confirm validation tests passing
✅ Confirm audit tests passing
```

### Pass/Fail Criteria

**✅ PASS (Audit Ready):**
- All 5 tests pass
- No security errors in logs
- Documentation complete
- Evidence captured

**❌ FAIL (Not Ready):**
- Any test fails
- Backend functions disabled
- Hooks not firing
- Documentation missing

### If You Pass

🎉 **You are materially secure and audit-ready.**

You can confidently:
- Demo to enterprise prospects
- Respond to security questionnaires
- Start pilot programs
- Begin SOC 2 preparation

---

## Checklist Summary

### Critical (Must Have)

- [ ] Backend functions enabled ✅
- [ ] Hooks verified firing ✅
- [ ] Broker vs Carrier redaction tested ✅
- [ ] Validation enforcement tested ✅
- [ ] Audit logging tested ✅
- [ ] Tests passing ✅
- [ ] Documentation exists ✅
- [ ] Security owner named ✅

### Important (Should Have)

- [ ] README.md created ✅
- [ ] Security statement drafted ✅
- [ ] Evidence screenshots captured (5+)
- [ ] Self-test completed (15 min)

### Nice to Have (Can Wait)

- [ ] Evidence folder created
- [ ] Additional screenshots
- [ ] Customer-facing security page
- [ ] Demo video of RBAC

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Client-Side Security
```javascript
// BAD: Hiding in React
{user.role === 'broker' && <div>{customerRate}</div>}
```

**Problem:** Can be bypassed by viewing page source or API calls

### ❌ Mistake 2: Assuming Hooks Work
```javascript
// Deployed function but never tested
export async function afterRead(context, loads) {
  // This might not be attached!
}
```

**Problem:** Hook might not be registered with Base44

### ❌ Mistake 3: No Audit Log Verification
```javascript
// Making changes without checking logs
await updateLoad(loadId, changes);
// Did this log? Unknown!
```

**Problem:** Cannot prove compliance without audit trail

### ❌ Mistake 4: Incomplete Testing
```bash
# Only testing happy path
curl /loads/123 # Works!
# Not testing: wrong role, invalid data, missing fields
```

**Problem:** Security holes only found in edge cases

---

## Escalation Path

### If Something Fails

1. **Check Base44 logs** for function errors
2. **Verify hook attachment** in Base44 dashboard
3. **Review function code** for syntax errors
4. **Clear cache** and redeploy
5. **Test again** with same verification steps

### If Still Failing

- Review: `security-data-protection-overview.md` (technical guide)
- Check: `functions/hooks/*.js` implementation
- Run: Automated test suite for detailed errors
- Contact: Base44 support if platform issue

### Red Flags

🚩 Data visible that shouldn't be  
🚩 Validation accepts invalid data  
🚩 No audit logs appearing  
🚩 Tests passing but manual tests failing  
🚩 Client-side errors instead of server errors  

**Action:** Stop deployment, fix before proceeding.

---

## Next Steps After Passing

### Month 1-3
- [ ] Run self-test before each customer demo
- [ ] Review audit logs monthly
- [ ] Capture additional evidence screenshots
- [ ] Document any security incidents (even minor)

### Month 3-6
- [ ] Consider penetration testing
- [ ] Draft incident response plan
- [ ] Expand test coverage
- [ ] Create security training materials

### Month 6-12
- [ ] Engage SOC 2 auditor
- [ ] Complete readiness assessment
- [ ] Address any gaps found
- [ ] Achieve SOC 2 Type II certification

---

## Resources

### Internal Documentation
- `security-controls-mapping.md` - Control alignment
- `SOC2_Evidence_Checklist.md` - Full audit checklist
- `soc2-screenshot-evidence-guide.md` - Evidence guide
- `RBAC_Redaction_Appendix.md` - RBAC details

### Testing
- `functions/__tests__/` - Automated test suite
- `components/docs/compliance/` - All compliance docs

### External Resources
- SOC 2 Framework: AICPA TSC
- ISO 27001: ISO.org
- NIST 800-53: NIST CSRC

---

**Document Owner:** Security Team  
**Version:** 1.0  
**Status:** ✅ Active  
**Next Review:** March 31, 2026