# Compliance Checklist
## TMS.ai Security & Regulatory Compliance

**Version:** 1.0  
**Date:** 2025-11-25  
**Review Cycle:** Quarterly  

---

## 1. FMCSA/DOT Compliance

### 1.1 Broker Recordkeeping (49 CFR 371.3)

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Shipper identification records | ✅ | Shipper entity | Company name, address stored |
| Shipper authorization proof | ✅ | Load.shipper_id | Reference to shipper record |
| Carrier identification | ✅ | Carrier entity | MC#, DOT#, contact info |
| Carrier authority verification | ✅ | FMCSAComplianceCenter | Live authority check |
| Rate agreement documentation | ✅ | Load.rate_con_url | Rate confirmations stored |
| Compensation records | ✅ | Load.carrier_pay | Payment amounts tracked |
| 3-year record retention | ✅ | DataRetentionPolicy | Automated 3-year retention |

### 1.2 Carrier Safety

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| Insurance verification | ✅ | Carrier.insurance_* | Coverage and expiration tracked |
| Safety rating check | ✅ | CarrierCompliance | SAFER data integration |
| Authority status monitoring | ✅ | LiveAuthorityMonitor | Real-time status checks |
| Double-brokering prevention | ✅ | DoubleBrokeringDetection | Fraud scoring system |

### 1.3 Driver Compliance

| Requirement | Status | Evidence | Notes |
|-------------|--------|----------|-------|
| CDL verification | ✅ | Driver.cdl_* | License tracking |
| Medical card tracking | ✅ | Driver.medical_card_expiration | Expiration alerts |
| HOS compliance | ✅ | HOSEvent entity | ELD integration |
| Drug testing records | 🔶 | DriverQualificationFile | Manual upload |

---

## 2. SOC 2 Type II

### 2.1 Security (CC6)

| Control | Status | Implementation |
|---------|--------|----------------|
| CC6.1 - Logical access | ✅ | RBAC, user authentication |
| CC6.2 - Access provisioning | ✅ | Role assignment workflow |
| CC6.3 - Access removal | ✅ | User deactivation |
| CC6.6 - Encryption in transit | ✅ | TLS 1.2+ enforced |
| CC6.7 - Encryption at rest | ✅ | AES-256 database encryption |
| CC6.8 - Malicious software | ✅ | File upload scanning |

### 2.2 Availability (A1)

| Control | Status | Implementation |
|---------|--------|----------------|
| A1.1 - Availability commitment | ✅ | 99.9% SLA documented |
| A1.2 - Recovery procedures | ✅ | DR Runbook |
| A1.3 - Backup testing | 🔶 | Manual quarterly tests |

### 2.3 Confidentiality (C1)

| Control | Status | Implementation |
|---------|--------|----------------|
| C1.1 - Data classification | 🔶 | Partial implementation |
| C1.2 - Data disposal | ✅ | DataRetentionJob |

### 2.4 Processing Integrity (PI1)

| Control | Status | Implementation |
|---------|--------|----------------|
| PI1.1 - Input validation | ✅ | InputValidationSchemas |
| PI1.2 - Processing accuracy | ✅ | Audit logging |
| PI1.3 - Output review | 🔶 | Manual review process |

---

## 3. ISO 27001:2022

### 3.1 Organizational Controls (A.5)

| Control | Status | Implementation |
|---------|--------|----------------|
| A.5.1 - Security policies | ✅ | Documented policies |
| A.5.2 - Security roles | ✅ | RBAC system |
| A.5.3 - Segregation of duties | ✅ | Role separation |
| A.5.7 - Threat intelligence | 🔶 | Basic monitoring |
| A.5.23 - Cloud security | ✅ | Cloud-native architecture |

### 3.2 People Controls (A.6)

| Control | Status | Implementation |
|---------|--------|----------------|
| A.6.1 - Screening | 📋 | Planned |
| A.6.3 - Security awareness | 🔶 | UserTrainingManual |
| A.6.5 - Responsibilities | ✅ | Documented roles |

### 3.3 Physical Controls (A.7)

| Control | Status | Implementation |
|---------|--------|----------------|
| A.7.1-A.7.14 | ⬜ | N/A - Cloud provider responsibility |

### 3.4 Technological Controls (A.8)

| Control | Status | Implementation |
|---------|--------|----------------|
| A.8.2 - Privileged access | ✅ | Admin role restrictions |
| A.8.3 - Information access | ✅ | Field-level permissions |
| A.8.5 - Secure authentication | 🔶 | Password + MFA planned |
| A.8.7 - Malware protection | ✅ | Upload scanning |
| A.8.9 - Configuration management | ✅ | Version-controlled configs |
| A.8.12 - Data leakage prevention | 🔶 | Partial implementation |
| A.8.15 - Logging | ✅ | Comprehensive audit logs |
| A.8.16 - Monitoring | ✅ | Real-time alerting |
| A.8.24 - Cryptography | ✅ | AES-256, TLS 1.2+ |

---

## 4. Data Privacy (CCPA/GDPR)

### 4.1 CCPA Compliance

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Right to know | ✅ | Data export capability |
| Right to delete | ✅ | DataRetentionJob anonymization |
| Right to opt-out | ✅ | ConsentManagement |
| Non-discrimination | ✅ | No service degradation |
| Privacy notice | 🔶 | Draft completed |

### 4.2 GDPR Compliance

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Lawful basis | ✅ | Consent collection |
| Purpose limitation | ✅ | Purpose-specific consents |
| Data minimization | 🔶 | Review in progress |
| Accuracy | ✅ | User data editing |
| Storage limitation | ✅ | Retention policies |
| Security | ✅ | Encryption, access controls |
| Accountability | ✅ | Audit logging |
| Consent management | ✅ | UserConsent entity |
| Data portability | ✅ | Export functionality |
| Right to erasure | ✅ | Anonymization capability |

---

## 5. Action Items

### High Priority (Q1 2026)

| Item | Owner | Deadline | Status |
|------|-------|----------|--------|
| Deploy MFA | Auth Team | 2026-02-15 | 📋 |
| Complete rate limiting | Backend Team | 2026-01-31 | 📋 |
| Webhook HMAC validation | Backend Team | 2026-02-15 | 📋 |
| Consent flow integration | Privacy Team | 2026-02-28 | 📋 |
| Data retention automation | Data Team | 2026-02-28 | 📋 |

### Medium Priority (Q2 2026)

| Item | Owner | Deadline | Status |
|------|-------|----------|--------|
| SOC 2 audit prep | Compliance | 2026-04-30 | 📋 |
| ELD backend integration | Integrations | 2026-05-31 | 📋 |
| DR drill execution | DevOps | 2026-04-15 | 📋 |
| Penetration test | Security | 2026-03-31 | 📋 |

---

## 6. Audit Schedule

| Audit Type | Frequency | Last | Next |
|------------|-----------|------|------|
| Internal security review | Quarterly | 2025-11-25 | 2026-02-25 |
| SOC 2 Type II | Annual | N/A | 2026-Q2 |
| Penetration test | Annual | N/A | 2026-Q1 |
| DR test | Semi-annual | N/A | 2026-Q1 |
| Compliance review | Quarterly | 2025-11-25 | 2026-02-25 |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented |
| 🔶 | Partially implemented |
| 📋 | Planned |
| ⬜ | Not applicable |

---

*Last Updated: 2025-11-25*