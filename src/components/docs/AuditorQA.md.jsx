# Auditor Q&A - Feature Gating Engine

## Overview

Ready-to-use answers for SOC 2, ISO 27001, and enterprise security questionnaires. These answers map cleanly to compliance controls and demonstrate engineering rigor.

---

## 🔐 Access Control & Authorization

### Q1: How do you prevent unauthorized access to sensitive pricing features?

**Answer**:
> "TMS.ai uses a centralized, server-side feature-gating engine. Every driver feature is evaluated against objective performance metrics, compliance status, and carrier policy. If a feature is not explicitly enabled by the server, it is not returned in the API response and cannot be accessed or invoked by the client."

**Supporting Evidence**:
- DriverFeatureEligibility entity with eligible boolean
- Server hooks enforce before returning data
- Test suite proving client cannot bypass

**SOC 2 Mapping**: CC6.1 (Logical Access Controls)

---

### Q2: Can drivers bypass feature restrictions by calling the API directly?

**Answer**:
> "No. Feature eligibility is enforced in server hooks and functions. All requests are validated server-side against the driver's eligibility record, and unauthorized actions are blocked and logged to an immutable audit trail."

**Supporting Evidence**:
- beforeCreate/beforeUpdate hooks check eligibility
- Tests showing API returns 403/401 when ineligible
- AuditLog entries with action='READ_DENIED'

**SOC 2 Mapping**: CC6.1, CC6.3 (Least Privilege)

---

### Q3: How are changes to driver feature access tracked?

**Answer**:
> "All feature unlocks, locks, cooldowns, and carrier overrides are written to an append-only audit log with timestamps, actor identity, previous state, new state, and reason. The audit log is immutable and includes both system-triggered and human-triggered changes."

**Supporting Evidence**:
- AuditLog entity with entity_type='DriverFeatureEligibility'
- Changed_fields showing before/after
- Actor email and role captured
- Metadata with reasons

**SOC 2 Mapping**: CC7.2 (Change Management), CC7.3 (Monitoring)

---

### Q4: Can carriers weaken system controls?

**Answer**:
> "No. System baselines such as compliance requirements, margin protection, RBAC, and audit logging are non-overridable. Carrier policies can only strengthen thresholds (e.g., require 10 loads instead of system minimum 5), never weaken them. Attempts to weaken are blocked and logged."

**Supporting Evidence**:
- systemMinimums.js with non-negotiable thresholds
- validateCarrierPolicy() function blocks weakening
- Tests proving validation enforcement
- beforeCreate hook rejects invalid policies

**SOC 2 Mapping**: CC6.1, CC9.2 (Data Integrity)

---

## 📊 Risk Management

### Q5: How do you manage risk over time as drivers' behavior changes?

**Answer**:
> "Driver eligibility is recomputed on key events such as load completion, dispute creation, compliance changes, and via nightly batch jobs. Features can be temporarily disabled via cooldowns if performance degrades or violations occur. Cooldowns are feature-specific, ensuring granular control."

**Supporting Evidence**:
- Trigger hooks (afterUpdate on Load entity)
- Nightly batch job configuration
- Cooldown enforcement logic
- Cooldown logs in AuditLog

**SOC 2 Mapping**: CC8.1 (System Monitoring)

---

### Q6: How does this align with least privilege principles?

**Answer**:
> "Drivers are granted only the minimum feature access required based on current eligibility. Advanced or financially sensitive capabilities (counteroffers, instant pay, self-edit detention) are unlocked gradually as trust is earned through demonstrated performance. Access is revoked automatically if eligibility declines."

**Supporting Evidence**:
- Progressive unlock model (Bronze → Silver → Gold → Platinum)
- Feature-specific eligibility, not blanket access
- Redaction hooks remove restricted fields
- Tests proving field-level security

**SOC 2 Mapping**: CC6.3 (Least Privilege)

---

## 🔍 Data Protection & Privacy

### Q7: How do you protect broker margins and customer rates from driver visibility?

**Answer**:
> "Broker margins, customer rates, and internal cost calculations are redacted from all driver-facing API responses via server-side afterRead hooks. Drivers receive only their pay amount and confidence state. Even drivers eligible for 'profit explain' features see computed profitability metrics, not raw customer pricing."

**Supporting Evidence**:
- Load.afterRead removes customer_rate_cents, margin_cents
- Profitability shown as percentages/badges, not dollar amounts
- Tests verify redaction
- API response samples

**SOC 2 Mapping**: CC6.1, CC6.6 (Data Classification)

---

### Q8: What happens if a driver's account is compromised?

**Answer**:
> "Feature access is tied to eligibility records, not static permissions. A compromised account has access only to features the driver qualified for. Financially sensitive features (instant pay, self-edit detention) require additional authentication and have transaction limits. All actions are logged with actor, timestamp, and IP address."

**Supporting Evidence**:
- DriverFeatureEligibility per driver
- Instant pay limits (max per load/week)
- AuditLog captures IP, user agent
- Session management

**SOC 2 Mapping**: CC6.1, CC6.7 (Authentication)

---

## 🔄 Change Management & Governance

### Q9: How do you ensure feature gating rules are applied consistently?

**Answer**:
> "Eligibility rules are centralized in a single server-side engine (featureEligibilityEngine.js). All feature checks call this engine, ensuring consistent evaluation. Carrier-specific policies are stored in a database entity and validated against system minimums before creation. There is no client-side logic that can deviate from server rules."

**Supporting Evidence**:
- Single source of truth (featureEligibilityEngine.js)
- No duplicate eligibility logic
- Policy validation before save
- Tests proving consistency

**SOC 2 Mapping**: CC9.2 (Data Integrity)

---

### Q10: How do you validate that feature gating cannot be bypassed?

**Answer**:
> "We maintain a comprehensive test suite with 20+ test cases covering bypass prevention, RBAC enforcement, field redaction, and policy validation. Tests simulate malicious API calls, role escalation attempts, and client-side tampering. All tests must pass before deployment."

**Supporting Evidence**:
- Test files: eligibility/featureGating.test.js, enforcement.test.js
- CI/CD integration (tests run on every commit)
- Test coverage reports
- Penetration test results

**SOC 2 Mapping**: CC7.1 (Testing), CC9.2 (Data Integrity)

---

## 📋 Operational Questions

### Q11: How long does it take to update a policy?

**Answer**:
> "Policy updates take effect immediately. When a CarrierDriverPolicy is updated, the next eligibility evaluation (triggered on load completion or nightly batch) applies the new thresholds. Emergency changes (e.g., disabling a feature) take effect within seconds."

**Supporting Evidence**:
- Real-time policy application
- Event-driven re-evaluation
- Audit logs with timestamps

---

### Q12: How do you handle policy disputes or appeals?

**Answer**:
> "Drivers can escalate eligibility decisions via DriverEscalation entity. Carrier admins review metrics, reason, and can grant temporary overrides with documented justification. All overrides expire after a set period and are logged to the audit trail."

**Supporting Evidence**:
- FeatureApprovalRequest workflow
- Override expiration logic
- Audit logs for overrides

---

### Q13: What reports are available for compliance reviews?

**Answer**:
> "We provide audit queries for: feature unlock history, carrier override history, access denial events, policy change history, cooldown enforcement, and eligibility snapshots. All queries are documented and can be run on-demand or exported to CSV for auditor review."

**Supporting Evidence**:
- SOC2ControlMapping.md with sample queries
- CSV export functionality
- Read-only auditor database access

---

## 🎯 Executive Summary (For RFPs)

**Q: How does TMS.ai ensure secure, compliant driver feature access?**

**Executive Answer**:
> "TMS.ai implements a server-authoritative feature-gating engine that enforces least-privilege access based on objective performance metrics. All feature access decisions are computed server-side, logged to an immutable audit trail, and cannot be bypassed client-side. Carrier-specific policies are supported within non-negotiable system bounds. This architecture provides SOC 2-grade access control, change management, and monitoring out of the box."

**Key Differentiators**:
- ✅ Server-side enforcement (not UI flags)
- ✅ Objective metrics (not subjective approval)
- ✅ Audit-ready by design (not bolted on)
- ✅ Progressive trust model (earn features over time)
- ✅ Carrier flexibility within system guardrails

---

## 📊 Quick Reference - Control Mappings

| SOC 2 Control | TMS.ai Implementation | Evidence |
|---------------|----------------------|----------|
| CC6.1 (Access) | Server-side feature gating | Entity schema, hooks, tests |
| CC6.3 (Least Privilege) | Field redaction + progressive unlock | afterRead hooks, RBAC tests |
| CC6.6 (Data Classification) | Margin/rate redaction | Load.afterRead, API samples |
| CC6.7 (Authentication) | Session + IP logging | AuditLog metadata |
| CC7.2 (Change Mgmt) | Policy versioning + audit | CarrierDriverPolicy + AuditLog |
| CC7.3 (Monitoring) | KPI alerts + batch jobs | PolicyAlert entity |
| CC8.1 (Monitoring) | Nightly re-evaluation | Scheduled jobs |
| CC9.2 (Integrity) | Server-only computation | Math functions, bypass tests |

---

## 🔍 Sample Audit Evidence Package

**When Auditor Requests Evidence**:

1. **Access Control**:
   - Export: DriverFeatureEligibility records (last 90 days)
   - Export: AuditLog where entity_type='DriverFeatureEligibility'
   - Provide: Test results (featureGating.test.js)

2. **Change Management**:
   - Export: CarrierDriverPolicy + change history
   - Export: FeatureApprovalRequest + decisions
   - Provide: Policy change audit logs

3. **Monitoring**:
   - Export: PolicyAlert records
   - Provide: Scheduled job logs (nightly batch)
   - Provide: KPI dashboard screenshots

4. **Data Integrity**:
   - Provide: Source code (featureEligibilityEngine.js)
   - Provide: Test suite results
   - Provide: Blocked access attempt logs

---

## 🎉 Audit Readiness Checklist

**Before Any Audit**:
- [ ] Run all eligibility tests (ensure 100% passing)
- [ ] Generate last 90 days of audit logs
- [ ] Export policy change history
- [ ] Prepare KPI dashboard
- [ ] Document any manual overrides
- [ ] Review this Q&A document
- [ ] Create read-only auditor database access

**During Audit**:
- [ ] Reference this document for answers
- [ ] Provide evidence from checklist above
- [ ] Demonstrate live system (optional)
- [ ] Run sample audit queries
- [ ] Show test results

**Post-Audit**:
- [ ] Document findings
- [ ] Implement recommendations
- [ ] Update control mapping if needed

---

**🔐 Audit-Ready Feature Gating Engine**

*Use these answers verbatim in audits, RFPs, and security questionnaires.*