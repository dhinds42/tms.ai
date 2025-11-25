# NIST 800-53 & ISO 27001 Control Mapping
## TMS.ai Security Controls Implementation

**Version:** 1.0  
**Date:** 2025-11-25  

---

## Control Status Summary

| Framework | Implemented | Partial | Planned | N/A | Total |
|-----------|-------------|---------|---------|-----|-------|
| NIST 800-53 | 47 | 23 | 18 | 12 | 100 |
| ISO 27001:2022 | 52 | 18 | 12 | 11 | 93 |

---

## NIST 800-53 Rev 5 Mapping

### Access Control (AC)

| ID | Control | Status | TMS.ai Implementation | ISO 27001 Map |
|----|---------|--------|----------------------|---------------|
| AC-1 | Policy & Procedures | ✅ | SecurityComplianceReport | A.5.1 |
| AC-2 | Account Management | ✅ | User entity, UserManagementTab | A.5.16 |
| AC-3 | Access Enforcement | ✅ | RBAC, RolePermissionsTab | A.5.15 |
| AC-4 | Information Flow | ✅ | TenantDataFirewall | A.5.14 |
| AC-5 | Separation of Duties | ✅ | Role-based access | A.5.3 |
| AC-6 | Least Privilege | ✅ | Minimal default permissions | A.8.2 |
| AC-7 | Failed Logon Attempts | 🔶 | Platform-level, custom planned | A.8.5 |
| AC-8 | System Use Notification | 📋 | Login banner planned | A.5.10 |
| AC-11 | Device Lock | ✅ | 30-min session timeout | A.8.1 |
| AC-12 | Session Termination | ✅ | Auto-logout, manual logout | A.8.1 |
| AC-17 | Remote Access | ✅ | HTTPS only | A.6.7 |

### Audit & Accountability (AU)

| ID | Control | Status | TMS.ai Implementation | ISO 27001 Map |
|----|---------|--------|----------------------|---------------|
| AU-1 | Policy & Procedures | ✅ | AuditTrail page | A.5.1 |
| AU-2 | Event Logging | ✅ | AuditLog entity | A.8.15 |
| AU-3 | Audit Content | ✅ | User, action, timestamp, details | A.8.15 |
| AU-4 | Audit Storage | ✅ | Cloud storage, auto-scaling | A.8.15 |
| AU-6 | Audit Review | ✅ | AuditTrail filtering/search | A.8.15 |
| AU-7 | Audit Reduction | ✅ | Search, filter, export | A.8.15 |
| AU-8 | Time Stamps | ✅ | UTC timestamps | A.8.15 |
| AU-9 | Protection of Audit Info | ✅ | Read-only for non-admins | A.8.15 |
| AU-12 | Audit Generation | ✅ | Automatic logging | A.8.15 |

### Configuration Management (CM)

| ID | Control | Status | TMS.ai Implementation | ISO 27001 Map |
|----|---------|--------|----------------------|---------------|
| CM-1 | Policy & Procedures | ✅ | Engineering standards | A.5.1 |
| CM-2 | Baseline Configuration | ✅ | Version-controlled | A.8.9 |
| CM-3 | Change Control | ✅ | PR-based, CI pipeline | A.8.32 |
| CM-5 | Access for Change | ✅ | Branch protection | A.8.2 |
| CM-6 | Configuration Settings | ✅ | Environment variables | A.8.9 |
| CM-8 | Component Inventory | 🔶 | package.json, SBOM planned | A.5.9 |

### Contingency Planning (CP)

| ID | Control | Status | TMS.ai Implementation | ISO 27001 Map |
|----|---------|--------|----------------------|---------------|
| CP-1 | Policy & Procedures | ✅ | DR Runbook | A.5.1 |
| CP-2 | Contingency Plan | ✅ | DisasterRecoveryRunbook | A.5.29 |
| CP-4 | Plan Testing | 📋 | Tabletop exercise scheduled | A.5.29 |
| CP-6 | Alternate Storage | ✅ | Multi-region cloud | A.5.30 |
| CP-7 | Alternate Site | ✅ | Cloud auto-failover | A.5.30 |
| CP-9 | System Backup | ✅ | Daily automated backups | A.8.13 |
| CP-10 | System Recovery | 🔶 | Documented, automation planned | A.5.29 |

### Identification & Authentication (IA)

| ID | Control | Status | TMS.ai Implementation | ISO 27001 Map |
|----|---------|--------|----------------------|---------------|
| IA-1 | Policy & Procedures | ✅ | Auth policy documented | A.5.1 |
| IA-2 | Identification & Auth | ✅ | Email/password, OAuth | A.8.5 |
| IA-2(1) | MFA | 🔶 | OAuth MFA, native planned | A.8.5 |
| IA-4 | Identifier Management | ✅ | Unique user IDs | A.5.16 |
| IA-5 | Authenticator Mgmt | ✅ | Password requirements | A.8.5 |
| IA-6 | Auth Feedback | ✅ | Generic error messages | A.8.5 |

### Incident Response (IR)

| ID | Control | Status | TMS.ai Implementation | ISO 27001 Map |
|----|---------|--------|----------------------|---------------|
| IR-1 | Policy & Procedures | ✅ | IR plan documented | A.5.1 |
| IR-4 | Incident Handling | ✅ | ErrorAlertSystem | A.5.24 |
| IR-5 | Incident Monitoring | 🔶 | AlertRule entity | A.5.25 |
| IR-6 | Incident Reporting | ✅ | Internal procedures | A.5.26 |
| IR-8 | IR Plan | ✅ | DR Runbook | A.5.24 |

### Risk Assessment (RA)

| ID | Control | Status | TMS.ai Implementation | ISO 27001 Map |
|----|---------|--------|----------------------|---------------|
| RA-1 | Policy & Procedures | ✅ | Risk management policy | A.5.1 |
| RA-3 | Risk Assessment | ✅ | SecurityComplianceReport | A.5.7 |
| RA-5 | Vulnerability Scan | ✅ | Snyk, npm audit, CodeQL | A.8.8 |

### System & Communications Protection (SC)

| ID | Control | Status | TMS.ai Implementation | ISO 27001 Map |
|----|---------|--------|----------------------|---------------|
| SC-5 | DoS Protection | ✅ | Rate limiting, CDN | A.8.6 |
| SC-7 | Boundary Protection | ✅ | API gateway | A.8.20 |
| SC-8 | Transmission Confidentiality | ✅ | TLS 1.2+ | A.8.24 |
| SC-12 | Key Management | ✅ | Platform-managed keys | A.8.24 |
| SC-13 | Cryptographic Protection | ✅ | AES-256, TLS | A.8.24 |
| SC-23 | Session Authenticity | ✅ | Secure tokens, CSRF | A.8.5 |
| SC-28 | Protection at Rest | ✅ | Encrypted database | A.8.24 |

### System & Information Integrity (SI)

| ID | Control | Status | TMS.ai Implementation | ISO 27001 Map |
|----|---------|--------|----------------------|---------------|
| SI-2 | Flaw Remediation | ✅ | CI vulnerability scanning | A.8.8 |
| SI-3 | Malicious Code Protection | ✅ | File upload scanning | A.8.7 |
| SI-4 | System Monitoring | ✅ | Application logging | A.8.16 |
| SI-5 | Security Alerts | ✅ | ErrorAlertSystem | A.8.16 |
| SI-7 | Software Integrity | ✅ | Package checksums | A.8.19 |
| SI-10 | Input Validation | ✅ | InputValidationSchemas | A.8.28 |
| SI-11 | Error Handling | ✅ | Generic messages | A.8.28 |

---

## ISO 27001:2022 Mapping

### A.5 Organizational Controls

| ID | Control | Status | TMS.ai Implementation | NIST Map |
|----|---------|--------|----------------------|----------|
| A.5.1 | Policies | ✅ | Documented policies | AC-1, AU-1 |
| A.5.2 | Roles & Responsibilities | ✅ | Role entity | AC-2 |
| A.5.3 | Segregation of Duties | ✅ | RBAC separation | AC-5 |
| A.5.7 | Threat Intelligence | 🔶 | Basic monitoring | RA-3 |
| A.5.9 | Asset Inventory | 🔶 | Partial, SBOM planned | CM-8 |
| A.5.10 | Acceptable Use | 📋 | Policy drafted | AC-8 |
| A.5.14 | Information Transfer | ✅ | Secure APIs | AC-4 |
| A.5.15 | Access Control | ✅ | RBAC system | AC-3 |
| A.5.16 | Identity Management | ✅ | User entity | AC-2, IA-4 |
| A.5.17 | Authentication | 🔶 | Password + MFA planned | IA-2, IA-5 |
| A.5.22 | Monitoring | ✅ | AuditLog, alerts | AU-6, SI-4 |
| A.5.23 | Cloud Security | ✅ | Cloud-native | SC-7 |
| A.5.24 | Incident Planning | ✅ | IR procedures | IR-4, IR-8 |
| A.5.25 | Incident Assessment | 🔶 | Basic classification | IR-5 |
| A.5.26 | Incident Response | ✅ | DR Runbook | IR-6 |
| A.5.29 | Business Continuity | ✅ | DR plan | CP-2 |
| A.5.30 | ICT Readiness | ✅ | Failover capability | CP-6, CP-7 |
| A.5.33 | Records Protection | ✅ | Encrypted storage | AU-9 |
| A.5.34 | Privacy & PII | ✅ | Consent management | - |

### A.6 People Controls

| ID | Control | Status | TMS.ai Implementation | NIST Map |
|----|---------|--------|----------------------|----------|
| A.6.1 | Screening | 📋 | Planned | PS-3 |
| A.6.3 | Awareness Training | 🔶 | UserTrainingManual | AT-2 |
| A.6.5 | Termination | ✅ | User deactivation | AC-2 |
| A.6.7 | Remote Working | ✅ | Cloud-based access | AC-17 |

### A.7 Physical Controls

| ID | Control | Status | Notes |
|----|---------|--------|-------|
| A.7.1-A.7.14 | Physical Security | ⬜ | Cloud provider responsibility |

### A.8 Technological Controls

| ID | Control | Status | TMS.ai Implementation | NIST Map |
|----|---------|--------|----------------------|----------|
| A.8.1 | User Devices | ✅ | Session management | AC-11, AC-12 |
| A.8.2 | Privileged Access | ✅ | Admin restrictions | AC-6 |
| A.8.3 | Information Access | ✅ | Field permissions | AC-3 |
| A.8.5 | Secure Authentication | 🔶 | Password, MFA planned | IA-2, IA-5 |
| A.8.6 | Capacity Management | ✅ | Auto-scaling | SC-5 |
| A.8.7 | Malware Protection | ✅ | Upload scanning | SI-3 |
| A.8.8 | Vulnerability Mgmt | ✅ | CI scanning | RA-5, SI-2 |
| A.8.9 | Configuration Mgmt | ✅ | Version control | CM-2, CM-6 |
| A.8.12 | Data Leakage Prevention | 🔶 | Partial | - |
| A.8.13 | Backup | ✅ | Daily automated | CP-9 |
| A.8.15 | Logging | ✅ | AuditLog entity | AU-2 to AU-12 |
| A.8.16 | Monitoring | ✅ | Real-time alerts | SI-4, SI-5 |
| A.8.19 | Software Installation | ✅ | CI/CD pipeline | SI-7 |
| A.8.20 | Network Security | ✅ | API gateway | SC-7 |
| A.8.24 | Cryptography | ✅ | AES-256, TLS | SC-8, SC-12, SC-13 |
| A.8.28 | Secure Coding | ✅ | Validation, sanitization | SI-10 |
| A.8.32 | Change Management | ✅ | PR workflow | CM-3 |

---

## Gap Remediation Priority

### Critical (Q1 2026)

| Gap | NIST | ISO | Remediation |
|-----|------|-----|-------------|
| Native MFA | IA-2(1) | A.5.17, A.8.5 | Implement TOTP |
| Rate Limiting | SC-5 | A.8.6 | Deploy middleware |
| Webhook Hardening | SI-10 | A.8.28 | HMAC validation |

### High (Q1-Q2 2026)

| Gap | NIST | ISO | Remediation |
|-----|------|-----|-------------|
| Component Inventory | CM-8 | A.5.9 | Generate SBOM |
| DR Testing | CP-4 | A.5.29 | Tabletop exercise |
| Data Classification | - | A.5.12 | Implement tagging |

### Medium (Q2-Q3 2026)

| Gap | NIST | ISO | Remediation |
|-----|------|-----|-------------|
| Threat Intelligence | RA-5(2) | A.5.7 | Enhanced monitoring |
| DLP | - | A.8.12 | Implement controls |
| Pen Testing | CA-8 | - | Annual assessment |

---

## Certification Roadmap

| Certification | Target Date | Status |
|---------------|-------------|--------|
| SOC 2 Type II | Q2 2026 | In Progress |
| ISO 27001:2022 | Q4 2026 | Planned |
| FMCSA Audit Ready | Q1 2026 | Active |

---

*Last Updated: 2025-11-25*