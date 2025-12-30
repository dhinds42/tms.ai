# SOC 2 Type II Evidence Checklist
**TMS.ai Compliance Documentation**  
**Audit Period:** [To Be Determined]  
**Last Updated:** 2025-12-30  
**Version:** 1.0

---

## Purpose

This checklist guides evidence collection for SOC 2 Type II audits. Each control lists required evidence, collection method, and responsible party.

**Status Legend:**
- ✅ Evidence Available
- 📋 In Progress
- ⚠️ Needs Attention
- ❌ Not Available

---

## CC6: Logical and Physical Access Controls

### CC6.1 - The entity implements logical access security software, infrastructure, and architectures.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **RBAC Policy** | Documented role definitions and permissions | `RBAC_Redaction_Appendix.md` | ✅ | Security |
| **Access Control Matrix** | Role-based data visibility rules | `role-data-visibility.md` | ✅ | Security |
| **Hook Source Code** | Server-side enforcement implementation | `functions/hooks/*.js` | ✅ | Engineering |
| **Architecture Diagram** | Data flow showing access control points | `security-controls-mapping.md` Section 5.2 | ✅ | Engineering |

### CC6.2 - Prior to issuing system credentials and granting access, the entity registers and authorizes new users.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **User Provisioning Process** | How users are onboarded and assigned roles | [To Be Documented] | 📋 | IT/Security |
| **Role Assignment Records** | Base44 user management logs | Base44 platform | ✅ | IT |
| **User Access Reviews** | Quarterly access certification | [To Be Implemented] | ⚠️ | Security |

### CC6.3 - The entity authorizes, modifies, or removes access to data, software, functions, and other IT resources based on roles, responsibilities, or the system design.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Access Change Logs** | Records of role changes and access modifications | AuditLog entity | ✅ | System |
| **Offboarding Procedure** | User deprovisioning process | [To Be Documented] | 📋 | HR/IT |
| **Emergency Access Process** | Break-glass procedure documentation | [To Be Documented] | ⚠️ | Security |

### CC6.6 - The entity implements logical access security measures to protect against threats from sources outside its system boundaries.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Authentication Mechanism** | JWT tokens, session management | Base44 platform | ✅ | Platform |
| **API Security** | Server-side hook enforcement | `functions/hooks/` | ✅ | Engineering |
| **Network Security** | TLS/HTTPS enforcement | Base44 platform | ✅ | Platform |
| **Penetration Test Report** | External security assessment | [To Be Conducted] | ⚠️ | Security |

### CC6.7 - The entity restricts the transmission, movement, and removal of information to authorized internal and external users and processes.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Data Redaction Implementation** | Field-level masking based on role | `afterRead()` hooks | ✅ | Engineering |
| **API Response Examples** | Redacted vs full responses by role | Test outputs | ✅ | QA |
| **DLP Controls** | Data loss prevention measures | [To Be Documented] | ⚠️ | Security |

### CC6.8 - The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Code Review Process** | Peer review for security-critical changes | Git pull requests | ✅ | Engineering |
| **Dependency Scanning** | NPM audit for vulnerable packages | CI/CD pipeline | 📋 | DevOps |
| **Change Management** | Deployment approval workflow | [To Be Documented] | 📋 | Engineering |

---

## CC7: System Operations

### CC7.2 - The entity monitors system components and the operation of those components for anomalies.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Audit Log Monitoring** | AuditLog review process | `pages/AuditTrail.js` | ✅ | Operations |
| **Access Denial Alerts** | Failed authorization attempts | AuditLog entity (READ_DENIED) | ✅ | Security |
| **Performance Monitoring** | Application health metrics | [To Be Implemented] | ⚠️ | DevOps |
| **Error Tracking** | Exception logging and alerting | [To Be Implemented] | ⚠️ | DevOps |

### CC7.3 - The entity evaluates security events to determine whether they could or have resulted in a failure of the system.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Incident Response Plan** | Security incident procedures | [To Be Documented] | ⚠️ | Security |
| **Security Event Reviews** | Monthly audit log analysis | [To Be Implemented] | ⚠️ | Security |
| **Breach Notification Process** | Customer notification procedures | [To Be Documented] | ⚠️ | Legal/Security |

### CC7.4 - The entity responds to identified security events by executing a defined incident response program.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Incident Response Runbook** | Step-by-step incident procedures | [To Be Documented] | ⚠️ | Security |
| **Incident Log** | Record of security incidents (if any) | [To Be Created] | 📋 | Security |
| **Post-Incident Reviews** | Root cause analysis documentation | [To Be Created] | 📋 | Security |

---

## CC8: Change Management

### CC8.1 - The entity authorizes, designs, develops, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Change Management Policy** | Documented change control process | [To Be Documented] | 📋 | Engineering |
| **Git Commit History** | Code changes with peer review | GitHub/Base44 | ✅ | Engineering |
| **Automated Tests** | Unit/integration test suite | `functions/__tests__/` | ✅ | QA |
| **Test Results** | CI/CD test outputs | [To Be Collected] | 📋 | QA |
| **Deployment Logs** | Production release records | Base44 platform | ✅ | DevOps |

---

## A1: Additional Criteria for Confidentiality

### C1.1 - The entity identifies and maintains confidential information to meet the entity's objectives.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Data Classification** | Sensitive field inventory | `RBAC_Redaction_Appendix.md` Section 4 | ✅ | Security |
| **Confidential Data Map** | Where sensitive data is stored | Entity schemas | ✅ | Engineering |
| **Data Flow Diagrams** | How confidential data moves | `security-controls-mapping.md` Section 5.2 | ✅ | Engineering |

### C1.2 - The entity disposes of confidential information to meet the entity's objectives.

| Evidence Item | Description | Location | Status | Owner |
|---------------|-------------|----------|--------|-------|
| **Data Retention Policy** | Retention periods by data type | `DataRetentionPolicy.md` | ✅ | Compliance |
| **Data Deletion Procedures** | Secure data disposal process | [To Be Documented] | ⚠️ | Engineering |
| **Retention Job Logs** | Automated deletion audit trail | [To Be Implemented] | ⚠️ | Engineering |

---

## Evidence Collection Schedule

### Pre-Audit (60 Days Before)

- [ ] Review this checklist with audit firm
- [ ] Identify evidence gaps (⚠️ and ❌ items)
- [ ] Assign owners to missing evidence
- [ ] Schedule evidence collection sprints

### Pre-Audit (30 Days Before)

- [ ] Collect all ✅ evidence in shared folder
- [ ] Document 📋 items currently in progress
- [ ] Implement missing ⚠️ controls
- [ ] Conduct pre-audit testing

### Pre-Audit (14 Days Before)

- [ ] Complete evidence package
- [ ] Conduct internal review
- [ ] Prepare evidence walkthrough presentation
- [ ] Schedule audit kickoff call

### During Audit

- [ ] Provide evidence on request
- [ ] Track auditor findings
- [ ] Respond to evidence requests within 48 hours
- [ ] Document any exceptions or gaps

### Post-Audit

- [ ] Review final audit report
- [ ] Create remediation plan for findings
- [ ] Update controls based on feedback
- [ ] Schedule next audit

---

## Evidence Package Structure

```
SOC2_Audit_Evidence/
├── Policies/
│   ├── RBAC_Redaction_Appendix.md
│   ├── Audit_Logging_Policy.md
│   ├── Data_Retention_Policy.md
│   └── Security_Controls_Mapping.md
│
├── Technical_Implementation/
│   ├── hooks/
│   │   ├── loadHooks.js
│   │   ├── carrierHooks.js
│   │   ├── driverHooks.js
│   │   └── shipperHooks.js
│   ├── middleware/
│   │   └── authorize.js
│   └── validation/
│       └── schemas.js
│
├── Test_Results/
│   ├── unit_test_output.txt
│   ├── integration_test_results.json
│   └── manual_test_screenshots/
│
├── Audit_Logs/
│   ├── sample_audit_log_export.csv
│   ├── access_denial_report.csv
│   └── admin_action_log.csv
│
├── Access_Control/
│   ├── user_list_with_roles.csv
│   ├── role_permission_matrix.xlsx
│   └── access_review_Q4_2025.pdf
│
└── Architecture/
    ├── system_architecture.png
    ├── data_flow_diagram.png
    └── network_diagram.png
```

---

## Auditor Question Preparation

### Common SOC 2 Questions

| Question | Answer Location |
|----------|----------------|
| How do you enforce access controls? | `functions/hooks/` + `RBAC_Redaction_Appendix.md` |
| How do you protect confidential data? | `afterRead()` hooks + redaction examples |
| How do you detect unauthorized access? | AuditLog entity + READ_DENIED events |
| How do you validate data integrity? | `beforeCreate()` / `beforeUpdate()` hooks |
| How often do you review access rights? | User access review schedule (to be implemented) |
| How do you track system changes? | Git commits + deployment logs |
| What happens when an employee leaves? | Offboarding procedure (to be documented) |
| How do you test your controls? | `functions/__tests__/` + manual test results |

---

## Critical Gaps to Address

### High Priority (Must Have for Audit)

1. **User Access Reviews** (CC6.2)
   - Implement quarterly access certification
   - Document review process
   - **Target:** 30 days before audit

2. **Incident Response Plan** (CC7.4)
   - Create formal incident response runbook
   - Define escalation procedures
   - **Target:** 45 days before audit

3. **Penetration Testing** (CC6.6)
   - Engage external security firm
   - Remediate critical findings
   - **Target:** 60 days before audit

### Medium Priority (Nice to Have)

4. **Change Management Policy** (CC8.1)
   - Document formal change approval process
   - **Target:** 30 days before audit

5. **DLP Controls** (CC6.7)
   - Document data exfiltration prevention
   - **Target:** 30 days before audit

### Low Priority (Can Be Explained)

6. **Performance Monitoring** (CC7.2)
   - Application health dashboard
   - **Target:** Post-audit improvement

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Engineering Lead** | | | |
| **Security Officer** | | | |
| **Compliance Manager** | | | |
| **External Auditor** | | | |

---

**Document Version:** 1.0  
**Audit Firm:** [TBD]  
**Audit Period:** [TBD]  
**Expected Completion:** [TBD]