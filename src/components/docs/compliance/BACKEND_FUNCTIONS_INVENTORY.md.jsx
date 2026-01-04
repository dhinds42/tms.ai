# BACKEND FUNCTIONS INVENTORY — SERVER-SIDE ENFORCEMENT CATALOG
**Generated:** 2026-01-04  
**App:** Dual TMS.ai  
**Purpose:** Complete mapping of entity hooks to security controls

---

## ENTITY HOOKS REGISTRY

### Entity: Load

| Hook | File Path | Controls Enforced | Status |
|------|-----------|-------------------|--------|
| beforeRead | `functions/entities/load/beforeRead.js` | • Tenant isolation (org_id filtering)<br>• Admin bypass<br>• Active membership validation | ✅ DEPLOYED |
| beforeUpdate | `functions/entities/load/beforeUpdate.js` | • Credit hold enforcement (dispatch/assignment)<br>• Accrual generation (on delivery)<br>• Status transition validation | ✅ DEPLOYED |
| afterRead | — | Field redaction (financial data by role) | ⚠️ NOT FOUND - Uses shared redaction module |
| beforeCreate | — | None | ❌ MISSING |
| beforeDelete | — | None | ❌ MISSING |

**Authorization Enforcement:** Read-level tenant isolation only  
**Audit Events Emitted:** None (should emit on UPDATE)

---

### Entity: Invoice

| Hook | File Path | Controls Enforced | Status |
|------|-----------|-------------------|--------|
| beforeRead | `functions/entities/invoice/beforeRead.js` | • Tenant isolation (org_id filtering)<br>• Admin bypass<br>• Active membership validation | ✅ DEPLOYED |
| beforeCreate | `functions/entities/invoice/beforeCreate.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeUpdate | `functions/entities/invoice/beforeUpdate.js` | Referenced in tests | ⚠️ UNKNOWN |
| afterRead | `functions/entities/invoice/afterRead.js` | Referenced in tests | ⚠️ UNKNOWN |
| afterCreate | `functions/entities/invoice/afterCreate.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeDelete | — | None | ❌ MISSING |

**Authorization Enforcement:** Read-level tenant isolation only  
**Audit Events Emitted:** Unknown

---

### Entity: Settlement

| Hook | File Path | Controls Enforced | Status |
|------|-----------|-------------------|--------|
| beforeRead | — | None | ❌ MISSING - P0 GAP |
| beforeCreate | `functions/entities/settlement/beforeCreate.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeUpdate | `functions/entities/settlement/beforeUpdate.js` | Referenced in tests | ⚠️ UNKNOWN |
| afterRead | `functions/entities/settlement/afterRead.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeDelete | — | None | ❌ MISSING |

**Authorization Enforcement:** ❌ NONE - Tenant isolation bypass risk  
**Audit Events Emitted:** Unknown

---

### Entity: Quote

| Hook | File Path | Controls Enforced | Status |
|------|-----------|-------------------|--------|
| beforeRead | `functions/entities/quote/beforeRead.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeCreate | `functions/entities/quote/beforeCreate.js` | Referenced in tests | ⚠️ UNKNOWN |
| afterRead | `functions/entities/quote/afterRead.js` | Referenced in tests | ⚠️ UNKNOWN |
| afterCreate | `functions/entities/quote/afterCreate.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeDelete | — | None | ❌ MISSING |

**Authorization Enforcement:** Unknown  
**Audit Events Emitted:** Unknown

---

### Entity: LaneRate

| Hook | File Path | Controls Enforced | Status |
|------|-----------|-------------------|--------|
| beforeRead | `functions/entities/laneRate/beforeRead.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeCreate | `functions/entities/laneRate/beforeCreate.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeUpdate | `functions/entities/laneRate/beforeUpdate.js` | Referenced in tests | ⚠️ UNKNOWN |
| afterRead | `functions/entities/laneRate/afterRead.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeDelete | — | None | ❌ MISSING |

**Authorization Enforcement:** Unknown  
**Audit Events Emitted:** Unknown

---

### Entity: Membership

| Hook | File Path | Controls Enforced | Status |
|------|-----------|-------------------|--------|
| beforeCreate | `functions/entities/membership/beforeCreate.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeUpdate | `functions/entities/membership/beforeUpdate.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeRead | — | None | ❌ MISSING |
| afterRead | — | None | ❌ MISSING |
| beforeDelete | — | None | ❌ MISSING |

**Authorization Enforcement:** Unknown  
**Audit Events Emitted:** Unknown

---

### Entity: Customer

| Hook | File Path | Controls Enforced | Status |
|------|-----------|-------------------|--------|
| afterRead | `functions/entities/customer/afterRead.js` | Referenced in tests | ⚠️ UNKNOWN |
| beforeRead | — | None | ❌ MISSING |
| beforeCreate | — | None | ❌ MISSING |
| beforeUpdate | — | None | ❌ MISSING |
| beforeDelete | — | None | ❌ MISSING |

**Authorization Enforcement:** Unknown  
**Audit Events Emitted:** Unknown

---

### Entity: OwnerOperator

| Hook | File Path | Controls Enforced | Status |
|------|-----------|-------------------|--------|
| beforeCreate | `functions/entities/ownerOperator/beforeCreate.js` | Referenced in shared math | ⚠️ UNKNOWN |
| beforeRead | — | None | ❌ MISSING |
| beforeUpdate | — | None | ❌ MISSING |
| afterRead | — | None | ❌ MISSING |
| beforeDelete | — | None | ❌ MISSING |

**Authorization Enforcement:** Unknown  
**Audit Events Emitted:** Unknown

---

### Entity: Stop

| Hook | File Path | Controls Enforced | Status |
|------|-----------|-------------------|--------|
| beforeUpdate | `functions/entities/stop/beforeUpdate.js` | Referenced in trust features tests | ⚠️ UNKNOWN |
| beforeRead | — | None | ❌ MISSING |
| afterRead | — | None | ❌ MISSING |
| beforeDelete | — | None | ❌ MISSING |

**Authorization Enforcement:** Unknown  
**Audit Events Emitted:** Unknown

---

### Entities with NO Hooks Found

**High-Risk Entities (Org-Scoped):**
- Carrier (no tenant isolation on reads)
- Driver (no tenant isolation on reads)
- Organization (no access control)
- Role (no access control)
- Permission (no access control)
- RolePermission (no access control)
- UserRole (no access control)
- FieldRedactionPolicy (no access control)
- ApprovalRequest (authorization unknown)
- AuditLog (no access control - should be write-only)
- CarrierDriverPolicy (authorization unknown)
- PolicyAlert (authorization unknown)

---

## SHARED AUTHORIZATION & SECURITY MODULES

### Authorization Engine
**File:** `functions/shared/rbac/authorizationEngine.js`

**Functions:**
```javascript
export async function authorize(base44, user, permissionCode, entity, orgId)
export function enforceOrgIsolation(entity, orgId)
export function filterByOrg(entities, orgId)
export function getCurrentOrg(user, context)
```

**Used By:** Entity hooks (Load, Invoice)  
**Controls:** Membership validation, permission resolution, tenant isolation

---

### Membership Resolver
**File:** `functions/shared/rbac/membershipResolver.js`

**Functions:**
```javascript
export async function getActiveMembership(base44, userId, orgId)
export async function getUserMemberships(base44, userId)
export async function getMembershipRoles(base44, membershipId)
export async function getMembershipPermissions(base44, membershipId)
export async function getUserContext(base44, userId, orgId)
```

**Used By:** Authorization engine  
**Controls:** Role resolution, permission aggregation, context assembly

---

### Policy Engine (Field Redaction)
**File:** `functions/shared/rbac/policyEngine.js`

**Functions:**
```javascript
export async function applyFieldRedaction(base44, entity, entityName, roleKeys, orgType)
export async function getRedactionPolicies(base44, roleKey, entityName, orgType)
export async function applyBatchRedaction(base44, entities, entityName, roleKeys, orgType)
```

**Used By:** afterRead hooks (should be)  
**Controls:** Data-driven field hiding, partial masking

---

### Financial Redaction
**File:** `functions/shared/security/financialRedaction.js`

**Functions:**
```javascript
export function redactFinancialsByRole(entityType, entity, role)
export function getRedactedFields(entityType, role)
```

**Entities Protected:**
- Load (customer_rate, carrier_pay, margin)
- Invoice (internal_notes)
- Settlement (internal_notes, gross_pay)
- LaneRate (margins)

**Used By:** Should be used in afterRead hooks  
**Controls:** Role-based financial data hiding

---

### Legacy Authorize
**File:** `functions/shared/security/authorize.js`

**Functions:**
```javascript
export function hasPermission(user, permission, entity)
export async function authorize(user, permission, entity)
```

**Status:** ⚠️ LEGACY - Should migrate to entity-backed RBAC  
**Used By:** Unknown (search codebase)

---

## APPROVAL WORKFLOW FUNCTIONS

**File:** `functions/shared/approval/approvalWorkflow.js`

**Functions:**
```javascript
export function requiresApproval(requestType, changeAmount)
export async function createApprovalRequest(base44, {...})
export async function approveRequest(base44, requestId, approver, user)
export async function applyApprovedChanges(base44, requestId, appliedBy)
export async function rejectRequest(base44, requestId, rejectedBy, reason)
```

**Privileged Operations:**
- bank_account_change (threshold: $0, MFA: required)
- instant_pay_enable (threshold: $0, MFA: required)
- negative_margin_override (threshold: -$1, MFA: required)
- carrier_pay_override (threshold: $10,000, MFA: required)
- rate_change (threshold: $5,000, MFA: not required)
- large_payment (threshold: $100,000, MFA: required)
- user_role_change (threshold: $0, MFA: required)

**Controls Enforced:**
- Self-approval prevention (line 98)
- 72-hour expiry (line 107)
- MFA requirement validation (line 118)
- Before/after snapshot capture

**Audit Events:**
- APPROVAL_REQUESTED
- APPROVAL_GRANTED
- APPROVAL_REJECTED
- APPROVED_CHANGES_APPLIED

---

## MFA ENFORCEMENT POINTS

**File:** `functions/shared/security/mfaEnforcement.js`

**Functions:**
```javascript
export async function hasMFAEnabled(base44, user)
export async function requireMFA(base44, user, operation)
export function roleRequiresMFA(roleKey)
export async function enforceMembershipMFA(base44, membership, roles)
```

**Privileged Roles:**
- broker_admin
- carrier_admin
- broker_finance
- carrier_finance
- customer_admin
- oo_admin

**Enforcement Points:**
- Approval request approval (approvalWorkflow.js:119)
- Membership role assignment (if privileged role)
- Manual requireMFA() calls

**Audit Events:**
- MFA_REQUIRED (when blocked)

---

## AUDIT LOG EVENT SCHEMA

**File:** `functions/shared/security/auditLogger.js`

**Schema:**
```typescript
interface AuditEntry {
  entity_type: string;           // "Load", "Invoice", etc.
  entity_id: string;             // Entity record ID
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ_DENIED' | 
          'APPROVAL_REQUESTED' | 'APPROVAL_GRANTED' | 'APPROVAL_REJECTED' |
          'MFA_REQUIRED' | 'APPROVAL_REJECTED' | 'APPROVED_CHANGES_APPLIED' |
          'AUTO_TUNING_BATCH_COMPLETED' | 'POLICY_ALERT_BATCH_FAILED';
  actor_user_id: string;
  actor_email: string;
  actor_role: string;
  changed_fields?: object;       // { field: { from: val, to: val } }
  before_values?: object;        // Full entity snapshot before
  after_values?: object;         // Full entity snapshot after
  calculation_explanation?: string;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  metadata?: object;
}
```

**Emission Points:**
- `functions/shared/rbac/authorizationEngine.js:24, 47` (READ_DENIED)
- `functions/shared/approval/approvalWorkflow.js:64, 133, 216` (approval events)
- `functions/shared/security/mfaEnforcement.js:29` (MFA_REQUIRED)
- `functions/scheduled/weeklyThresholdTuning.js:43` (AUTO_TUNING_BATCH_COMPLETED)
- `functions/scheduled/dailyPolicyAlerts.js:46` (POLICY_ALERT_BATCH_FAILED)
- `functions/entities/load/beforeUpdate.js` (none - should emit)

**Status:** ❌ CRITICAL - Audit log creation commented out (TODO), only console.log active

---

## FINANCIAL ENFORCEMENT POINTS

### Credit Hold Enforcement
**File:** `functions/shared/finance/creditHoldEnforcement.js`

**Used In:**
- `functions/entities/load/beforeUpdate.js:14` (dispatch blocking)

**Controls:**
- SOFT_HOLD: blocks dispatch/assignment
- HARD_HOLD: blocks all operations

---

### Accrual Engine
**File:** `functions/shared/finance/accrualEngine.js`

**Used In:**
- `functions/entities/load/beforeUpdate.js:20` (delivery trigger)

**Controls:**
- Revenue recognition on delivery
- AR/AP accrual generation

---

### Variance Engine
**File:** `functions/shared/finance/varianceEngine.js`

**Used In:** Referenced in tests, usage unknown

**Controls:**
- Quote vs Invoice variance detection

---

## SCHEDULED JOBS

### Weekly Threshold Tuning
**File:** `functions/scheduled/weeklyThresholdTuning.js`

**Schedule:** Every Sunday at 03:00 UTC  
**Purpose:** Auto-tune carrier policy thresholds  
**Entities Modified:** CarrierDriverPolicy  
**Audit Events:** AUTO_TUNING_BATCH_COMPLETED

**Function:**
```javascript
export default async function weeklyThresholdTuning(base44)
```

---

### Daily Policy Alerts
**File:** `functions/scheduled/dailyPolicyAlerts.js`

**Schedule:** Daily at 02:00 America/New_York  
**Purpose:** Generate policy alerts for carriers  
**Entities Modified:** PolicyAlert  
**Audit Events:** POLICY_ALERT_BATCH_FAILED (on error)

**Function:**
```javascript
export default async function dailyPolicyAlerts(base44)
```

---

### Data Retention Job
**File:** ❌ NOT FOUND

**Status:** Missing - P0 requirement  
**Should Enforce:** DataRetentionPolicy entity  
**Should Archive/Delete:** Expired entities per policy

---

## API ENDPOINTS (CUSTOM FUNCTIONS)

### Seed Functions
- `functions/api/seedDefaultRolesAndPermissions.js`
- `functions/api/seedRbacDefaults.js`
- `functions/api/seedCarrierDriverPolicies.js`

### Approval API
- `functions/api/applyPolicyFromAlert.js`

### Drag-Drop Security
- `functions/api/applyDragDropAction.js`

### Migration Tools
- `functions/api/migrateToMultiTenant.js`
- `functions/api/createMembershipForUser.js`

### Audit Pack Export
- `functions/api/exportAuditPack.js`

---

## COMPREHENSIVE CONTROL MATRIX

| Entity | Tenant Isolation (R/C/U/D) | Authorization (R/C/U/D) | Field Redaction | Audit Events | Approval Required | Status |
|--------|----------------------------|-------------------------|-----------------|--------------|-------------------|--------|
| **Load** | ✅/❌/❌/❌ | ✅/❌/❌/❌ | ✅ | ❌ | carrier_pay_override | PARTIAL |
| **Invoice** | ✅/❌/❌/❌ | ✅/❌/❌/❌ | ✅ | ❌ | None | PARTIAL |
| **Settlement** | ❌/❌/❌/❌ | ❌/❌/❌/❌ | ✅ | ❌ | large_payment | CRITICAL GAP |
| **Quote** | ❓/❌/❌/❌ | ❓/❌/❌/❌ | ❌ | ❌ | rate_change | UNKNOWN |
| **LaneRate** | ❓/❌/❌/❌ | ❓/❌/❌/❌ | ✅ | ❌ | rate_change | UNKNOWN |
| **Carrier** | ❌/❌/❌/❌ | ❌/❌/❌/❌ | ❌ | ❌ | None | NO CONTROLS |
| **Driver** | ❌/❌/❌/❌ | ❌/❌/❌/❌ | ❌ | ❌ | None | NO CONTROLS |
| **Customer** | ❌/❌/❌/❌ | ❌/❌/❌/❌ | ❌ | ❌ | None | NO CONTROLS |
| **Organization** | ❌/❌/❌/❌ | ❌/❌/❌/❌ | ❌ | ❌ | None | NO CONTROLS |
| **Membership** | ❌/❌/❌/❌ | ❌/❌/❌/❌ | ❌ | ❌ | user_role_change | PARTIAL |
| **Role** | ❌/❌/❌/❌ | ❌/❌/❌/❌ | ❌ | ❌ | user_role_change | NO CONTROLS |
| **Permission** | ❌/❌/❌/❌ | ❌/❌/❌/❌ | ❌ | ❌ | None | NO CONTROLS |
| **ApprovalRequest** | ❌/❌/❌/❌ | ✅/✅/✅/❌ | ❌ | ✅ | N/A | PARTIAL |
| **AuditLog** | ❌/❌/❌/❌ | ❌/❌/❌/❌ | ❌ | N/A | None | NO CONTROLS |

**Legend:**
- ✅ = Implemented
- ❌ = Not implemented
- ❓ = Unknown (hook file referenced but not confirmed)
- R/C/U/D = Read/Create/Update/Delete

---

## CRITICAL GAPS SUMMARY

### P0 (Production Blockers)
1. **Settlement.beforeRead missing** - Tenant isolation bypass
2. **Audit log creation not implemented** - Only console.log
3. **No C/U/D tenant isolation** - Only Read protected
4. **No authorization on writes** - Anyone can create/update

### P1 (High Priority)
1. **15+ entities with no hooks** - Inconsistent enforcement
2. **Field redaction not applied** - afterRead hooks missing
3. **Most hooks status unknown** - Need file confirmation

### P2 (Medium Priority)
1. **Data retention job missing** - Regulatory compliance
2. **Legacy authorize.js in use** - Should migrate
3. **Financial validation missing** - No invoice/settlement math checks

---

## NEXT STEPS

1. **Confirm hook files exist** - Read all referenced hook files
2. **Deploy missing hooks** - Settlement.beforeRead (P0)
3. **Implement audit persistence** - Remove TODO comments
4. **Add C/U/D tenant isolation** - beforeCreate/beforeUpdate hooks
5. **Add authorization to writes** - Permission checks on create/update
6. **Deploy afterRead hooks** - Apply field redaction consistently
7. **Create data retention job** - Scheduled enforcement

---

**Generated:** 2026-01-04  
**Source:** Code analysis + context snapshot  
**Classification:** INTERNAL - SECURITY CONTROLS INVENTORY