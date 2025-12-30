# TMS.ai Security Whitepaper
**Customer-Facing Security Documentation**  
**Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Public

---

## Executive Summary

TMS.ai is an AI-native transportation management system built on Base44's secure cloud platform. This whitepaper describes our security architecture, data protection measures, and compliance commitments.

**Key Security Highlights:**
- 🔒 Zero-trust architecture with role-based access control
- 🛡️ Server-side enforcement of all security policies
- 📝 Immutable audit logging for complete traceability
- 🏢 Multi-tenant data isolation
- ✅ SOC 2 Type II ready (audit in progress)
- 🌐 ISO 27001 and NIST 800-53 aligned

---

## 1. Security Architecture

### 1.1 Platform Foundation

**Base44 Cloud Infrastructure**
- Managed cloud hosting with enterprise-grade security
- Automatic security updates and patches
- Built-in DDoS protection and WAF
- 99.9% uptime SLA

**Technology Stack**
- Frontend: React with secure authentication
- Backend: Node.js with Base44 SDK
- Database: Encrypted at rest and in transit
- API: RESTful with JWT authentication

### 1.2 Security Layers

```
┌─────────────────────────────────────────┐
│         User Authentication             │  ← JWT tokens, session management
├─────────────────────────────────────────┤
│      Role-Based Access Control          │  ← RBAC enforcement via hooks
├─────────────────────────────────────────┤
│      Field-Level Redaction              │  ← Sensitive data masking
├─────────────────────────────────────────┤
│      Business Logic Validation          │  ← Server-side rule enforcement
├─────────────────────────────────────────┤
│         Audit Logging                   │  ← Immutable change tracking
├─────────────────────────────────────────┤
│      Multi-Tenant Isolation             │  ← Data segregation
└─────────────────────────────────────────┘
```

---

## 2. Identity & Access Management

### 2.1 Authentication

**User Authentication**
- Email-based identity with secure password requirements
- JWT token-based sessions with automatic expiration
- Optional: Multi-factor authentication (roadmap)
- Single sign-on (SSO) support available

**Password Security**
- Minimum 8 characters with complexity requirements
- Passwords hashed using industry-standard algorithms
- Account lockout after failed login attempts
- Password reset via secure email verification

### 2.2 Authorization

**Role-Based Access Control (RBAC)**

| Role | Access Level | Use Case |
|------|-------------|----------|
| **Admin** | Full system access | System configuration, user management |
| **Broker** | Broker operations, full load visibility | Freight brokerage operations |
| **Carrier** | Carrier operations, assigned loads only | Trucking company operations |
| **Driver** | Driver portal, assigned trips only | Individual driver app access |
| **Customer** | Customer portal, own shipments only | Shipper self-service |

**Least Privilege Principle**
- Users granted minimum access necessary for their role
- Sensitive fields automatically redacted based on role
- Cross-tenant access strictly prohibited
- Admin actions require explicit role assignment

---

## 3. Data Protection

### 3.1 Data Classification

| Classification | Examples | Protection Measures |
|----------------|----------|---------------------|
| **Highly Sensitive** | Customer rates, margins, financial terms | Broker-only access, encrypted, audited |
| **Sensitive** | Driver SSN, CDL numbers, carrier insurance | Role-based access, encrypted, audited |
| **Confidential** | Load details, contact info, routes | Tenant-scoped access, encrypted |
| **Public** | Equipment types, general locations | Standard access controls |

### 3.2 Data Redaction

**Field-Level Security**
- Sensitive fields removed from API responses based on role
- Server-side enforcement (not UI-only hiding)
- Example: Carriers never receive customer pricing in API responses

**Redaction Examples:**

```javascript
// Broker sees:
{
  "customer_rate": 2500,
  "carrier_pay": 2000,
  "margin": 500
}

// Carrier sees:
{
  "carrier_pay": 2000
  // customer_rate: REDACTED
  // margin: REDACTED
}
```

### 3.3 Data Encryption

**Encryption at Rest**
- Database encryption using AES-256
- Encrypted backups with secure key management
- File storage encryption for documents

**Encryption in Transit**
- TLS 1.2+ for all API communications
- HTTPS enforced for web interface
- Certificate pinning for mobile apps

### 3.4 Data Retention

**Retention Periods**
- Transaction data: 3 years minimum (FMCSA compliance)
- Audit logs: 7 years
- User data: Active + 90 days after termination
- Backup data: 30 days rolling window

**Data Disposal**
- Secure deletion processes for expired data
- Automated retention policy enforcement
- Data export available upon request (GDPR)

---

## 4. Application Security

### 4.1 Secure Development

**Development Practices**
- Code review required for all changes
- Automated security scanning in CI/CD pipeline
- Dependency vulnerability monitoring (npm audit)
- Regular security training for developers

**Testing**
- Automated unit and integration tests
- Security-focused test coverage for RBAC
- Penetration testing (annual)
- Vulnerability assessments (quarterly)

### 4.2 Input Validation

**Server-Side Validation**
- All user input validated before processing
- Business rule enforcement (e.g., rate validation)
- SQL injection prevention via ORM
- XSS protection via React's built-in escaping

**Validation Examples:**
- Negative margin prevention (customer_rate ≥ carrier_pay)
- Required field enforcement
- Date logic validation (delivery ≥ pickup)
- Status transition rules

### 4.3 API Security

**Authentication & Authorization**
- JWT tokens required for all API calls
- Token expiration and refresh mechanism
- Rate limiting to prevent abuse
- IP whitelisting available for enterprise customers

**Security Headers**
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)

---

## 5. Audit & Monitoring

### 5.1 Audit Logging

**What We Log**
- All data create, update, delete operations
- User authentication events
- Access control decisions (grants and denials)
- Admin actions
- API requests with response status

**Audit Log Contents**
- Timestamp (UTC)
- Actor identity (user email, role)
- Entity type and ID
- Action performed
- Changed fields with before/after values
- IP address and user agent
- Request metadata

**Example Audit Log:**
```json
{
  "timestamp": "2025-12-30T14:23:45Z",
  "actor_email": "broker@company.com",
  "actor_role": "broker",
  "entity_type": "Load",
  "entity_id": "load_123",
  "action": "UPDATE",
  "changed_fields": {
    "customer_rate": {"from": 2000, "to": 2500}
  },
  "ip_address": "203.0.113.42"
}
```

### 5.2 Log Protection

**Immutability**
- Audit logs are append-only (no edit/delete)
- Stored separately from application data
- Tamper-evident design
- Long-term retention (7 years)

**Access Control**
- Audit log access restricted to admins
- Separate permission required for viewing
- All audit log access is itself audited

### 5.3 Monitoring & Alerting

**Security Monitoring**
- Failed authentication attempts
- Unauthorized access attempts (403 responses)
- Unusual data access patterns
- Privilege escalation attempts
- Mass data exports

**Incident Response**
- 24/7 security monitoring
- Automated alerting for critical events
- Incident response plan documented
- Customer notification within 72 hours (if applicable)

---

## 6. Multi-Tenant Security

### 6.1 Data Isolation

**Tenant Segregation**
- Each customer's data isolated via tenant ID
- Cross-tenant queries blocked at database level
- Server-side enforcement on every request
- No shared resources between tenants

**Scope Enforcement:**
```javascript
// Carrier A can only access their assigned loads
query = {
  carrier_id: "carrier_a_id",
  status: { $in: ["assigned", "in_transit"] }
}

// Query automatically scoped - cannot see Carrier B data
```

### 6.2 Resource Isolation

**Compute & Storage**
- Logical separation within shared infrastructure
- Resource quotas per tenant (roadmap)
- Performance isolation to prevent noisy neighbor
- Dedicated instances available for enterprise

---

## 7. Compliance & Certifications

### 7.1 Compliance Frameworks

**SOC 2 Type II**
- Status: Audit in progress
- Expected completion: Q2 2026
- Trust Services Criteria: Security, Confidentiality
- Annual audits planned

**ISO 27001**
- Status: Controls aligned
- Certification: Planned for 2026
- Information Security Management System (ISMS)

**NIST 800-53**
- Status: Moderate baseline aligned
- Control families implemented: AC, AU, IA, SI, SC
- Continuous control monitoring

### 7.2 Industry-Specific Compliance

**FMCSA Regulations (49 CFR 371.3)**
- Broker transaction record retention (3 years)
- Carrier authority verification
- Broker-carrier separation enforced
- Digital record keeping compliant

**Data Privacy**
- GDPR-ready (data export, right to deletion)
- CCPA compliance for California customers
- Privacy policy available at tms.ai/privacy

### 7.3 Third-Party Assessments

**Planned Assessments:**
- Penetration testing: Annual
- Vulnerability scanning: Quarterly
- Security audit: Annual
- Code security review: Continuous

---

## 8. Business Continuity

### 8.1 Backup & Recovery

**Backup Strategy**
- Automated daily backups
- Point-in-time recovery capability
- Geographically distributed backup storage
- Backup encryption with separate keys

**Recovery Objectives**
- Recovery Point Objective (RPO): < 1 hour
- Recovery Time Objective (RTO): < 4 hours
- Backup restoration tested quarterly

### 8.2 Disaster Recovery

**DR Plan**
- Documented disaster recovery procedures
- Failover to secondary region available
- Annual DR testing
- Customer communication plan

### 8.3 High Availability

**System Availability**
- 99.9% uptime SLA
- Redundant infrastructure
- Automatic failover
- Load balancing across availability zones

---

## 9. Vendor Security

### 9.1 Base44 Platform Security

**Infrastructure Provider:** Base44
- SOC 2 Type II (in progress)
- AWS/Azure-backed infrastructure
- Enterprise-grade security controls
- Regular security audits

**Shared Responsibility Model**
- Base44: Infrastructure, platform, network security
- TMS.ai: Application logic, data classification, access controls

### 9.2 Third-Party Services

**Service Providers:**
- Email delivery: [Provider TBD]
- Payment processing: [Provider TBD]
- Analytics: [Provider TBD]

**Vendor Management**
- Security questionnaires required
- Annual vendor risk assessments
- Data processing agreements in place
- Compliance certifications verified

---

## 10. Security Roadmap

### 10.1 Planned Enhancements

**Q1 2026**
- [ ] Multi-factor authentication (MFA)
- [ ] Advanced threat detection
- [ ] Enhanced anomaly detection in audit logs

**Q2 2026**
- [ ] SOC 2 Type II certification completion
- [ ] Penetration testing and remediation
- [ ] Security awareness training portal

**Q3 2026**
- [ ] ISO 27001 certification
- [ ] Customer security dashboard
- [ ] Real-time security metrics

**Q4 2026**
- [ ] Advanced encryption key management
- [ ] Zero-knowledge architecture exploration
- [ ] Blockchain audit trail (pilot)

---

## 11. Customer Security Responsibilities

### 11.1 Shared Security Model

**TMS.ai Responsibilities**
- Platform security and infrastructure
- Application-level access controls
- Data encryption and protection
- Security monitoring and incident response

**Customer Responsibilities**
- User account security (passwords)
- Role assignment and access governance
- Secure integration credentials
- Employee security training

### 11.2 Security Best Practices

**For Customers:**
1. Use strong, unique passwords
2. Limit user access to least privilege
3. Review user access quarterly
4. Enable MFA when available
5. Monitor audit logs for anomalies
6. Report security concerns immediately

---

## 12. Security Contact

### 12.1 Reporting Security Issues

**Security Team Contact**
- Email: security@tms.ai
- Response time: < 24 hours
- Bug bounty program: Planned for 2026

**What to Report:**
- Suspected vulnerabilities
- Unauthorized access attempts
- Data breaches or leaks
- Security misconfigurations
- Phishing attempts

### 12.2 Security Documentation

**Available Resources:**
- Security whitepaper (this document)
- Privacy policy: tms.ai/privacy
- Terms of service: tms.ai/terms
- Data processing agreement: Available on request
- Compliance reports: Available to enterprise customers

---

## 13. Frequently Asked Questions

**Q: Is my data encrypted?**  
A: Yes, all data is encrypted at rest (AES-256) and in transit (TLS 1.2+).

**Q: Can TMS.ai employees see my data?**  
A: Access is strictly limited to authorized personnel for support/maintenance only, with full audit logging.

**Q: Where is my data stored?**  
A: Data is stored in [region] data centers with redundancy across availability zones.

**Q: How long do you keep my data?**  
A: Active data + 3 years minimum (FMCSA), or per contract terms. Longer retention available.

**Q: Are you SOC 2 certified?**  
A: Audit in progress, expected completion Q2 2026.

**Q: Do you support SSO?**  
A: Yes, SSO integration available for enterprise customers.

**Q: Can I export my data?**  
A: Yes, data export available via API or support request.

**Q: What happens if there's a breach?**  
A: We follow our incident response plan and notify affected customers within 72 hours.

---

## Appendix A: Security Control Matrix

| Control Category | Implementation | Status |
|-----------------|----------------|--------|
| **Access Control** | RBAC with server-side enforcement | ✅ Active |
| **Data Protection** | Field-level redaction + encryption | ✅ Active |
| **Audit Logging** | Immutable append-only logs | ✅ Active |
| **Input Validation** | Server-side business rules | ✅ Active |
| **Multi-Tenant Isolation** | Tenant-scoped queries | ✅ Active |
| **MFA** | Optional multi-factor auth | 📋 Planned Q1 2026 |
| **Penetration Testing** | Annual third-party assessment | 📋 Planned Q2 2026 |
| **SOC 2 Type II** | Compliance certification | 📋 In Progress |

---

## Appendix B: Compliance Mapping

See detailed control mappings:
- `RBAC_Redaction_Appendix.md` - Access control implementation
- `security-controls-mapping.md` - SOC 2, ISO 27001, NIST mapping
- `SOC2_Evidence_Checklist.md` - Audit evidence requirements

---

## Document Information

**Document Owner:** Security & Compliance Team  
**Review Frequency:** Quarterly  
**Last Review:** December 30, 2025  
**Next Review:** March 31, 2026

**Approval:**
- Chief Security Officer: [Name TBD]
- Chief Technology Officer: [Name TBD]
- Legal Counsel: [Name TBD]

**Version History:**
- v1.0 (2025-12-30): Initial release

---

**© 2025 TMS.ai. All rights reserved.**  
This document is confidential and proprietary. Distribution is limited to prospective and current customers under NDA.