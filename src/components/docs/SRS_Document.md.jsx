# Software Requirements Specification (SRS)
## TMS.ai - AI-Native Transportation Management System

**Document Version:** 2.0  
**Date:** 2025-11-25  
**Status:** Approved  
**Classification:** Internal Use  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Data Requirements](#5-data-requirements)
6. [External Interface Requirements](#6-external-interface-requirements)
7. [Security Requirements](#7-security-requirements)
8. [Compliance Requirements](#8-compliance-requirements)
9. [Appendices](#9-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the TMS.ai Transportation Management System. It defines the functional and non-functional requirements, system constraints, and design specifications necessary for development, testing, and deployment.

### 1.2 Scope

TMS.ai is an AI-native, cloud-based Transportation Management System designed to serve:
- **Freight Brokers**: Load matching, carrier management, margin optimization
- **Carriers**: Fleet management, driver dispatch, compliance tracking
- **Shippers**: Self-service booking, tracking, and reporting

The system encompasses:
- Load lifecycle management (quote → delivery → invoice)
- Real-time tracking and visibility
- AI-powered dispatch optimization
- Compliance and document management
- Financial management (AR/AP, settlements, commissions)
- Multi-modal support (TL, LTL, intermodal, drayage)

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| TMS | Transportation Management System |
| ELD | Electronic Logging Device |
| HOS | Hours of Service |
| BOL | Bill of Lading |
| POD | Proof of Delivery |
| FMCSA | Federal Motor Carrier Safety Administration |
| DOT | Department of Transportation |
| MC Number | Motor Carrier Number |
| FSC | Fuel Surcharge |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| RBAC | Role-Based Access Control |

### 1.4 References

- IEEE 830-1998 (SRS Standard)
- FMCSA Regulations 49 CFR Parts 370-399
- SOC 2 Type II Requirements
- ISO 27001:2022
- NIST 800-53 Rev 5

### 1.5 Document Overview

This document is organized into functional modules, each with detailed requirements, acceptance criteria, and traceability to business objectives.

---

## 2. Overall Description

### 2.1 Product Perspective

TMS.ai operates as a standalone SaaS platform with integrations to:
- ELD providers (KeepTruckin, Samsara, Omnitracs)
- Load boards (DAT, Truckstop, 123Loadboard)
- Accounting systems (QuickBooks, Xero)
- Payment processors (TriumphPay, RoadSync)
- Compliance services (RMIS, Highway, MyCarrierPortal)

### 2.2 Product Functions

```
┌─────────────────────────────────────────────────────────────────┐
│                        TMS.ai Platform                          │
├─────────────┬─────────────┬─────────────┬─────────────┬────────┤
│   Dispatch  │   Finance   │  Compliance │   AI Suite  │  CRM   │
│   Console   │  Management │   Center    │             │        │
├─────────────┼─────────────┼─────────────┼─────────────┼────────┤
│ • Load Mgmt │ • Invoicing │ • Documents │ • Route Opt │ • Leads│
│ • Tracking  │ • AR/AP     │ • Carrier   │ • Rate Pred │ • Sales│
│ • Routing   │ • Settle    │ • Driver    │ • Matching  │ • Supp │
│ • Tendering │ • Payroll   │ • Audit     │ • Doc AI    │ • Pipe │
└─────────────┴─────────────┴─────────────┴─────────────┴────────┘
```

### 2.3 User Classes and Characteristics

| User Class | Description | Access Level |
|------------|-------------|--------------|
| Admin | System administrators | Full access |
| Dispatcher | Load management, driver assignment | Operations |
| Finance | Invoicing, payments, reporting | Financial |
| Compliance | Document verification, audits | Compliance |
| Driver | Mobile app, document upload | Driver Portal |
| Carrier | Load acceptance, POD upload | Carrier Portal |
| Customer | Booking, tracking | Customer Portal |

### 2.4 Operating Environment

- **Frontend**: React 18, Tailwind CSS, TypeScript
- **Backend**: Base44 BaaS (authentication, database, integrations)
- **Database**: Managed NoSQL with automatic scaling
- **CDN**: Global edge distribution
- **Mobile**: Progressive Web App (PWA)

### 2.5 Design and Implementation Constraints

- Must comply with FMCSA 49 CFR Part 371.3 (broker recordkeeping)
- Data retention minimum 3 years for transaction records
- Must support 99.9% uptime SLA
- Response time < 500ms for 95th percentile
- Must support multi-tenant data isolation

### 2.6 Assumptions and Dependencies

- Users have modern web browsers (Chrome, Firefox, Safari, Edge)
- Reliable internet connectivity
- Integration partners maintain API availability
- Base44 platform maintains infrastructure SLA

---

## 3. Functional Requirements

### 3.1 Load Management Module

#### FR-LM-001: Load Creation
**Priority:** Critical  
**Description:** System shall allow creation of loads with pickup/delivery details, equipment requirements, and rates.

**Acceptance Criteria:**
- [ ] User can create load with required fields (pickup, delivery, equipment)
- [ ] System generates unique load number
- [ ] Load status defaults to 'available'
- [ ] Validation prevents invalid data entry
- [ ] Audit log captures creation event

**Inputs:**
```json
{
  "pickup_location": { "city": "string", "state": "string", "zip": "string" },
  "dropoff_location": { "city": "string", "state": "string", "zip": "string" },
  "equipment_type": "enum[dry_van, reefer, flatbed, ...]",
  "customer_rate": "number",
  "pickup_date": "datetime",
  "delivery_date": "datetime"
}
```

**Outputs:**
- Created load record with generated ID
- Audit log entry
- Notification to assigned users

#### FR-LM-002: Load Status Lifecycle
**Priority:** Critical  
**Description:** System shall track load through defined status transitions.

**Status Flow:**
```
quote → available → tendered → assigned → dispatched → 
picked_up → in_transit → delivered → invoiced → closed
                                          ↓
                                     cancelled
```

**Business Rules:**
- Only valid status transitions allowed
- Status change triggers workflow events
- Timestamp recorded for each transition

#### FR-LM-003: Load Search and Filtering
**Priority:** High  
**Description:** System shall provide advanced search and filtering capabilities.

**Filters:**
- Status (multi-select)
- Date range (pickup, delivery)
- Equipment type
- Origin/destination (city, state, radius)
- Customer/carrier
- Load number, PO, reference

#### FR-LM-004: Bulk Load Operations
**Priority:** Medium  
**Description:** System shall support bulk operations on multiple loads.

**Operations:**
- Bulk status update
- Bulk export (CSV, PDF)
- Bulk assignment
- Bulk invoice generation

### 3.2 Dispatch Module

#### FR-DS-001: Dispatch Console
**Priority:** Critical  
**Description:** Real-time dispatch interface showing active loads, available drivers, and pending dispatches.

**Features:**
- Split-panel view (loads | drivers)
- Drag-and-drop assignment
- Real-time status updates
- Priority indicators
- ETA calculations

#### FR-DS-002: Driver Assignment
**Priority:** Critical  
**Description:** System shall match and assign drivers to loads based on availability, location, and qualifications.

**Matching Criteria:**
- HOS availability
- Current location proximity
- Equipment compatibility
- Endorsements (hazmat, tanker)
- Customer preferences

#### FR-DS-003: AI-Powered Optimization
**Priority:** High  
**Description:** System shall provide AI recommendations for dispatch decisions.

**Capabilities:**
- Optimal driver-load matching
- Route optimization
- Backhaul suggestions
- Rate recommendations
- ETA predictions

### 3.3 Financial Module

#### FR-FN-001: Invoice Generation
**Priority:** Critical  
**Description:** System shall generate invoices from delivered loads.

**Requirements:**
- Auto-populate from load data
- Support accessorial charges
- Multiple invoice formats
- Email delivery
- QuickBooks sync

#### FR-FN-002: Accounts Receivable
**Priority:** Critical  
**Description:** Track customer invoices and payments.

**Features:**
- Invoice aging reports
- Payment application
- Credit limits
- Collection alerts
- Statement generation

#### FR-FN-003: Carrier Settlements
**Priority:** Critical  
**Description:** Process carrier/driver payments.

**Requirements:**
- Settlement calculation
- Deduction management
- Check/ACH generation
- Pay statement delivery
- QuickPay support

#### FR-FN-004: Commission Management
**Priority:** Medium  
**Description:** Calculate and track sales commissions.

**Models Supported:**
- Percentage of margin
- Flat per load
- Tiered structures
- Team splits

### 3.4 Compliance Module

#### FR-CM-001: Document Management
**Priority:** Critical  
**Description:** Store, organize, and verify compliance documents.

**Document Types:**
- BOL, POD, Rate Confirmation
- Insurance certificates
- CDL, Medical cards
- MC/DOT authority
- Drug test results

#### FR-CM-002: Expiration Tracking
**Priority:** High  
**Description:** Monitor and alert on expiring documents.

**Alert Thresholds:**
- 90 days: Advisory
- 60 days: Warning
- 30 days: Critical
- Expired: Block operations

#### FR-CM-003: Carrier Vetting
**Priority:** Critical  
**Description:** Verify carrier authority and safety before booking.

**Verifications:**
- MC/DOT authority status
- Insurance coverage
- Safety rating
- Double-brokering detection
- Fraud scoring

#### FR-CM-004: FMCSA Compliance (371.3)
**Priority:** Critical  
**Description:** Maintain broker transaction records per FMCSA requirements.

**Required Records:**
- Shipper identity and authorization
- Carrier identity and authority
- Rate agreements
- Payment records
- 3-year retention

### 3.5 Tracking Module

#### FR-TR-001: Real-Time GPS Tracking
**Priority:** High  
**Description:** Display live load positions on map.

**Data Sources:**
- ELD integration
- Mobile app GPS
- Carrier API
- Manual check calls

#### FR-TR-002: ETA Prediction
**Priority:** High  
**Description:** Calculate and update delivery ETAs.

**Factors:**
- Current position
- Traffic conditions
- Weather
- HOS constraints
- Historical data

#### FR-TR-003: Geofencing
**Priority:** Medium  
**Description:** Trigger events on location boundaries.

**Events:**
- Pickup arrival/departure
- Delivery arrival
- Route deviation
- Unauthorized stop

### 3.6 Integration Module

#### FR-IN-001: ELD Integration
**Priority:** High  
**Description:** Connect to ELD providers for HOS and location data.

**Supported Providers:**
- KeepTruckin/Motive
- Samsara
- Omnitracs
- Platform Science

#### FR-IN-002: Load Board Integration
**Priority:** High  
**Description:** Post loads to and retrieve from external load boards.

**Supported Boards:**
- DAT
- Truckstop
- 123Loadboard
- Direct Freight

#### FR-IN-003: Accounting Integration
**Priority:** High  
**Description:** Sync financial data with accounting systems.

**Supported Systems:**
- QuickBooks Online
- Xero
- Sage

### 3.7 Reporting Module

#### FR-RP-001: Standard Reports
**Priority:** High  
**Description:** Pre-built reports for common needs.

**Reports:**
- Load summary
- Revenue by customer/lane
- Carrier performance
- Commission report
- Aging report
- IFTA mileage

#### FR-RP-002: Custom Reports
**Priority:** Medium  
**Description:** User-defined report builder.

**Capabilities:**
- Drag-and-drop fields
- Filter conditions
- Grouping/sorting
- Export formats
- Scheduled delivery

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

| Metric | Requirement | Target |
|--------|-------------|--------|
| NFR-PF-001 | Page load time | < 2 seconds |
| NFR-PF-002 | API response (95th percentile) | < 500ms |
| NFR-PF-003 | API response (99th percentile) | < 1000ms |
| NFR-PF-004 | Concurrent users | 1,000+ |
| NFR-PF-005 | Database queries | < 100ms average |
| NFR-PF-006 | File upload | < 5 seconds for 10MB |

### 4.2 Availability Requirements

| Metric | Requirement |
|--------|-------------|
| NFR-AV-001 | Uptime SLA | 99.9% |
| NFR-AV-002 | Planned maintenance window | < 4 hours/month |
| NFR-AV-003 | Recovery Time Objective (RTO) | < 4 hours |
| NFR-AV-004 | Recovery Point Objective (RPO) | < 1 hour |

### 4.3 Scalability Requirements

| Metric | Requirement |
|--------|-------------|
| NFR-SC-001 | Load records | 10M+ |
| NFR-SC-002 | Active users | 10,000+ |
| NFR-SC-003 | API requests | 10,000/minute |
| NFR-SC-004 | Document storage | 10TB+ |

### 4.4 Security Requirements

| ID | Requirement |
|----|-------------|
| NFR-SE-001 | All data encrypted at rest (AES-256) |
| NFR-SE-002 | All data encrypted in transit (TLS 1.2+) |
| NFR-SE-003 | Multi-factor authentication available |
| NFR-SE-004 | Session timeout after 30 minutes inactivity |
| NFR-SE-005 | Password complexity requirements enforced |
| NFR-SE-006 | API rate limiting (100 req/min default) |
| NFR-SE-007 | Webhook signature validation (HMAC-SHA256) |
| NFR-SE-008 | Input validation on all endpoints |
| NFR-SE-009 | SQL injection prevention |
| NFR-SE-010 | XSS prevention |

### 4.5 Usability Requirements

| ID | Requirement |
|----|-------------|
| NFR-US-001 | Responsive design (mobile, tablet, desktop) |
| NFR-US-002 | WCAG 2.1 AA accessibility compliance |
| NFR-US-003 | Keyboard navigation support |
| NFR-US-004 | Error messages with actionable guidance |
| NFR-US-005 | Consistent UI patterns |
| NFR-US-006 | < 3 clicks to common actions |

### 4.6 Maintainability Requirements

| ID | Requirement |
|----|-------------|
| NFR-MT-001 | Modular component architecture |
| NFR-MT-002 | Automated test coverage > 80% |
| NFR-MT-003 | CI/CD pipeline with quality gates |
| NFR-MT-004 | Comprehensive API documentation |
| NFR-MT-005 | Structured logging for debugging |

---

## 5. Data Requirements

### 5.1 Core Entities

#### 5.1.1 Load Entity
```
Load
├── id (auto-generated)
├── load_number (unique)
├── status (enum)
├── pickup_location (object)
├── dropoff_location (object)
├── equipment_type (enum)
├── customer_rate (number)
├── carrier_pay (number)
├── margin (computed)
├── pickup_date (datetime)
├── delivery_date (datetime)
├── shipper_id (reference)
├── carrier_id (reference)
├── driver_id (reference)
├── created_date (auto)
├── updated_date (auto)
└── created_by (auto)
```

#### 5.1.2 Driver Entity
```
Driver
├── id (auto-generated)
├── first_name (string, required)
├── last_name (string, required)
├── phone (string, required)
├── email (string)
├── cdl_number (string, required)
├── cdl_state (enum)
├── cdl_class (enum: A, B, C)
├── cdl_expiration (date)
├── medical_card_expiration (date)
├── endorsements (array)
├── status (enum)
├── payment_structure (enum)
├── payment_rate (number)
└── current_location (object)
```

#### 5.1.3 Carrier Entity
```
Carrier
├── id (auto-generated)
├── company_name (string, required)
├── mc_number (string, required)
├── dot_number (string, required)
├── contact_name (string)
├── contact_email (string, required)
├── contact_phone (string, required)
├── address (object)
├── insurance_expiration (date)
├── insurance_coverage (number)
├── safety_rating (enum)
├── status (enum)
└── performance_score (number)
```

### 5.2 Data Retention Policies

| Data Type | Retention Period | Action After |
|-----------|------------------|--------------|
| Transaction records | 3 years | Archive |
| Financial records | 7 years | Archive |
| Audit logs | 3 years | Delete |
| Session tokens | 30 days | Delete |
| Documents (compliance) | 3 years | Archive |
| PII (upon request) | Immediate | Anonymize |

### 5.3 Data Validation Rules

All input data validated per `InputValidationSchemas.jsx`:
- Load: pickup/delivery locations, equipment type, rates, dates
- Carrier: MC/DOT format, email, phone, insurance
- Driver: CDL format, state code, expiration dates

---

## 6. External Interface Requirements

### 6.1 User Interfaces

| Interface | Description |
|-----------|-------------|
| Web Dashboard | Primary interface for dispatchers, finance, compliance |
| Driver Portal | Mobile-optimized for drivers |
| Carrier Portal | Self-service for carriers |
| Customer Portal | Booking and tracking for shippers |

### 6.2 Hardware Interfaces

| Interface | Description |
|-----------|-------------|
| ELD Devices | GPS and HOS data via API |
| Mobile Devices | Camera for document capture |
| Signature Pads | Electronic signature capture |

### 6.3 Software Interfaces

| System | Protocol | Purpose |
|--------|----------|---------|
| QuickBooks | REST API | Financial sync |
| DAT Load Board | REST API | Load posting |
| Samsara ELD | REST/Webhook | GPS/HOS data |
| Stripe | REST API | Payment processing |
| SendGrid | REST API | Email delivery |
| Twilio | REST API | SMS notifications |

### 6.4 Communication Interfaces

| Protocol | Usage |
|----------|-------|
| HTTPS | All API communication |
| WebSocket | Real-time updates |
| SMTP | Email delivery |
| Webhooks | Event notifications |

---

## 7. Security Requirements

### 7.1 Authentication

- OAuth 2.0 / OpenID Connect
- Multi-factor authentication (optional)
- Session management with secure tokens
- Password requirements (12+ chars, complexity)

### 7.2 Authorization

- Role-based access control (RBAC)
- Field-level permissions
- Tenant data isolation
- API key management

### 7.3 Data Protection

- AES-256 encryption at rest
- TLS 1.3 in transit
- PII masking in logs
- Secure key management

### 7.4 Audit Trail

- All data modifications logged
- User actions tracked
- IP address recorded
- Tamper-evident logs

### 7.5 Vulnerability Management

- Dependency scanning (Snyk, npm audit)
- Static analysis (ESLint, CodeQL)
- Secret detection (Gitleaks)
- Penetration testing (annual)

---

## 8. Compliance Requirements

### 8.1 FMCSA Compliance

| Regulation | Requirement | Implementation |
|------------|-------------|----------------|
| 49 CFR 371.3 | Broker recordkeeping | Transaction records, 3-year retention |
| 49 CFR 387 | Insurance requirements | Carrier insurance verification |
| 49 CFR 395 | HOS regulations | ELD integration, HOS tracking |

### 8.2 Data Privacy

| Regulation | Scope | Implementation |
|------------|-------|----------------|
| CCPA | California residents | Consent management, data deletion |
| GDPR | EU residents | Consent, portability, erasure |
| State laws | Various | Configurable by jurisdiction |

### 8.3 Security Standards

| Standard | Status | Notes |
|----------|--------|-------|
| SOC 2 Type II | In Progress | Target Q2 2025 |
| ISO 27001 | Planned | Target Q4 2025 |
| PCI DSS | N/A | No direct card processing |

---

## 9. Appendices

### Appendix A: Glossary

See Section 1.3 for definitions.

### Appendix B: Entity Relationship Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Shipper │────<│   Load   │>────│  Carrier │
└──────────┘     └────┬─────┘     └──────────┘
                      │
                      │
                ┌─────┴─────┐
                │  Driver   │
                └───────────┘
                      │
              ┌───────┴───────┐
              │   Document    │
              └───────────────┘
```

### Appendix C: Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | TMS Team | Initial draft |
| 1.5 | 2024-06-01 | TMS Team | Added compliance module |
| 2.0 | 2025-11-25 | TMS Team | Security audit findings incorporated |

### Appendix D: Approval Signatures

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | _____________ | ________ | _________ |
| Tech Lead | _____________ | ________ | _________ |
| QA Lead | _____________ | ________ | _________ |
| Security | _____________ | ________ | _________ |

---

*End of Document*