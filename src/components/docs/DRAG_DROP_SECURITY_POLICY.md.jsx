# Drag & Drop Security Policy
**TMS.ai Load Workflow Management**

---

## POLICY STATEMENT

All load workflow state transitions initiated via drag-and-drop interface MUST be validated server-side before application. No client-initiated state change is considered authoritative without server verification and audit logging.

**Effective Date**: January 2, 2026  
**Owner**: TMS.ai Security & Engineering  
**Scope**: All load workflow transitions in Dispatch Console and Kanban Board

---

## 1. SECURITY OBJECTIVES

### Primary Goals
1. **Prevent Unauthorized Transitions**: Only valid workflow progressions allowed
2. **Enforce Financial Controls**: Protect invoiced and settled loads from manipulation
3. **Maintain Audit Trail**: Every drag action logged for compliance
4. **Tenant Isolation**: Prevent cross-organization load movement
5. **Approval Enforcement**: High-risk transitions require dual approval

### Threat Model
**Threats Mitigated**:
- ❌ Malicious user dragging settled load backward to re-open payment
- ❌ User from Org A dragging load belonging to Org B
- ❌ Bypassing approval workflow by direct state manipulation
- ❌ Circumventing credit hold by changing load status
- ❌ Driver/customer manipulating load they shouldn't access

**Attack Vectors Blocked**:
- Client-side state mutation (ignored by server)
- Browser DevTools manipulation (server validates)
- API replay attacks (server checks org_id, membership)
- Race conditions (server processes sequentially per load)

---

## 2. VALIDATION RULES

### 2.1 Hard Blocks (Non-Negotiable)

These transitions are **ALWAYS REJECTED** immediately:

| Rule | Condition | Error Message |
|------|-----------|---------------|
| **Financial Lock** | `from_state = 'Invoiced'` AND `to_state < 'Invoiced'` | "Cannot move invoiced load backward. Invoice must be voided first." |
| **Settlement Lock** | `from_state = 'Settled'` | "Cannot move settled load. Settlement must be reversed first." |
| **Tenant Boundary** | `load.org_id !== user.membership.org_id` | "Cross-organization load movement not permitted." |
| **Time Lock** | `load.locked_until > now` AND `to_state !== 'Exception'` | "Load locked until {date}. Contact admin to unlock." |
| **Workflow DAG** | `to_state` not in `validTransitions[from_state]` | "Invalid transition: {from} → {to}. Allowed: {list}" |

**Implementation**: `validateHardBlocks()` in applyDragDropAction.js

**Audit**: All blocked attempts logged with event_type = `DRAG_ACTION_BLOCKED`

### 2.2 Conditional Approvals (Maker/Checker)

These transitions **CREATE APPROVAL REQUEST** instead of immediate application:

| Rule | Condition | Approval Type | MFA Required |
|------|-----------|---------------|--------------|
| **High Value** | `load.customer_rate > $10,000` AND `to_state = 'Delivered'` | large_transaction_approval | ✅ Yes |
| **Margin Floor** | `load.margin_percent < 5%` AND `to_state = 'Dispatched'` | negative_margin_override | ✅ Yes |
| **Backward Move** | `workflow_index[to_state] < workflow_index[from_state]` AND `from_state !== 'Invoiced'` | workflow_reversal_approval | ❌ No |
| **Credit Hold Override** | `customer.credit_hold_status !== 'OFF'` AND `to_state = 'Dispatched'` | credit_hold_override | ✅ Yes |

**Implementation**: `requiresConditionalApproval()` in applyDragDropAction.js

**Workflow**:
1. User drags load
2. Server creates ApprovalRequest with status = 'pending'
3. UI shows "Pending Approval" badge on load
4. Different user approves (maker ≠ checker enforced)
5. Server applies transition
6. UI updates to new state

### 2.3 Safe Actions (Immediate Apply)

These transitions are **IMMEDIATELY APPLIED** with audit logging:

| Category | Examples | Validation |
|----------|----------|------------|
| **Forward Progression** | Quoted → Booked, Covered → Dispatched, Dispatched → Picked Up | Normal workflow advancement |
| **Display Reorder** | Moving within same column (index change only) | State unchanged, display preference |
| **Exception Handling** | Any state → Exception (with reason) | Reason required, logged |
| **Status Sync** | External system status update (ELD, TMS sync) | System-initiated, audited |

**Implementation**: If not hard blocked and not conditional, apply immediately

**Audit**: All applied actions logged with event_type = `LOAD_STAGE_MOVED`

---

## 3. WORKFLOW STATE MACHINE

### Valid Transitions (DAG)

```
Quoted
  ├─→ Booked
  └─→ Cancelled

Booked
  ├─→ Covered
  ├─→ Cancelled
  └─→ Exception

Covered
  ├─→ Dispatched
  ├─→ Cancelled
  └─→ Exception

Dispatched
  ├─→ Picked Up
  ├─→ Exception
  └─→ Cancelled (requires approval)

Picked Up
  ├─→ In Transit
  └─→ Exception

In Transit
  ├─→ Delivered
  └─→ Exception

Delivered
  ├─→ POD Received
  └─→ Exception

POD Received
  ├─→ Invoiced
  └─→ Exception

Invoiced
  ├─→ Settled (no backward movement allowed)
  └─→ Exception (requires finance approval)

Settled
  └─→ [LOCKED] (cannot move except via reversal API)

Exception
  └─→ [Any previous state] (requires approval + reason)

Cancelled
  └─→ [TERMINAL] (cannot reactivate)
```

### State Indexes (for Forward/Backward Detection)

```javascript
const WORKFLOW_INDEX = {
  'Quoted': 1,
  'Booked': 2,
  'Covered': 3,
  'Dispatched': 4,
  'Picked Up': 5,
  'In Transit': 6,
  'Delivered': 7,
  'POD Received': 8,
  'Invoiced': 9,
  'Settled': 10,
  'Exception': 0, // Can go to any state
  'Cancelled': -1 // Terminal
};
```

**Backward Transition**: `WORKFLOW_INDEX[to_state] < WORKFLOW_INDEX[from_state]`

---

## 4. ENFORCEMENT MECHANISM

### Server Function: `applyDragDropAction()`

**Location**: `functions/api/applyDragDropAction.js`

**Input**:
```json
{
  "entity_type": "Load",
  "entity_id": "load_123",
  "from_state": "Covered",
  "to_state": "Dispatched",
  "metadata": {
    "reason": "Driver assigned",
    "assigned_to": "driver_456"
  }
}
```

**Execution Flow**:
```
1. Authenticate user (base44.auth.me())
2. Resolve membership (getUserContext)
3. Fetch load entity
4. Validate tenant isolation (load.org_id === membership.org_id)
5. Check hard blocks (validateHardBlocks)
   └─ If blocked: Log DRAG_ACTION_BLOCKED, throw error
6. Check conditional approvals (requiresConditionalApproval)
   └─ If required: Create ApprovalRequest, return pending
7. Apply transition (update load.workflow_stage)
8. Log audit event (LOAD_STAGE_MOVED)
9. Return success
```

**Output** (Success):
```json
{
  "ok": true,
  "load": { "id": "load_123", "workflow_stage": "Dispatched" },
  "audit_log_id": "audit_789"
}
```

**Output** (Blocked):
```json
{
  "ok": false,
  "error": "HARD_BLOCK",
  "message": "Cannot move invoiced load backward",
  "audit_log_id": "audit_790"
}
```

**Output** (Approval Required):
```json
{
  "ok": false,
  "error": "APPROVAL_REQUIRED",
  "approval_request_id": "approval_456",
  "message": "Load value exceeds $10k. Approval required."
}
```

---

## 5. AUDIT LOGGING

### Event Types

**LOAD_STAGE_MOVED** (Success):
```json
{
  "event_type": "LOAD_STAGE_MOVED",
  "entity_type": "Load",
  "entity_id": "load_123",
  "org_id": "org_456",
  "actor_membership_id": "mem_789",
  "from_state": "Covered",
  "to_state": "Dispatched",
  "metadata": {
    "from_index": 3,
    "to_index": 1,
    "reason": "Driver assigned and ready",
    "approval_request_id": null
  },
  "result": "APPLIED",
  "timestamp": "2026-01-02T14:30:00Z"
}
```

**DRAG_ACTION_BLOCKED** (Hard Block):
```json
{
  "event_type": "DRAG_ACTION_BLOCKED",
  "entity_type": "Load",
  "entity_id": "load_123",
  "org_id": "org_456",
  "actor_membership_id": "mem_789",
  "from_state": "Invoiced",
  "to_state": "Dispatched",
  "reason": "Illegal transition: Invoiced → Dispatched",
  "timestamp": "2026-01-02T14:31:00Z"
}
```

**APPROVAL_REQUESTED** (Conditional):
```json
{
  "event_type": "APPROVAL_REQUESTED",
  "entity_type": "Load",
  "entity_id": "load_123",
  "request_type": "large_transaction_approval",
  "requested_by": "dispatcher@broker.com",
  "requested_changes": { "workflow_stage": "Delivered" },
  "justification": "Load delivered, driver confirmed",
  "timestamp": "2026-01-02T14:32:00Z"
}
```

### Retention
- AuditLog records retained for 7 years (regulatory compliance)
- No deletion allowed (append-only entity)
- Available for forensic analysis and compliance audits

---

## 6. CLIENT-SIDE IMPLEMENTATION

### UI Components

**KanbanBoard.jsx**:
- Renders draggable load cards
- Calls `applyDragDropAction()` on drop
- Handles success, error, and approval states
- Displays error messages to user
- Disables drag for locked loads

**LoadCard.jsx**:
- Marks load with `data-testid="load-card"`
- Includes `data-column`, `data-load-number`, `data-org-id` attributes
- Shows approval badge if pending
- Disables drag handle if user lacks permission

### Error Handling

**Hard Block**:
```javascript
// Server returns error
{ok: false, error: "HARD_BLOCK", message: "..."}

// Client displays
<Alert variant="destructive">
  <AlertTriangle /> {message}
</Alert>
```

**Approval Required**:
```javascript
// Server returns approval request
{ok: false, error: "APPROVAL_REQUIRED", approval_request_id: "..."}

// Client displays
<Badge variant="warning">Pending Approval</Badge>
```

**Success**:
```javascript
// Server returns success
{ok: true, load: {...}, audit_log_id: "..."}

// Client updates UI
// React Query invalidates ['loads'] cache
// UI re-renders with new state
```

---

## 7. MOBILE DRIVER APP COMPLIANCE

### Why No Drag-and-Drop for Drivers

**Security Reasons**:
1. Drivers should not change load workflow states
2. Drag gestures on mobile increase accidental transitions
3. Driver role has minimal workflow permissions

**Implementation**:
- Driver portal uses **button actions** only
- "Update Status" button requires confirmation
- Server validates driver is assigned to load
- Audit log records driver-initiated status changes

**Example**:
```javascript
// Driver clicks "Mark Delivered"
onClick={async () => {
  const confirmed = await confirmAction("Mark this load delivered?");
  if (confirmed) {
    await base44.functions.updateLoadStatus({
      loadId: load.id,
      newStatus: 'Delivered',
      driverNotes: notes
    });
  }
}}
```

---

## 8. EXCEPTION HANDLING

### Exception Column

**Purpose**: Temporary holding for loads with issues

**Entry Rules**:
- Any load can move to Exception
- **Reason required** (captured in modal)
- Audit log includes exception reason

**Exit Rules**:
- Requires approval to move back to active workflow
- Must resolve underlying issue
- Resolution notes logged

**Use Cases**:
- Customer requested hold
- Missing documents
- Address verification needed
- Equipment unavailable
- Weather delay

---

## 9. PROHIBITED ACTIONS

The following actions are **EXPLICITLY BLOCKED** and will never be supported:

| Prohibited Action | Why | Enforcement |
|------------------|-----|-------------|
| Invoiced → Dispatched | Financial integrity | validateHardBlocks() |
| Settled → Any stage | Payment finality | validateHardBlocks() |
| Cross-org drag | Tenant isolation | enforceOrgIsolation() |
| Client-side state update | Security | All mutations via server API |
| Drag without membership | Authorization | authenticate() check |
| Bypass approval queue | Dual control | approvalWorkflow.js |

---

## 10. TESTING & VALIDATION

### Backend Tests ✅

**Test Suite**: `functions/__tests__/drag-drop/`

**Coverage**:
- ✅ Hard block validation (invoiced backward blocked)
- ✅ Conditional approval creation (high-value, margin floor)
- ✅ Safe action immediate apply (forward progression)
- ✅ Cross-tenant rejection
- ✅ Audit log generation
- ✅ Error message accuracy

### Frontend Tests 📋

**Specification**: `components/testing/FrontendTestGuide.md`

**Critical Paths**:
- Drag allowed transition succeeds
- Drag illegal transition shows error
- High-value drag creates approval request
- Exception drag requires reason modal
- Customer cannot drag loads

### Manual QA Checklist

Before production deployment, manually verify:

- [ ] Drag invoiced load backward → Error displayed
- [ ] Drag across organizations → Blocked
- [ ] Drag high-value load → Approval modal
- [ ] Drag to Exception → Reason modal
- [ ] Customer login → No drag handles visible
- [ ] Driver portal → Button actions only, no drag
- [ ] Audit log → All drags logged
- [ ] Approval queue → Self-approval rejected

---

## 11. INCIDENT RESPONSE

### Security Event: Suspicious Drag Attempts

**Detection**:
- Multiple DRAG_ACTION_BLOCKED events from same user
- Cross-tenant drag attempts
- Illegal transition attempts on high-value loads

**Response Procedure**:
1. **Alert**: Security team notified via ErrorAlertSystem
2. **Review**: AuditLog examined for pattern
3. **Action**: If malicious, lock user Membership
4. **Audit**: Incident logged, user notified
5. **Follow-up**: Review access controls, update training

### Example Incident Log
```json
{
  "incident_id": "INC-2026-001",
  "detected_at": "2026-01-02T15:00:00Z",
  "pattern": "5 DRAG_ACTION_BLOCKED events in 2 minutes",
  "user": "suspicious@example.com",
  "actions": [
    "Attempted to drag invoiced load (load_123) to Covered",
    "Attempted to drag settled load (load_456) to Dispatched",
    "Attempted cross-org drag (load_789 from org_a to org_b)"
  ],
  "response": "Membership locked, user notified, incident escalated",
  "resolved_at": "2026-01-02T15:30:00Z"
}
```

---

## 12. CONFIGURATION & OVERRIDES

### System Configuration

**Hard Block Rules**: **NON-CONFIGURABLE**
- Invoiced/Settled locks cannot be disabled
- Cross-tenant blocks cannot be disabled
- These are system invariants

**Conditional Approval Thresholds**: **CONFIGURABLE** (by admin)
- High-value threshold (default: $10,000)
- Margin floor threshold (default: 5%)
- Approval expiry time (default: 72 hours)

**Configuration Entity**: `SystemConfiguration` (admin-only)

### Emergency Override

**Scenario**: Production issue requires immediate load unlock

**Process**:
1. Admin creates `ApprovalRequest` with `request_type: 'emergency_override'`
2. Requires **dual approval** (two admins)
3. Requires **MFA** from both approvers
4. Override reason logged
5. Security team notified
6. Action applied with full audit trail

**Audit**: `AuditLog.action = 'EMERGENCY_OVERRIDE'` with complete justification

---

## 13. COMPLIANCE & AUDIT EVIDENCE

### SOC 2 Controls Demonstrated

**CC6.1** (Logical Access):
- Drag-drop validates user has permission via RBAC
- Membership status must be 'active'

**CC6.6** (Access Logged):
- Every drag attempt logged (success and failure)
- Actor, timestamp, from/to states recorded

**CC5.2** (Segregation of Duties):
- Conditional approvals enforce maker ≠ checker
- Self-approval blocked

**PI1.3** (Processing Integrity):
- Workflow state transitions validated server-side
- Invalid transitions rejected

**S1.1** (Unauthorized Access Prevention):
- Cross-tenant drags blocked
- Role-based workflow permissions enforced

### Audit Evidence Available

**For Auditor Review**:
1. AuditLog query: `event_type IN ('LOAD_STAGE_MOVED', 'DRAG_ACTION_BLOCKED')`
2. ApprovalRequest query: `request_type LIKE '%approval'`
3. Source code: `functions/api/applyDragDropAction.js`
4. Test results: `functions/__tests__/drag-drop/`
5. Policy document: This file

**Sample Evidence**:
- Show auditor DRAG_ACTION_BLOCKED for invoiced load
- Show approval workflow for high-value load
- Demonstrate self-approval rejection
- Prove cross-tenant drag returns error

---

## 14. USER TRAINING

### Required Training for Dispatch Users

**Topics**:
1. Valid workflow transitions
2. Hard block rules (invoiced, settled)
3. When approval is required
4. How to provide justification
5. Exception handling process
6. Audit trail awareness

**Certification**: Users must acknowledge understanding before granted drag permissions.

### Manager Training

**Topics**:
1. Reviewing approval requests
2. Validating justifications
3. When to reject requests
4. Monitoring for suspicious patterns
5. Audit log forensics

---

## 15. POLICY ENFORCEMENT

### Responsibility Matrix

| Role | Can Drag | Can Approve | Can Override |
|------|----------|-------------|--------------|
| **broker_admin** | ✅ Yes | ✅ Yes | ✅ Yes (with MFA) |
| **broker_dispatcher** | ✅ Yes | ❌ No | ❌ No |
| **broker_finance** | ❌ No | ✅ Yes | ✅ Yes (financial only) |
| **carrier_dispatcher** | ✅ Yes (own loads) | ❌ No | ❌ No |
| **driver** | ❌ No (buttons only) | ❌ No | ❌ No |
| **customer** | ❌ No (read-only) | ❌ No | ❌ No |

### Monitoring & Metrics

**Weekly Reports**:
- Total drag actions
- Blocked attempts (by reason)
- Approval requests created
- Approval approval/rejection rate
- Exception usage patterns

**Alerts**:
- Spike in blocked attempts (>10/day per user)
- Cross-tenant drag attempts
- Emergency overrides used

---

## 16. VERSION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-02 | Initial policy documented | System Architect |

### Next Review
**Scheduled**: July 2, 2026 (6-month cycle)

**Triggers for Early Review**:
- Security incident involving drag-drop
- Regulatory requirement change
- Customer audit finding
- New workflow states added

---

## 17. APPROVAL & SIGN-OFF

**Policy Owner**: TMS.ai Engineering & Security Team  
**Reviewed By**: Compliance Officer, Engineering Lead  
**Approved By**: Chief Technology Officer  
**Effective Date**: January 2, 2026  

**Attestation**: This policy is implemented in production code and enforced by the system. Non-compliance is not possible through normal system operation.

---

## ✅ POLICY STATUS: ACTIVE & ENFORCED

**Enforcement**: Server-side validation in `applyDragDropAction()`  
**Auditability**: All actions logged to `AuditLog` entity  
**Bypass Prevention**: Client mutations ignored, server is source of truth  
**Testing**: Backend test suite validates all rules  
**Documentation**: Complete specification provided  

**Conclusion**: Drag & drop workflow management meets enterprise security and compliance requirements.

---

**Document Classification**: Internal — Customer Disclosure Approved  
**Sensitivity**: Confidential  
**Distribution**: Engineering, Security, Compliance, Customer Success