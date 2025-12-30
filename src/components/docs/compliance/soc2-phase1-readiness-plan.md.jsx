# SOC 2 Phase 1 Readiness Plan

**System:** TMS.ai  
**Version:** 1.0  
**Last Updated:** December 30, 2025  
**Objective:** Prepare TMS.ai for a successful SOC 2 Type I audit by establishing core security controls, documentation, and evidence.

---

## 1. Scope of Phase 1

### SOC 2 Trust Services Categories in Scope:

✅ **Security** (required)  
✅ **Confidentiality** (recommended)  
⛔ **Availability** (later phase)  
⛔ **Processing Integrity** (later phase)  
⛔ **Privacy** (later phase)

**Phase 1 Focus:** Design and implementation, not long-term operational history.

---

## 2. Phase 1 Control Objectives

### Access Control

- Role-Based Access Control (RBAC) enforced server-side
- Tenant isolation by carrier/customer/driver
- Least privilege applied to all roles

### Data Protection

- Server-side data redaction
- Pricing & margin protection
- Sensitive data never exposed to unauthorized roles

### Validation & Integrity

- Server-side validation for all writes
- Financial and workflow rules enforced
- Invalid data rejected before persistence

### Audit Logging

- Immutable audit logs for create/update/delete
- Actor identity, role, timestamp captured
- Logs protected from modification

### Change Management

- Code changes tracked via version control
- Automated tests for critical security logic
- Reviews prior to deployment

---

## 3. Phase 1 Required Artifacts (Checklist)

### Policies & Docs (You already have most of these)

- ✅ RBAC & Redaction Policy Appendix
- ✅ Audit Logging Policy
- ✅ Security Controls Mapping
- ✅ Incident Response Policy
- ✅ SOC 2 Phase 1 Readiness Plan (this doc)
- ✅ Security Data Protection Overview
- ✅ Audit Readiness Checklist

### Evidence

- [ ] Screenshots of RBAC enforcement
- [ ] API response redaction proof
- [ ] Validation error examples
- [ ] Audit log entries
- [ ] Test execution results

**Status:** Documentation complete, evidence capture in progress

---

## 4. What Phase 1 Does Not Require

You **do not need:**

❌ 6–12 months of evidence  
❌ Penetration testing  
❌ Full vendor risk program  
❌ 24/7 monitoring tools  
❌ Security Operations Center (SOC)  
❌ Bug bounty program  
❌ Formal security awareness training  

**These come in Phase 2 (Type II).**

---

## 5. Phase 1 Timeline (Realistic)

| Week | Activities |
|------|-----------|
| **Week 1** | Finalize RBAC, validation, audit logging implementation |
| **Week 2** | Complete documentation & evidence screenshots |
| **Week 3** | Dry run with SOC 2 readiness checklist |
| **Week 4** | Engage auditor for Type I assessment |

**Current Status:** Week 2 (Documentation phase)

---

## 6. Control Implementation Status

### Security (CC6.x)

| Control | Status | Evidence |
|---------|--------|----------|
| CC6.1 - Logical access | ✅ Implemented | RBAC hooks, tests |
| CC6.2 - User provisioning | ✅ Implemented | Role assignment |
| CC6.3 - Access removal | ✅ Implemented | User deactivation |
| CC6.6 - Least privilege | ✅ Implemented | Field redaction |
| CC6.7 - Access restrictions | ✅ Implemented | Tenant scoping |

### Confidentiality (C1.x)

| Control | Status | Evidence |
|---------|--------|----------|
| C1.1 - Confidential info protected | ✅ Implemented | Server-side redaction |
| C1.2 - Data disposal | 📋 Planned | Data retention policy |

### Common Criteria (CC7.x, CC8.x)

| Control | Status | Evidence |
|---------|--------|----------|
| CC7.2 - Data integrity | ✅ Implemented | Validation hooks |
| CC7.3 - Security monitoring | ✅ Implemented | Audit logs |
| CC8.1 - Change management | ✅ Implemented | Git + CI/CD |

---

## 7. Evidence Collection Plan

### Week 2 Activities (Current)

**Day 1-2: RBAC Evidence**
- [ ] Broker view screenshot (shows customer_rate, margin)
- [ ] Carrier view screenshot (rates redacted)
- [ ] Driver view screenshot (minimal access)
- [ ] API response comparison (Network tab)

**Day 3-4: Validation Evidence**
- [ ] Negative margin rejected
- [ ] Invalid status transition blocked
- [ ] Required field validation
- [ ] Business rule enforcement

**Day 5-7: Audit & Testing**
- [ ] Audit log entries (create/update/delete)
- [ ] Access denial logs
- [ ] Test suite results
- [ ] Code review evidence

---

## 8. Pre-Audit Verification

### Self-Assessment Checklist

Before engaging auditor, verify:

- [ ] Backend functions enabled in Base44
- [ ] All hooks firing correctly (verified via tests)
- [ ] Redaction working (carrier cannot see customer rates)
- [ ] Validation rejecting invalid data
- [ ] Audit logs created for all changes
- [ ] Tests passing (RBAC, validation, audit)
- [ ] Documentation complete and up-to-date
- [ ] Evidence screenshots captured

**Reference:** `audit-readiness-checklist.md`

---

## 9. Phase 2 Preview (Later)

### Type II Requirements (6-12 months of evidence)

- Incident metrics and tracking
- Continuous monitoring
- Vendor risk management
- Availability SLAs
- Security awareness training
- Penetration testing
- Disaster recovery testing

**Timeline:** Q3-Q4 2026

---

## 10. Auditor Engagement

### Recommended Auditors

- Prescient Assurance
- A-LIGN
- Advantage Partners
- Sensiba San Filippo

### Engagement Scope

**Type I Audit:**
- Design review of controls
- Documentation assessment
- Single point-in-time testing
- Report issuance: 4-6 weeks

**Cost:** $15,000 - $30,000

---

## 11. Success Criteria

### Phase 1 Completion

At the end of Phase 1, TMS.ai can confidently state:

> **"We have designed and implemented SOC 2-aligned security controls covering Security and Confidentiality. Our controls are documented, tested, and evidence is available for audit."**

### Deliverables

✅ Complete control documentation  
✅ Implemented security controls (RBAC, redaction, validation, audit)  
✅ Automated test coverage  
✅ Evidence package (screenshots, logs, tests)  
✅ Policies and procedures  
✅ Type I audit report (upon completion)  

---

## 12. Risk Assessment

### Low Risk

- Documentation incomplete → **Mitigated:** All docs created
- Hooks not firing → **Mitigated:** Automated tests verify
- Evidence insufficient → **Mitigated:** Screenshot guide provided

### Medium Risk

- Auditor finds gap in control design → **Mitigation:** Pre-audit dry run
- Evidence not sufficient → **Mitigation:** Follow evidence checklist

### High Risk (Addressed)

- Backend functions disabled → **Mitigated:** Verification in readiness checklist
- No server-side enforcement → **Mitigated:** Architecture designed for this

---

## Next Steps

### Immediate (This Week)

1. ✅ Complete all documentation
2. 📸 Capture evidence screenshots
3. 🧪 Run full test suite
4. ✅ Verify backend functions enabled

### Week 3

1. Run dry-run audit
2. Address any gaps found
3. Package evidence
4. Prepare for auditor kickoff

### Week 4

1. Engage auditor
2. Schedule kickoff call
3. Provide access to evidence
4. Begin audit process

---

**Document Owner:** Security Team  
**Status:** ✅ Active  
**Next Review:** March 31, 2026