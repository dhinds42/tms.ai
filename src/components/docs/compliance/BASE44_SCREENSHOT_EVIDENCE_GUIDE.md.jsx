# BASE44 DASHBOARD SCREENSHOT EVIDENCE GUIDE
**Purpose:** Capture server-side compliance proof for audit  
**Date:** 2026-01-04  
**App:** Dual TMS.ai (app ID: 690ad9e79a3ab2ecec0ce973)

---

## INSTRUCTIONS

1. Login to Base44 Dashboard: https://app.base44.com
2. Navigate to your app: **Dual TMS.ai**
3. Capture each screenshot below
4. Include **timestamp** and **environment name** in every screenshot
5. Save as: `screenshot-{number}-{name}.png`

---

## SCREENSHOT 1: BACKEND FUNCTIONS ENABLED

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Settings → Backend Functions
```

**Must Show:**
- ✅ "Backend Functions: **ENABLED**" status indicator
- List of registered functions/hooks visible
- Environment name (Production/Staging)
- Timestamp (browser time or system time visible)

**Proves Control:** Server-side hooks are active and executing

**File Name:** `screenshot-1-backend-functions-enabled.png`

---

## SCREENSHOT 2: ENTITY HOOKS REGISTRATION

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Entities → [Select Entity] → Hooks
```

**Capture for EACH Critical Entity:**

### 2A: Load Entity Hooks
- beforeRead hook: **ACTIVE**
- beforeUpdate hook: **ACTIVE**
- afterRead hook: status (if present)

**File Name:** `screenshot-2a-load-entity-hooks.png`

### 2B: Invoice Entity Hooks
- beforeRead hook: **ACTIVE**
- afterRead hook: status (if present)

**File Name:** `screenshot-2b-invoice-entity-hooks.png`

### 2C: Settlement Entity Hooks
- beforeRead hook: **⚠️ EXPECTED MISSING** (document as gap)
- Any registered hooks visible

**File Name:** `screenshot-2c-settlement-entity-hooks.png`

### 2D: ApprovalRequest Entity Hooks
- All registered hooks visible
- beforeCreate/beforeUpdate status

**File Name:** `screenshot-2d-approval-entity-hooks.png`

**Proves Control:** Entity-level authorization and tenant isolation enforcement

---

## SCREENSHOT 3: AUTHENTICATION SETTINGS

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Settings → Authentication
OR
Dashboard → Settings → Security → Authentication
```

**Must Show:**
- MFA requirement settings (enabled/disabled/conditional)
- MFA enforcement for privileged roles
- Session timeout configuration
- Password policy settings
- Environment name
- Timestamp

**Proves Control:** MFA enforcement for sensitive operations

**File Name:** `screenshot-3-auth-mfa-settings.png`

---

## SCREENSHOT 4: AUDIT LOG CONFIGURATION

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Audit Logs
OR
Dashboard → Apps → Dual TMS.ai → Settings → Audit
```

**Must Show:**
- Audit logging: **ENABLED** status
- Retention period (days)
- Log level configuration
- Sample audit records visible (if available)
- Entity types being logged
- Environment name
- Timestamp

**Proves Control:** Immutable audit trail active

**File Name:** `screenshot-4-audit-log-config.png`

---

## SCREENSHOT 5: SAMPLE AUDIT RECORDS

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Audit Logs → View Logs
```

**Must Show:**
- Recent audit log entries visible
- Event types: CREATE, UPDATE, READ_DENIED, APPROVAL_GRANTED
- Actor email/user visible
- Entity type and entity ID visible
- Before/after values (if present)
- Timestamp of events
- Environment name

**Proves Control:** Audit events are being captured and persisted

**File Name:** `screenshot-5-audit-log-sample.png`

---

## SCREENSHOT 6: SCHEDULED JOBS / CRON CONFIGURATION

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Scheduled Functions
OR
Dashboard → Apps → Dual TMS.ai → Cron Jobs
```

**Must Show:**
- `weeklyThresholdTuning` job: schedule and status
- `dailyPolicyAlerts` job: schedule and status
- Last run timestamp for each job
- Success/failure status
- Next scheduled run time
- Environment name
- Current timestamp

**Proves Control:** Background jobs are configured and executing

**File Name:** `screenshot-6-scheduled-jobs.png`

---

## SCREENSHOT 7: ROLE-BASED ACCESS CONTROL (RBAC)

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Entities → Role
OR
Dashboard → Apps → Dual TMS.ai → Settings → User Management
```

**Must Show:**
- Role entity with sample data visible
- Permission entity with sample permissions
- RolePermission mappings visible
- UserRole assignments visible
- Environment name
- Timestamp

**Proves Control:** Entity-backed RBAC is configured

**File Name:** `screenshot-7-rbac-entities.png`

---

## SCREENSHOT 8: ORGANIZATION & TENANT ISOLATION

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Entities → Organization
AND
Dashboard → Apps → Dual TMS.ai → Entities → Membership
```

**Must Show:**
- Multiple organizations visible (if multi-tenant)
- Organization entity with org_id field visible
- Membership entity showing org assignments
- org_id present in entity schemas
- Environment name
- Timestamp

**Proves Control:** Multi-tenant data isolation is enforced

**File Name:** `screenshot-8-tenant-isolation.png`

---

## SCREENSHOT 9: FIELD REDACTION POLICIES

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Entities → FieldRedactionPolicy
```

**Must Show:**
- FieldRedactionPolicy entity with sample policies
- Policies showing entity_name, role_key, hidden_fields
- Priority values visible
- is_active status visible
- Environment name
- Timestamp

**Proves Control:** Privacy-by-design field redaction configured

**File Name:** `screenshot-9-field-redaction-policies.png`

---

## SCREENSHOT 10: APPROVAL REQUEST WORKFLOW

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Entities → ApprovalRequest
```

**Must Show:**
- Sample ApprovalRequest records visible
- Status values: pending, approved, rejected, applied
- request_type field showing: bank_account_change, negative_margin_override, etc.
- approved_by ≠ requested_by (dual-control proof)
- requires_mfa field visible
- Environment name
- Timestamp

**Proves Control:** Dual-control maker/checker workflow active

**File Name:** `screenshot-10-approval-requests.png`

---

## SCREENSHOT 11: DATA RETENTION POLICY

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Entities → DataRetentionPolicy
OR
Dashboard → Apps → Dual TMS.ai → Settings → Data Retention
```

**Must Show:**
- DataRetentionPolicy entity (if configured)
- Retention rules visible
- Scheduled deletion jobs (if present)
- ⚠️ **IF MISSING:** Document as gap
- Environment name
- Timestamp

**Proves Control:** Regulatory data retention compliance

**File Name:** `screenshot-11-data-retention.png`

---

## SCREENSHOT 12: ENVIRONMENT INFORMATION

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Settings → General
```

**Must Show:**
- App name: **Dual TMS.ai**
- App ID: **690ad9e79a3ab2ecec0ce973**
- Environment: **Production** or **Staging**
- Backend functions version (if shown)
- Base44 platform version
- Deployment status
- Current timestamp

**Proves Control:** Environment identification

**File Name:** `screenshot-12-environment-info.png`

---

## SCREENSHOT 13: FUNCTION LOGS (RECENT EXECUTION)

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Functions → Logs
OR
Dashboard → Apps → Dual TMS.ai → Monitoring → Function Logs
```

**Must Show:**
- Recent function executions visible
- Function names: Load.beforeRead, Invoice.beforeRead, etc.
- Execution status (success/error)
- Execution duration
- Timestamp of executions
- Error messages (if any)

**Proves Control:** Server-side hooks are executing in production

**File Name:** `screenshot-13-function-execution-logs.png`

---

## EVIDENCE COMPILATION CHECKLIST

After capturing all screenshots:

- [ ] All 13 screenshots captured
- [ ] Every screenshot shows **environment name**
- [ ] Every screenshot shows **timestamp**
- [ ] Screenshots are named per file naming convention
- [ ] High resolution (readable text)
- [ ] No sensitive data exposed (redact if needed)
- [ ] Compiled into ZIP file: `base44-compliance-screenshots-2026-01-04.zip`

---

## LABELING TEMPLATE

For each screenshot, create a companion `.txt` file with:

```
SCREENSHOT: {number} - {name}
DATE CAPTURED: 2026-01-04 HH:MM:SS
ENVIRONMENT: Production / Staging
APP ID: 690ad9e79a3ab2ecec0ce973

CONTROL PROVED:
{Description of what security control this screenshot evidences}

COMPLIANCE REQUIREMENT:
{Which audit requirement this satisfies: SOC2 CC6.1, etc.}

NOTES:
{Any observations, gaps, or concerns visible in screenshot}
```

**Example:**
```
SCREENSHOT: 1 - Backend Functions Enabled
DATE CAPTURED: 2026-01-04 14:32:15 EST
ENVIRONMENT: Production
APP ID: 690ad9e79a3ab2ecec0ce973

CONTROL PROVED:
Server-side backend functions are enabled and active. This proves that 
entity hooks (beforeRead, beforeUpdate, afterRead) are executing on the 
server and cannot be bypassed by client-side code.

COMPLIANCE REQUIREMENT:
- SOC2 CC6.1: Logical access controls
- SOC2 CC6.6: Authorization enforcement
- ISO 27001 A.9.4.1: Information access restriction

NOTES:
Status shows "ENABLED" with green indicator. 23 functions registered.
Last deployment: 2026-01-03 22:14:00 UTC.
```

---

## ALTERNATE: BASE44 FUNCTIONS EXPORT

If Base44 supports function export, capture this instead:

**Navigation Path:**
```
Dashboard → Apps → Dual TMS.ai → Settings → Backend Functions → Export
```

**Export Contains:**
- All function source code
- Hook registrations
- Scheduled job configurations
- Entity policies

**Export File:** `dual-tms-functions-export-2026-01-04.zip`

---

## IF SCREENSHOTS NOT AVAILABLE

If Base44 dashboard does not provide UI for these settings:

1. **Contact Base44 Support:**
   - Request compliance evidence export
   - Ask for attestation letter confirming:
     - Backend functions are enabled
     - Hooks are registered and active
     - Audit logging is enabled
     - MFA enforcement is configured

2. **Alternative Evidence:**
   - Base44 deployment logs showing function registration
   - Base44 API responses showing hook execution
   - Base44 platform SOC2 report (if available)

---

## FINAL DELIVERABLE

Create folder structure:
```
base44-compliance-evidence/
├── screenshots/
│   ├── screenshot-1-backend-functions-enabled.png
│   ├── screenshot-1-backend-functions-enabled.txt
│   ├── screenshot-2a-load-entity-hooks.png
│   ├── screenshot-2a-load-entity-hooks.txt
│   ├── ... (all screenshots + labels)
├── exports/
│   └── dual-tms-functions-export-2026-01-04.zip
├── attestations/
│   └── base44-platform-attestation.pdf
└── README.md (this guide)
```

ZIP entire folder and attach to compliance evidence pack.

---

## QUESTIONS FOR BASE44 SUPPORT

If any of the above is not visible in the dashboard:

1. How do we verify backend functions are enabled in production?
2. Where can we view registered entity hooks and their status?
3. How do we access audit log configuration and retention settings?
4. Where are scheduled job configurations visible?
5. How do we export all backend functions for compliance review?
6. Does Base44 provide a compliance evidence export feature?
7. Can Base44 provide attestation of platform security controls?

**Support Contact:** support@base44.com or in-app chat

---

## COMPLETION

Once all screenshots are captured and labeled:

1. Update `COMPLIANCE_EVIDENCE_PACK_2026.md` Section 2 with screenshot references
2. Update entity coverage table with confirmed hook status
3. Update P0 blockers based on screenshot findings
4. Re-issue compliance opinion based on complete evidence

---

**Generated By:** Base44 Compliance Evidence Generator  
**Last Updated:** 2026-01-04  
**Classification:** INTERNAL USE - AUDIT EVIDENCE