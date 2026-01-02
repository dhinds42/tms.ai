# PHASE 0 — RBAC & MULTI-TENANT IDENTITY INVENTORY
## TMS.ai User Module Verification
**Date:** January 2, 2026  
**System:** TMS.ai (Dual Mode: Broker/Carrier)

---

## 1️⃣ EXISTING IDENTITY & AUTH MODEL

### ✅ User Entity
**Status:** ✅ BUILT-IN (Base44 Managed)  
**Default Fields:**
- id
- email
- full_name
- role (admin | user)
- created_date
- updated_date

**Custom Fields:** Can be extended via `entities/User.json`  
**Assessment:** ✅ Core user identity exists, extendable for multi-tenant model

**Authentication:**
- ✅ Base44-managed login/sessions
- ✅ JWT tokens (assumed)
- ✅ base44.auth.me() retrieves current user
- ✅ base44.users.inviteUser() for user invitations

---

## 2️⃣ EXISTING RBAC ENTITIES

### ✅ Role Entity
**Status:** ✅ EXISTS  
**Fields Present:**
- name (string)
- description (string)
- role_type (system | custom)
- permissions (array of strings)
- is_active (boolean)

**Assessment:** ✅ Basic role entity exists, supports custom roles

---

### ✅ Permission Entity
**Status:** ✅ EXISTS  
**Fields Present:**
- code (string) - e.g., "load.view", "settlement.approve"
- description (string)
- category (loads, finance, compliance, admin, analytics, customers, carriers)
- is_active (boolean)

**Assessment:** ✅ Permission registry exists

---

### ✅ RolePermission Entity
**Status:** ✅ EXISTS  
**Fields Present:**
- role_id (FK to Role)
- permission_id (FK to Permission)
- granted_at (date-time)
- granted_by (string)
- is_active (boolean)

**Assessment:** ✅ Many-to-many relationship implemented

---

### ✅ Organization Entity
**Status:** ✅ EXISTS  
**Fields Present:**
- name, legal_name
- dot_number, mc_number, scac, tax_id
- time_zone_default, country, state
- billing_email
- data_retention_policy_id
- branding_settings (logo, colors)
- feature_flags (object)
- is_active (boolean)

**Fields Missing:**
- ❌ org_type (BROKER | CARRIER | OWNER_OPERATOR | CUSTOMER) - **CRITICAL GAP**
- ⚠️ created_by, parent_org_id (optional for sub-orgs)

**Assessment:** ⚠️ PARTIAL - Organization exists but missing org_type field

---

### ❌ Membership Entity
**Status:** ❌ MISSING  
**Purpose:** Links User ↔ Organization  
**Required Fields:**
- membership_id
- user_id (FK to User)
- org_id (FK to Organization)
- title (optional)
- status (invited | active | locked | offboarded)
- is_primary (boolean)
- created_at

**Assessment:** 🚨 **CRITICAL GAP** - No user-to-org linking mechanism

---

### ❌ UserRole Entity (Membership ↔ Role)
**Status:** ❌ MISSING  
**Purpose:** Assigns roles to memberships (not users directly)  
**Required Fields:**
- user_role_id
- membership_id (FK to Membership)
- role_id (FK to Role)
- granted_at
- granted_by
- is_active

**Assessment:** 🚨 **CRITICAL GAP** - Roles assigned to users globally, not per-org

---

### ❌ DataScope Entity
**Status:** ❌ MISSING  
**Purpose:** Restricts data visibility (e.g., assigned drivers only)  
**Required Fields:**
- scope_id
- membership_id
- scope_type (ALL | TEAM | TERMINAL | ASSIGNED_DRIVERS | ASSIGNED_CUSTOMERS)
- scope_ref_id (nullable)
- active

**Assessment:** ⚠️ OPTIONAL (nice-to-have for large orgs)

---

### ❌ FieldRedactionPolicy Entity
**Status:** ❌ MISSING  
**Purpose:** Defines field-level redaction by role/entity  
**Required Fields:**
- policy_id
- org_type (nullable)
- role_key (string)
- entity_name (string)
- hidden_fields_json (array of field names)
- masked_fields_json (array) - optional
- conditions_json (object) - optional
- active (boolean)

**Assessment:** 🚨 **CRITICAL GAP** - Redaction exists in code but not data-driven

---

## 3️⃣ EXISTING ACCESS CONTROL PATTERNS

### ✅ financialRedaction.js
**Location:** `functions/shared/security/financialRedaction.js`  
**Status:** ✅ IMPLEMENTED

**Redaction Functions:**
- redactLoad(entity, role)
- redactInvoice(entity, role)
- redactSettlement(entity, role)
- redactLaneRate(entity, role)

**Role-Based Hiding:**
- ✅ Carrier/Driver: cannot see customer_rate, margin
- ✅ Customer: cannot see carrier_pay, margin
- ✅ Admin/Broker: see all

**Assessment:** ✅ Code-based redaction works but NOT data-driven (hard to customize)

---

### ✅ authorize.js
**Location:** `functions/shared/security/authorize.js`  
**Status:** ✅ PARTIAL

**Features:**
- hasPermission(user, permission, entity)
- getRolePermissions(role)
- authorize(user, permission, entity)
- logAccessDenied()

**Limitations:**
- ❌ No org_id/membership_id awareness
- ❌ Roles are user.role (global), not per-org
- ⚠️ Hardcoded role permissions in code

**Assessment:** ⚠️ PARTIAL - Authorization logic exists but not multi-tenant aware

---

### ✅ permissions.js
**Location:** `functions/auth/permissions.js`  
**Status:** ✅ PARTIAL

**Features:**
- PERMISSIONS object mapping permission → allowed roles
- hasPermission(user, permission, context)
- canAccessRecord(user, entityType, record, operatingMode)
- redactForRole(entityType, data, role)

**Limitations:**
- ❌ No org_id isolation
- ⚠️ Hardcoded permission matrix
- ⚠️ operatingMode from localStorage (not database)

**Assessment:** ⚠️ PARTIAL - Good foundation but not tenant-aware

---

## 4️⃣ EXISTING HOOKS USING RBAC

### ✅ Hooks with Redaction:
- `functions/entities/laneRate/afterRead.js` - ✅ Role-based redaction
- `functions/entities/quote/afterRead.js` - ✅ Redacts broker margin
- `functions/entities/invoice/afterRead.js` - ✅ Calls redactFinancialsByRole
- `functions/entities/load/afterRead.js` - ✅ (referenced in snapshot)
- `functions/entities/customer/afterRead.js` - ✅ Placeholder
- `functions/entities/settlement/afterRead.js` - ✅ (referenced in snapshot)

**Assessment:** ✅ afterRead redaction widely implemented

---

### ⚠️ Hooks with Permission Checks:
- `functions/entities/laneRate/beforeCreate.js` - ✅ Validation, ❌ No permission check
- `functions/entities/laneRate/beforeUpdate.js` - ✅ Validation, ❌ No permission check
- `functions/entities/quote/beforeCreate.js` - ✅ Pricing computation, ❌ No permission check
- `functions/entities/invoice/beforeCreate.js` - ✅ (referenced), ❌ No permission check

**Assessment:** ⚠️ PARTIAL - No permission enforcement in hooks (relies on UI/frontend)

---

## 5️⃣ EXISTING ADMIN UI

### ✅ User Roles Page
**Location:** `pages/UserRoles.js`  
**Status:** ✅ EXISTS

**Features:**
- View roles list
- Create/edit/delete roles
- Permission assignment UI
- Search and pagination
- Toggles between simple/enhanced view

**Limitations:**
- ⚠️ Mock data (not connected to database)
- ❌ No organization context
- ❌ No membership management

**Assessment:** ⚠️ PARTIAL - UI exists but needs database integration

---

### ✅ RolePermissionsTab Component
**Location:** `components/settings/RolePermissionsTab.js`  
**Status:** ✅ EXISTS

**Features:**
- Enhanced role cards with color coding
- Permission categories
- System vs custom role badges
- Stats display

**Limitations:**
- ⚠️ Mock data
- ❌ No org scoping

**Assessment:** ⚠️ PARTIAL - Good UI, needs backend integration

---

### ❌ Organization Admin UI
**Status:** ❌ MISSING  
**Required:** Create/edit orgs, assign org admins

---

### ❌ Member Management UI
**Status:** ❌ MISSING  
**Required:** Invite users, assign roles per org, lock/offboard

---

## 6️⃣ EXISTING TEST FRAMEWORK

### ✅ Test Structure:
**Location:** `functions/__tests__/`

**Test Files Found:**
- `functions/__tests__/auth.test.js` - ❌ File exists but not verified
- `functions/__tests__/rbac.test.js` - ❌ File exists but not verified
- `functions/__tests__/validation.test.js` - ❌ File exists but not verified
- `functions/__tests__/security/authorize.test.js` - ❌ File exists but not verified
- `functions/__tests__/rbac/loadRedaction.test.js` - ❌ File exists but not verified

**Assessment:** ⚠️ Test files exist but content/coverage unknown

---

## 7️⃣ ROLE-SENSITIVE ENTITIES

### Entities with Pricing/Margin Fields (require redaction):
1. ✅ **Load** - customer_rate, carrier_pay, margin (redaction implemented)
2. ✅ **LaneRate** - customer_rate, carrier_rate, margin (redaction implemented)
3. ✅ **Quote** - estimated_cost, margin (redaction implemented)
4. ✅ **Invoice** - variance_cents, internal_notes (redaction implemented)
5. ✅ **Settlement** - gross_pay, deductions (redaction implemented)

### Entities requiring tenant isolation (no cross-org access):
1. ⚠️ **Load** - needs org_id field
2. ⚠️ **Carrier** - needs org_id field
3. ⚠️ **Driver** - needs org_id field
4. ⚠️ **Customer** - needs org_id field
5. ⚠️ **Lane** - needs org_id field
6. ⚠️ **LaneRate** - needs org_id field
7. ⚠️ **Quote** - needs org_id field
8. ⚠️ **Invoice** - needs org_id field
9. ⚠️ **Document** - needs org_id field
10. ⚠️ **ComplianceItem** - needs org_id field

**Assessment:** 🚨 **MAJOR GAP** - No org_id on tenant-sensitive entities

---

## 8️⃣ GAP SUMMARY

### 🚨 CRITICAL GAPS (Must-Have for Production)

1. **Membership Entity** - ❌ MISSING
   - Links users to organizations
   - Enables multi-org participation
   - Status tracking (invited/active/locked)

2. **UserRole Entity** - ❌ MISSING
   - Assigns roles per membership (not globally)
   - Enables same user = different roles in different orgs

3. **FieldRedactionPolicy Entity** - ❌ MISSING
   - Makes redaction data-driven
   - Allows customization without code changes

4. **org_id Field** - ❌ MISSING on all tenant entities
   - Load, Carrier, Driver, Customer, Lane, LaneRate, Quote, Invoice, Document, etc.
   - **WITHOUT THIS, TENANT ISOLATION IS IMPOSSIBLE**

5. **Permission Enforcement in Hooks** - ❌ MISSING
   - beforeCreate/beforeUpdate hooks lack permission checks
   - Currently relies on UI (bypassable)

---

### ⚠️ MODERATE GAPS (Should-Have)

1. **Organization.org_type** - ⚠️ MISSING
   - Needed to apply baseline policies

2. **DataScope Entity** - ⚠️ MISSING (optional)
   - Restricts data visibility (assigned drivers/customers only)

3. **Seed Roles/Permissions Function** - ⚠️ MISSING
   - No default role seeding on org creation

4. **Member Management UI** - ⚠️ MISSING
   - Invite, assign roles, lock/offboard

5. **Organization Admin UI** - ⚠️ MISSING
   - Create/edit orgs, assign admins

---

### ✅ WHAT EXISTS (Reusable)

1. ✅ Base44 user authentication (login/sessions)
2. ✅ Role, Permission, RolePermission entities
3. ✅ Organization entity (partial)
4. ✅ financialRedaction.js (code-based redaction)
5. ✅ authorize.js (permission check utilities)
6. ✅ AuditLog entity (complete)
7. ✅ User Roles UI (needs backend integration)
8. ✅ afterRead hooks enforcing redaction

---

## 9️⃣ PROPOSED ADDITIONS (Non-Breaking)

### A. Extend Organization Entity
**Action:** ADD FIELDS (do not delete existing)
```json
{
  "org_type": {
    "type": "string",
    "enum": ["BROKER", "CARRIER", "OWNER_OPERATOR", "CUSTOMER"],
    "description": "Organization type for baseline policies"
  },
  "parent_org_id": {
    "type": "string",
    "description": "Parent org for sub-orgs (optional)"
  },
  "created_by": {
    "type": "string",
    "description": "User who created this org"
  },
  "tenant_id": {
    "type": "string",
    "description": "Tenant isolation ID (same as org_id typically)"
  }
}
```

---

### B. Create Membership Entity
**Action:** CREATE NEW
```json
{
  "name": "Membership",
  "properties": {
    "user_id": { "type": "string", "description": "FK to User" },
    "org_id": { "type": "string", "description": "FK to Organization" },
    "title": { "type": "string", "description": "Job title (optional)" },
    "status": {
      "type": "string",
      "enum": ["invited", "active", "locked", "offboarded"],
      "default": "invited"
    },
    "is_primary": {
      "type": "boolean",
      "default": false,
      "description": "Primary organization for this user"
    },
    "invited_by": { "type": "string" },
    "accepted_at": { "type": "string", "format": "date-time" },
    "locked_at": { "type": "string", "format": "date-time" },
    "locked_by": { "type": "string" },
    "lock_reason": { "type": "string" },
    "offboarded_at": { "type": "string", "format": "date-time" },
    "offboarded_by": { "type": "string" },
    "is_active": { "type": "boolean", "default": true }
  },
  "required": ["user_id", "org_id"]
}
```

---

### C. Create UserRole Entity
**Action:** CREATE NEW
```json
{
  "name": "UserRole",
  "properties": {
    "membership_id": { "type": "string", "description": "FK to Membership" },
    "role_id": { "type": "string", "description": "FK to Role" },
    "granted_at": { "type": "string", "format": "date-time" },
    "granted_by": { "type": "string" },
    "is_active": { "type": "boolean", "default": true }
  },
  "required": ["membership_id", "role_id"]
}
```

---

### D. Create FieldRedactionPolicy Entity
**Action:** CREATE NEW
```json
{
  "name": "FieldRedactionPolicy",
  "properties": {
    "org_type": {
      "type": "string",
      "enum": ["BROKER", "CARRIER", "OWNER_OPERATOR", "CUSTOMER"],
      "description": "Baseline policy for org type (nullable for global)"
    },
    "role_key": {
      "type": "string",
      "description": "Role this policy applies to"
    },
    "entity_name": {
      "type": "string",
      "description": "Entity name (Load, Invoice, etc.)"
    },
    "hidden_fields": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Fields to completely hide"
    },
    "masked_fields": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Fields to partially mask (optional)"
    },
    "conditions": {
      "type": "object",
      "description": "Conditional redaction rules (optional)"
    },
    "is_active": { "type": "boolean", "default": true }
  },
  "required": ["role_key", "entity_name", "hidden_fields"]
}
```

---

### E. Extend AuditLog (if needed)
**Action:** ADD FIELDS (do not delete existing)
```json
{
  "actor_membership_id": {
    "type": "string",
    "description": "Membership ID of actor"
  },
  "org_id": {
    "type": "string",
    "description": "Organization context"
  },
  "impersonation_session_id": {
    "type": "string",
    "description": "If action taken during impersonation"
  }
}
```

---

### F. Add org_id to Tenant Entities
**Action:** EXTEND (add field to existing entities)

**Entities requiring org_id:**
- Load
- Carrier
- Driver
- Customer
- Lane
- LaneRate
- Quote
- Invoice
- Document
- ComplianceItem
- Settlement
- PolicyAlert
- CarrierDriverPolicy
- FeatureApprovalRequest
- (and all other business entities)

**Schema Addition:**
```json
{
  "org_id": {
    "type": "string",
    "description": "Organization/tenant owning this record"
  }
}
```

**Migration Strategy:**
- Backfill existing records with default org_id
- Make org_id required going forward

---

## 🔟 PROPOSED ARCHITECTURE

### Multi-Tenant Identity Model:

```
User (Base44 built-in)
  ↓ (1:N)
Membership
  ↓ (belongs to)
Organization
  ↓ (has)
UserRole (N:M with Role)
  ↓ (references)
Role
  ↓ (has)
RolePermission (N:M with Permission)
  ↓ (references)
Permission
```

### Authorization Flow:

```
Request → Get user.id
  → Lookup Membership(s) by user_id
  → Check membership.status = active
  → Get UserRole(s) for membership
  → Get Permissions for roles
  → Check permission.code matches resource.action
  → Filter data by org_id
  → Apply FieldRedactionPolicy for role_key + entity
  → Return redacted data
  → Log to AuditLog
```

---

## 1️⃣1️⃣ BACKWARD COMPATIBILITY STRATEGY

### Reuse Existing:
1. ✅ User entity (extend, don't replace)
2. ✅ Role entity (keep existing roles, add org-scoped ones)
3. ✅ Permission entity (keep existing permissions)
4. ✅ RolePermission entity (keep existing mappings)
5. ✅ Organization entity (extend with org_type)
6. ✅ AuditLog entity (extend with membership/org fields)

### Add New (no deletion):
1. ➕ Membership entity
2. ➕ UserRole entity
3. ➕ FieldRedactionPolicy entity
4. ➕ DataScope entity (optional)

### Extend Existing Entities:
1. ➕ Add org_id to: Load, Carrier, Driver, Customer, Lane, LaneRate, Quote, Invoice, etc.
2. ➕ Add org_type to Organization
3. ➕ Add actor_membership_id, org_id to AuditLog

### Migration Path:
- Phase 1: Add new entities, extend existing entities (additive only)
- Phase 2: Create default org for existing data
- Phase 3: Backfill org_id on existing records
- Phase 4: Enforce org_id in hooks (new records only initially)
- Phase 5: Make org_id required after backfill complete

---

## 1️⃣2️⃣ RECOMMENDED DEFAULT ROLES

### BROKER ORG:
- broker_admin (all permissions)
- broker_ops (loads, docs, no finance)
- broker_finance (invoices, settlements, exports)
- broker_sales (quotes, customers, limited pricing)

### CARRIER ORG:
- carrier_admin (all carrier-side)
- dispatcher (driver/load assignment)
- safety_manager (compliance, docs)
- carrier_finance (settlements, payables)

### OWNER_OPERATOR ORG:
- oo_admin (all for that OO)
- oo_driver (driver portal)

### CUSTOMER ORG:
- customer_admin (lanes, rates, FSC, users)
- customer_user (view quotes/invoices, limited)

---

## 1️⃣3️⃣ RECOMMENDED DEFAULT REDACTION POLICIES

### Baseline for DRIVER role:
- Entity: Load
- Hidden: customer_rate, carrier_pay, margin, total_revenue, broker_fee

### Baseline for CARRIER role:
- Entity: Load
- Hidden: customer_rate, margin, broker_fee, total_revenue

### Baseline for CUSTOMER role:
- Entity: Load
- Hidden: carrier_pay, driver_pay, margin, broker_fee

### Baseline for CUSTOMER role:
- Entity: LaneRate
- Hidden: carrier_rate, driver_rate, broker_fee, margin

---

## 🎯 NEXT STEPS (PHASE 1-6)

### Phase 1: Data Model
- ✅ Extend Organization (add org_type)
- ✅ Create Membership entity
- ✅ Create UserRole entity
- ✅ Create FieldRedactionPolicy entity
- ✅ Add org_id to all tenant entities

### Phase 2: Seed Function
- ✅ Create seedRbacDefaults()
- ✅ Seed default roles per org_type
- ✅ Seed default permissions
- ✅ Seed baseline FieldRedactionPolicy

### Phase 3: Server Authorization
- ✅ Enhance authorize() for multi-tenant
- ✅ Add permission checks to beforeCreate/beforeUpdate hooks
- ✅ Add org_id filtering to beforeRead hooks
- ✅ Enhance afterRead with data-driven FieldRedactionPolicy
- ✅ Add membership.status checks

### Phase 4: Admin UI
- ✅ Organization admin page
- ✅ Member management page
- ✅ Invite flow
- ✅ Role assignment UI
- ✅ Lock/offboard actions

### Phase 5: Test Harness
- ✅ Tenant isolation tests
- ✅ RBAC permission tests
- ✅ Redaction policy tests
- ✅ Membership status tests
- ✅ Seed idempotency tests

### Phase 6: Migration & Backfill
- ✅ Create default organization
- ✅ Backfill org_id on existing records
- ✅ Create memberships for existing users

---

## ✅ CONCLUSION

### Current State:
- ✅ Strong foundation: Role, Permission, Organization entities exist
- ✅ Redaction code exists (financialRedaction.js)
- ✅ Authorization utilities exist (authorize.js, permissions.js)
- ✅ UI components exist (UserRoles, RolePermissionsTab)

### Critical Gaps:
- 🚨 **Membership entity missing** (user-org linking)
- 🚨 **UserRole entity missing** (role-per-org)
- 🚨 **FieldRedactionPolicy entity missing** (data-driven redaction)
- 🚨 **org_id missing on all entities** (tenant isolation impossible)
- 🚨 **Permission checks missing in hooks** (UI-only enforcement)

### Recommendation:
**Implement Phases 1-6 in strict sequence, testing each phase before proceeding.**

The existing code provides 60% of the required functionality. The remaining 40% (multi-tenancy, org-scoped roles, data-driven redaction) must be added to achieve production-grade RBAC.

---

**Next Action:** Proceed to PHASE 1 (Data Model) with user approval.