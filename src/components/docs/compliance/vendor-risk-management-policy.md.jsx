# Vendor Risk Management Policy

**System:** TMS.ai  
**Version:** 1.0  
**Last Updated:** December 30, 2025  
**Applies To:** All third-party vendors with access to TMS.ai systems or data

---

## 1. Purpose

TMS.ai relies on third-party vendors to deliver its services. This policy defines how vendor risks are identified, assessed, and managed to protect customer data and system integrity.

---

## 2. Scope

This policy applies to all vendors that:

- Store, process, or transmit TMS.ai data
- Support infrastructure, hosting, or authentication
- Provide integrations or services critical to operations
- Have access to TMS.ai systems or networks

**Examples:**
- Cloud infrastructure providers (AWS, Base44)
- Authentication services
- Payment processors
- Analytics platforms
- Email service providers
- Support ticketing systems

---

## 3. Vendor Risk Categories

| Risk Level | Description | Examples |
|------------|-------------|----------|
| **High** | Vendors with access to sensitive data or core systems | Database hosting, authentication providers, backup services |
| **Medium** | Vendors supporting operations with limited data exposure | Email services, analytics, monitoring tools |
| **Low** | Vendors with no access to sensitive data | Marketing tools, office software, productivity apps |

---

## 4. Risk Assessment Process

### Before Onboarding High or Medium Risk Vendors

**Required Steps:**

1. **Review vendor security posture**
   - Request security documentation
   - Review SOC 2/ISO certifications (if applicable)
   - Assess incident history
   - Review security practices

2. **Identify data access level**
   - What data will vendor access?
   - How is data transmitted?
   - Where is data stored?
   - How long is data retained?

3. **Confirm security controls**
   - Access controls implemented
   - Encryption at rest and in transit
   - Authentication mechanisms
   - Audit logging capabilities

4. **Contract requirements**
   - Confidentiality obligations
   - Data processing agreements (DPA)
   - Breach notification terms
   - Right to audit
   - Data deletion upon termination

### Assessment Template

```
Vendor Name: [Vendor]
Risk Level: [High/Medium/Low]
Service Provided: [Description]
Data Access: [Types of data accessed]
Security Certifications: [SOC 2, ISO, etc.]
Contract Start Date: [Date]
Review Date: [Annual review date]
Assessment Completed By: [Name]
Approval: [Security Owner]
```

---

## 5. Approved Vendors

### Current High-Risk Vendors

| Vendor | Service | Risk Level | Certifications | Last Reviewed |
|--------|---------|-----------|----------------|---------------|
| Base44 | Backend platform, database | High | SOC 2 Type II | 2025-12-30 |
| AWS | Infrastructure hosting | High | SOC 2, ISO 27001 | 2025-12-30 |

### Medium-Risk Vendors

| Vendor | Service | Risk Level | Certifications | Last Reviewed |
|--------|---------|-----------|----------------|---------------|
| [To be populated] | Email delivery | Medium | - | - |

### Low-Risk Vendors

*(List maintained separately - no security review required)*

---

## 6. Ongoing Monitoring

### Annual Review

- All High-risk vendors reviewed annually
- Medium-risk vendors reviewed upon contract renewal
- Review includes:
  - Security posture changes
  - New certifications or audits
  - Incident history
  - Continued business need

### Continuous Monitoring

- Monitor vendor security advisories
- Track vendor incidents reported publicly
- Review vendor-related security events in audit logs
- Assess vendor changes (acquisitions, leadership changes)

### Triggers for Immediate Review

- Vendor security breach reported
- Loss of security certification
- Material change in vendor ownership or structure
- Contract renewal approaching
- Significant service changes

---

## 7. Access Controls

### Principle of Least Privilege

- Vendor access limited to minimum required for service delivery
- Role-based access applied where possible
- Vendor accounts are distinct from employee accounts

### Access Management

**Granting Access:**
1. Business justification documented
2. Security Owner approval required
3. Access limited to specific systems/data
4. Time-bound access where applicable

**Revoking Access:**
- Credentials revoked upon contract termination
- Access reviewed quarterly
- Inactive accounts disabled after 90 days
- Terminated vendor access removed within 24 hours

### Vendor Credentials

- Unique credentials per vendor
- No shared accounts
- MFA required where available
- Passwords rotated annually (if not SSO)

---

## 8. Data Protection Requirements

### Vendor Obligations

All High and Medium risk vendors must:

1. **Encrypt data in transit** - TLS 1.2 or higher
2. **Encrypt data at rest** - AES-256 or equivalent
3. **Implement access controls** - Role-based, least privilege
4. **Maintain audit logs** - Retain per policy
5. **Report incidents** - Within 24 hours of discovery
6. **Delete data** - Upon contract termination

### Data Processing Agreements (DPA)

Required for vendors processing customer data:
- Scope of processing defined
- Security obligations specified
- Sub-processor approval rights
- Data subject rights supported
- Breach notification terms
- Right to audit included

---

## 9. Incident Handling

### Vendor-Related Incidents

Security incidents involving vendors are handled using the same procedures as internal incidents (see Incident Response Policy).

**Additional Steps:**

1. **Notify vendor immediately** if incident originates from TMS.ai
2. **Request vendor cooperation** for investigation
3. **Document vendor response** and timeline
4. **Assess vendor security posture** post-incident
5. **Consider vendor termination** if negligence found

### Vendor-Reported Incidents

When a vendor reports an incident:

1. Assess impact to TMS.ai systems and data
2. Activate Incident Response Policy if applicable
3. Document vendor incident details
4. Review vendor relationship and controls
5. Notify customers if TMS.ai data affected

---

## 10. Exceptions

### Exception Process

Exceptions to this policy may be granted when:
- Business critical need exists
- Risk is assessed and accepted
- Compensating controls are implemented

**Exception Requirements:**

- Written justification
- Risk assessment completed
- Compensating controls documented
- Security Owner approval
- Leadership approval (for High-risk exceptions)
- Annual review of exception

### Exception Documentation

```
Vendor: [Name]
Exception Type: [Security control waived]
Business Justification: [Why exception needed]
Risk Assessment: [Assessed risk level]
Compensating Controls: [Alternative protections]
Approved By: [Name, Date]
Review Date: [Annual review date]
```

---

## 11. Vendor Offboarding

### Termination Checklist

When vendor contract terminates:

- [ ] Revoke all vendor access credentials
- [ ] Request data deletion confirmation
- [ ] Retrieve or destroy shared credentials
- [ ] Remove vendor from approved vendor list
- [ ] Update documentation
- [ ] Conduct offboarding review

### Data Deletion

Vendors must:
- Delete all TMS.ai data within 30 days of termination
- Provide written confirmation of deletion
- Delete data from backup systems
- Return or destroy any physical media

---

## 12. Vendor Security Requirements

### Minimum Security Standards

All High-risk vendors must demonstrate:

**Access Control:**
- Role-based access control
- Multi-factor authentication
- Least privilege enforcement

**Data Protection:**
- Encryption in transit (TLS 1.2+)
- Encryption at rest (AES-256)
- Secure key management

**Monitoring:**
- Security event logging
- Intrusion detection
- Vulnerability management

**Incident Response:**
- Documented incident response plan
- Breach notification within 24 hours
- Forensic investigation capability

**Compliance:**
- SOC 2 Type II (preferred)
- ISO 27001 certification (preferred)
- GDPR/CCPA compliance (if applicable)

---

## 13. Review Cycle

### Policy Review

- **Frequency:** Annual (Q1)
- **Owner:** Security Team
- **Approver:** CTO/CEO
- **Updates:** Communicated to all stakeholders

### Vendor Review Schedule

| Risk Level | Review Frequency | Owner |
|------------|------------------|-------|
| High | Annual | Security Owner |
| Medium | Upon renewal | Operations |
| Low | As needed | Procurement |

---

## 14. Roles & Responsibilities

### Security Owner

- Approve vendor risk assessments
- Review High-risk vendor relationships
- Grant exceptions to policy
- Conduct annual policy review

### Operations Team

- Manage vendor relationships
- Maintain vendor inventory
- Coordinate vendor reviews
- Track contract renewals

### Engineering Team

- Implement vendor integrations
- Monitor vendor access
- Report vendor-related incidents
- Support vendor offboarding

---

## 15. Related Documents

- `incident-response-policy.md` - Incident handling procedures
- `security-controls-mapping.md` - Security control framework
- `security-data-protection-overview.md` - Data protection standards
- `soc2-phase1-readiness-plan.md` - Audit preparation

---

## Appendix A: Vendor Assessment Questionnaire

Use this questionnaire for High and Medium risk vendors:

### Security & Compliance

1. Do you have SOC 2 Type II or ISO 27001 certification?
2. When was your last security audit?
3. Do you have a documented incident response plan?
4. Have you had any security breaches in the past 12 months?

### Data Protection

5. How is data encrypted in transit?
6. How is data encrypted at rest?
7. Where is data stored (geographic regions)?
8. Do you use sub-processors? (List them)

### Access Control

9. Do you implement role-based access control?
10. Do you require multi-factor authentication?
11. How often are access rights reviewed?
12. What is your user offboarding process?

### Monitoring & Logging

13. Do you maintain audit logs?
14. How long are logs retained?
15. Do you monitor for suspicious activity?
16. Can you provide logs upon request?

### Incident Response

17. What is your breach notification timeline?
18. Who is the incident response contact?
19. Will you support forensic investigations?
20. Do you have cyber insurance?

---

**Document Owner:** Security Team  
**Approved By:** [CTO/CEO Name]  
**Effective Date:** December 30, 2025  
**Next Review:** December 30, 2026  
**Status:** ✅ Active