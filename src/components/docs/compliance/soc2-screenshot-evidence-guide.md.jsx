# SOC 2 Screenshot Evidence Collection Guide
**TMS.ai Compliance Documentation**  
**Purpose:** Step-by-step guide for capturing audit evidence  
**Last Updated:** 2025-12-30  
**Version:** 1.0

---

## Overview

This guide provides exact instructions for capturing screenshots and evidence for SOC 2 Type II audits. Follow each section to build a complete evidence package.

**Evidence Folder Structure:**
```
SOC2_Screenshots/
├── A_Access_Control/
├── B_RBAC_Enforcement/
├── C_Server_Validation/
├── D_Audit_Logging/
├── E_Change_Management/
└── F_Evidence_Retention/
```

---

## A. Access Control (CC6.x)

### A1. User Authentication

**Control:** CC6.1 – Logical access restricted to authorized users

**Screenshots Needed:**

1. **Login Screen**
   - 📸 Capture: TMS.ai login page showing authentication required
   - 📍 URL: `[your-app-url]/login`
   - 💾 Save as: `A1_login_screen.png`

2. **Logged-in User Profile - Broker Role**
   - 📸 Capture: User profile/header showing:
     - User email
     - Role badge: "Broker"
     - Operating mode indicator
   - 📍 Where: Dashboard or Settings page
   - 💾 Save as: `A1_broker_profile.png`

3. **Logged-in User Profile - Carrier Role**
   - 📸 Capture: Same as above, showing "Carrier" role
   - 📍 Where: Dashboard (toggle operating mode if needed)
   - 💾 Save as: `A1_carrier_profile.png`

4. **Logged-in User Profile - Driver Role**
   - 📸 Capture: TMS-B dashboard showing driver role
   - 📍 Where: TMS-B (driver-facing) interface
   - 💾 Save as: `A1_driver_profile.png`

**Evidence Notes:**
- Shows authentication required before system access
- Demonstrates role identification and display
- Proves user identity verification

---

### A2. Role Assignment

**Control:** CC6.2 – Role-based authorization

**Screenshots Needed:**

1. **User Management Interface**
   - 📸 Capture: User list showing columns:
     - Email
     - Full Name
     - Role (admin/broker/carrier/driver)
     - Status (active/inactive)
   - 📍 Where: `Settings` → `User Roles` page
   - 💾 Save as: `A2_user_management.png`

2. **Role Assignment Details**
   - 📸 Capture: Individual user record showing:
     - Assigned role
     - Permissions inherited from role
     - Assignment date (if available)
   - 📍 Where: User detail modal/page
   - 💾 Save as: `A2_role_assignment.png`

**Evidence Notes:**
- Demonstrates centralized user and role management
- Shows role enforcement at user level
- Proves authorization controls in place

---

## B. RBAC Enforcement (CC6.6)

### B1. Broker vs Carrier Data Visibility

**Control:** CC6.6 – Least privilege enforcement (field-level redaction)

**Screenshots Needed:**

#### Broker View (Full Data)

1. **Load Details - Broker View**
   - 📸 Capture: Load detail page showing:
     - ✅ `customer_rate`: $2,500
     - ✅ `carrier_pay`: $2,000
     - ✅ `margin`: $500 (20%)
     - ✅ Customer name
   - 📍 Where: Load Board → Select any load
   - 🔐 Logged in as: Broker or Admin
   - 💾 Save as: `B1_broker_full_data.png`

2. **Network Tab - Broker API Response**
   - 📸 Capture: Browser DevTools → Network tab showing:
     - API endpoint: `/loads/[id]`
     - Response JSON containing:
       ```json
       {
         "customer_rate": 2500,
         "carrier_pay": 2000,
         "margin": 500,
         "customer_id": "..."
       }
       ```
   - 📍 Where: Browser DevTools (F12) → Network → XHR
   - 💾 Save as: `B1_broker_api_response.png`

#### Carrier View (Redacted Data)

3. **Load Details - Carrier View**
   - 📸 Capture: Same load, but showing:
     - ❌ `customer_rate` field **absent**
     - ❌ `margin` field **absent**
     - ✅ `carrier_pay`: $2,000 (visible)
     - ❌ Customer name **hidden** (only generic label)
   - 📍 Where: Load Board (operating mode: Carrier)
   - 🔐 Logged in as: Carrier role
   - 💾 Save as: `B1_carrier_redacted_ui.png`

4. **Network Tab - Carrier API Response**
   - 📸 Capture: Browser DevTools showing:
     - API endpoint: `/loads/[id]`
     - Response JSON **without**:
       ```json
       {
         "carrier_pay": 2000,
         // customer_rate: ABSENT
         // margin: ABSENT
         // customer_id: ABSENT
       }
       ```
   - 📍 Where: Browser DevTools (F12) → Network → XHR
   - 💾 Save as: `B1_carrier_api_redacted.png`

**Evidence Notes:**
- **Critical Evidence:** Shows server-side redaction working
- Demonstrates least privilege: carriers see only their data
- Network tab proves redaction happens server-side (not just UI hiding)

---

### B2. Unauthorized Access Denial

**Control:** CC6.1 – Prevent unauthorized access

**Screenshots Needed:**

1. **UI Access Denial**
   - 📸 Capture: Error message when carrier attempts broker-only action:
     - "Unauthorized: Insufficient permissions"
     - 403 Forbidden status
   - 📍 Where: Attempt to access `/Settings` → `User Roles` as carrier
   - 💾 Save as: `B2_ui_access_denied.png`

2. **API Access Denial**
   - 📸 Capture: Browser DevTools or Postman showing:
     - API endpoint: `/loads/[other-carrier-load-id]`
     - Status: `403 Forbidden`
     - Response: `{"error": "Unauthorized access"}`
   - 📍 Where: Carrier attempting to access another carrier's load
   - 💾 Save as: `B2_api_403_response.png`

3. **Rate Modification Denial (Carrier)**
   - 📸 Capture: Error when carrier tries to update `customer_rate`:
     - "Forbidden: Cannot modify customer rate"
     - Form field disabled or API error
   - 📍 Where: Load edit form (carrier role)
   - 💾 Save as: `B2_rate_modification_denied.png`

**Evidence Notes:**
- Shows unauthorized actions are blocked
- Demonstrates defense in depth (UI + API enforcement)
- Proves access control cannot be bypassed

---

## C. Server-Side Validation (CC7.2)

### C1. Invalid Business Rule Rejection

**Control:** CC7.2 – Input validation and processing integrity

**Screenshots Needed:**

1. **Negative Margin Prevention**
   - 📸 Capture: Error when creating load with:
     - `customer_rate`: $2,000
     - `carrier_pay`: $2,500
     - Error: "Customer rate must be >= carrier pay"
   - 📍 Where: Load creation modal (broker view)
   - 💾 Save as: `C1_negative_margin_error.png`

2. **Required Field Validation**
   - 📸 Capture: Error when submitting incomplete load:
     - Missing `pickup_location`
     - Error: "Pickup location is required"
   - 📍 Where: Load creation modal
   - 💾 Save as: `C1_required_field_error.png`

3. **Date Validation**
   - 📸 Capture: Error when delivery_date < pickup_date:
     - Error: "Delivery date must be after pickup date"
   - 📍 Where: Load creation modal
   - 💾 Save as: `C1_date_validation_error.png`

4. **Status Transition Rejection**
   - 📸 Capture: Error when invalid status change:
     - Current: "delivered"
     - Attempted: "assigned"
     - Error: "Invalid status transition"
   - 📍 Where: Load detail page → Status dropdown
   - 💾 Save as: `C1_status_transition_error.png`

**Evidence Notes:**
- Shows server-side business rules enforced
- Demonstrates data integrity protection
- Proves validation cannot be bypassed via API

---

## D. Audit Logging (CC7.2 / CC7.3)

### D1. Audit Log Record

**Control:** CC7.2 – Change monitoring and traceability

**Screenshots Needed:**

1. **Audit Log Entry - Load Creation**
   - 📸 Capture: AuditLog table row showing:
     - `entity_type`: "Load"
     - `entity_id`: "load_123"
     - `action`: "CREATE"
     - `actor_email`: "broker@example.com"
     - `actor_role`: "broker"
     - `timestamp`: "2025-12-30 14:23:45"
     - `after_values`: {...}
   - 📍 Where: Audit Trail page (admin view)
   - 💾 Save as: `D1_audit_load_create.png`

2. **Audit Log Entry - Load Update**
   - 📸 Capture: AuditLog showing:
     - `action`: "UPDATE"
     - `changed_fields`: {"customer_rate": {"from": 2000, "to": 2500}}
     - `before_values`: {...}
     - `after_values`: {...}
   - 📍 Where: Audit Trail page
   - 💾 Save as: `D1_audit_load_update.png`

3. **Audit Log Filtering**
   - 📸 Capture: Audit Trail page with filters:
     - Filter by entity_type: "Load"
     - Filter by actor: "broker@example.com"
     - Date range selector
   - 📍 Where: Audit Trail page
   - 💾 Save as: `D1_audit_filtering.png`

**Evidence Notes:**
- Shows all data changes are logged
- Demonstrates immutable audit trail
- Proves accountability and traceability

---

### D2. Denied Access Logged

**Control:** CC7.3 – Incident detection and response

**Screenshots Needed:**

1. **Access Denial Audit Entry**
   - 📸 Capture: AuditLog entry showing:
     - `entity_type`: "Load"
     - `entity_id`: "load_456"
     - `action`: "READ_DENIED"
     - `actor_email`: "carrier@example.com"
     - `actor_role`: "carrier"
     - `metadata`: {"reason": "Unauthorized: Load not assigned to carrier"}
   - 📍 Where: Audit Trail page (filter by READ_DENIED)
   - 💾 Save as: `D2_access_denied_logged.png`

2. **Security Event Summary**
   - 📸 Capture: Dashboard showing:
     - Count of access denials today/week
     - Chart of failed authorization attempts
     - Top denied resources
   - 📍 Where: Security Dashboard (if available) or Audit Trail stats
   - 💾 Save as: `D2_security_events_summary.png`

**Evidence Notes:**
- Shows security events are logged
- Demonstrates detection capability
- Proves unauthorized access attempts are monitored

---

## E. Change Management & Testing (CC8.1)

### E1. Automated Test Execution

**Control:** CC8.1 – Change management and testing

**Screenshots Needed:**

1. **CI Pipeline Dashboard**
   - 📸 Capture: CI/CD run showing:
     - ✅ Build: Passed
     - ✅ Lint: Passed
     - ✅ Tests: 47 passed
     - Test categories:
       - RBAC Enforcement Tests
       - Validation Tests
       - Hook Tests
   - 📍 Where: GitHub Actions / CI platform
   - 💾 Save as: `E1_ci_pipeline_passed.png`

2. **Test Suite Results**
   - 📸 Capture: Test output showing:
     - `functions/__tests__/hooks/loadHooks.test.js` ✅
     - `functions/__tests__/rbac.test.js` ✅
     - `functions/__tests__/validation.test.js` ✅
     - All tests passing with coverage %
   - 📍 Where: Terminal output or CI logs
   - 💾 Save as: `E1_test_results.png`

3. **Git Commit with Tests**
   - 📸 Capture: Git commit showing:
     - Commit message: "feat: Add RBAC enforcement to loads"
     - Files changed: `loadHooks.js`, `loadHooks.test.js`
     - Pull request linked
     - CI status: ✅ Passed
   - 📍 Where: GitHub / Git platform
   - 💾 Save as: `E1_git_commit_with_tests.png`

**Evidence Notes:**
- Shows automated testing in place
- Demonstrates change validation before deployment
- Proves regression prevention controls

---

## F. Evidence Retention

### F1. Retention Configuration

**Control:** CC7.x – Data retention and traceability

**Screenshots Needed:**

1. **Audit Log Retention Policy**
   - 📸 Capture: Settings showing:
     - Audit logs retained for: 3 years
     - Automatic archival: Enabled
     - Backup frequency: Daily
   - 📍 Where: Settings → Data Retention (if UI available)
   - Alternative: Configuration file screenshot
   - 💾 Save as: `F1_audit_retention_policy.png`

2. **Import Run Logs**
   - 📸 Capture: ImportRun records showing:
     - Historical imports from 90+ days ago
     - Record counts
     - Status history
   - 📍 Where: Data Import page → Import History
   - 💾 Save as: `F1_import_run_history.png`

3. **Database Backup Schedule**
   - 📸 Capture: Base44 platform backup configuration:
     - Backup frequency
     - Retention period
     - Last backup timestamp
   - 📍 Where: Base44 dashboard (if available)
   - 💾 Save as: `F1_backup_schedule.png`

**Evidence Notes:**
- Shows data retention policies configured
- Demonstrates backup and recovery capability
- Proves compliance with retention requirements

---

## Evidence Collection Checklist

### Pre-Collection Setup

- [ ] Create `SOC2_Screenshots/` folder structure
- [ ] Prepare test data in different roles (broker, carrier, driver)
- [ ] Ensure audit logs have recent activity
- [ ] Clear browser cache for clean screenshots
- [ ] Use consistent screen resolution (1920x1080 recommended)

### Collection Process

- [ ] **Section A:** Access Control (4 screenshots)
- [ ] **Section B:** RBAC Enforcement (7 screenshots)
- [ ] **Section C:** Server-Side Validation (4 screenshots)
- [ ] **Section D:** Audit Logging (4 screenshots)
- [ ] **Section E:** Change Management (3 screenshots)
- [ ] **Section F:** Evidence Retention (3 screenshots)

**Total Evidence Items:** 25 screenshots

### Post-Collection Review

- [ ] Verify all screenshots are clear and readable
- [ ] Ensure sensitive data is redacted (if needed)
- [ ] Add annotations/arrows to highlight key elements
- [ ] Create README.txt in each folder explaining contents
- [ ] Compress evidence package as `SOC2_Evidence_YYYY-MM-DD.zip`

---

## Screenshot Best Practices

### Technical Guidelines

1. **Resolution:** Capture at 1920x1080 or higher
2. **Format:** PNG for clarity (avoid JPEG compression)
3. **Full Context:** Include browser URL bar when relevant
4. **Annotations:** Add red arrows/boxes to highlight key fields
5. **Timestamps:** Ensure visible timestamps in UI or logs

### Content Guidelines

1. **Redact Personal Data:** Blur/hide real customer names, emails, addresses
2. **Use Test Data:** Create sanitized test loads/carriers for screenshots
3. **Show Dates:** Include recent dates to prove current implementation
4. **Consistency:** Use same test scenario across related screenshots
5. **Clarity:** Zoom in on complex JSON responses

### Annotation Examples

```
🔴 Red Arrow → Points to "customer_rate" field present in broker view
🔴 Red Box → Highlights "customer_rate" field ABSENT in carrier view
📝 Text Label → "403 Forbidden - Server-side enforcement"
```

---

## Quick Reference: Control to Screenshot Mapping

| SOC 2 Control | Screenshot | Evidence Proves |
|---------------|------------|-----------------|
| CC6.1 | A1, A2, B2 | Authentication and authorization required |
| CC6.2 | A2 | Role-based access provisioning |
| CC6.6 | B1, B2 | Least privilege and field-level security |
| CC7.2 | C1, D1 | Input validation and change monitoring |
| CC7.3 | D2 | Security event detection |
| CC8.1 | E1 | Change testing and validation |

---

## Auditor Presentation Tips

### During Evidence Walkthrough

1. **Start with Architecture:** Show data flow diagram first
2. **Live Demo:** Walk through one complete scenario live
3. **Compare Views:** Show broker vs carrier side-by-side
4. **Network Tab:** Demonstrate server-side enforcement in real-time
5. **Audit Logs:** Filter logs to show specific test actions

### Common Auditor Questions

**Q: How do you prevent UI bypass?**  
**A:** Show Network tab with API response redaction (Screenshot B1)

**Q: Can a carrier see another carrier's data?**  
**A:** Show access denial + audit log (Screenshots B2, D2)

**Q: How do you ensure data integrity?**  
**A:** Show validation errors + before/after audit logs (Screenshots C1, D1)

**Q: What happens when a role changes?**  
**A:** Explain hook re-evaluation on every request (no cached permissions)

---

## Contact

**Evidence Coordinator:** [Name]  
**Email:** compliance@tms.ai  
**Questions:** Reference this guide's section letter (e.g., "Question about Section B1")

---

**Document Version:** 1.0  
**Last Screenshot Capture:** [TBD]  
**Next Evidence Review:** [TBD]