# Role-Based Data Visibility Matrix
**TMS.ai Compliance Documentation**  
**Policy Reference:** RBAC & Data Redaction Policy Appendix  
**Last Updated:** 2025-12-30

---

## Purpose

This document provides a **quick-reference visibility matrix** for all system roles, defining exactly what data each role can see and modify. This supports operator training, access reviews, and compliance audits.

---

## 1. Load Entity Visibility

### 1.1 Financial Fields

| Field | Admin | Broker | Carrier | Owner-Op | Driver | Customer |
|-------|:-----:|:------:|:-------:|:--------:|:------:|:--------:|
| **customer_rate** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **carrier_pay** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **margin** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **margin_estimate** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **margin_actual** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **linehaul_revenue** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **fuel_surcharge_revenue** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **accessorial_revenue_total** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **total_revenue** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Key Principles:**
- ❌ **Carriers/Drivers:** Never see customer rates or broker margins
- ❌ **Customers:** Never see carrier pay or margin breakdowns
- ✅ **Broker/Admin:** Full financial visibility

---

### 1.2 Operational Fields

| Field | Admin | Broker | Carrier | Owner-Op | Driver | Customer |
|-------|:-----:|:------:|:-------:|:--------:|:------:|:--------:|
| **load_number** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **status** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **pickup_location** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **dropoff_location** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **pickup_date** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **delivery_date** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **commodity** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **weight** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **equipment_type** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **special_instructions** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Key Principles:**
- ✅ All roles see operational data for assigned loads
- Scope enforcement: Users only see loads they're authorized for

---

### 1.3 Document Fields

| Field | Admin | Broker | Carrier | Owner-Op | Driver | Customer |
|-------|:-----:|:------:|:-------:|:--------:|:------:|:--------:|
| **bol_url** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **pod_url** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **rate_con_url** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **invoice_url** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

**Key Principles:**
- BOL/POD: Visible to all execution parties
- Rate Confirmations: Carriers/Owner-Ops only
- Invoices: Broker ↔ Customer only

---

### 1.4 Internal Fields

| Field | Admin | Broker | Carrier | Owner-Op | Driver | Customer |
|-------|:-----:|:------:|:-------:|:--------:|:------:|:--------:|
| **internal_notes** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **broker_notes** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **compliance_notes** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Key Principles:**
- Internal notes are **never** visible to external parties
- Used for vetting, risk management, internal strategy

---

## 2. Carrier Entity Visibility

| Field | Admin | Broker | Carrier (Self) | Other Carrier |
|-------|:-----:|:------:|:--------------:|:-------------:|
| **company_name** | ✅ | ✅ | ✅ | ❌ |
| **mc_number** | ✅ | ✅ | ✅ | ❌ |
| **dot_number** | ✅ | ✅ | ✅ | ❌ |
| **email** | ✅ | ✅ | ✅ | ❌ |
| **phone** | ✅ | ✅ | ✅ | ❌ |
| **insurance_expiration** | ✅ | ✅ | ✅ | ❌ |
| **compliance_score** | ✅ | ✅ | ✅ | ❌ |
| **total_loads** | ✅ | ✅ | ✅ | ❌ |
| **on_time_percentage** | ✅ | ✅ | ✅ | ❌ |
| **average_margin** | ✅ | ✅ | ❌ | ❌ |
| **notes** | ✅ | ✅ | ❌ | ❌ |

**Key Principles:**
- ❌ Carriers cannot see other carriers' data
- ❌ Carriers cannot see broker's internal notes or margin averages
- ✅ Carriers see own performance metrics

---

## 3. Driver Entity Visibility

| Field | Admin | Broker | Carrier | Driver (Self) | Other Driver |
|-------|:-----:|:------:|:-------:|:-------------:|:------------:|
| **first_name** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **last_name** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **phone** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **email** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **cdl_number** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **cdl_expiration** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **medical_card_expiry** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **payment_structure** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **payment_rate** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **performance_notes** | ✅ | ✅ | ✅ | ❌ | ❌ |

**Key Principles:**
- ❌ Drivers cannot see other drivers' data
- ❌ Drivers cannot see internal performance notes
- ✅ Carriers see all drivers in their fleet

---

## 4. Shipper/Customer Entity Visibility

| Field | Admin | Broker | Customer (Self) | Other Customer |
|-------|:-----:|:------:|:---------------:|:--------------:|
| **company_name** | ✅ | ✅ | ✅ | ❌ |
| **email** | ✅ | ✅ | ✅ | ❌ |
| **phone** | ✅ | ✅ | ✅ | ❌ |
| **address** | ✅ | ✅ | ✅ | ❌ |
| **payment_terms** | ✅ | ✅ | ✅ | ❌ |
| **total_loads** | ✅ | ✅ | ✅ | ❌ |
| **credit_score** | ✅ | ✅ | ❌ | ❌ |
| **credit_limit** | ✅ | ✅ | ❌ | ❌ |
| **total_revenue** | ✅ | ✅ | ❌ | ❌ |
| **notes** | ✅ | ✅ | ❌ | ❌ |

**Key Principles:**
- ❌ Customers cannot see credit information or internal notes
- ❌ Customers cannot see other customers' data
- ✅ Customers see own shipment history

---

## 5. Audit Log Visibility

| Record Type | Admin | Broker | Carrier | Driver | Customer |
|-------------|:-----:|:------:|:-------:|:------:|:--------:|
| **All Audit Logs** | ✅ | ✅ (tenant-scoped) | ❌ | ❌ | ❌ |
| **Own Entity Changes** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Load Changes** | ✅ | ✅ | ❌ | ❌ | ❌ |

**Key Principles:**
- ❌ External parties cannot access audit logs
- ✅ Broker can audit all tenant activity
- ✅ Admin has global audit access

---

## 6. Document Visibility

| Document Type | Admin | Broker | Carrier | Owner-Op | Driver | Customer |
|---------------|:-----:|:------:|:-------:|:--------:|:------:|:--------:|
| **BOL** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **POD** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Rate Confirmation** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Customer Invoice** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Carrier Invoice** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Insurance Cert** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **CDL / Medical Card** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

**Key Principles:**
- Execution documents (BOL/POD): All parties
- Financial documents: Relevant parties only
- Compliance documents: Internal + subject party

---

## 7. Scope Enforcement Rules

### 7.1 Load Scope

| Role | Query Scope |
|------|-------------|
| **Admin** | All loads |
| **Broker** | All loads in tenant |
| **Carrier** | `current_carrier_party_id = user.carrier_id` |
| **Owner-Operator** | `current_carrier_party_id = user.carrier_id` |
| **Driver** | `driver_id = user.id` |
| **Customer** | `customer_id = user.customer_id` |

### 7.2 Carrier Scope

| Role | Query Scope |
|------|-------------|
| **Admin** | All carriers |
| **Broker** | All carriers in tenant |
| **Carrier** | `id = user.carrier_id` |

### 7.3 Driver Scope

| Role | Query Scope |
|------|-------------|
| **Admin** | All drivers |
| **Broker** | All drivers in tenant |
| **Carrier** | `party_id = user.carrier_id` |
| **Driver** | `id = user.id` |

---

## 8. Modification Permissions

### 8.1 Load Modifications

| Field Category | Admin | Broker | Carrier | Owner-Op | Driver | Customer |
|----------------|:-----:|:------:|:-------:|:--------:|:------:|:--------:|
| **Status** | ✅ | ✅ | ✅ (limited) | ✅ (limited) | ✅ (limited) | ❌ |
| **Financial** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Assignment** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Documents** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

### 8.2 Carrier Modifications

| Field Category | Admin | Broker | Carrier (Self) |
|----------------|:-----:|:------:|:--------------:|
| **Authority Info** | ✅ | ✅ | ❌ |
| **Contact Info** | ✅ | ✅ | ✅ |
| **Compliance Docs** | ✅ | ✅ | ✅ |
| **Notes** | ✅ | ✅ | ❌ |

### 8.3 Driver Modifications

| Field Category | Admin | Broker | Carrier | Driver (Self) |
|----------------|:-----:|:------:|:-------:|:-------------:|
| **Credentials** | ✅ | ✅ | ✅ | ❌ |
| **Contact Info** | ✅ | ✅ | ✅ | ✅ |
| **Payment Rate** | ✅ | ✅ | ✅ (approval required) | ❌ |

---

## 9. Enforcement Mechanism

All rules in this document are enforced via:

1. **Base44 Lifecycle Hooks**
   - `beforeRead()` - Scope enforcement
   - `afterRead()` - Field redaction
   - `beforeUpdate()` - Modification restrictions
   - `beforeDelete()` - Deletion restrictions

2. **Server-Side Only**
   - UI restrictions are supplementary
   - Direct API calls are blocked

3. **Audit Logged**
   - All access denials logged
   - All data access logged

---

## 10. Quick Decision Tree

```
User requests data → Identify user role → Check scope rules → Apply redaction → Return data
                                    ↓
                              Access Denied? → Log to AuditLog → Return 403
```

---

## 11. Review Schedule

This visibility matrix must be reviewed:
- **Quarterly** - Standard review
- **After role changes** - New role added or modified
- **After entity changes** - New entity or fields added
- **Post-incident** - After any data exposure incident

---

**Document Version:** 1.0  
**Implementation:** Base44 Hooks (`functions/hooks/`)  
**Compliance:** SOC 2, ISO 27001, FMCSA 371.3  
**Next Review:** 2026-03-30