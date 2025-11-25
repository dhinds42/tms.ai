# Engineering Roadmap - Security & Compliance Focus
## TMS.ai Platform Hardening Initiative

**Version:** 1.0  
**Date:** 2025-11-25  
**Owner:** Engineering  

---

## Executive Summary

This roadmap prioritizes security and compliance enhancements identified through audit findings. Focus areas:

1. **Backend Functions** - ELD/telematics, external APIs
2. **Consent Management** - GDPR/CCPA compliance
3. **Data Retention** - Automated purging
4. **MFA Enforcement** - Multi-factor authentication
5. **Rate Limiting** - API protection
6. **Webhook Hardening** - Signature validation
7. **Server-Side Validation** - Input sanitization

---

## Phase 1: Foundation (Q1 2026 - Weeks 1-4)

### 1.1 Rate Limiting Implementation

**Week 1-2**

```
┌─────────────────────────────────────────────────────────────┐
│ RATE LIMITING ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Client] → [CDN/WAF] → [API Gateway] → [Application]       │
│                              │                               │
│                         Rate Limit                           │
│                         Middleware                           │
│                              │                               │
│                         [Redis]                              │
│                         Counter                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Deliverables:**
- [ ] Deploy rate limiting middleware (APIGatewayConfig)
- [ ] Configure Redis-backed counters
- [ ] Set endpoint-specific limits:
  - Global: 100 req/min
  - Auth: 20 req/min
  - Webhooks: 500 req/min
  - Reports: 30 req/min
- [ ] Add rate limit headers to responses
- [ ] Create monitoring dashboard

**Owner:** Backend Team  
**Effort:** 2 weeks  

### 1.2 Webhook HMAC Hardening

**Week 2-3**

**Deliverables:**
- [ ] Deploy WebhookHMACMiddleware to all webhook endpoints
- [ ] Configure secrets per integration source:
  - ELD providers (KeepTruckin, Samsara)
  - Load boards (DAT, Truckstop)
  - Payment processors
- [ ] Implement timestamp validation (5-min window)
- [ ] Add replay attack prevention
- [ ] Create secret rotation procedures

**Owner:** Backend Team  
**Effort:** 1.5 weeks  

### 1.3 Server-Side Input Validation

**Week 3-4**

**Deliverables:**
- [ ] Deploy InputValidationSchemas server-side
- [ ] Validate all entity mutations:
  - Load: locations, rates, dates, equipment
  - Carrier: MC/DOT, insurance, contacts
  - Driver: CDL, medical card, endorsements
- [ ] Sanitize all string inputs (XSS prevention)
- [ ] Validate file uploads (type, size, content)
- [ ] Standardize error responses (no stack traces)

**Owner:** Backend Team  
**Effort:** 2 weeks  

---

## Phase 2: Authentication & Privacy (Q1 2026 - Weeks 5-8)

### 2.1 Multi-Factor Authentication

**Week 5-6**

```
┌─────────────────────────────────────────────────────────────┐
│ MFA ENROLLMENT FLOW                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User enables MFA in settings                            │
│  2. System generates TOTP secret                            │
│  3. Display QR code for authenticator app                   │
│  4. User enters verification code                           │
│  5. Generate backup recovery codes                          │
│  6. MFA active on next login                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Deliverables:**
- [ ] TOTP secret generation and storage
- [ ] QR code enrollment UI
- [ ] Verification code validation
- [ ] Recovery code generation (10 single-use codes)
- [ ] Admin MFA enforcement policy
- [ ] MFA bypass for service accounts

**Owner:** Auth Team  
**Effort:** 2 weeks  

### 2.2 Consent Management System

**Week 6-8**

**Deliverables:**
- [ ] Implement ConsentRepository methods
- [ ] Integrate ConsentCheckboxes into:
  - Driver onboarding (mandatory consents block activation)
  - Carrier onboarding
  - Customer registration
- [ ] Create consent withdrawal UI
- [ ] Implement analytics suppression when consent denied
- [ ] Build consent audit report
- [ ] Add jurisdiction-specific rules (CCPA, GDPR)

**Owner:** Privacy Team  
**Effort:** 3 weeks  

### 2.3 Data Retention Automation

**Week 7-8**

**Deliverables:**
- [ ] Deploy DataRetentionJob as scheduled task
- [ ] Configure retention policies:
  | Entity | Retention | Action |
  |--------|-----------|--------|
  | Loads | 3 years | Archive |
  | Documents | 3 years | Archive |
  | AuditLogs | 3 years | Delete |
  | SessionTokens | 30 days | Delete |
- [ ] Implement PII anonymization
- [ ] Create retention audit log
- [ ] Build compliance dashboard

**Owner:** Data Team  
**Effort:** 2 weeks  

---

## Phase 3: Backend Functions (Q2 2026 - Weeks 9-16)

### 3.1 Enable Backend Functions

**Week 9-10**

**Prerequisites:**
- Base44 backend functions enabled in dashboard
- API credentials for external services

**Deliverables:**
- [ ] Enable backend functions in Base44 settings
- [ ] Set up secure credential storage
- [ ] Create function deployment pipeline
- [ ] Implement error handling and retry logic

### 3.2 ELD/Telematics Integration

**Week 10-14**

```
┌─────────────────────────────────────────────────────────────┐
│ ELD INTEGRATION ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [ELD Provider] ──webhook──> [Backend Function]             │
│        │                           │                         │
│        │                      Validate HMAC                  │
│        │                      Parse payload                  │
│        │                      Normalize data                 │
│        │                           │                         │
│        │                      [Database]                     │
│        │                           │                         │
│  <──REST API──                [WebSocket]                    │
│   (polling fallback)               │                         │
│                               [Frontend]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Deliverables:**
- [ ] Deploy ELDProviderClient for:
  - KeepTruckin/Motive
  - Samsara
  - Omnitracs
- [ ] Implement HOS data sync (15-min intervals)
- [ ] Implement GPS position updates
- [ ] Create webhook receivers
- [ ] Build connection health dashboard
- [ ] Implement fallback polling

**Owner:** Integrations Team  
**Effort:** 5 weeks  

### 3.3 External API Gateway

**Week 14-16**

**Deliverables:**
- [ ] API key management UI
- [ ] OAuth2 client credentials flow
- [ ] Scoped permissions system
- [ ] Request/response logging
- [ ] Usage metering and billing hooks
- [ ] API documentation (OpenAPI spec)
- [ ] Developer portal

**Owner:** Platform Team  
**Effort:** 3 weeks  

---

## Phase 4: Monitoring & DR (Q2 2026 - Weeks 17-20)

### 4.1 Enhanced Monitoring

**Week 17-18**

**Deliverables:**
- [ ] Real-time error tracking dashboard
- [ ] Performance metrics (p50, p95, p99)
- [ ] Automated anomaly detection
- [ ] PagerDuty integration
- [ ] Custom alert rules UI

### 4.2 Disaster Recovery Automation

**Week 19-20**

**Deliverables:**
- [ ] Automated backup verification
- [ ] Point-in-time recovery testing
- [ ] Failover automation scripts
- [ ] DR drill scheduling
- [ ] Recovery runbook automation

---

## Timeline Summary

```
Q1 2026
├── Week 1-2:  Rate Limiting ████████
├── Week 2-3:  Webhook HMAC ██████
├── Week 3-4:  Input Validation ████████
├── Week 5-6:  MFA Implementation ████████
├── Week 6-8:  Consent Management ████████████
└── Week 7-8:  Data Retention ████████

Q2 2026
├── Week 9-10:  Backend Functions Setup ████████
├── Week 10-14: ELD Integration ████████████████████
├── Week 14-16: External API Gateway ████████████
├── Week 17-18: Enhanced Monitoring ████████
└── Week 19-20: DR Automation ████████
```

---

## Resource Requirements

| Phase | Team | FTEs | Duration |
|-------|------|------|----------|
| Phase 1 | Backend | 2 | 4 weeks |
| Phase 2 | Auth/Privacy | 3 | 4 weeks |
| Phase 3 | Integrations | 3 | 8 weeks |
| Phase 4 | DevOps | 2 | 4 weeks |

**Total Effort:** ~40 person-weeks

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Backend functions not available | High | Low | Coordinate with Base44 |
| ELD API changes | Medium | Medium | Abstract provider interfaces |
| MFA user friction | Medium | High | Gradual rollout, clear UX |
| Data retention errors | High | Low | Extensive testing, dry-run mode |

---

## Success Metrics

| Metric | Current | Target | Deadline |
|--------|---------|--------|----------|
| API endpoints with rate limiting | 0% | 100% | Week 2 |
| Webhooks with HMAC validation | 0% | 100% | Week 3 |
| Entities with server validation | 60% | 100% | Week 4 |
| Users with MFA enabled | 0% | 50% | Week 8 |
| Consent collection rate | 0% | 95% | Week 8 |
| Data retention compliance | Manual | Automated | Week 8 |
| ELD integrations active | 0 | 3 | Week 14 |

---

## Approval

| Role | Name | Date |
|------|------|------|
| CTO | | |
| Security Officer | | |
| Engineering Lead | | |

---

*Last Updated: 2025-11-25*