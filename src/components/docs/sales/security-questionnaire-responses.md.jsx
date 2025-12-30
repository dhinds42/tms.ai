# Standard Enterprise Security Responses – TMS.ai
**Prepared Answers for RFPs and Security Questionnaires**  
**Version:** 1.0  
**Last Updated:** December 30, 2025

---

## How to Use This Document

This document provides pre-approved responses to common security questions in:
- RFPs (Request for Proposals)
- Security questionnaires
- Vendor risk assessments
- Customer due diligence
- Procurement processes

**Instructions:**
- Copy/paste responses as appropriate
- Customize [bracketed] sections as needed
- Reference supporting documentation when required
- Update if material changes to security posture occur

---

## Access Control & Authentication

### Q1: Do you enforce role-based access control (RBAC)?

**Answer:**  
Yes. TMS.ai enforces server-side RBAC using Base44 backend lifecycle hooks. Access is restricted by role (Admin, Broker, Carrier, Driver, Customer) and tenant context. Unauthorized access attempts are denied and logged to immutable audit trails.

**Evidence Available:**
- RBAC implementation code (`functions/hooks/*.js`)
- Automated test suite (`functions/__tests__/rbac.test.js`)
- Security controls mapping document

---

### Q2: How do you authenticate users?

**Answer:**  
TMS.ai uses JWT (JSON Web Token) authentication provided by the Base44 platform. Tokens are signed, time-limited (24-hour expiration), and include user identity and role claims. All API requests require valid authentication tokens in the Authorization header.

**Future:** Multi-factor authentication (MFA) planned for Q2 2026.

---

### Q3: Do you support single sign-on (SSO)?

**Answer:**  
SSO integration via SAML 2.0 and OAuth 2.0 is on our roadmap for Q2 2026. Currently, users authenticate with email and password credentials managed by the Base44 platform.

---

### Q4: How are user passwords managed?

**Answer:**  
Passwords are hashed using industry-standard algorithms (bcrypt) by the Base44 platform. TMS.ai application code never has access to plaintext passwords. Password complexity requirements are enforced (minimum 8 characters).

---

## Data Protection & Confidentiality

### Q5: Can users see pricing or margin data they shouldn't?

**Answer:**  
No. Pricing, margin, and internal financial fields are redacted server-side using role-based filtering before API responses are returned. This protection cannot be bypassed through UI manipulation or direct API access. Carriers never see customer rates or broker margins.

**Technical Implementation:**  
- `afterRead()` hooks remove sensitive fields based on user role
- Redaction enforced at database query level, not in client code
- Automated tests verify redaction works correctly

---

### Q6: How do you protect confidential customer data?

**Answer:**  
TMS.ai implements multiple layers of data protection:
1. **Server-side redaction** - Sensitive fields removed based on role
2. **Tenant isolation** - Users can only access data for their organization
3. **Field-level security** - Granular control over data visibility
4. **Encryption at rest** - Database encrypted by hosting provider
5. **Encryption in transit** - TLS 1.2+ for all communications

---

### Q7: Do you encrypt data in transit and at rest?

**Answer:**  
Yes.  
- **In Transit:** All API communications use TLS 1.2 or higher with strong cipher suites
- **At Rest:** Database and file storage are encrypted using AES-256 encryption provided by our infrastructure partner (Base44/AWS)

---

## Data Validation & Integrity

### Q8: Is data validation enforced server-side?

**Answer:**  
Yes. All create and update operations are validated server-side using lifecycle hooks (`beforeCreate`, `beforeUpdate`). Business rules, including financial integrity checks (e.g., preventing negative margins), are enforced before data is persisted to the database. Client-side validation is for user experience only; server validation cannot be bypassed.

**Examples of Validation:**
- Required field enforcement
- Data type and format validation
- Business rule enforcement (margin checks, status transitions)
- Duplicate detection
- Financial constraint validation

---

### Q9: How do you prevent invalid status transitions?

**Answer:**  
TMS.ai enforces a state machine for load statuses. Invalid transitions (e.g., "delivered" → "available") are rejected server-side in the `beforeUpdate()` hook. Valid transitions are defined in code and tested via automated test suite.

---

### Q10: Can users enter negative margins or invalid rates?

**Answer:**  
No. Server-side validation prevents:
- Customer rate < Carrier pay (negative margin) - requires admin override
- Negative values for rates
- Invalid currency formats
- Rates exceeding reasonable thresholds

All validation logic is enforced server-side and cannot be bypassed.

---

## Audit Logging & Monitoring

### Q11: Do you log data changes?

**Answer:**  
Yes. All create, update, and delete actions are logged to an immutable `AuditLog` entity with:
- Actor identity (user email and role)
- Timestamp (ISO 8601 format)
- Entity type and ID
- Changed fields (before/after values)
- IP address and user agent
- Full snapshots of before/after state

Audit logs are append-only (no update or delete operations) and retained for 7 years.

---

### Q12: How do you handle unauthorized access attempts?

**Answer:**  
Unauthorized access requests are:
1. Blocked server-side before data is retrieved
2. Recorded in audit logs with `action: READ_DENIED`
3. Reviewed by security team during monthly log reviews
4. Investigated if patterns indicate malicious activity

Repeated unauthorized attempts trigger incident response procedures.

---

### Q13: Can audit logs be tampered with or deleted?

**Answer:**  
No. The `AuditLog` entity is designed as append-only with no update or delete capabilities. Audit logs are stored separately from application data and protected by database-level access controls. Any attempt to modify logs would itself be logged.

---

## Tenant Isolation & Multi-Tenancy

### Q14: How do you isolate customers and carriers?

**Answer:**  
Tenant isolation is enforced server-side through query scoping:
- **Carriers** can only access loads assigned to them
- **Drivers** can only access their own trip details
- **Customers** can only access their own shipments
- **Brokers** can access data for their brokerage operations

Scoping is applied automatically in `beforeRead()` hooks and cannot be bypassed. Cross-tenant data access is prevented at the database query level.

---

### Q15: Can one customer see another customer's data?

**Answer:**  
No. All database queries are automatically scoped to the user's tenant context. A carrier assigned to Customer A cannot query or access data related to Customer B. This is enforced server-side and tested via automated test suite.

---

## Import & Data Integration

### Q16: How do you protect data during bulk imports?

**Answer:**  
TMS.ai validates all imported data server-side with:
- **Schema validation** - Required fields, data types, formats
- **Business rule enforcement** - Margin checks, duplicate detection
- **RBAC checks** - User must have permission to import entity type
- **Dry-run support** - Preview validation errors before committing
- **Strict mode** - Option to reject entire import if any errors found

All imports create an `ImportRun` audit record with validation results.

---

### Q17: Do you prevent duplicate records during import?

**Answer:**  
Yes. The import engine checks for duplicates using unique identifiers (e.g., MC number for carriers, CDL number for drivers). Duplicate handling can be configured:
- **Insert mode** - Reject duplicates
- **Upsert mode** - Update existing records
- **Update mode** - Only update, never insert

All duplicate detections are logged in the import summary.

---

## SOC 2 & Compliance

### Q18: Do you support SOC 2?

**Answer:**  
Yes. TMS.ai is SOC 2 aligned and preparing for a SOC 2 Type I audit (scheduled for Q2 2026). Core Security and Confidentiality controls are implemented and documented.

**Evidence Available:**
- Security controls mapping (SOC 2, ISO 27001, NIST 800-53)
- RBAC implementation documentation
- Audit logging policy
- Incident response policy
- Evidence collection package

---

### Q19: What compliance frameworks do you align with?

**Answer:**  
TMS.ai aligns with:
- **SOC 2** (Security, Confidentiality) - Type I in progress
- **ISO 27001** - Control families implemented
- **NIST 800-53 Rev 5** - Moderate baseline controls
- **FMCSA 371.3** - Broker record retention requirements

**Supporting Documentation:**
- `security-controls-mapping.md` - Complete control alignment
- `NIST_ISO_ControlMapping.md` - Detailed control mapping

---

### Q20: When will you complete SOC 2 certification?

**Answer:**  
TMS.ai is currently in Phase 1 (SOC 2 Type I) with audit engagement planned for Q2 2026. Type I focuses on design and implementation of controls. Type II (operational effectiveness over 6-12 months) is planned for Q4 2026 - Q2 2027.

**Current Status:**
- ✅ Controls designed and implemented
- ✅ Documentation complete
- 📸 Evidence collection in progress
- 📋 Auditor engagement pending

---

## Security Testing

### Q21: Do you perform security testing?

**Answer:**  
Yes. TMS.ai implements multiple layers of security testing:

**Automated Testing:**
- RBAC enforcement tests
- Validation rule tests
- Access denial tests
- Audit logging tests
- Runs on every code change via CI/CD

**Manual Testing:**
- Pre-deployment security verification
- Quarterly access reviews
- Monthly audit log reviews

**Planned:**
- Penetration testing (Q3 2026)
- Vulnerability scanning (Q2 2026)

---

### Q22: What is your test coverage for security controls?

**Answer:**  
Critical security controls have dedicated automated tests:
- RBAC enforcement: 25+ test cases
- Data redaction: 15+ test cases
- Validation rules: 30+ test cases
- Audit logging: 10+ test cases

All tests run on every commit and must pass before deployment.

**Evidence:** Test execution reports available upon request.

---

## Incident Response

### Q23: How do you respond to security incidents?

**Answer:**  
TMS.ai follows a formal Incident Response Policy covering:
1. **Identification** - Detection via logs, reports, or monitoring
2. **Containment** - Disable access, revoke credentials
3. **Investigation** - Root cause analysis, evidence collection
4. **Remediation** - Patch vulnerability, deploy fixes
5. **Recovery** - Restore service, verify integrity
6. **Post-Incident Review** - Document lessons learned, update controls

**Response Times:**
- Critical incidents: 15 minutes
- High incidents: 1 hour
- Medium incidents: 4 hours

**Reference:** `incident-response-policy.md`

---

### Q24: Have you had any security incidents?

**Answer:**  
[Update based on actual incident history]

**Template Response:**  
TMS.ai maintains detailed incident records per our Incident Response Policy. To date, we have not experienced any material security incidents involving unauthorized data access or breach. All security events are logged, investigated, and documented.

---

### Q25: How do you notify customers of security incidents?

**Answer:**  
Customer notification occurs within 72 hours if:
- Customer data was accessed or exposed
- Service availability impacted >4 hours
- Contract requires notification
- Legal/regulatory requirement applies (GDPR, CCPA)

Notification includes: nature of incident, data affected, remediation steps, and preventive actions.

---

## Change Management & Development

### Q26: How do you manage code changes?

**Answer:**  
TMS.ai follows secure development practices:
- **Version control** - All code in Git repository
- **Code review** - Peer review required for all changes
- **Automated testing** - Tests must pass before deployment
- **Security review** - Required for changes to authentication, authorization, or audit logging
- **Deployment controls** - Staging environment testing before production

**Security-critical changes** require senior engineering approval.

---

### Q27: Do you have a rollback plan?

**Answer:**  
Yes. All deployments can be rolled back:
- **Automated rollback** - If health checks fail
- **Manual rollback** - Via CI/CD dashboard
- **Database migrations** - Reversible schema changes
- **Rollback testing** - Verified during staging deployment

Average rollback time: 5-10 minutes.

---

## Data Retention & Deletion

### Q28: How long do you retain customer data?

**Answer:**  
- **Operational data** (loads, carriers, etc.) - Retained while account active + 90 days post-cancellation
- **Audit logs** - Retained for 7 years per compliance requirements
- **Backups** - Retained for 30 days
- **User data** - Deleted upon account closure (after retention period)

**Custom retention** can be configured per customer requirements.

---

### Q29: Can you delete customer data upon request?

**Answer:**  
Yes. Upon request, TMS.ai will:
1. Delete all customer-specific data from production systems
2. Remove data from backup systems (within 30 days)
3. Retain audit logs per regulatory requirements
4. Provide confirmation of deletion

**Note:** Some data may be retained to comply with legal obligations (e.g., FMCSA broker record retention).

---

## Business Continuity

### Q30: What is your backup and disaster recovery plan?

**Answer:**  
TMS.ai leverages Base44 platform infrastructure:
- **Automated backups** - Daily database snapshots
- **Geographic redundancy** - Multi-region deployment
- **Recovery Time Objective (RTO)** - 4 hours
- **Recovery Point Objective (RPO)** - 24 hours (daily backups)

**Disaster recovery testing** planned for Q3 2026.

**Reference:** `DisasterRecovery_Runbook.md`

---

## Additional Resources

### Supporting Documentation Available

- Security Whitepaper (customer-facing)
- Security & Data Protection Overview (technical)
- SOC 2 Evidence Checklist
- RBAC & Redaction Appendix
- Incident Response Policy
- Security Controls Mapping
- Audit Readiness Checklist

### Requesting Additional Information

For questions not covered in this document:
- **Security inquiries:** security@tms.ai
- **Compliance questions:** compliance@tms.ai
- **RFP support:** sales@tms.ai

---

**Document Owner:** Security Team  
**Version:** 1.0  
**Status:** ✅ Active  
**Next Review:** March 31, 2026