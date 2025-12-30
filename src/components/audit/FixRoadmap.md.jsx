# TMS.ai Fix Roadmap & Implementation Plan

**Version:** 1.0  
**Last Updated:** 2025-12-30

---

## Priority Levels

- **P0 - BLOCKER:** Must fix before production (security, data integrity, compliance)
- **P1 - CRITICAL:** Required for core workflows to function
- **P2 - IMPORTANT:** UX issues, missing features, polish
- **P3 - NICE TO HAVE:** Enhancements, optimizations

---

## P0 - BLOCKERS (Must Fix Now)

### P0-1: Enable Backend Functions
**Issue:** 80% of advanced features require backend but it's disabled  
**Impact:** CSV import, real integrations, server validation all non-functional  
**Effort:** 1 day (configuration)  
**Owner:** DevOps + Product

**Action Items:**
1. Enable backend functions in Base44 dashboard → Settings
2. Set up secrets for integrations (FMCSA API key, QB OAuth, etc.)
3. Test backend function execution
4. Update docs to reflect backend-enabled features

**Status:** ⏳ BLOCKED ON PRODUCT DECISION

---

### P0-2: Implement Server-Side Validation
**Issue:** Zero server-side validation - all entities accept invalid data  
**Impact:** Data corruption, negative margins, expired compliance  
**Effort:** 2 weeks  
**Owner:** Backend Engineer

**Implementation:**
```javascript
// Option A: JSON Schema Validation at Entity Level
// Add to each entity JSON schema:
{
  "name": "Carrier",
  "properties": {
    "mc_number": {
      "type": "string",
      "pattern": "^\\d{5,7}$",
      "errorMessage": "MC must be 5-7 digits"
    },
    "insurance_expiration": {
      "type": "string",
      "format": "date",
      "futureDate": true
    }
  },
  "required": ["mc_number", "company_name", "insurance_expiration"]
}

// Option B: Backend Function Middleware
export async function validateBeforeCreate(entity, data) {
  const schema = VALIDATION_SCHEMAS[entity];
  const errors = validate(data, schema);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
  return data;
}
```

**Entities to validate:**
- Load (highest priority)
- Carrier
- Driver
- Shipper
- Invoice
- Settlement

**Status:** 🚧 IN PROGRESS

---

### P0-3: Add Audit Logging
**Issue:** No audit trail for sensitive actions  
**Impact:** FMCSA 371.3 non-compliance, no forensics  
**Effort:** 1 week  
**Owner:** Backend Engineer

**Implementation:**
```javascript
// Wrap all mutations:
const auditedMutation = async (entity, action, data, user) => {
  // Perform action
  const result = await base44.entities[entity][action](data);
  
  // Log to AuditLog entity
  await base44.entities.AuditLog.create({
    entity_type: entity,
    entity_id: result.id,
    action: action,
    user_id: user.id,
    user_email: user.email,
    changes_json: data,
    ip_address: getClientIP(),
    timestamp: new Date().toISOString()
  });
  
  return result;
};
```

**Actions to audit:**
- Load creation, rate changes, status updates
- Carrier/driver/shipper creation
- Document uploads
- Invoice creation, payment processing
- Settlement approval

**Status:** 📋 PLANNED

---

### P0-4: Implement Negative Margin Prevention
**Issue:** Loads can be saved with carrier_pay > customer_rate  
**Impact:** Financial loss  
**Effort:** 2 days  
**Owner:** Frontend + Backend

**Fix:**
```javascript
// In CreateLoadModal validation:
if (formData.carrier_pay && formData.customer_rate) {
  const carrierPay = parseFloat(formData.carrier_pay);
  const customerRate = parseFloat(formData.customer_rate);
  
  if (carrierPay > customerRate) {
    setError('Carrier pay cannot exceed customer rate (negative margin)');
    return; // Block save
  }
}

// Server-side (entity validation):
if (data.carrier_pay > data.customer_rate) {
  throw new Error('Negative margin not allowed');
}
```

**Status:** ⏳ READY TO IMPLEMENT

---

### P0-5: Add ImportRun Entity for CSV Auditing
**Issue:** No audit trail for CSV imports  
**Impact:** Cannot track data source, no rollback capability  
**Effort:** 1 day

**Implementation:** Create entity (see recommendation in audit report)

**Status:** 📋 PLANNED

---

## P1 - CRITICAL (Fix Next Sprint)

### P1-1: Implement Duplicate Prevention
**Issue:** Duplicate MC numbers, CDL numbers, invoice numbers allowed  
**Effort:** 1 week

**Fix:**
```javascript
// Before creating carrier:
const existing = await base44.entities.Carrier.filter({ mc_number: data.mc_number });
if (existing.length > 0) {
  throw new Error('Carrier with this MC number already exists');
}
```

**Entities needing duplicate checks:**
- Carrier (mc_number, dot_number)
- Driver (cdl_number)
- Shipper (customer_code if provided)
- Load (load_number)
- Invoice (invoice_number)

**Status:** 📋 PLANNED

---

### P1-2: Complete Rate Confirmation Workflow
**Issue:** Rate con generation disconnected from load workflow  
**Effort:** 3 days

**Fix:**
- Integrate AutomatedRateConfirmationAI into LoadBoard
- Add workflow trigger on status='tendered'
- Auto-email rate con to carrier

**Status:** 📋 PLANNED

---

### P1-3: Add Carrier Portal Load Acceptance
**Issue:** Carrier cannot self-service accept/reject loads  
**Effort:** 1 week

**Implementation:**
- Add Tender entity with status: pending/accepted/rejected
- Add accept/reject buttons to CarrierPortal
- Add notification to broker on carrier response

**Status:** 📋 PLANNED

---

### P1-4: Implement Real Document History
**Issue:** DocumentHistory entity populated but getDocumentHistory returns mocks  
**Effort:** 2 days

**Fix:**
```javascript
export async function getDocumentHistory(documentId) {
  return await base44.entities.DocumentHistory.filter({ 
    document_id: documentId 
  }, '-timestamp', 100);
}
```

**Status:** ⏳ READY TO IMPLEMENT

---

### P1-5: Add Test Suite (60% coverage)
**Issue:** Only 4 test files exist, ~5% coverage  
**Effort:** 4 weeks

**Plan:** See TestPlan.md

**Status:** 🚧 IN PROGRESS

---

### P1-6: Fix Dynamic Tailwind Classes
**Issue:** SecurityAuditLog uses string interpolation for classes (won't work)  
**Effort:** 1 hour

**Files:**
- `components/security/SecurityAuditLog.js` (lines 36-39)

**Fix:** Use explicit class names or cn() utility

**Status:** ⏳ READY TO IMPLEMENT

---

## P2 - IMPORTANT (Fix in 2-4 weeks)

### P2-1: Implement Multi-Tenant Isolation
**Issue:** tenant_id exists but not enforced  
**Effort:** 2 weeks

**Implementation:**
- Add tenant_id to all queries automatically
- Prevent cross-tenant data access
- Add tenant switcher for multi-tenant users

---

### P2-2: Add FMCSA Real Integration
**Issue:** FMCSA verification is simulated  
**Effort:** 1 week (requires API key)

**Implementation:**
```javascript
// Backend function:
const response = await fetch(
  `https://mobile.fmcsa.dot.gov/qc/services/carriers/${mc}?webKey=${FMCSA_API_KEY}`
);
```

---

### P2-3: Complete Driver Mobile App
**Issue:** Driver app is web page, not native  
**Effort:** 3 weeks

**Implementation:**
- Add PWA manifest
- Add service worker for offline
- Add push notifications
- Add signature capture UI

---

### P2-4: Consolidate TMS-A/TMS-B
**Issue:** Parallel system architecture unclear  
**Effort:** 2 weeks (or clarify intent)

**Recommendation:** Document or consolidate

---

### P2-5: Add Email/SMS Templates
**Issue:** Automated notifications exist but use hardcoded text  
**Effort:** 1 week

**Implementation:**
- Create EmailTemplate entity
- Create SMSMessage entity
- Add template editor UI

---

## P3 - ENHANCEMENTS (Future)

### P3-1: Standardize Status Enums
**Effort:** 2 days

### P3-2: Improve Empty States
**Effort:** 3 days

### P3-3: Add Accessibility Audit
**Effort:** 1 week

### P3-4: Performance Optimization
**Effort:** 2 weeks

---

## Implementation Timeline

### Sprint 1 (Week 1-2) - BLOCKERS
- [ ] Enable backend functions (P0-1)
- [ ] Implement server validation for Load, Carrier, Driver (P0-2)
- [ ] Add negative margin prevention (P0-4)
- [ ] Create ImportRun entity (P0-5)
- [ ] Fix dynamic Tailwind classes (P1-6)

### Sprint 2 (Week 3-4) - CRITICAL
- [ ] Implement audit logging (P0-3)
- [ ] Add duplicate prevention (P1-1)
- [ ] Complete rate con workflow (P1-2)
- [ ] Implement document history (P1-4)
- [ ] Start test suite (P1-5)

### Sprint 3 (Week 5-6) - IMPORTANT
- [ ] Add carrier portal acceptance (P1-3)
- [ ] Continue test suite (P1-5)
- [ ] Add multi-tenant isolation (P2-1)
- [ ] FMCSA integration (P2-2)

### Sprint 4 (Week 7-8) - POLISH
- [ ] Complete test suite to 60% (P1-5)
- [ ] Driver mobile PWA (P2-3)
- [ ] Email templates (P2-5)

---

## Risk Mitigation

**IF Backend Functions Cannot Be Enabled:**
- Disable/hide all backend-dependent features:
  - CSV Import pages
  - Real integrations (QB, FMCSA, Opendock)
  - Webhook pages
  - App connectors
- Focus on client-side-only features
- Document limitations clearly

**IF Timeline Too Aggressive:**
- Prioritize P0 only for MVP launch
- Phase P1/P2 as post-launch iterations

---

## Success Metrics

- ✅ All P0 issues resolved
- ✅ 60%+ test coverage
- ✅ Zero critical security vulnerabilities
- ✅ FMCSA 371.3 compliant (for broker mode)
- ✅ < 5 production bugs per week

---

**Plan Owner:** Engineering Leadership  
**Review Cadence:** Weekly  
**Next Review:** 2026-01-06