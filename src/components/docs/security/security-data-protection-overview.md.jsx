# TMS.ai Security & Data Protection Overview
**Technical Implementation Guide**  
**Version:** 1.0  
**Last Updated:** December 30, 2025  
**Audience:** Technical teams, security professionals, enterprise prospects

---

## 1. Executive Summary

### Overview of TMS.ai Security Philosophy

TMS.ai is built on a **zero-trust security model** where access control decisions are made server-side on every request. We reject the traditional approach of client-side permission checking, which can be circumvented by technically sophisticated users.

**Core Principles:**
1. **Server-side enforcement only** - Never trust the client
2. **Defense in depth** - Multiple security layers
3. **Least privilege by default** - Users see only what they need
4. **Complete auditability** - Every action is logged
5. **Data segregation** - Multi-tenant isolation enforced at query level

### Defense-in-Depth Approach

```
┌──────────────────────────────────────────────┐
│  Layer 1: Authentication (Base44 JWT)        │
├──────────────────────────────────────────────┤
│  Layer 2: RBAC (Role-based permissions)      │
├──────────────────────────────────────────────┤
│  Layer 3: Tenant Scoping (Data isolation)    │
├──────────────────────────────────────────────┤
│  Layer 4: Field Redaction (Sensitive data)   │
├──────────────────────────────────────────────┤
│  Layer 5: Validation (Business rules)        │
├──────────────────────────────────────────────┤
│  Layer 6: Audit Logging (Complete tracking)  │
└──────────────────────────────────────────────┘
```

Each layer is independent and provides protection even if other layers fail.

### Server-Side Enforcement Model

**Problem with Client-Side Security:**
```javascript
// ❌ BAD: Client-side permission check (can be bypassed)
if (user.role === 'broker') {
  showCustomerRate(); // Attacker can modify JavaScript
}
```

**TMS.ai Approach:**
```javascript
// ✅ GOOD: Server enforces via hooks
afterRead(context, records) {
  if (context.user.role !== 'broker') {
    delete record.customer_rate; // Server removes before sending
  }
}
```

**Result:** Even if an attacker modifies client code, the server never sends unauthorized data.

---

## 2. Platform Architecture

### Base44 Backend Model

TMS.ai runs on **Base44**, a backend-as-a-service platform that provides:

- **Entity-based data model** - Structured, schema-enforced storage
- **Lifecycle hooks** - Server-side logic at key points (beforeCreate, afterRead, etc.)
- **Built-in authentication** - JWT tokens, session management
- **Automatic API generation** - CRUD endpoints created automatically
- **Audit infrastructure** - Change tracking built-in

**Architecture Diagram:**

```
┌─────────────┐
│   Client    │  (React, Browser)
└──────┬──────┘
       │ HTTPS + JWT
       ▼
┌─────────────────────────────┐
│  Base44 API Gateway         │
│  - Authenticate             │
│  - Rate limiting            │
│  - TLS termination          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Entity Lifecycle Hooks     │
│  - beforeRead()             │
│  - afterRead()              │ ← Security enforcement
│  - beforeUpdate()           │
│  - afterUpdate()            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  PostgreSQL Database        │
│  - Encrypted at rest        │
│  - Tenant-scoped queries    │
└─────────────────────────────┘
```

### Entity-Based Access Control

**How It Works:**

1. User makes API request: `GET /loads/123`
2. Base44 authenticates JWT token
3. `beforeRead()` hook checks permissions
4. If authorized, database query executes
5. `afterRead()` hook redacts sensitive fields
6. Sanitized data returned to client

**Key Entities:**
- **Load** - Shipment records (pricing, routing)
- **Carrier** - Trucking companies
- **Driver** - Individual operators
- **Shipper** - Customers
- **AuditLog** - Immutable change tracking

### No Client-Trusted Logic

**What This Means:**

❌ **Never:**
- Check permissions in React components
- Hide UI elements to "enforce" security
- Store sensitive data in localStorage/sessionStorage
- Trust form validation from client

✅ **Always:**
- Enforce all rules server-side via hooks
- Use UI hiding for **usability only** (not security)
- Validate all input on the server
- Treat client as potentially hostile

**Example:**

```javascript
// Client (React) - UI only
{user.role === 'broker' && <Button>View Margin</Button>}
// This is for UX, not security!

// Server (Hook) - Real enforcement
afterRead(context, loads) {
  if (context.user.role !== 'broker') {
    loads.forEach(load => {
      delete load.customer_rate;  // Actually removed
      delete load.margin;
    });
  }
}
```

---

## 3. Identity & Access Management

### Authentication

**Base44 JWT Authentication:**

1. User logs in with email + password
2. Base44 issues signed JWT token
3. Token contains: `{ userId, email, role, exp }`
4. Client includes token in `Authorization: Bearer <token>` header
5. Base44 validates signature on every request

**Token Security:**
- Signed with secret key (HS256 or RS256)
- Short expiration (24 hours)
- Refresh tokens for long sessions
- Automatic revocation on logout

**Future Enhancement:**
- Multi-factor authentication (MFA) - Q1 2026
- SSO integration (SAML, OAuth) - Q2 2026

### Role-Based Access Control (RBAC)

**Defined Roles:**

| Role | Access Level | Primary Use Case |
|------|-------------|-----------------|
| **Admin** | Full system access | IT, system configuration |
| **Broker** | All broker operations, customer-facing data | Freight brokers, dispatchers |
| **Carrier** | Carrier operations, assigned loads only | Trucking companies |
| **Driver** | Driver portal, own trips only | Individual truck drivers |
| **Customer** | Customer portal, own shipments only | Shippers using self-service |

**Permission Matrix:**

| Action | Admin | Broker | Carrier | Driver | Customer |
|--------|-------|--------|---------|--------|----------|
| View customer rates | ✅ | ✅ | ❌ | ❌ | ❌ |
| View carrier pay | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create loads | ✅ | ✅ | ❌ | ❌ | ✅ |
| Update carrier pay | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update load status | ✅ | ✅ | ✅ | ✅ | ❌ |
| View audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ |

**Implementation:**

```javascript
// functions/auth/permissions.js
export const PERMISSIONS = {
  'load.read.all': ['admin', 'broker'],
  'load.read.assigned': ['carrier', 'driver'],
  'load.update.customer_rate': ['admin', 'broker'],
  'carrier.read.all': ['admin', 'broker'],
  // ...
};

export function hasPermission(user, permission) {
  return PERMISSIONS[permission]?.includes(user.role) || false;
}
```

### Tenant Isolation

**Multi-Tenancy Model:**

TMS.ai supports multiple independent customers on shared infrastructure with **strict data isolation**:

1. **Carrier Isolation:** Carrier A cannot see Carrier B's loads/drivers
2. **Customer Isolation:** Customer X cannot see Customer Y's shipments
3. **Driver Isolation:** Driver 1 cannot see Driver 2's trip details

**Enforcement Mechanism:**

```javascript
// Automatic tenant scoping on every query
beforeRead(context, query) {
  // Carrier can only see their assigned loads
  if (context.user.role === 'carrier') {
    query.carrier_id = context.user.carrier_id;
  }
  
  // Driver can only see their trips
  if (context.user.role === 'driver') {
    query.driver_id = context.user.driver_id;
  }
  
  return query; // Modified query enforced at DB level
}
```

**Cross-Tenant Attack Prevention:**

Even if an attacker obtains valid credentials, they cannot access another tenant's data:

```
❌ Attacker scenario:
- Carrier A user obtains valid JWT token
- Attempts: GET /loads?carrier_id=carrier_b_id
- Server hook rewrites query to: carrier_id=carrier_a_id
- Result: No data returned (or 403 Forbidden)
```

---

## 4. Data Protection & Redaction

### Pricing and Margin Protection

**Sensitive Financial Data:**

In freight brokerage, pricing is **highly confidential**:

- **Customer Rate:** What the shipper pays the broker
- **Carrier Pay:** What the broker pays the carrier
- **Margin:** Difference (customer_rate - carrier_pay)

**Business Rule:** Carriers must **never** see customer rates or margins.

### Server-Side Redaction

**How It Works:**

The `afterRead()` hook removes sensitive fields **before** the API response is sent:

```javascript
// functions/hooks/loadHooks.js
export async function afterRead(context, loads) {
  const userRole = context.user.role;
  
  // Broker-only fields
  const brokerOnlyFields = [
    'customer_rate',
    'margin',
    'margin_percentage',
    'customer_id',
    'broker_notes'
  ];
  
  // Redact for non-broker/admin roles
  if (!['admin', 'broker'].includes(userRole)) {
    loads.forEach(load => {
      brokerOnlyFields.forEach(field => {
        delete load[field]; // Field removed from response
      });
    });
  }
  
  return loads;
}
```

**Example API Response:**

```javascript
// Broker sees (GET /loads/123):
{
  "id": "load_123",
  "load_number": "L-2025-001",
  "customer_rate": 2500,        // ✅ Visible
  "carrier_pay": 2000,          // ✅ Visible
  "margin": 500,                // ✅ Visible
  "margin_percentage": 20,      // ✅ Visible
  "customer_id": "cust_456",    // ✅ Visible
  "status": "in_transit"
}

// Carrier sees (same request):
{
  "id": "load_123",
  "load_number": "L-2025-001",
  // customer_rate: ABSENT         ❌ Redacted
  "carrier_pay": 2000,          // ✅ Visible
  // margin: ABSENT                ❌ Redacted
  // margin_percentage: ABSENT     ❌ Redacted
  // customer_id: ABSENT           ❌ Redacted
  "status": "in_transit"
}
```

### Confidential Field Handling

**Field Classification:**

| Field Type | Visibility | Reason |
|------------|-----------|---------|
| `customer_rate` | Broker only | Protects broker margin |
| `carrier_pay` | Broker + Carrier | Carrier needs to know their pay |
| `margin` | Broker only | Calculated profit |
| `customer_id` | Broker only | Prevents carrier from going direct |
| `broker_notes` | Broker only | Internal operational notes |
| `driver_ssn` | Admin only | PII protection |
| `cdl_number` | Carrier + Driver | Required for operations |

**Redaction Testing:**

All redaction logic is covered by automated tests:

```javascript
// functions/__tests__/hooks/loadHooks.test.js
test('Carrier cannot see customer_rate', async () => {
  const carrierContext = { user: { role: 'carrier' } };
  const loads = [{ customer_rate: 2500, carrier_pay: 2000 }];
  
  const result = await afterRead(carrierContext, loads);
  
  expect(result[0].customer_rate).toBeUndefined(); // ✅ Redacted
  expect(result[0].carrier_pay).toBe(2000);        // ✅ Still visible
});
```

---

## 5. Validation & Business Logic Integrity

### Server-Side Validation

**Why Client Validation Isn't Enough:**

Client validation can be bypassed by:
- Modifying JavaScript in DevTools
- Sending direct API requests with curl/Postman
- Using browser extensions to manipulate forms

**TMS.ai Solution:**

All validation happens in `beforeCreate()` and `beforeUpdate()` hooks:

```javascript
// functions/hooks/loadHooks.js
export async function beforeCreate(context, load) {
  const errors = [];
  
  // Required fields
  if (!load.pickup_location?.city) {
    errors.push('Pickup city is required');
  }
  
  if (!load.equipment_type) {
    errors.push('Equipment type is required');
  }
  
  // Business rules (see next section)
  if (load.customer_rate < load.carrier_pay) {
    // Special handling...
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join('; '));
  }
  
  return load;
}
```

### Financial Integrity Checks

**Negative Margin Prevention:**

**Rule:** `customer_rate` must be ≥ `carrier_pay` (broker cannot lose money)

**Enforcement:**

```javascript
// Check for negative margin
if (load.customer_rate && load.carrier_pay) {
  if (load.customer_rate < load.carrier_pay) {
    // Admin can override (for special contracts)
    if (context.user.role !== 'admin') {
      throw new Error(
        'Customer rate ($' + load.customer_rate + ') ' +
        'cannot be less than carrier pay ($' + load.carrier_pay + ')'
      );
    } else {
      // Log admin override
      console.warn('Admin overriding negative margin check');
    }
  }
}
```

**Other Financial Validations:**

- Carrier cannot modify `customer_rate` field
- Rate changes logged to AuditLog
- Currency validation (USD only, for now)
- Positive numbers only for rates

### Status Lifecycle Enforcement

**Valid Status Transitions:**

```javascript
const VALID_TRANSITIONS = {
  'quote': ['available', 'cancelled'],
  'available': ['tendered', 'cancelled'],
  'tendered': ['assigned', 'cancelled'],
  'assigned': ['dispatched', 'cancelled'],
  'dispatched': ['picked_up', 'cancelled'],
  'picked_up': ['in_transit'],
  'in_transit': ['delivered'],
  'delivered': ['invoiced'],
  'invoiced': ['closed'],
  'cancelled': [], // Terminal state
  'closed': []     // Terminal state
};
```

**Enforcement:**

```javascript
beforeUpdate(context, load, changes) {
  // Status change validation
  if (changes.status && changes.status !== load.status) {
    const allowedNext = VALID_TRANSITIONS[load.status];
    
    if (!allowedNext.includes(changes.status)) {
      throw new Error(
        `Invalid status transition: ${load.status} → ${changes.status}`
      );
    }
  }
}
```

**Example:**

```
❌ Cannot transition delivered → assigned (backwards)
✅ Can transition delivered → invoiced (forward)
✅ Can transition any non-terminal → cancelled
```

---

## 6. Audit Logging & Monitoring

### Immutable Audit Logs

**What Gets Logged:**

Every write operation (create/update/delete) generates an audit log entry:

```javascript
// functions/audit/auditLogger.js
export async function logAudit(context, entityType, entityId, action, changes) {
  await base44.entities.AuditLog.create({
    entity_type: entityType,
    entity_id: entityId,
    action: action, // CREATE, UPDATE, DELETE, READ_DENIED
    actor_email: context.user.email,
    actor_role: context.user.role,
    changed_fields: changes.changed, // {field: {from, to}}
    before_values: changes.before,   // Full snapshot before
    after_values: changes.after,     // Full snapshot after
    ip_address: context.request.ip,
    user_agent: context.request.userAgent,
    timestamp: new Date().toISOString()
  });
}
```

**Example Audit Log:**

```json
{
  "id": "audit_789",
  "entity_type": "Load",
  "entity_id": "load_123",
  "action": "UPDATE",
  "actor_email": "broker@company.com",
  "actor_role": "broker",
  "changed_fields": {
    "customer_rate": {"from": 2000, "to": 2500},
    "status": {"from": "available", "to": "assigned"}
  },
  "before_values": {
    "customer_rate": 2000,
    "status": "available",
    "carrier_pay": 1800
  },
  "after_values": {
    "customer_rate": 2500,
    "status": "assigned",
    "carrier_pay": 1800
  },
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-12-30T14:23:45Z"
}
```

### Change Traceability

**Use Cases:**

1. **Compliance Audits:** Who changed what, when?
2. **Dispute Resolution:** Prove agreed rates
3. **Fraud Detection:** Identify suspicious patterns
4. **Debugging:** Trace how data changed over time
5. **Training:** Review user actions for coaching

**Querying Audit Logs:**

```javascript
// Get all changes to a specific load
const auditTrail = await base44.entities.AuditLog.filter({
  entity_type: 'Load',
  entity_id: 'load_123'
}, '-timestamp'); // Newest first

// Get all rate changes by a specific user
const rateChanges = await base44.entities.AuditLog.filter({
  actor_email: 'broker@company.com',
  'changed_fields.customer_rate': { $exists: true }
});

// Get all access denials (security events)
const denials = await base44.entities.AuditLog.filter({
  action: 'READ_DENIED'
});
```

### Incident Investigation Support

**Scenario: Unauthorized data access attempt**

1. Carrier attempts to access another carrier's load
2. `beforeRead()` hook denies access
3. Audit log entry created with `action: READ_DENIED`
4. Security team reviews logs daily
5. Pattern detected: 10+ failed attempts in 1 hour
6. Incident response triggered

**Audit Log for Security:**

```javascript
{
  "action": "READ_DENIED",
  "entity_type": "Load",
  "entity_id": "load_456",
  "actor_email": "carrier_a@company.com",
  "actor_role": "carrier",
  "metadata": {
    "reason": "Load not assigned to carrier",
    "attempted_access": "GET /loads/456",
    "carrier_id_mismatch": true
  },
  "ip_address": "198.51.100.22",
  "timestamp": "2025-12-30T10:15:30Z"
}
```

**Retention:**

- Audit logs retained for **7 years**
- Immutable: No edit or delete operations allowed
- Encrypted at rest
- Backed up daily

---

## 7. Import & Bulk Data Security

### CSV Import Validation

**Import Flow:**

1. User uploads CSV file
2. Client-side parsing (preview only)
3. Server-side validation via `CSVImportProcessor`
4. Dry-run mode (no commit)
5. User reviews validation results
6. Final commit (if no errors)

**Validation Layers:**

```javascript
// components/import/CSVImportProcessor.js

// Layer 1: Format validation
validateRow(entityType, row) {
  const schema = ENTITY_SCHEMAS[entityType];
  schema.requiredFields.forEach(field => {
    if (!row[field]) {
      errors.push(`${field} is required`);
    }
  });
}

// Layer 2: Business rules
if (entityType === 'Load') {
  if (row.customer_rate < row.carrier_pay) {
    errors.push('Negative margin not allowed');
  }
}

// Layer 3: Duplicate detection
const existing = await base44.entities[entityType].filter({
  [schema.uniqueKey]: row[schema.uniqueKey]
});
if (existing.length > 0) {
  warnings.push('Duplicate detected - will update');
}
```

### Dry-Run Enforcement

**Why Dry-Run Matters:**

Bulk imports can corrupt data if not validated first. TMS.ai requires a **dry-run** before commit.

**Process:**

```javascript
// Step 1: Dry-run (no database writes)
const dryRunResults = await dryRun(entityType, rows);
// Returns: { validRows: 45, invalidRows: 5, errors: [...] }

// Step 2: User reviews errors

// Step 3: Commit only if user confirms
if (userConfirms && dryRunResults.invalidRows === 0) {
  const commitResults = await commitImport(entityType, rows, {
    mode: 'upsert',
    strict: true
  });
}
```

**Strict Mode:**

- `strict: true` - Stop immediately if any error found
- `strict: false` - Skip invalid rows, import valid ones

### Duplicate & Fraud Prevention

**Duplicate Detection:**

```javascript
// Check for duplicates by unique key
// Carriers: mc_number
// Drivers: cdl_number
// Loads: load_number or customer_reference

const existing = await base44.entities.Carrier.filter({
  mc_number: row.mc_number
});

if (existing.length > 0) {
  if (mode === 'insert') {
    throw new Error('Duplicate MC number');
  } else if (mode === 'upsert') {
    // Update existing record
    toUpdate.push({ id: existing[0].id, data });
  }
}
```

**Fraud Prevention:**

1. **Rate validation:** Unusually high/low rates flagged
2. **Pattern detection:** Same carrier name, different MC numbers
3. **CDL validation:** Check digit algorithm
4. **Address validation:** USPS API integration (optional)

**Import Audit:**

Every import creates an `ImportRun` record:

```json
{
  "id": "import_456",
  "entity_type": "Carrier",
  "file_name": "carriers_2025_12.csv",
  "total_rows": 50,
  "valid_rows": 48,
  "invalid_rows": 2,
  "created": 35,
  "updated": 13,
  "errors_json": [
    {"row": 12, "field": "mc_number", "message": "Invalid format"},
    {"row": 27, "field": "insurance_expiry", "message": "Date in past"}
  ],
  "status": "completed",
  "imported_by_email": "admin@company.com",
  "timestamp": "2025-12-30T15:00:00Z"
}
```

---

## 8. Compliance Alignment

### SOC 2

**Trust Services Criteria Covered:**

| Criteria | Implementation | Evidence |
|----------|----------------|----------|
| **CC6.1** | RBAC enforcement | `functions/hooks/` |
| **CC6.2** | Role assignment | User management |
| **CC6.6** | Least privilege | Field redaction |
| **CC7.2** | Data integrity | Validation hooks |
| **CC7.3** | Security monitoring | Audit logs |
| **CC8.1** | Change management | Git + tests |

**Audit Readiness:**

- ✅ Controls implemented and tested
- ✅ Evidence collection guide available
- 📋 External audit scheduled Q2 2026

**Reference Documents:**
- `security-controls-mapping.md` - Full control mapping
- `SOC2_Evidence_Checklist.md` - Audit preparation
- `soc2-screenshot-evidence-guide.md` - Screenshot instructions

### ISO 27001

**Control Families Implemented:**

| ISO Control | Description | TMS.ai Implementation |
|-------------|-------------|----------------------|
| **A.5.15** | Access control policy | RBAC policy documented |
| **A.8.2** | Privileged access | Admin actions audited |
| **A.8.3** | Information access restriction | Field-level redaction |
| **A.8.15** | Logging | Immutable audit logs |
| **A.9.2** | User access management | Role-based scoping |
| **A.12.1** | Operational procedures | Validation enforcement |

**Certification Timeline:**
- Controls alignment: ✅ Complete
- Documentation: ✅ Complete
- External audit: 📋 Planned 2026

### NIST Alignment

**NIST 800-53 Rev 5 (Moderate Baseline):**

| Control Family | Implementation Status |
|----------------|----------------------|
| **AC** (Access Control) | ✅ Fully implemented |
| **AU** (Audit & Accountability) | ✅ Fully implemented |
| **IA** (Identification & Authentication) | ✅ Fully implemented |
| **SC** (System & Communications Protection) | ✅ TLS, encryption |
| **SI** (System & Information Integrity) | ✅ Input validation |

**Reference:** `security-controls-mapping.md` Section 3

---

## 9. Secure Development Lifecycle

### Automated Testing

**Test Coverage:**

```
functions/__tests__/
├── audit.test.js           # Audit logging tests
├── rbac.test.js            # Permission enforcement tests
├── validation.test.js      # Input validation tests
└── hooks/
    ├── loadHooks.test.js   # Load entity security tests
    ├── carrierHooks.test.js
    ├── driverHooks.test.js
    └── shipperHooks.test.js
```

**Security Test Categories:**

1. **RBAC Tests:**
   - Unauthorized role receives 403
   - Field redaction works correctly
   - Scope enforcement prevents cross-tenant access

2. **Validation Tests:**
   - Invalid data rejected
   - Business rules enforced
   - SQL injection prevention

3. **Audit Tests:**
   - All CRUD events logged
   - Access denials logged
   - Log immutability

**Example Test:**

```javascript
// functions/__tests__/hooks/loadHooks.test.js
describe('Load RBAC', () => {
  test('Carrier cannot see customer_rate', async () => {
    const context = { user: { role: 'carrier' } };
    const loads = [{ 
      customer_rate: 2500, 
      carrier_pay: 2000 
    }];
    
    const result = await afterRead(context, loads);
    
    expect(result[0].customer_rate).toBeUndefined();
    expect(result[0].carrier_pay).toBe(2000);
  });
  
  test('Carrier cannot update customer_rate', async () => {
    const context = { user: { role: 'carrier' } };
    const load = { customer_rate: 2500 };
    const changes = { customer_rate: 3000 };
    
    await expect(
      beforeUpdate(context, load, changes)
    ).rejects.toThrow('Unauthorized');
  });
});
```

**CI/CD Integration:**

- Tests run on every commit
- Pull request requires tests to pass
- No deployment without passing tests

### Change Management

**Development Workflow:**

1. **Feature Branch:** Developer creates feature branch
2. **Code + Tests:** Implement feature with security tests
3. **Peer Review:** Another developer reviews code
4. **CI Validation:** Automated tests + linting
5. **Approval:** Security-critical changes require senior approval
6. **Deployment:** Merge to main, auto-deploy to production

**Security Review Triggers:**

Changes to these areas require security review:
- Entity hooks (RBAC enforcement)
- Validation logic
- Authentication/authorization code
- Audit logging
- User role definitions

### Deployment Controls

**Pre-Deployment Checklist:**

- [ ] All tests passing
- [ ] Code review completed
- [ ] Security review (if applicable)
- [ ] Documentation updated
- [ ] Rollback plan documented

**Deployment Process:**

1. Deploy to staging environment
2. Run smoke tests
3. Security scan (if new dependencies)
4. Deploy to production
5. Monitor for errors (15 minutes)
6. Rollback if issues detected

**Rollback Capability:**

- Automated rollback if health checks fail
- Manual rollback via CI/CD dashboard
- Database migrations are reversible

---

## 10. Customer Responsibilities (Shared Responsibility Model)

### Credential Protection

**Customer Duties:**

1. **Strong Passwords:**
   - Minimum 8 characters
   - Mix of upper/lower/numbers/symbols
   - No password reuse
   - Change passwords every 90 days (recommended)

2. **Secure Storage:**
   - Do not share passwords
   - Use password manager
   - Do not write passwords down
   - Do not send passwords via email

3. **Account Security:**
   - Log out after use
   - Report compromised accounts immediately
   - Enable MFA when available

### Role Assignment Hygiene

**Best Practices:**

1. **Principle of Least Privilege:**
   - Assign minimum role needed
   - Review access quarterly
   - Remove access for departed employees

2. **Role Assignment Matrix:**
   - Document who should have what access
   - Approve role changes via workflow
   - Audit role assignments regularly

3. **Segregation of Duties:**
   - Don't give everyone admin access
   - Separate financial from operational roles
   - Use driver role for drivers only

**Example Policy:**

| User Type | Recommended Role | Rationale |
|-----------|------------------|-----------|
| Owner/CEO | Admin | Full system access needed |
| Dispatcher | Broker | Needs pricing visibility |
| Operations Manager | Broker | Needs carrier management |
| Carrier Contact | Carrier | Should not see customer rates |
| Truck Driver | Driver | Only needs trip details |
| Shipper Contact | Customer | Only their shipments |

### Data Accuracy

**Customer Responsibilities:**

1. **Data Entry:**
   - Verify MC/DOT numbers
   - Validate carrier insurance
   - Check driver CDL expiration dates
   - Confirm customer credit limits

2. **Data Maintenance:**
   - Update expired documents
   - Maintain carrier compliance files
   - Keep contact information current
   - Archive old/inactive records

3. **Data Quality:**
   - Use standardized formats (addresses, phone numbers)
   - Avoid duplicate entries
   - Validate imported data before commit
   - Report data inconsistencies

**Why This Matters:**

TMS.ai enforces **security**, but customers are responsible for **accuracy**:

- ✅ TMS.ai prevents unauthorized access to rates
- ❌ TMS.ai cannot verify if entered rate is correct
- ✅ TMS.ai prevents negative margins (validation)
- ❌ TMS.ai cannot verify if margin is profitable for your business

---

## 11. Conclusion

### Summary of Safeguards

TMS.ai implements **defense-in-depth security** with:

1. ✅ **Authentication** - JWT tokens, secure sessions
2. ✅ **Authorization** - RBAC enforced server-side
3. ✅ **Data Protection** - Field-level redaction, encryption
4. ✅ **Validation** - Business rules enforced server-side
5. ✅ **Audit Logging** - Immutable change tracking
6. ✅ **Tenant Isolation** - Multi-tenant data segregation
7. ✅ **Compliance** - SOC 2, ISO 27001, NIST alignment
8. ✅ **Testing** - Automated security tests
9. ✅ **Monitoring** - Security event detection

**Key Differentiators:**

- **Zero client trust** - All security server-side
- **Field-level security** - Granular data protection
- **Complete auditability** - Every action logged
- **Compliance-ready** - Built for SOC 2 from day one

### Trust Commitment

**TMS.ai Security Promise:**

1. **Transparency:** Open documentation of security practices
2. **Accountability:** Complete audit trail for all actions
3. **Continuous Improvement:** Regular security assessments
4. **Customer Partnership:** Shared responsibility model

**We Commit To:**

- Never trust the client for security decisions
- Always enforce access control server-side
- Log all security-relevant events
- Maintain compliance with industry standards
- Respond to security incidents within 24 hours
- Notify customers of breaches within 72 hours

**Get in Touch:**

- Security questions: security@tms.ai
- Compliance documentation: compliance@tms.ai
- Report vulnerabilities: security@tms.ai

---

## Appendix: Quick Reference

### Security Checklist for Customers

- [ ] Strong passwords for all users
- [ ] Roles assigned per least privilege
- [ ] Quarterly access reviews scheduled
- [ ] MFA enabled (when available)
- [ ] Data validation before import
- [ ] Audit logs reviewed monthly
- [ ] Incident response plan documented
- [ ] Employee security training completed

### Security Control Locations

| Control | Implementation File |
|---------|-------------------|
| RBAC | `functions/hooks/*.js` → `beforeRead/Update/Delete` |
| Redaction | `functions/hooks/*.js` → `afterRead` |
| Validation | `functions/hooks/*.js` → `beforeCreate/Update` |
| Audit Logging | `functions/audit/auditLogger.js` |
| Permissions | `functions/auth/permissions.js` |
| Scoping | `functions/middleware/authorize.js` |

### Related Documentation

- `security-whitepaper-outline.md` - Customer-facing whitepaper
- `security-controls-mapping.md` - SOC 2/ISO/NIST mapping
- `RBAC_Redaction_Appendix.md` - Detailed RBAC spec
- `role-data-visibility.md` - Quick reference matrix
- `SOC2_Evidence_Checklist.md` - Audit preparation

---

**Document Owner:** Security Team  
**Version:** 1.0  
**Status:** ✅ Active  
**Next Review:** March 31, 2026