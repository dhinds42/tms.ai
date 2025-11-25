# Software Requirements Specification (SRS)
## TMS.ai - AI-Native Transportation Management System
### Complete Edition with Current Modules & Future Requirements

**Document Version:** 3.0  
**Date:** 2025-11-25  
**Status:** Approved  
**Classification:** Internal Use  

---

## 1. Introduction

### 1.1 Purpose
This SRS documents all current TMS.ai functionality and identifies gaps from security/compliance audits as future requirements.

### 1.2 Scope
TMS.ai serves freight brokers and carriers with:
- Load lifecycle management
- Real-time dispatch and tracking
- AI-powered optimization
- Compliance and document management
- Financial management
- Multi-modal transportation support

### 1.3 Definitions

| Term | Definition |
|------|------------|
| TMS | Transportation Management System |
| ELD | Electronic Logging Device |
| HOS | Hours of Service |
| FMCSA | Federal Motor Carrier Safety Administration |
| MFA | Multi-Factor Authentication |
| RBAC | Role-Based Access Control |
| RTO/RPO | Recovery Time/Point Objective |

---

## 2. Current Modules (Implemented)

### 2.1 Load Management Module
**Status:** ✅ Fully Implemented

| Requirement | Description | Component |
|-------------|-------------|-----------|
| FR-LM-001 | Load creation with validation | CreateLoadModal |
| FR-LM-002 | Status lifecycle tracking | LoadCard, LoadBoard |
| FR-LM-003 | Advanced search/filtering | LoadFilters, AdvancedLoadFilters |
| FR-LM-004 | Bulk operations | BulkLoadActions |
| FR-LM-005 | Load templates | LoadTemplates page |
| FR-LM-006 | Multi-stop routing | RouteOptimizer |

### 2.2 Dispatch Module
**Status:** ✅ Fully Implemented

| Requirement | Description | Component |
|-------------|-------------|-----------|
| FR-DS-001 | Real-time dispatch console | DispatchConsole |
| FR-DS-002 | AI-powered driver matching | DispatchOptimizationAI |
| FR-DS-003 | Driver assignment | AssignDriverModal |
| FR-DS-004 | Carrier tendering | LoadTendering, TenderBot |
| FR-DS-005 | Route optimization | RouteOptimizer |

### 2.3 Tracking Module
**Status:** ✅ Fully Implemented

| Requirement | Description | Component |
|-------------|-------------|-----------|
| FR-TR-001 | Real-time GPS tracking | RealtimeTracking, FleetLocationMap |
| FR-TR-002 | ETA prediction | Rosie, ETAPredictionCard |
| FR-TR-003 | Geofencing alerts | GeofencingAlerts |
| FR-TR-004 | Check call logging | LogCheckCallModal |

### 2.4 Financial Module
**Status:** ✅ Fully Implemented

| Requirement | Description | Component |
|-------------|-------------|-----------|
| FR-FN-001 | Invoice generation | Invoicing, CreateInvoiceModal |
| FR-FN-002 | Accounts receivable | ARDashboard |
| FR-FN-003 | Accounts payable | APDashboard |
| FR-FN-004 | Carrier settlements | SettlementManagement |
| FR-FN-005 | Commission management | CommissionManagement |
| FR-FN-006 | QuickBooks integration | QuickBooksSync |

### 2.5 Compliance Module
**Status:** ✅ Fully Implemented

| Requirement | Description | Component |
|-------------|-------------|-----------|
| FR-CM-001 | Document management | Documents, DocumentCard |
| FR-CM-002 | AI document processing | DocumentAI, DocumentProcessor |
| FR-CM-003 | Expiration tracking | ComplianceChecklist |
| FR-CM-004 | Carrier vetting | CarrierCompliance, AICarrierVetting |
| FR-CM-005 | FMCSA 371.3 compliance | FMCSAComplianceCenter |

### 2.6 CRM Module
**Status:** ✅ Fully Implemented

| Requirement | Description | Component |
|-------------|-------------|-----------|
| FR-CR-001 | Prospect intake | ProspectIntake |
| FR-CR-002 | Customer management | CustomerManagement, Shippers |
| FR-CR-003 | Carrier management | Carriers |
| FR-CR-004 | Driver management | Drivers, DriverOnboarding |

### 2.7 Analytics Module
**Status:** ✅ Fully Implemented

| Requirement | Description | Component |
|-------------|-------------|-----------|
| FR-AN-001 | Dashboard analytics | AnalyticsDashboard |
| FR-AN-002 | Advanced reporting | AdvancedAnalytics |
| FR-AN-003 | Predictive analytics | PredictiveAnalytics |
| FR-AN-004 | Custom reports | Reports |

### 2.8 Portal Module
**Status:** ✅ Fully Implemented

| Requirement | Description | Component |
|-------------|-------------|-----------|
| FR-PT-001 | Driver portal | DriverPortal |
| FR-PT-002 | Carrier portal | CarrierPortal |
| FR-PT-003 | Shipper portal | ShipperPortal |
| FR-PT-004 | Customer self-service | CustomerSelfServicePortal |

---

## 3. Gap Analysis - Future Requirements

### 3.1 Security Enhancements (High Priority)

#### FR-SEC-001: Multi-Factor Authentication
**Priority:** Critical | **Target:** Q1 2026

**Description:** Implement native MFA with TOTP support.

**Requirements:**
- TOTP-based authentication (Google Authenticator, Authy)
- SMS backup codes
- Mandatory MFA for admin users
- Optional MFA for standard users
- Recovery code generation

**Acceptance Criteria:**
- [ ] MFA enrollment flow implemented
- [ ] TOTP verification working
- [ ] Admin MFA enforcement configurable
- [ ] Recovery codes functional

#### FR-SEC-002: Enhanced Rate Limiting
**Priority:** Critical | **Target:** Q1 2026

**Description:** Implement comprehensive API rate limiting.

**Requirements:**
- 100 req/min default per IP
- Endpoint-specific limits (auth: 20/min, webhooks: 500/min)
- Burst allowance (20 requests)
- Redis-backed distributed limiting
- Rate limit headers in responses

**Acceptance Criteria:**
- [ ] Rate limiting middleware deployed
- [ ] Custom limits per endpoint
- [ ] 429 responses with retry-after header
- [ ] Monitoring dashboard for rate limit hits

#### FR-SEC-003: Webhook HMAC Hardening
**Priority:** High | **Target:** Q1 2026

**Description:** Secure all webhook endpoints with signature validation.

**Requirements:**
- HMAC-SHA256 signature validation
- Configurable secrets per integration
- Timestamp validation (5-minute tolerance)
- Replay attack prevention
- Signature header standardization

**Acceptance Criteria:**
- [ ] WebhookHMACMiddleware deployed
- [ ] All integrations using signed webhooks
- [ ] Secret rotation capability
- [ ] Failed signature logging

#### FR-SEC-004: Server-Side Input Validation
**Priority:** Critical | **Target:** Q1 2026

**Description:** Comprehensive validation on all API endpoints.

**Requirements:**
- Schema-based validation (Load, Carrier, Driver)
- SQL injection prevention
- XSS sanitization
- File upload validation
- Error message sanitization

**Acceptance Criteria:**
- [ ] InputValidationSchemas deployed server-side
- [ ] All entities have validation schemas
- [ ] Validation errors return 400 with details
- [ ] No raw error messages exposed

### 3.2 Data Privacy & Compliance (High Priority)

#### FR-DPC-001: Consent Management System
**Priority:** Critical | **Target:** Q1 2026

**Description:** Full consent lifecycle management for GDPR/CCPA compliance.

**Requirements:**
- Purpose-based consent collection
- Jurisdiction-aware consent rules
- Consent withdrawal workflow
- Audit trail for all consent changes
- Integration with analytics suppression

**Acceptance Criteria:**
- [ ] UserConsent entity fully utilized
- [ ] ConsentCheckboxes in all onboarding flows
- [ ] Analytics suppressed when consent denied
- [ ] Consent export for data subject requests

#### FR-DPC-002: Automated Data Retention
**Priority:** High | **Target:** Q1 2026

**Description:** Automatic data purging per retention policies.

**Requirements:**
- Configurable retention periods per entity
- Automatic anonymization for PII
- Hard deletion for expired data
- Audit logging of retention actions
- Manual override capability

**Retention Schedule:**
| Entity | Retention | Action |
|--------|-----------|--------|
| Loads | 3 years | Archive |
| Documents | 3 years | Archive |
| Audit Logs | 3 years | Delete |
| Session Tokens | 30 days | Delete |
| PII (on request) | Immediate | Anonymize |

**Acceptance Criteria:**
- [ ] DataRetentionJob running daily
- [ ] Retention policies configurable
- [ ] Deletion/anonymization verified
- [ ] Compliance report generated

### 3.3 Integration Enhancements (Medium Priority)

#### FR-INT-001: Backend Functions for ELD/Telematics
**Priority:** High | **Target:** Q2 2026

**Description:** Server-side integrations with ELD providers.

**Requirements:**
- KeepTruckin/Motive API integration
- Samsara API integration
- Real-time HOS data sync
- GPS position streaming
- Webhook receivers for events

**Acceptance Criteria:**
- [ ] ELD credentials securely stored
- [ ] HOS data syncing every 15 minutes
- [ ] GPS updates streaming to UI
- [ ] Connection health monitoring

#### FR-INT-002: External API Gateway
**Priority:** Medium | **Target:** Q2 2026

**Description:** Secure API for third-party integrations.

**Requirements:**
- API key management
- OAuth2 client credentials flow
- Scoped permissions per client
- Request/response logging
- Usage metering

**Acceptance Criteria:**
- [ ] API key generation UI
- [ ] Per-client rate limiting
- [ ] Webhook subscription management
- [ ] API documentation published

### 3.4 Infrastructure Improvements (Medium Priority)

#### FR-INF-001: Enhanced Monitoring & Alerting
**Priority:** Medium | **Target:** Q2 2026

**Requirements:**
- Real-time error tracking
- Performance metrics dashboard
- Automated anomaly detection
- PagerDuty integration
- Custom alert rules

#### FR-INF-002: Disaster Recovery Automation
**Priority:** High | **Target:** Q2 2026

**Requirements:**
- Automated failover capability
- Point-in-time recovery testing
- Cross-region replication
- Recovery runbook automation
- DR drill scheduling

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Current | Target |
|--------|---------|--------|
| Page load time | < 3s | < 2s |
| API response (p95) | < 800ms | < 500ms |
| Concurrent users | 500 | 1,000 |
| Database queries | < 150ms | < 100ms |

### 4.2 Availability

| Metric | Current | Target |
|--------|---------|--------|
| Uptime SLA | 99.5% | 99.9% |
| RTO | 8 hours | 4 hours |
| RPO | 4 hours | 1 hour |

### 4.3 Security

| Requirement | Status |
|-------------|--------|
| Encryption at rest (AES-256) | ✅ Implemented |
| Encryption in transit (TLS 1.2+) | ✅ Implemented |
| RBAC | ✅ Implemented |
| Audit logging | ✅ Implemented |
| MFA | 📋 Planned Q1 2026 |
| Rate limiting | 📋 Planned Q1 2026 |

---

## 5. Traceability Matrix

| Business Objective | Requirements | Status |
|--------------------|--------------|--------|
| Efficient load management | FR-LM-001 to FR-LM-006 | ✅ |
| Real-time visibility | FR-TR-001 to FR-TR-004 | ✅ |
| Financial accuracy | FR-FN-001 to FR-FN-006 | ✅ |
| Regulatory compliance | FR-CM-001 to FR-CM-005 | ✅ |
| Data security | FR-SEC-001 to FR-SEC-004 | 📋 |
| Privacy compliance | FR-DPC-001 to FR-DPC-002 | 📋 |
| External integrations | FR-INT-001 to FR-INT-002 | 📋 |

---

## 6. Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| Security Officer | | | |
| Compliance Officer | | | |

---

*Document Version 3.0 - 2025-11-25*