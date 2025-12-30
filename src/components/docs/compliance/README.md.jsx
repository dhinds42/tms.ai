# TMS.ai Compliance Documentation

This folder contains compliance and security documentation for TMS.ai.

## Core Security Principles

- **RBAC enforcement** is server-side using Base44 entity hooks
- **Data redaction** occurs before responses are sent to clients
- **Audit logs** are immutable and retained per policy
- **Validation** is enforced server-side, never client-side
- **Zero-trust model** - no client logic is trusted for security

## Purpose

These documents support:
- SOC 2 Type II audits
- ISO 27001 certification
- NIST 800-53 compliance
- Customer security reviews
- Enterprise procurement processes

## Document Index

### Security & Architecture
- `security-data-protection-overview.md` - Technical implementation guide
- `security-whitepaper-outline.md` - Customer-facing security overview
- `security-controls-mapping.md` - SOC 2/ISO/NIST control alignment

### RBAC & Data Protection
- `RBAC_Redaction_Appendix.md` - Detailed RBAC specification
- `role-data-visibility.md` - Quick reference matrix for role permissions

### Audit Preparation
- `SOC2_Evidence_Checklist.md` - Evidence collection guide
- `soc2-screenshot-evidence-guide.md` - Screenshot instructions
- `audit-readiness-checklist.md` - Pre-audit verification steps

### System Documentation
- `SRS_Complete.md` - System Requirements Specification
- `NIST_ISO_ControlMapping.md` - Comprehensive control mapping
- `DisasterRecovery_Runbook.md` - DR procedures
- `EngineeringRoadmap_Security.md` - Security enhancement roadmap

## Quick Start for Auditors

1. **Authentication:** Base44 JWT tokens with role-based access
2. **Authorization:** Server-side hooks enforce permissions on every request
3. **Data Protection:** Sensitive fields redacted in `afterRead()` hooks
4. **Audit Trail:** Immutable logs in `AuditLog` entity
5. **Testing:** Automated tests in `functions/__tests__/`

## Security Owner

**Responsible for:**
- RBAC policy changes
- Security incident response
- Audit log review
- Compliance documentation
- Vulnerability management

## Contact

- Security questions: security@tms.ai
- Compliance inquiries: compliance@tms.ai
- Audit coordination: audit@tms.ai

---

**Last Updated:** December 30, 2025  
**Document Owner:** Security Team  
**Review Cycle:** Quarterly