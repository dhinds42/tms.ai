# RBAC & Data Redaction Appendix
**TMS.ai Compliance Documentation**  
**Last Updated:** 2025-12-30  
**Version:** 1.0

---

## 1. Overview

This appendix documents the Role-Based Access Control (RBAC) and data redaction mechanisms implemented in TMS.ai to ensure:
- **Principle of Least Privilege:** Users access only data necessary for their role
- **Data Confidentiality:** Sensitive financial and operational data is protected
- **Compliance:** FMCSA 371.3, SOC 2, ISO 27001 requirements met

All controls are **server-side enforced** via Base44 lifecycle hooks and cannot be bypassed through client manipulation.

---

## 2. Role Definitions

### 2.1 System Roles

| Role | Description | Typical Users |
|------|-------------|---------------|
| **Admin** | Full system access, override privileges | System administrators, IT staff |
| **Broker** | Full operational access, customer/carrier management | Freight brokers, dispatchers, operations managers |
| **Carrier** | Access to assigned loads, own profile | Carrier companies, fleet managers |
| **Driver** | Access to assigned loads, limited profile updates | Company drivers, independent drivers |
| **Owner-Operator** | Hybrid carrier/driver permissions | Independent owner-operators |
| **Customer** | Read-only access to own shipments | Shippers, consignees |

### 2.2 Operating Mode
TMS.ai supports dual operating modes:
- **Broker Mode:** User acts as freight broker
- **Carrier Mode:** User acts as asset-based carrier

The system uses `context.operatingMode` to determine effective role when `user.role !== 'admin'`.

---

## 3. Entity-Level Access Control

### 3.1 Load Entity

#### Create Operations
| Role | Allowed | Restrictions |
|------|---------|--------------|
| Admin | ✅ Yes | None |
| Broker | ✅ Yes | None |
| Carrier | ✅ Yes | Cannot set `customer_rate`, `margin` |
| Driver | ❌ No | - |
| Customer | ❌ No | - |

#### Read Operations
| Role | Scope | Restrictions |
|------|-------|--------------|
| Admin | All loads | None |
| Broker | All loads | None |
| Carrier | `carrier_id = user.carrier_id` | See redaction table below |
| Driver | `driver_id = user.id` | See redaction table below |
| Customer | `customer_id = user.customer_id` | See redaction table below |

#### Update Operations
| Role | Allowed Fields | Forbidden Fields |
|------|----------------|------------------|
| Admin | All | None |
| Broker | All | None |
| Carrier | `status`, operational fields | `customer_rate`, `margin`, `carrier_pay`, revenue fields |
| Driver | `status`, `actual_pickup_datetime`, `actual_delivery_datetime` | All rate and financial fields |
| Customer | ❌ Read-only | - |

---

### 3.2 Carrier Entity

#### Create Operations
| Role | Allowed | Notes |
|------|---------|-------|
| Admin | ✅ Yes | Full access |
| Broker | ✅ Yes | Standard onboarding |
| Carrier | ❌ No | Cannot self-register |

#### Read Operations
| Role | Scope | Redaction |
|------|-------|-----------|
| Admin | All carriers | None |
| Broker | All carriers | None |
| Carrier | `id = user.carrier_id` | Internal notes, `average_margin` |

#### Update Operations
| Role | Allowed Fields | Forbidden Fields |
|------|----------------|------------------|
| Admin | All | None |
| Broker | All | None |
| Carrier (Self) | Contact info, equipment, insurance docs | `mc_number`, `dot_number`, `fmcsa_safety_rating`, `compliance_score` |

---

### 3.3 Driver Entity

#### Create Operations
| Role | Allowed | Notes |
|------|---------|-------|
| Admin | ✅ Yes | - |
| Broker | ✅ Yes | - |
| Carrier | ✅ Yes | For own fleet |
| Driver | ❌ No | Cannot self-register |

#### Read Operations
| Role | Scope |
|------|-------|
| Admin | All drivers |
| Broker | All drivers |
| Carrier | Drivers where `party_id = user.carrier_id` |
| Driver | `id = user.id` only |

#### Update Operations
| Role | Allowed Fields | Forbidden Fields |
|------|----------------|------------------|
| Admin | All | None |
| Broker | All | None |
| Carrier | All for own drivers | `payment_rate` (requires approval) |
| Driver (Self) | Contact info, preferences | `payment_rate`, `payment_structure`, `cdl_number` |

---

### 3.4 Shipper/Customer Entity

#### Create Operations
| Role | Allowed | Notes |
|------|---------|-------|
| Admin | ✅ Yes | - |
| Broker | ✅ Yes | CRM onboarding |
| Customer | ❌ No | Must be invited |

#### Read Operations
| Role | Scope | Redaction |
|------|-------|-----------|
| Admin | All customers | None |
| Broker | All customers | None |
| Customer | `id = user.customer_id` | `credit_score`, `credit_limit`, `total_revenue`, `notes` |

#### Update Operations
| Role | Allowed | Notes |
|------|---------|-------|
| Admin | ✅ Yes | - |
| Broker | ✅ Yes | - |
| Customer | ❌ No | Read-only, must contact broker |

---

## 4. Field-Level Redaction

### 4.1 Load Entity Redaction Matrix

**Implemented in:** `functions/hooks/loadHooks.js` → `afterRead()`

| Field | Admin | Broker | Carrier | Driver | Customer |
|-------|-------|--------|---------|--------|----------|
| `customer_rate` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `carrier_pay` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `margin` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `margin_estimate` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `margin_actual` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `linehaul_revenue` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `fuel_surcharge_revenue` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `accessorial_revenue_total` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `total_revenue` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `pickup_location` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `dropoff_location` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `status` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `pod_url` | ✅ | ✅ | ✅ | ✅ | ✅ |

**Rationale:**
- **Carriers/Drivers:** Cannot see customer rates or broker margins (prevents competitive intel leaks, protects broker business model)
- **Customers:** Cannot see carrier pay (protects broker sourcing strategy)
- **All Non-Brokers:** Cannot see revenue breakdowns or margin calculations

---

### 4.2 Carrier Entity Redaction Matrix

**Implemented in:** `functions/hooks/carrierHooks.js` → `afterRead()`

| Field | Admin | Broker | Carrier (Self) |
|-------|-------|--------|----------------|
| `company_name` | ✅ | ✅ | ✅ |
| `mc_number` | ✅ | ✅ | ✅ |
| `dot_number` | ✅ | ✅ | ✅ |
| `email` | ✅ | ✅ | ✅ |
| `phone` | ✅ | ✅ | ✅ |
| `notes` | ✅ | ✅ | ❌ |
| `average_margin` | ✅ | ✅ | ❌ |
| `compliance_score` | ✅ | ✅ | ✅ |
| `total_loads` | ✅ | ✅ | ✅ |
| `on_time_percentage` | ✅ | ✅ | ✅ |

**Rationale:**
- **Internal Notes:** Broker-only field for vetting notes, performance issues, internal communications
- **Average Margin:** Competitive information, should not be shared with carrier

---

### 4.3 Shipper/Customer Entity Redaction Matrix

**Implemented in:** `functions/hooks/shipperHooks.js` → `afterRead()`

| Field | Admin | Broker | Customer (Self) |
|-------|-------|--------|-----------------|
| `company_name` | ✅ | ✅ | ✅ |
| `email` | ✅ | ✅ | ✅ |
| `phone` | ✅ | ✅ | ✅ |
| `address` | ✅ | ✅ | ✅ |
| `credit_score` | ✅ | ✅ | ❌ |
| `credit_limit` | ✅ | ✅ | ❌ |
| `total_revenue` | ✅ | ✅ | ❌ |
| `notes` | ✅ | ✅ | ❌ |
| `payment_terms` | ✅ | ✅ | ✅ |
| `total_loads` | ✅ | ✅ | ✅ |

**Rationale:**
- **Credit Information:** Internal broker risk assessment, should not be exposed to customer
- **Total Revenue:** Internal sales/account metrics
- **Notes:** Internal CRM notes, sales strategy, relationship history

---

## 5. Validation Rules & Business Logic

### 5.1 Load Entity Validation

**Implemented in:** `functions/hooks/loadHooks.js` → `beforeCreate()` / `beforeUpdate()`

| Rule | Description | Override |
|------|-------------|----------|
| **Negative Margin Prevention** | `customer_rate >= carrier_pay` | Admin only |
| **Date Sequence** | `pickup_date <= delivery_date` | None |
| **Status Transitions** | Must follow state machine | Admin can force |
| **Reefer Temperature** | Required if `equipment_type = 'reefer'` | None |
| **Hazmat Class** | Required if `hazmat_flag = true` | None |

**State Machine (Status Transitions):**
```
quote → available → tendered → assigned → dispatched 
  ↓         ↓          ↓           ↓
cancelled  cancelled  cancelled  cancelled

dispatched → picked_up → in_transit → delivered → invoiced → closed
```

---

### 5.2 Carrier Entity Validation

**Implemented in:** `functions/hooks/carrierHooks.js` → `beforeCreate()`

| Rule | Description | Error Code |
|------|-------------|------------|
| **MC# Format** | 5-7 digits | `INVALID_FORMAT` |
| **DOT# Format** | 5-8 digits | `INVALID_FORMAT` |
| **MC# Uniqueness** | No duplicates | `DUPLICATE` (409) |
| **Insurance Expiration** | Must be future date | `EXPIRED_INSURANCE` |

---

### 5.3 Driver Entity Validation

**Implemented in:** `functions/hooks/driverHooks.js` → `beforeCreate()`

| Rule | Description | Error Code |
|------|-------------|------------|
| **CDL Expiration** | Must be future date | `EXPIRED_CDL` |
| **Medical Card** | Must be future date | `EXPIRED_MEDICAL` |
| **CDL# Uniqueness** | No duplicates | `DUPLICATE` (409) |
| **Payment Rate** | Must be > 0 | `INVALID_RATE` |

---

## 6. Compliance Mapping

### 6.1 FMCSA 371.3 (Broker Authority)

| Requirement | Implementation |
|-------------|----------------|
| **Transaction Records** | All loads audited via `AuditLog` |
| **Carrier Authority Verification** | MC#/DOT# validated, FMCSA lookup ready (commented) |
| **Broker-Carrier Separation** | Carriers cannot see `customer_rate`, enforced server-side |

### 6.2 SOC 2 (Security & Confidentiality)

| Control | Implementation |
|---------|----------------|
| **CC6.1 - Logical Access Controls** | RBAC enforced via hooks, role-based redaction |
| **CC6.2 - Access Restrictions** | Least privilege, scope checks per entity |
| **CC6.3 - Access Removal** | Role changes reflected immediately in hooks |
| **CC7.2 - Confidential Data Protection** | Sensitive fields redacted based on role |

### 6.3 ISO 27001

| Control | Implementation |
|---------|----------------|
| **A.9.2.3 - User Access Management** | Role-based, entity-scoped access |
| **A.9.4.1 - Information Access Restriction** | Field-level redaction |
| **A.12.4.1 - Event Logging** | All CRUD events logged to `AuditLog` |
| **A.12.4.3 - Administrator Logs** | Admin actions fully audited |

---

## 7. Testing & Verification

### 7.1 Automated Tests

**Location:** `functions/__tests__/hooks/loadHooks.test.js`

**Coverage:**
- ✅ Negative margin validation
- ✅ Admin override functionality
- ✅ Date sequence validation
- ✅ Status transition enforcement
- ✅ Carrier cannot see `customer_rate`
- ✅ Driver cannot update rates
- ✅ Scope enforcement (carrier/driver/customer)

**Run Tests:**
```bash
npm test functions/__tests__/hooks/
```

---

## Appendix: Hook Implementation Reference

### Load Entity Hooks
- `functions/hooks/loadHooks.js`
  - `beforeCreate()` - Validation + RBAC on create
  - `beforeUpdate()` - Validation + RBAC on update
  - `afterCreate()` - Audit logging
  - `afterUpdate()` - Audit logging with changed fields
  - `afterRead()` - Field redaction + scope enforcement

### Carrier Entity Hooks
- `functions/hooks/carrierHooks.js`
  - `beforeCreate()` - Validation + duplicate check
  - `beforeUpdate()` - RBAC enforcement
  - `afterRead()` - Field redaction

### Driver Entity Hooks
- `functions/hooks/driverHooks.js`
  - `beforeCreate()` - CDL/medical validation + duplicate check
  - `beforeUpdate()` - Payment rate protection
  - `afterRead()` - Scope enforcement

### Shipper Entity Hooks
- `functions/hooks/shipperHooks.js`
  - `beforeCreate()` - Credit validation
  - `beforeUpdate()` - Customer write block
  - `afterRead()` - Financial field redaction

---

**Document Version:** 1.0  
**Implementation Status:** ✅ Active  
**Compliance Status:** ✅ Aligned with SOC 2, ISO 27001, FMCSA 371.3