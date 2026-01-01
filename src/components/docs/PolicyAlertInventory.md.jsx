# STEP 0 — INVENTORY REPORT

## Existing Data Sources

### ✅ Disputes & Escalations
- **Entity**: `DriverEscalation`
- **Fields**: driver_id, escalation_type, status, created_date
- **Usage**: Track disputes for dispute_per_100_loads KPI

### ✅ Accessorial Tracking
- **Entity**: `AccessorialRequest`
- **Fields**: requester_id, eligibility_status, approval_status, created_date
- **Usage**: Track ineligible_accessorial_rate KPI

### ✅ Load Management
- **Entity**: `Load`
- **Fields**: 
  - `status` (delivered, closed for completion tracking)
  - `carrier_id` (broker mode)
  - `driver_id` (carrier mode)
  - `margin_cents` (for margin tracking)
  - `planned_delivery_datetime` vs `actual_delivery_datetime` (for on-time %)
  - `created_date`
- **Usage**: 
  - On-time % calculation
  - Dispute rate calculation
  - Margin tracking (broker mode)

### ✅ Document Tracking
- **Entity**: `LoadDocumentChecklist`
- **Fields**: load_id, billing_ready, billing_ready_percent, received_docs
- **Usage**: Doc-on-time % calculation

### ✅ Pay Confidence & Settlement
- **Entity**: `PayConfidence`
- **Fields**: estimated_pay_cents, final_pay_cents, variance_cents
- **Usage**: Pay variance tracking (optional for alerts)

### ✅ Driver Management
- **Entity**: `Driver`
- **Fields**: party_id (carrier reference), performance_score, on_time_percentage
- **Usage**: Link drivers to carriers

### ✅ Feature Gating Infrastructure
- **Entity**: `DriverFeatureEligibility`
- **Fields**: driver_id, feature_key, eligible, tier, carrier_override
- **Usage**: Track manual overrides, P2 eligible drivers

- **Entity**: `CarrierDriverPolicy`
- **Fields**: carrier_id, carrier_type, feature_key, enabled, min_completed_loads, etc.
- **Usage**: Policy configuration for each carrier

### ✅ Audit Infrastructure
- **Entity**: `AuditLog`
- **Fields**: entity_type, entity_id, action, actor_email, metadata, created_date
- **Usage**: Track all policy changes and alert actions

### ✅ Policy Alerts (CREATED)
- **Entity**: `PolicyAlert`
- **Fields**: carrier_id, alert_type, severity, status, etc.
- **Note**: Needs schema updates per requirements

### ❌ Support Tickets
- **Status**: No dedicated support ticket entity found
- **Workaround**: Use manual_override count from DriverFeatureEligibility

### ❌ Scheduled Jobs (Base44 Pattern)
- **Status**: No visible scheduled job configuration in snapshot
- **Solution**: Create backend function with documentation for manual/cron setup

### ✅ Admin Dashboards
- **Existing**: Settings, UserRoles, AuditTrail
- **Pattern**: Admin-only pages with RBAC
- **New**: Need to create PolicyAlertsPage

---

## Schema Gaps to Address

### PolicyAlert Entity Updates Needed
- Add: `carrier_type` field (for type-based alerts)
- Add: `metric_window` field (7d, 30d)
- Rename: `alert_type` → keep as is, maps to `signal_type` in requirements
- Add: Better indexing for queries

### Missing Support Structures
- ❌ No dedicated support ticket tracking
- ✅ Can use `DriverFeatureEligibility.carrier_override` count as proxy for "ops load"

---

## Implementation Strategy

1. **Update PolicyAlert entity** with carrier_type and metric_window
2. **Enhance policyAlertEngine.js** with all 6 alert types and de-duplication
3. **Create scheduled function wrapper** (functions/scheduled/dailyPolicyAlerts.js)
4. **Create admin page** (pages/PolicyAlertsManagement.js) with filters and "Apply Policy" action
5. **Add "Apply Policy" backend function** (functions/api/applyPolicyFromAlert.js) with safety checks
6. **Add comprehensive tests** verifying idempotency, permissions, baseline protection
7. **Document scheduling** (manual cron or Base44 trigger pattern)

---

**Inventory Complete ✅ - Proceeding to Implementation**