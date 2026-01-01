# SOC 2 Control Mapping - Feature Gating Engine

## Executive Summary

The TMS.ai Feature Gating Engine provides **audit-ready access controls** that map directly to SOC 2 Trust Services Criteria. This document demonstrates how feature gating serves as both a product feature and a compliance asset.

---

## 🎯 Auditor-Friendly Summary Statement

> **"TMS.ai uses a centralized, server-side feature-gating engine to enforce least-privilege access to driver functionality. Feature eligibility is computed using objective performance metrics and carrier policy, logged for auditability, and cannot be overridden client-side."**

This statement alone demonstrates SOC 2 compliance intent. Use it in audits and RFPs.

---

## 🔐 SOC 2 Trust Services Mapping

### CC6.1 – Logical Access Controls

**Control Objective**: The entity restricts access to information assets based on user roles and least privilege principles.

**How Feature Gating Implements This**:
- ✅ Driver features unlocked **only via server-side eligibility engine**
- ✅ RBAC + feature gating **enforced in backend hooks**
- ✅ No client-side bypass possible

**Evidence**:
| Evidence Type | Location | Description |
|---------------|----------|-------------|
| Entity Schema | `entities/DriverFeatureEligibility.json` | Stores eligibility per driver per feature |
| Enforcement Hooks | `functions/entities/*/beforeRead.js` | Server blocks ineligible actions |
| Audit Logs | `entities/AuditLog` | All unlock/lock events logged |
| Tests | `functions/__tests__/eligibility/` | Proves server-side enforcement |

**Audit Query**:
```sql
-- Show all feature access changes for driver in last 90 days
SELECT * FROM AuditLog 
WHERE entity_type = 'DriverFeatureEligibility'
  AND entity_id = 'driver_id_here'
  AND created_date >= NOW() - INTERVAL '90 days'
ORDER BY created_date DESC;
```

---

### CC6.3 – Least Privilege Access

**Control Objective**: Users are granted access only to the information necessary for their role.

**How Feature Gating Implements This**:
- ✅ Drivers see **only features they are eligible for**
- ✅ Broker margins and customer rates **always redacted** for drivers
- ✅ Eligibility based on **objective performance metrics**, not manual grants

**Evidence**:
| Evidence Type | Location | Description |
|---------------|----------|-------------|
| Redaction Logic | `functions/entities/load/afterRead.js` | Removes margin/customer_rate fields |
| Field-Level Security | `functions/shared/eligibility/` | Feature-specific redaction |
| API Response Snapshots | System logs | Show redacted fields |
| RBAC Tests | `functions/__tests__/rbac/` | Verify drivers cannot see restricted data |

**Audit Query**:
```sql
-- Show drivers who attempted to access restricted features
SELECT * FROM AuditLog 
WHERE action = 'READ_DENIED'
  AND actor_role = 'driver'
  AND created_date >= NOW() - INTERVAL '30 days';
```

---

### CC7.2 – Change Management

**Control Objective**: Changes to system components are authorized, tested, and logged.

**How Feature Gating Implements This**:
- ✅ Feature access changes **logged and auditable**
- ✅ Carrier overrides **tracked with reason and actor**
- ✅ Policy changes **versioned and timestamped**

**Evidence**:
| Evidence Type | Location | Description |
|---------------|----------|-------------|
| Policy Entity | `entities/CarrierDriverPolicy` | Carrier-specific thresholds |
| Policy History | `AuditLog` where `entity_type='CarrierDriverPolicy'` | All policy changes |
| Override Tracking | `DriverFeatureEligibility.carrier_override` | Manual grants logged |
| Approval Workflow | `entities/FeatureApprovalRequest` | Request-based unlocks |

**Audit Query**:
```sql
-- Show all carrier policy changes in last quarter
SELECT * FROM AuditLog 
WHERE entity_type = 'CarrierDriverPolicy'
  AND action IN ('CREATE', 'UPDATE')
  AND created_date >= NOW() - INTERVAL '90 days'
ORDER BY created_date DESC;
```

---

### CC8.1 – System Monitoring

**Control Objective**: The entity monitors system components to detect anomalies and security events.

**How Feature Gating Implements This**:
- ✅ Eligibility **recomputed on events** (load completion, dispute)
- ✅ Nightly batch job **recalculates all eligibility**
- ✅ Cooldowns **applied automatically** for violations

**Evidence**:
| Evidence Type | Location | Description |
|---------------|----------|-------------|
| Trigger Events | `functions/entities/load/afterUpdate.js` | Re-evaluation on load complete |
| Scheduled Jobs | System cron | Nightly eligibility batch |
| Evaluation Logs | `DriverFeatureEligibility.evaluated_at` | Timestamp of last check |
| Cooldown Enforcement | `DriverFeatureEligibility.cooldown_until` | Temporary locks |

**Audit Query**:
```sql
-- Show drivers in cooldown period
SELECT driver_id, feature_key, cooldown_until, cooldown_reason
FROM DriverFeatureEligibility
WHERE cooldown_until > NOW()
ORDER BY cooldown_until ASC;
```

---

### CC9.2 – Data Integrity

**Control Objective**: Data processing is complete, accurate, and valid.

**How Feature Gating Implements This**:
- ✅ Server **recomputes all eligibility** (never trusts client)
- ✅ Profitability calculations **performed server-side**
- ✅ Client cannot bypass gating via API manipulation

**Evidence**:
| Evidence Type | Location | Description |
|---------------|----------|-------------|
| Server-Side Engine | `functions/shared/eligibility/featureEligibilityEngine.js` | Computes eligibility |
| Test Suite | `functions/__tests__/eligibility/enforcement.test.js` | Proves no client bypass |
| Blocked Attempts | System logs | API requests denied |
| Math Functions | `functions/shared/math/` | Server-side calculations |

**Audit Query**:
```sql
-- Show eligibility evaluations with metrics snapshot
SELECT driver_id, feature_key, eligible, reason, metrics_snapshot, evaluated_at
FROM DriverFeatureEligibility
WHERE evaluated_at >= NOW() - INTERVAL '7 days'
ORDER BY evaluated_at DESC
LIMIT 100;
```

---

## 📋 SOC 2 Evidence Checklist

### For Auditors (What to Request)

**Access Control Evidence**:
- [ ] DriverFeatureEligibility entity schema
- [ ] Sample eligibility evaluation logs (last 90 days)
- [ ] Audit logs for feature unlock/lock events
- [ ] Test results proving server-side enforcement

**Least Privilege Evidence**:
- [ ] Redaction logic source code
- [ ] API response samples (showing redacted fields)
- [ ] RBAC test results
- [ ] Driver role permission matrix

**Change Management Evidence**:
- [ ] CarrierDriverPolicy entity schema
- [ ] Policy change audit logs (last 90 days)
- [ ] Carrier override logs with reasons
- [ ] Approval workflow documentation

**Monitoring Evidence**:
- [ ] Scheduled job configuration (nightly batch)
- [ ] Cooldown enforcement logs
- [ ] Eligibility re-evaluation triggers
- [ ] System alert configuration

**Data Integrity Evidence**:
- [ ] Server-side math functions
- [ ] Test suite results (eligibility, enforcement)
- [ ] Blocked access attempt logs
- [ ] Client-side bypass prevention tests

---

## 🎯 Control Effectiveness Metrics

| Control | Metric | Target | How Measured |
|---------|--------|--------|--------------|
| CC6.1 (Access) | % features gated server-side | 100% | Code review |
| CC6.3 (Least Privilege) | Unauthorized access attempts | 0 | AuditLog READ_DENIED |
| CC7.2 (Change Mgmt) | % policy changes logged | 100% | AuditLog coverage |
| CC8.1 (Monitoring) | Eligibility checks per day | > 1000 | Evaluation logs |
| CC9.2 (Integrity) | Client bypass attempts | 0 | Test suite + logs |

---

## 🔍 Sample Audit Queries

### 1. Feature Unlock Audit Trail
```sql
SELECT 
  driver_id,
  feature_key,
  eligible,
  reason,
  evaluated_at,
  carrier_override,
  override_granted_by
FROM DriverFeatureEligibility
WHERE driver_id = 'sample_driver_id'
ORDER BY evaluated_at DESC;
```

### 2. Carrier Override History
```sql
SELECT 
  entity_id AS driver_id,
  metadata->>'feature_key' AS feature,
  actor_email,
  metadata->>'override_reason' AS reason,
  created_date
FROM AuditLog
WHERE entity_type = 'DriverFeatureEligibility'
  AND metadata->>'carrier_override' = 'true'
ORDER BY created_date DESC;
```

### 3. Access Denial Events
```sql
SELECT 
  actor_email,
  entity_type,
  metadata->>'feature_key' AS attempted_feature,
  metadata->>'denial_reason' AS reason,
  created_date
FROM AuditLog
WHERE action = 'READ_DENIED'
  AND actor_role = 'driver'
ORDER BY created_date DESC
LIMIT 50;
```

### 4. Policy Change History
```sql
SELECT 
  entity_id AS carrier_id,
  changed_fields,
  actor_email,
  metadata->>'reason' AS change_reason,
  created_date
FROM AuditLog
WHERE entity_type = 'CarrierDriverPolicy'
  AND action = 'UPDATE'
ORDER BY created_date DESC;
```

---

## 📊 Compliance Dashboard

**Real-Time Metrics for SOC 2 Readiness**:

```javascript
const complianceMetrics = {
  accessControl: {
    totalFeatures: 14,
    serverGated: 14,
    percentage: 100
  },
  auditTrail: {
    eligibilityChanges30d: 2847,
    policyChanges30d: 12,
    overrides30d: 5,
    completeness: 100
  },
  leastPrivilege: {
    unauthorizedAttempts30d: 0,
    redactionRate: 100,
    rbacTestsPassing: 23
  },
  monitoring: {
    evaluationsPerDay: 1500,
    nightlyBatchSuccess: true,
    cooldownsActive: 8
  }
};
```

---

## 🚀 Pre-Audit Preparation

### 30 Days Before Audit
- [ ] Run all audit queries, verify data completeness
- [ ] Review last 90 days of AuditLog entries
- [ ] Ensure all tests passing (eligibility, RBAC, enforcement)
- [ ] Generate compliance metrics dashboard
- [ ] Document any manual overrides with reasons

### 7 Days Before Audit
- [ ] Export audit logs to CSV
- [ ] Prepare entity schemas (PDF)
- [ ] Run test suite, capture results
- [ ] Create read-only audit user for auditor access
- [ ] Prepare this document + evidence checklist

### During Audit
- [ ] Provide auditor access to read-only database view
- [ ] Demonstrate feature gating in UI
- [ ] Walk through audit queries
- [ ] Show test results proving enforcement
- [ ] Answer questions with data, not promises

---

## 🎉 Compliance Benefits

**What Feature Gating Gives You**:
- ✅ **SOC 2 Type II evidence** (continuous monitoring)
- ✅ **Audit-ready access logs** (no scrambling to backfill)
- ✅ **Defensible access decisions** (metrics-based, not subjective)
- ✅ **Least-privilege enforcement** (automatic, not manual)
- ✅ **Change management trail** (every policy change logged)

**Beyond Compliance**:
- 🚀 Faster onboarding (lower risk = faster rollout)
- 📉 Reduced fraud (gating prevents abuse)
- 💰 Protected margins (pricing features locked)
- 🎯 Better driver behavior (incentive alignment)

---

**🔐 SOC 2 Compliant by Design**