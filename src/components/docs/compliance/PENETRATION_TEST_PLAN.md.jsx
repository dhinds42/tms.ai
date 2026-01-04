# PENETRATION TEST PLAN - MULTI-TENANT ISOLATION
**Target:** Dual TMS.ai Application  
**Test Environment:** STAGING ONLY  
**Authorization:** Security Team Approved  
**Date:** 2026-01-04

---

## TEST SCENARIOS

### Scenario 1: Cross-Tenant Data Access (IDOR)

**Objective:** Verify users cannot access data from other organizations

**Attack Vectors:**

**1.1 Direct Entity ID Manipulation**
```javascript
// As user from Org-A, attempt to read Org-B settlement
const response = await fetch('/api/entities/Settlement/settlement-orgB-123', {
  headers: { 'Authorization': `Bearer ${orgA_token}` }
});

// EXPECTED: 403 Forbidden or 404 Not Found
// ACTUAL: beforeRead hook blocks with TENANT_ISOLATION_VIOLATION
```

**1.2 Query Parameter Injection**
```javascript
// Attempt to override org_id in filter
const settlements = await base44.entities.Settlement.filter({
  org_id: 'org-B',  // Attacker-supplied
  status: 'pending'
});

// EXPECTED: Query rejected or org_id overridden
// ACTUAL: enforceReadIsolation() detects mismatch, returns error
```

**1.3 Bulk Read Attack**
```javascript
// Attempt to read all settlements without filter
const allSettlements = await base44.entities.Settlement.list();

// EXPECTED: Only user's org settlements returned
// ACTUAL: beforeRead injects org_id filter automatically
```

**Test Evidence Location:** `functions/__tests__/security/penetration-tests.test.js:PT-1, PT-2`

---

### Scenario 2: Privilege Escalation

**Objective:** Verify role-based access controls prevent unauthorized actions

**Attack Vectors:**

**2.1 Role Bypass Attempt**
```javascript
// Driver role attempting to approve settlement
const response = await base44.entities.Settlement.update('settlement-1', {
  status: 'approved'
});

// EXPECTED: AUTHORIZATION_FAILED (missing permission)
// ACTUAL: enforceRequestContext() → authorize() → checks permission_code
```

**2.2 Self-Approval Attack**
```javascript
// User attempts to approve their own approval request
const result = await approveRequest(base44, 'approval-123', 'user@org.com', user);

// EXPECTED: SELF_APPROVAL_DENIED
// ACTUAL: approvalWorkflow.js:98 blocks maker approving own request
```

**2.3 MFA Bypass**
```javascript
// Privileged operation without MFA
const result = await enforceMembershipMFA(base44, membership, [privilegedRole]);

// EXPECTED: MFA_REQUIRED error
// ACTUAL: mfaEnforcement.js:24 checks mfa_enabled flag
```

**Test Evidence:** `functions/__tests__/security/penetration-tests.test.js:PT-3`

---

### Scenario 3: Data Tampering & Integrity

**Objective:** Verify data cannot be modified to cross org boundaries

**Attack Vectors:**

**3.1 org_id Field Tampering**
```javascript
// Attempt to change settlement's org_id
const response = await base44.entities.Settlement.update('settlement-1', {
  org_id: 'org-B',  // Trying to "move" record
  amount: 10000
});

// EXPECTED: TENANT_ISOLATION_VIOLATION
// ACTUAL: enforceUpdateIsolation() blocks org_id changes
```

**3.2 Null org_id Injection**
```javascript
// Attempt to create record with null org_id
const response = await base44.entities.Load.create({
  org_id: null,  // Bypass attempt
  customer: 'Test'
});

// EXPECTED: org_id injected from user context
// ACTUAL: enforceCreateIsolation() injects user's org_id
```

**3.3 Orphan Record Creation**
```javascript
// Create invoice referencing load from different org
const invoice = await base44.entities.Invoice.create({
  load_id: 'load-orgB-999',  // Belongs to Org-B
  org_id: 'org-A'  // User's org
});

// EXPECTED: FK validation fails OR business logic blocks
// STATUS: ⚠️ Not currently validated (finding)
```

**Test Evidence:** `functions/__tests__/security/penetration-tests.test.js:PT-2`

---

### Scenario 4: Audit Trail Manipulation

**Objective:** Verify audit logs are immutable and complete

**Attack Vectors:**

**4.1 Audit Log Deletion Attempt**
```javascript
// Attempt to delete audit log entry
const response = await base44.entities.AuditLog.delete('audit-123');

// EXPECTED: Not allowed (no delete hook)
// STATUS: ⚠️ Verify Base44 prevents AuditLog deletes
```

**4.2 Audit Log Update Attempt**
```javascript
// Attempt to modify audit entry
const response = await base44.entities.AuditLog.update('audit-123', {
  action: 'READ'  // Change from DELETE to READ
});

// EXPECTED: Not allowed (no update hook)
// STATUS: ⚠️ Verify Base44 prevents AuditLog updates
```

**4.3 Audit Write Failure Bypass**
```javascript
// Cause audit write to fail, verify operation blocks
// See Test PT-6 in penetration-tests.test.js

// EXPECTED: Operation aborted with AUDIT_WRITE_FAILED
// ACTUAL: auditLogger.js throws, enforceUpdate returns error
```

**Test Evidence:** `functions/__tests__/security/penetration-tests.test.js:PT-6`

---

### Scenario 5: Session/Context Manipulation

**Objective:** Verify session integrity and context isolation

**Attack Vectors:**

**5.1 Membership Status Bypass**
```javascript
// User with locked membership attempts access
const user = { email: 'locked@org.com', role: 'user' };
const membership = { org_id: 'org-A', status: 'locked' };

// Attempt operation
const result = await authorize(base44, user, 'loads.read', null, 'org-A');

// EXPECTED: Blocked due to membership status
// ACTUAL: authorizationEngine.js:32 checks status !== 'active'
```

**5.2 Concurrent Org Switch Attack**
```javascript
// User switches org mid-request
// Verify org_id remains consistent throughout request

// Currently not applicable (no org switching)
// Future: If implemented, add request-scoped org context
```

**Test Evidence:** `functions/__tests__/security/penetration-tests.test.js:PT-4, PT-8`

---

### Scenario 6: Business Logic Bypasses

**Objective:** Verify business rules cannot bypass tenant isolation

**Attack Vectors:**

**6.1 Credit Hold Bypass via Direct Update**
```javascript
// Customer on credit hold
// Attacker attempts direct load status update (bypass credit check)

const load = await base44.entities.Load.update('load-123', {
  status: 'dispatched'  // Should trigger credit hold check
});

// EXPECTED: CREDIT_HOLD_BLOCK error
// ACTUAL: load/beforeUpdate.js:17 calls enforceCreditHold()
```

**6.2 Approval Workflow Bypass**
```javascript
// Large payment requiring approval
// Attempt direct update without approval request

const payment = await base44.entities.Payment.update('payment-123', {
  amount: 100000  // Exceeds threshold
});

// EXPECTED: APPROVAL_REQUIRED error
// ACTUAL: enforceUpdate() checks requiresApproval() at requestContext.js:96
```

**Test Evidence:** Existing business logic tests

---

### Scenario 7: Information Disclosure

**Objective:** Verify error messages and logs don't leak cross-org data

**Attack Vectors:**

**7.1 Error Message Enumeration**
```javascript
// Attempt to access non-existent vs unauthorized record
// Compare error messages

const response1 = await fetch('/api/entities/Settlement/does-not-exist');
const response2 = await fetch('/api/entities/Settlement/settlement-orgB-real');

// EXPECTED: Both return same generic error (404)
// VERIFY: No details about org-B settlement exposed
```

**7.2 Timing Attack**
```javascript
// Measure response time for:
// - Valid org-A settlement (fast)
// - Valid org-B settlement (blocked, fast?)
// - Non-existent settlement (fast?)

// EXPECTED: Consistent timing (no enumeration via timing)
```

**Test Evidence:** `functions/__tests__/security/penetration-tests.test.js:PT-9`

---

### Scenario 8: Export/Report Data Leakage

**Objective:** Verify exports and reports are org-scoped

**Attack Vectors:**

**8.1 Unscoped Export Request**
```javascript
// Request export of all invoices
const exportData = await fetch('/api/exports/invoices?format=csv');

// EXPECTED: Only user's org invoices
// VERIFY: Export uses beforeRead hooks (auto-scoped)
```

**8.2 Date Range Exploit**
```javascript
// Use wide date range to pull historical data
const settlements = await base44.entities.Settlement.filter({
  created_date: { $gte: '2020-01-01', $lte: '2030-12-31' }
});

// EXPECTED: Only user's org settlements (all dates)
// ACTUAL: beforeRead injects org_id, date range respected
```

**Test Evidence:** `functions/__tests__/security/penetration-tests.test.js:PT-10`

---

### Scenario 9: File Storage Isolation

**Objective:** Verify uploaded files cannot be accessed cross-org

**Attack Vectors:**

**9.1 URL Prediction**
```bash
# Guess file URL pattern
curl https://storage.base44.com/org-A/documents/doc-123.pdf
curl https://storage.base44.com/org-B/documents/doc-123.pdf

# EXPECTED: Org-B request denied
# STATUS: Requires Base44 platform verification
```

**9.2 Signed URL Sharing**
```javascript
// User from Org-A gets signed URL
const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl(
  'org-B/confidential.pdf',  // Cross-org file
  300
);

// EXPECTED: Rejected (org_id validation)
// STATUS: ⚠️ Requires integration testing
```

**Test Evidence:** `functions/__tests__/security/penetration-tests.test.js:PT-11`

---

### Scenario 10: Background Job Isolation

**Objective:** Verify scheduled jobs respect org boundaries

**Attack Vectors:**

**10.1 Data Retention Cross-Org Deletion**
```javascript
// Retention policy for Org-A accidentally deletes Org-B data
// Verify job scopes operations per org

// CODE REVIEW: functions/scheduled/dataRetentionJob.js
// FINDING: No org_id filter in expiredRecords query
// RISK: Could delete cross-org if policy misconfigured
```

**10.2 Policy Alert Cross-Org Leakage**
```javascript
// Alert generated for Org-A appears in Org-B dashboard
// Verify PolicyAlert entity has org_id

// STATUS: PolicyAlert has beforeRead hook (protected)
```

**Test Evidence:** Manual execution required

---

## EXECUTION GUIDE

### Prerequisites

1. **Staging Environment Setup:**
   - Two separate organizations: `org-test-A` and `org-test-B`
   - Test users in each org with different roles
   - Sample data in both orgs (settlements, invoices, loads)

2. **Test User Accounts:**
```json
{
  "org-A-admin": "admin@orgA.test",
  "org-A-user": "user@orgA.test",
  "org-B-admin": "admin@orgB.test",
  "org-B-user": "user@orgB.test",
  "platform-admin": "admin@platform.test",
  "no-membership": "orphan@test.com"
}
```

3. **Test Data Creation:**
```bash
# Create settlements for both orgs
curl -X POST /api/entities/Settlement \
  -H "Authorization: Bearer $ORG_A_TOKEN" \
  -d '{"org_id":"org-A","amount":5000}'

curl -X POST /api/entities/Settlement \
  -H "Authorization: Bearer $ORG_B_TOKEN" \
  -d '{"org_id":"org-B","amount":8000}'
```

### Test Execution Sequence

**Phase 1: Automated Unit Tests (30 min)**
```bash
npm test functions/__tests__/security/penetration-tests.test.js
npm test functions/__tests__/p0-remediation/tenantIsolation.test.js
npm test functions/__tests__/p0-remediation/coverageGate.test.js
```

**Phase 2: Manual API Tests (2 hours)**
- Execute scenarios 1-10 via Postman/curl
- Document responses and status codes
- Capture network traces

**Phase 3: UI Penetration Testing (1 hour)**
- Attempt to view cross-org data via browser DevTools
- Modify API requests in browser
- Test cache poisoning scenarios

**Phase 4: Database Verification (1 hour)**
```sql
-- Run database audit queries from COMPREHENSIVE_SECURITY_AUDIT_REPORT.md
-- Verify no cross-org data leakage at DB level
```

**Phase 5: Reporting (30 min)**
- Compile test results
- Document any successful attacks
- Update risk assessment

### Success Criteria

**PASS Requirements:**
- ✅ 0 successful cross-tenant data access attempts
- ✅ All IDOR attacks blocked
- ✅ All privilege escalation attempts blocked
- ✅ Audit logs capture all attack attempts
- ✅ No data leakage via error messages
- ✅ File access properly restricted
- ✅ Background jobs respect org boundaries

**FAIL Triggers:**
- ❌ Any cross-tenant read succeeds
- ❌ Any org_id tampering succeeds
- ❌ Any audit log bypass
- ❌ Any privilege escalation
- ❌ Any data leakage via timing/errors

---

## ATTACK SIMULATION SCRIPTS

### Script 1: Automated IDOR Scanner

```javascript
// tools/security/idor-scanner.js
async function scanForIDOR(entityName, recordIds, authTokens) {
  const results = [];
  
  for (const [orgName, token] of Object.entries(authTokens)) {
    for (const recordId of recordIds) {
      try {
        const response = await fetch(`/api/entities/${entityName}/${recordId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        results.push({
          org: orgName,
          record: recordId,
          status: response.status,
          allowed: response.ok,
          body: response.ok ? await response.json() : null
        });
      } catch (error) {
        results.push({
          org: orgName,
          record: recordId,
          error: error.message
        });
      }
    }
  }
  
  // Analyze: Ensure each org can only access their own records
  const violations = results.filter(r => 
    r.allowed && r.body?.org_id !== extractOrgFromToken(authTokens[r.org])
  );
  
  return {
    total_tests: results.length,
    violations: violations.length,
    details: violations
  };
}

// Run scanner
const recordIds = ['settlement-1', 'settlement-2', 'invoice-1', 'load-1'];
const tokens = {
  'org-A': 'token-A',
  'org-B': 'token-B'
};

const scanResults = await scanForIDOR('Settlement', recordIds, tokens);
console.log('IDOR Scan Results:', scanResults);
```

### Script 2: Bulk Operation Attack

```javascript
// tools/security/bulk-attack.js
async function bulkCrossTenantAttack() {
  const mixedData = [
    { org_id: 'org-A', customer: 'Legit' },
    { org_id: 'org-B', customer: 'Attack 1' },
    { org_id: 'org-C', customer: 'Attack 2' },
    { org_id: 'org-A', customer: 'Legit 2' }
  ];
  
  const results = [];
  for (const data of mixedData) {
    try {
      const created = await base44.entities.Load.create(data);
      results.push({ success: true, org: data.org_id, id: created.id });
    } catch (error) {
      results.push({ success: false, org: data.org_id, error: error.message });
    }
  }
  
  // EXPECTED: Only org-A records created (user is in org-A)
  const orgA_created = results.filter(r => r.success && r.org === 'org-A');
  const cross_org_created = results.filter(r => r.success && r.org !== 'org-A');
  
  console.log('Legit creates:', orgA_created.length);
  console.log('Cross-org creates:', cross_org_created.length);  // Should be 0
  
  return {
    test: 'Bulk Cross-Tenant Attack',
    passed: cross_org_created.length === 0
  };
}
```

### Script 3: Cache Poisoning Test

```javascript
// tools/security/cache-poison.js
async function testCachePoisoning() {
  // Login as Org-A user
  await loginAs('user@orgA.com');
  
  // Load settlements (should be cached)
  const settlementsA = await base44.entities.Settlement.list();
  console.log('Org-A settlements:', settlementsA.length);
  
  // Simulate org switch (if feature exists)
  // In current implementation, user would need to re-login
  
  // Login as Org-B user
  await loginAs('user@orgB.com');
  
  // Load settlements (should be fresh, not cached from Org-A)
  const settlementsB = await base44.entities.Settlement.list();
  console.log('Org-B settlements:', settlementsB.length);
  
  // VERIFY: No overlap in IDs
  const idsA = settlementsA.map(s => s.id);
  const idsB = settlementsB.map(s => s.id);
  const overlap = idsA.filter(id => idsB.includes(id));
  
  return {
    test: 'Cache Poisoning',
    passed: overlap.length === 0,
    overlap_count: overlap.length
  };
}
```

### Script 4: Audit Log Completeness Check

```bash
#!/bin/bash
# tools/security/audit-completeness.sh

echo "Checking audit log coverage..."

# Perform sensitive operations
curl -X PATCH /api/entities/Settlement/settlement-1 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":10000}'

# Query audit logs
AUDIT_ENTRY=$(curl -X POST /api/entities/AuditLog/filter \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"entity_type":"Settlement","action":"UPDATE"}')

# Verify entry exists
if echo "$AUDIT_ENTRY" | grep -q "settlement-1"; then
  echo "✅ Audit log created"
else
  echo "❌ Audit log MISSING - CRITICAL FAILURE"
  exit 1
fi

# Verify immutability
UPDATE_RESPONSE=$(curl -X PATCH /api/entities/AuditLog/audit-123 \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"READ"}')

if echo "$UPDATE_RESPONSE" | grep -q "403\|405"; then
  echo "✅ Audit log is immutable"
else
  echo "⚠️ Audit log may be modifiable"
fi
```

---

## EXPECTED RESULTS

### Green (Secure) Outcomes

| Test | Expected Behavior | Verification |
|------|-------------------|--------------|
| PT-1 | Cross-tenant read blocked | 403 error, audit log entry |
| PT-2 | IDOR blocked | 403 error, no data returned |
| PT-3 | Privilege escalation blocked | AUTHORIZATION_FAILED |
| PT-4 | Session tampering blocked | NO_ACTIVE_MEMBERSHIP |
| PT-5 | Concurrent access safe | org_id consistent |
| PT-6 | Audit bypass impossible | AUDIT_WRITE_FAILED blocks mutation |
| PT-7 | Admin access logged | Audit entry with role=admin |
| PT-8 | Export scoped | Only user's org data |
| PT-9 | File access denied | 403 Forbidden |
| PT-10 | Cache isolated | No cross-org cache hits |

### Red (Vulnerable) Outcomes

If any test shows:
- ❌ Cross-org data accessed
- ❌ org_id successfully tampered
- ❌ Audit log bypassed
- ❌ Error message leaks PII
- ❌ Cache poisoning succeeds

**Immediate Action:** HALT deployment, execute emergency remediation

---

## POST-TEST ACTIONS

### If Tests PASS:
1. Document test evidence
2. Capture screenshots
3. Export audit logs showing blocked attempts
4. Update compliance pack
5. Proceed to production deployment

### If Tests FAIL:
1. Categorize failures by severity
2. Execute emergency remediation for CRITICAL/HIGH
3. Re-test after fixes
4. Update security incident log
5. Notify stakeholders

### Monitoring After Deployment

**Setup Alerts:**
```javascript
// Alert on TENANT_ISOLATION_VIOLATION errors
SELECT COUNT(*) 
FROM audit_logs 
WHERE metadata->>'violation_type' = 'TENANT_ISOLATION'
  AND created_date > NOW() - INTERVAL '1 hour'
HAVING COUNT(*) > 5;  -- Threshold: 5 violations/hour
```

---

**Test Plan Approved:** Security Team  
**Date:** 2026-01-04  
**Classification:** CONFIDENTIAL - SECURITY TESTING