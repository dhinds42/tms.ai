# Security Controls Mapping
**TMS.ai Compliance Documentation**  
**Frameworks:** SOC 2, ISO 27001, NIST 800-53  
**Last Updated:** 2025-12-30  
**Version:** 1.0

---

## Purpose

This document maps TMS.ai's technical security controls to common compliance frameworks. It demonstrates how server-side enforcement via Base44 hooks satisfies control requirements for SOC 2, ISO 27001, and NIST 800-53.

**Audit Use:** Reference this document during SOC 2 audits, ISO certifications, or customer security assessments.

---

## 1. SOC 2 Trust Services Criteria Mapping

### CC6: Logical and Physical Access Controls

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **CC6.1** | Logical Access Controls | RBAC enforced via Base44 hooks (`beforeRead`, `beforeUpdate`, `beforeDelete`) | `functions/hooks/loadHooks.js`<br>`functions/hooks/carrierHooks.js`<br>`functions/hooks/driverHooks.js` |
| **CC6.2** | Access Restrictions | Scope checks limit data access to assigned entities only (carrier_id, driver_id, customer_id) | `functions/middleware/authorize.js`<br>`scopeQuery()` function |
| **CC6.3** | Access Removal | Role changes reflected immediately; hooks re-evaluate on every request | Base44 authentication + hook enforcement |
| **CC6.6** | Least Privilege | Field-level redaction based on role; sensitive data removed server-side | `afterRead()` hooks in all entity hooks |
| **CC6.7** | Authentication | Base44 built-in authentication with JWT tokens | Base44 platform |
| **CC6.8** | Privileged Access | Admin role requires explicit assignment; all admin actions audited | `functions/auth/permissions.js` + AuditLog |

### CC7: System Operations

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **CC7.2** | Confidential Data Protection | Sensitive fields redacted in `afterRead()` hooks before client response | All entity hooks → `afterRead()` |
| **CC7.3** | Data Integrity | Validation in `beforeCreate()` and `beforeUpdate()` prevents invalid data | `functions/hooks/` + `functions/validation/schemas.js` |
| **CC7.4** | Processing Integrity | Business logic enforced server-side (negative margin prevention, status transitions) | `loadHooks.js` → `beforeCreate()` / `beforeUpdate()` |

### CC8: Change Management

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **CC8.1** | Change Control | All CRUD operations logged to immutable AuditLog | `functions/audit/auditLogger.js`<br>`entities/AuditLog.json` |

### A1: Additional Criteria for Confidentiality

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **C1.1** | Confidential Data Protection | Customer rates hidden from carriers; carrier pay hidden from customers | `loadHooks.js` → `afterRead()` |
| **C1.2** | Disposal of Confidential Info | Data retention policy (separate document) | `components/docs/compliance/DataRetentionPolicy.md` |

---

## 2. ISO 27001:2022 Controls Mapping

### A.5: Organizational Controls

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **A.5.15** | Access Control Policy | RBAC policy defined and enforced server-side | `RBAC_Redaction_Appendix.md` |
| **A.5.16** | Identity Management | Base44 user authentication + role assignment | Base44 platform |
| **A.5.18** | Access Rights | Principle of least privilege; scope enforcement per role | `functions/auth/permissions.js` |

### A.8: Technological Controls

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **A.8.2** | Privileged Access Rights | Admin actions audited; `asServiceRole` usage logged | AuditLog entity |
| **A.8.3** | Information Access Restriction | Field-level redaction based on role | `afterRead()` hooks |
| **A.8.4** | Access to Source Code | Code stored in Base44 platform; Git access controlled | Base44 platform |
| **A.8.5** | Secure Authentication | JWT tokens with expiration; Base44 session management | Base44 platform |
| **A.8.11** | Data Masking | Sensitive fields removed in `afterRead()` before client response | All entity hooks |
| **A.8.15** | Logging | All CRUD events, access denials, and admin actions logged | `AuditLog` entity |
| **A.8.16** | Monitoring Activities | Audit logs queryable by admins/brokers for anomaly detection | `pages/AuditTrail.js` |

### A.9: Organizational Controls (continued)

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **A.9.2** | User Access Management | Role-based; users can only access data within their scope | `scopeQuery()` in `authorize.js` |
| **A.9.4** | System Audit Controls | Immutable audit logs capture all data changes | `AuditLog` entity + hooks |

---

## 3. NIST 800-53 Rev 5 Controls Mapping

### Access Control (AC)

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **AC-2** | Account Management | Base44 user management; roles assigned per user | Base44 authentication |
| **AC-3** | Access Enforcement | RBAC enforced on every API call via hooks | All entity hooks |
| **AC-5** | Separation of Duties | Brokers cannot act as carriers; carriers cannot see customer rates | RBAC policy + hook enforcement |
| **AC-6** | Least Privilege | Users granted minimum access; field redaction per role | `afterRead()` hooks |
| **AC-6(1)** | Authorize Access to Security Functions | Admin role required for audit log access | `pages/AuditTrail.js` |

### Audit and Accountability (AU)

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **AU-2** | Event Logging | All CRUD operations logged to AuditLog | `functions/audit/auditLogger.js` |
| **AU-3** | Content of Audit Records | Logs include: timestamp, actor, entity, action, changed fields, before/after values | `AuditLog` entity schema |
| **AU-6** | Audit Review | Admins can query audit logs; anomaly detection possible | `pages/AuditTrail.js` |
| **AU-9** | Protection of Audit Information | AuditLog is immutable; no delete/update allowed | Base44 entity design (no delete hook) |
| **AU-12** | Audit Record Generation | Automated via `afterCreate`, `afterUpdate`, `afterDelete` hooks | All entity hooks |

### Identification and Authentication (IA)

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **IA-2** | Identification and Authentication | Base44 JWT authentication | Base44 platform |
| **IA-4** | Identifier Management | Unique user IDs; email-based identity | Base44 user entity |

### System and Information Integrity (SI)

| Control ID | Control Name | TMS.ai Implementation | Evidence Location |
|------------|--------------|----------------------|-------------------|
| **SI-10** | Information Input Validation | Server-side validation in `beforeCreate()` / `beforeUpdate()` | `functions/validation/schemas.js` + entity hooks |
| **SI-11** | Error Handling | Validation errors return structured responses; no data leakage | Hook error handling |

---

## 4. FMCSA 371.3 (Broker Requirements) Mapping

| Requirement | TMS.ai Implementation | Evidence Location |
|-------------|----------------------|-------------------|
| **Transaction Records** | All load create/update/delete logged to AuditLog | `AuditLog` entity |
| **Carrier Authority Verification** | MC# and DOT# validated; FMCSA lookup available | `carrierHooks.js` → `beforeCreate()` |
| **Broker-Carrier Separation** | Carriers cannot see customer rates; enforced server-side | `loadHooks.js` → `afterRead()` |
| **Record Retention** | 3-year minimum retention (configurable) | Data retention policy |

---

## 5. Implementation Evidence Matrix

### 5.1 Server-Side Enforcement

| Security Layer | Control Type | Implementation | Bypass Risk |
|----------------|--------------|----------------|-------------|
| **UI Restrictions** | Supplementary | Field hiding, button disabling | ⚠️ High (client-side) |
| **API Hooks** | **Primary** | Base44 lifecycle hooks | ✅ None (server enforced) |
| **Database Scoping** | **Primary** | Query filters by tenant/role | ✅ None (server enforced) |
| **Audit Logging** | Detective | Immutable AuditLog entity | ✅ None (append-only) |

**Compliance Statement:** All access control decisions are made server-side. UI restrictions are for usability only and do not constitute security boundaries.

---

### 5.2 Data Flow Security

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP Request (JWT token)
       ▼
┌─────────────────────────────────────────┐
│         Base44 API Gateway              │
│  - Authenticate JWT                     │
│  - Extract user role & context          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Entity Lifecycle Hooks             │
│  beforeRead()  → Scope Check            │
│  afterRead()   → Field Redaction        │
│  beforeUpdate() → Permission Check      │
│  afterUpdate()  → Audit Log             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│        Database Query                   │
│  - Filtered by scope                    │
│  - Sensitive fields removed             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Response  │  ← Only authorized data returned
└─────────────┘
```

---

## 6. Control Testing Procedures

### 6.1 Automated Tests

**Location:** `functions/__tests__/hooks/`

| Test Category | Test Coverage | Pass Criteria |
|---------------|---------------|---------------|
| **RBAC Enforcement** | Role-based access checks | Unauthorized roles receive 403 |
| **Field Redaction** | Sensitive fields removed | Customer rates not in carrier response |
| **Scope Enforcement** | Cross-tenant access blocked | Carrier A cannot access Carrier B's loads |
| **Validation** | Business rules enforced | Negative margins rejected (except admin) |
| **Audit Logging** | All CRUD events logged | AuditLog entry created for every change |

**Run Tests:**
```bash
npm test functions/__tests__/hooks/
```

---

### 6.2 Manual Testing Scenarios

| Scenario | Expected Result | Test Method |
|----------|----------------|-------------|
| Carrier views Load | `customer_rate` field absent | Browser DevTools → Network tab |
| Driver updates `carrier_pay` | 403 Forbidden | API request |
| Admin overrides negative margin | Load created + audit log entry | Create load + check AuditLog |
| Carrier accesses other carrier's load | 403 Forbidden | API request with different carrier_id |
| Audit log query by non-admin | 403 Forbidden | API request |

---

## 7. Compliance Gaps & Mitigations

| Framework | Gap | Mitigation | Status |
|-----------|-----|------------|--------|
| SOC 2 CC6.8 | Multi-factor authentication | Base44 platform roadmap item | ⚠️ Pending |
| ISO 27001 A.8.22 | Physical security controls | Infrastructure hosted by Base44 (cloud) | ✅ Inherited |
| NIST AU-4 | Audit log storage capacity | Monitor AuditLog growth; implement archival | 📋 Planned |
| ISO 27001 A.5.23 | Third-party security | Base44 SOC 2 Type II in progress | ⚠️ In Progress |

---

## 8. Auditor Evidence Package

For compliance audits, provide:

1. **Policy Documents**
   - RBAC & Data Redaction Policy Appendix
   - Audit Logging Policy
   - Role-Based Data Visibility Matrix

2. **Technical Implementation**
   - Entity hook source code (`functions/hooks/`)
   - Authorization middleware (`functions/middleware/authorize.js`)
   - Validation schemas (`functions/validation/schemas.js`)

3. **Test Results**
   - Unit test output (`npm test`)
   - Manual test screenshots (Network tab showing redacted responses)

4. **Audit Logs**
   - Sample AuditLog exports (JSON or CSV)
   - Access denial logs
   - Admin action logs

5. **Architecture Diagrams**
   - Data flow diagram (Section 5.2 above)
   - Component architecture

---

## 9. Control Review Schedule

| Activity | Frequency | Owner | Next Due |
|----------|-----------|-------|----------|
| **Policy Review** | Quarterly | Security Team | 2026-03-30 |
| **Automated Tests** | Every deployment | Engineering | Continuous |
| **Manual Testing** | Quarterly | QA Team | 2026-03-30 |
| **Audit Log Review** | Monthly | Security Team | 2026-01-30 |
| **Framework Updates** | Annual | Compliance Officer | 2026-12-30 |

---

## 10. Contact & Escalation

**Control Owner:** Engineering & Security Team  
**Compliance Officer:** TBD  
**External Auditor:** TBD

**For questions:**
- Security Controls: security@tms.ai
- Audit Evidence: compliance@tms.ai
- Technical Implementation: dev@tms.ai

---

## Appendix A: Quick Reference - Framework Requirements

### SOC 2 Type II Focus Areas
- ✅ Access controls (CC6)
- ✅ Logical access restrictions (CC6.2)
- ✅ Audit logging (CC8.1)
- ✅ Confidentiality (C1.1)

### ISO 27001 Certification Requirements
- ✅ Access control policy (A.5.15)
- ✅ User access management (A.9.2)
- ✅ Event logging (A.8.15)
- ✅ Data masking (A.8.11)

### NIST 800-53 (Moderate Baseline)
- ✅ AC-3: Access enforcement
- ✅ AU-2: Event logging
- ✅ AU-9: Audit log protection
- ✅ SI-10: Input validation

---

**Document Version:** 1.0  
**Implementation Status:** ✅ Active  
**Last Audit:** Not yet audited  
**Next Audit:** TBD