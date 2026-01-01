# Feature Gating Engine - Complete Implementation

## ✅ Implementation Status: COMPLETE

---

## 📋 Feature Gating Matrix

| Feature Key | Stage | Min Loads | On-Time % | Doc % | Max Dispute % | Days Since Dispute | Tier |
|-------------|-------|-----------|-----------|-------|---------------|-------------------|------|
| **detention_timer** | 1 | 1 | - | - | - | - | Bronze |
| **accessorial_requests** | 1 | 3 | - | - | - | - | Bronze |
| **direct_messaging** | 1 | 3 | - | - | - | - | Bronze |
| **profit_explain** | 2 | 5 | 90% | 90% | 10% | - | Silver |
| **counteroffers** | 2 | 5 | 90% | 90% | 10% | - | Silver |
| **what_if_pricing** | 2 | 5 | 90% | 90% | 10% | - | Silver |
| **facility_intel** | 2 | 5 | 90% | 90% | 10% | - | Silver |
| **load_selection_priority** | 2 | 5 | 80% | 80% | 15% | - | Silver |
| **instant_pay** | 3 | 10 | 90% | 85% | 10% | - | Gold |
| **advance_request** | 3 | 15 | 85% | 85% | 10% | - | Gold |
| **flexible_home_time** | 3 | 25 | 88% | 85% | 10% | - | Gold |
| **accessorial_auto_approval** | 3 | 20 | 95% | 95% | 5% | 30 | Platinum |
| **detention_self_edit** | 3 | 30 | 95% | 95% | 5% | 30 | Platinum |
| **premium_loads** | 3 | 50 | 95% | 95% | 5% | - | Platinum |

---

## 🏗️ Architecture

### Entity Model

#### 1. DriverFeatureEligibility
```javascript
{
  driver_id: string,
  feature_key: enum[14 features],
  eligible: boolean,
  reason: string,
  evaluated_at: datetime,
  metrics_snapshot: {
    completed_loads: number,
    on_time_pct: number,
    doc_on_time_pct: number,
    dispute_rate: number,
    compliance_status: string,
    days_since_last_dispute: number
  },
  cooldown_until: datetime (nullable),
  cooldown_reason: string,
  carrier_override: boolean,
  override_granted_by: string,
  override_expires_at: datetime,
  override_reason: string,
  tier: enum[bronze, silver, gold, platinum]
}
```

#### 2. CarrierDriverPolicy
```javascript
{
  carrier_id: string,
  feature_key: enum[features],
  enabled: boolean,
  min_completed_loads: number,
  min_on_time_pct: number,
  min_doc_on_time_pct: number,
  max_dispute_rate: number,
  cooldown_days: number,
  detention_free_minutes: number,
  detention_rate_per_hour_cents: number,
  counteroffer_range_pct: number,
  counteroffer_allowed_on: enum[flat, rpm, both],
  instant_pay_fee_bps: number,
  instant_pay_max_per_load_cents: number
}
```

---

## 🔧 Core Functions

### 1. Eligibility Engine
**Location**: `functions/shared/eligibility/featureEligibilityEngine.js`

```javascript
evaluateDriverEligibility(driverId, featureKey, base44)
```

**Logic Flow**:
1. Fetch driver + metrics (loads, disputes, compliance)
2. Fetch carrier policy (if exists)
3. Calculate performance metrics:
   - Completed loads count
   - On-time delivery %
   - Doc submission on-time %
   - Dispute rate %
   - Days since last dispute
4. Check cooldown (block if active)
5. Check carrier override (grant if active)
6. Apply eligibility rules: `system_rules AND carrier_policy AND driver_metrics`
7. Write/update DriverFeatureEligibility record
8. Return result with tier + reason

**Example Output**:
```javascript
{
  eligible: true,
  reason: "Can view detailed profit breakdowns",
  tier: "silver",
  metrics_snapshot: {
    completed_loads: 7,
    on_time_pct: 92,
    doc_on_time_pct: 95,
    dispute_rate: 5,
    compliance_status: "valid"
  }
}
```

### 2. System Minimums
**Location**: `functions/shared/eligibility/systemMinimums.js`

**Purpose**: Define non-negotiable thresholds carriers cannot lower

**Validation**:
```javascript
validateCarrierPolicy(featureKey, policy)
```

Returns `{valid: boolean, reason: string}`

---

## 🛡️ Enforcement Hooks

### DriverFeatureEligibility Hooks

#### beforeCreate
- Handles carrier overrides (logs + bypasses rules)
- Calls `evaluateDriverEligibility()` for automatic evaluation
- Updates eligibility status + metrics snapshot

#### beforeUpdate
- Handles cooldown applications (carrier penalties)
- Handles carrier override grants
- Triggers re-evaluation when requested
- Clears cooldowns if driver becomes eligible

#### afterRead
- Restricts drivers to viewing only their own eligibility
- Blocks customer access entirely
- Redacts override fields for driver view

### CarrierDriverPolicy Hooks

#### beforeCreate
- Validates against system minimums
- Blocks if policy weakens required thresholds
- Audit logs policy creation

---

## 🚫 Access Control (RBAC)

### Field Redaction

**Load.afterRead**:
- Drivers: Cannot see `customer_rate_cents`, `margin_cents`, `broker_notes`
- Non-eligible for profit_explain: Cannot see `profit_breakdown`

**PayConfidence.afterRead**:
- Drivers: See only their own pay confidence
- Redacted variance details if < 5 loads

**AccessorialRequest.afterRead**:
- Drivers: See only their own requests
- Cannot see `computed_eligible_amount_cents` if not eligible

---

## 🧪 Tests

### Test Files Created
1. `functions/__tests__/eligibility/featureGating.test.js`
2. `functions/__tests__/eligibility/enforcement.test.js`

### Test Coverage

#### Feature Gating Tests
✅ Stage 1: New driver basic features  
✅ Stage 2: Established driver P1 unlock  
✅ Stage 3: Power driver P2 unlock  
✅ Carrier policy overrides (stricter thresholds)  
✅ Carrier policy disabling features  
✅ System minimums validation  
✅ Cooldown enforcement  

#### Enforcement Tests
✅ AccessorialRequest blocking when ineligible  
✅ Load field redaction based on eligibility  
✅ DetentionSession edit blocking  
✅ Cooldown period enforcement  
✅ Carrier override respect  

### Running Tests
```bash
npm test -- functions/__tests__/eligibility/
```

---

## 📊 Audit Logging

**All eligibility changes are logged to AuditLog entity**:

```javascript
{
  entity_type: "DriverFeatureEligibility",
  entity_id: driver_id,
  action: "CREATE" | "UPDATE",
  actor_email: user.email,
  actor_role: user.role,
  changed_fields: {
    eligible: {from: false, to: true},
    tier: {from: "bronze", to: "silver"}
  },
  metadata: {
    feature_key: "profit_explain",
    evaluation_triggered: true
  }
}
```

**CarrierDriverPolicy changes**:
```javascript
{
  entity_type: "CarrierDriverPolicy",
  entity_id: carrier_id,
  action: "CREATE",
  metadata: {
    feature_key: "instant_pay",
    policy_created: true
  }
}
```

---

## 🎯 Eligibility Rules Summary

### Default System Rules (Non-Adjustable)

**Bronze Tier (Day 0-14)**:
- Basic visibility only
- Escalation button available
- Document checklist visible
- Profitability badges (✅/❌ only)

**Silver Tier (P1 Unlocked)**:
- 5+ loads, 90% on-time, 90% doc, ≤10% disputes
- Profit breakdown visible
- Detention timer + accessorials
- Messaging templates

**Gold Tier (P2 Unlocked)**:
- 10-25+ loads, 90-95% performance
- Counteroffers (limited)
- What-if pricing
- Instant pay options

**Platinum Tier (Elite)**:
- 20-50+ loads, 95%+ performance, ≤5% disputes
- Auto-approved accessorials
- Self-edit detention
- Premium load access

### Carrier-Adjustable Rules

Carriers can **strengthen** (never weaken) thresholds:
- Completed loads minimum
- On-time % minimum
- Doc on-time % minimum
- Dispute rate maximum
- Cooldown duration

Carriers can **configure**:
- Detention free minutes
- Detention rate per hour
- Counteroffer range (±%)
- Instant pay fees + limits

---

## 🚀 UI Integration

### Frontend Access Pattern

```javascript
// Fetch driver eligibility
const { data: eligibility } = useQuery({
  queryKey: ['driverFeatureEligibility', driverId],
  queryFn: () => base44.entities.DriverFeatureEligibility.filter({
    driver_id: driverId
  })
});

// Check feature access
const canViewProfitBreakdown = eligibility.find(
  e => e.feature_key === 'profit_explain' && e.eligible
);

// Conditional rendering
{canViewProfitBreakdown && (
  <ProfitBreakdownDrawer load={load} />
)}
```

### Server Returns Allowed Actions

```javascript
// afterRead hook adds this to response
load.allowed_actions = [
  'DETENTION_TIMER',
  'ACCESSORIAL_REQUESTS',
  'PROFIT_EXPLAIN'
];

// UI renders based on array
{load.allowed_actions.includes('PROFIT_EXPLAIN') && (
  <ProfitExplainSection />
)}
```

---

## 🔐 Security Guarantees

✅ **Server-side enforcement**: All eligibility checks happen in hooks  
✅ **RBAC + Redaction**: Fields automatically hidden based on role + eligibility  
✅ **Audit trail**: Every eligibility change logged  
✅ **System minimums**: Carriers cannot weaken required thresholds  
✅ **Cooldown enforcement**: Feature access temporarily revoked for violations  
✅ **No UI bypass**: Frontend cannot override server decisions  

---

## 🎉 Implementation Complete

### Entities Added/Extended
✅ DriverFeatureEligibility (new)  
✅ CarrierDriverPolicy (new)  

### Hooks Implemented
✅ DriverFeatureEligibility: beforeCreate, beforeUpdate, afterRead  
✅ CarrierDriverPolicy: beforeCreate  
✅ Load: afterRead (enhanced redaction)  
✅ AccessorialRequest: afterRead (enhanced redaction)  

### Shared Functions
✅ featureEligibilityEngine.js (core logic)  
✅ systemMinimums.js (validation)  

### Tests
✅ 15+ test cases covering all stages  
✅ Policy override tests  
✅ Enforcement tests  
✅ Cooldown tests  

### Documentation
✅ DriverJourneyStages.md (user-facing)  
✅ FeatureGatingImplementation.md (technical)  

---

**🚀 Ready for Production**