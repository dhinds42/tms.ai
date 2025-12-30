# Incident Response Policy

**System:** TMS.ai  
**Version:** 1.0  
**Last Updated:** December 30, 2025  
**Applies To:** All employees, contractors, and systems

---

## 1. Purpose

This policy defines how TMS.ai detects, responds to, investigates, and resolves security incidents to minimize impact and prevent recurrence.

---

## 2. Definition of a Security Incident

A security incident includes, but is not limited to:

- **Unauthorized access** or attempted access
- **Data exposure** or leakage
- **Privilege escalation** attempts
- **Validation bypass** or business rule circumvention
- **Malicious or suspicious activity**
- **Service compromise** or degradation due to security events
- **Audit log tampering** attempts
- **Credential compromise** or password breach
- **Denial of service** attacks
- **Code injection** attempts (SQL, XSS, etc.)

---

## 3. Roles & Responsibilities

### Incident Response Owner

**Responsible Role:** Head of Engineering / Security Owner

**Duties:**
- Triage incidents within 1 hour of detection
- Coordinate response activities
- Communicate internally and externally
- Approve remediation actions
- Lead post-incident reviews

### Engineering Team

**Duties:**
- Investigate root cause
- Implement fixes
- Assist with containment
- Restore service
- Update security controls

### All Employees

**Duties:**
- Report suspected incidents immediately
- Cooperate with investigation
- Follow containment procedures
- Do not delete or modify evidence

---

## 4. Incident Response Lifecycle

### 4.1 Identification

**Triggered by:**
- Audit log review (access denials, suspicious patterns)
- User report (email, chat, support ticket)
- Automated test failure (RBAC, validation)
- System anomaly (unusual API activity)
- Security alert (authentication failures)

**Initial Assessment:**
- Severity: Critical, High, Medium, Low
- Impact: Data, Service, Reputation
- Scope: Users affected, systems involved

### 4.2 Containment

**Immediate Actions:**
- Disable affected user accounts
- Revoke compromised credentials
- Block suspicious IP addresses
- Limit access to affected systems
- Prevent further data exposure

**Communication:**
- Notify Incident Response Owner
- Alert affected users (if applicable)
- Document containment actions in incident log

### 4.3 Investigation

**Evidence Collection:**
- Review audit logs (`AuditLog` entity)
- Check access denial events (`READ_DENIED` actions)
- Examine API request logs
- Interview users/witnesses
- Capture system state

**Root Cause Analysis:**
- Identify vulnerability exploited
- Determine attack vector
- Assess whether attack succeeded
- Identify impacted data/users
- Timeline reconstruction

### 4.4 Remediation

**Fix Implementation:**
- Patch vulnerability in code
- Update validation rules
- Add/strengthen RBAC controls
- Deploy hotfix if critical
- Update security configurations

**Verification:**
- Test fix thoroughly
- Verify vulnerability no longer exploitable
- Run automated security tests
- Check for similar vulnerabilities

### 4.5 Recovery

**Service Restoration:**
- Verify system integrity
- Restore normal operations
- Re-enable user access (if disabled)
- Monitor for recurrence (24-48 hours)

**User Communication:**
- Notify users of resolution
- Provide security guidance
- Reset credentials if needed

### 4.6 Post-Incident Review

**Within 7 Days:**
- Document incident summary
- Identify preventive actions
- Update controls or policies
- Share lessons learned
- Update documentation

**Deliverables:**
- Incident report
- Timeline of events
- Root cause analysis
- Preventive action plan
- Control enhancements implemented

---

## 5. Incident Severity Classification

### Critical (P0)
- Active data breach in progress
- Customer data exposed publicly
- Widespread unauthorized access
- System completely compromised

**Response Time:** Immediate (within 15 minutes)  
**Escalation:** CEO, all stakeholders

### High (P1)
- Unauthorized access to sensitive data
- Privilege escalation successful
- Multiple security controls bypassed
- Audit log tampering detected

**Response Time:** Within 1 hour  
**Escalation:** Incident Response Owner, management

### Medium (P2)
- Repeated failed authentication attempts
- Suspicious but contained activity
- Single user account compromised
- Non-critical vulnerability exploited

**Response Time:** Within 4 hours  
**Escalation:** Incident Response Owner

### Low (P3)
- Single failed authentication attempt
- Informational security event
- False positive from monitoring
- Minor configuration issue

**Response Time:** Within 24 hours  
**Escalation:** Security team review

---

## 6. Communication

### Internal Notification

**Immediate:**
- Incident Response Owner
- Engineering team lead
- CTO/CEO (if P0 or P1)

**Within 24 Hours:**
- All relevant stakeholders
- Internal incident report

### Customer Notification

**Trigger Conditions:**
- Customer data accessed or exposed
- Service availability impacted >4 hours
- Contract requires notification
- Legal/regulatory requirement (GDPR, CCPA)

**Notification Timeline:**
- Within 72 hours of discovery
- Via email to primary contact
- Include: nature of incident, data affected, remediation steps

### Auditor Notification

**Required If:**
- Incident impacts SOC 2 scope
- Security control failed
- Audit-relevant data compromised

**Timeline:** Within 48 hours

### Regulatory Notification

**If Applicable:**
- GDPR: 72 hours to supervisory authority
- CCPA: Without unreasonable delay
- State breach laws: As required by jurisdiction

---

## 7. Recordkeeping

### Incident Documentation

All incidents must be documented with:

- **Incident ID** (unique identifier)
- **Date/time** of detection and resolution
- **Severity classification**
- **Description** of incident
- **Affected systems/users**
- **Root cause** analysis
- **Timeline** of events
- **Actions taken** (containment, remediation, recovery)
- **Evidence** preserved (logs, screenshots)
- **Lessons learned**
- **Preventive actions** implemented

### Storage & Retention

- Incident reports stored in secure repository
- Linked to relevant audit logs
- Retained for **7 years** per compliance requirements
- Access restricted to authorized personnel

---

## 8. Preventive Measures

### Proactive Security

- **Monthly audit log review** by security team
- **Automated testing** of security controls
- **Security code reviews** for critical changes
- **Vulnerability scanning** (quarterly)
- **Access reviews** (quarterly)

### Security Monitoring

- Monitor audit logs for:
  - Multiple `READ_DENIED` events from same user
  - Unusual API access patterns
  - After-hours access to sensitive data
  - Rate changes by non-broker roles
  - Validation bypass attempts

### Response Improvement

- Update incident response procedures annually
- Conduct tabletop exercise once per year
- Review incidents quarterly for trends
- Enhance controls based on lessons learned

---

## 9. Testing & Review

### Annual Review

- Policy reviewed and updated annually (Q1)
- Incident Response Owner verifies procedures
- Updates reflect lessons learned
- Changes communicated to all employees

### Tabletop Exercise

**Frequency:** Once per year (minimum)

**Scenario Examples:**
- Carrier attempts to access broker pricing data
- Database credentials leaked on GitHub
- DDoS attack affecting service availability
- Insider threat (disgruntled employee)

**Participants:**
- Incident Response Owner
- Engineering team
- Management representative

**Outcomes:**
- Identify gaps in response procedures
- Practice communication protocols
- Update runbooks as needed

---

## 10. Contact Information

### Incident Reporting

- **Email:** security@tms.ai
- **Phone:** [Emergency Contact Number]
- **Slack:** #security-incidents (internal)

### Incident Response Owner

- **Name:** [Security Owner Name]
- **Email:** [Owner Email]
- **Phone:** [Owner Phone]

### External Support

- **Legal Counsel:** [Law Firm Contact]
- **PR/Communications:** [PR Contact]
- **Cyber Insurance:** [Insurance Provider]

---

## 11. Related Documents

- `audit-readiness-checklist.md` - Pre-incident prevention
- `security-controls-mapping.md` - Control framework
- `RBAC_Redaction_Appendix.md` - Access control details
- `security-data-protection-overview.md` - Security architecture

---

## Appendix A: Incident Report Template

```
INCIDENT REPORT

Incident ID: INC-2025-XXX
Date Detected: YYYY-MM-DD HH:MM UTC
Date Resolved: YYYY-MM-DD HH:MM UTC
Severity: [Critical / High / Medium / Low]

SUMMARY
[Brief description of what happened]

DETECTION
[How was the incident discovered?]

AFFECTED SYSTEMS/USERS
[List systems, entities, user accounts affected]

ROOT CAUSE
[Technical explanation of vulnerability or failure]

TIMELINE
[Chronological list of events]
- HH:MM - Event 1
- HH:MM - Event 2
- HH:MM - Resolution

CONTAINMENT ACTIONS
[Steps taken to stop the incident]

REMEDIATION
[Fixes implemented]

EVIDENCE
[Audit log IDs, screenshots, etc.]

LESSONS LEARNED
[What could be improved?]

PREVENTIVE ACTIONS
[Controls added or enhanced]

PREPARED BY: [Name]
REVIEWED BY: [Incident Response Owner]
DATE: YYYY-MM-DD
```

---

**Document Owner:** Security Team  
**Approved By:** [CTO/CEO Name]  
**Effective Date:** December 30, 2025  
**Next Review:** December 30, 2026  
**Status:** ✅ Active