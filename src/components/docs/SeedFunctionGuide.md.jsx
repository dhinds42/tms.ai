# Seed Carrier Policies - Usage Guide

## Overview

The `seedCarrierDriverPolicies` function initializes default CarrierDriverPolicy records for three carrier types:
- **asset**: Asset-based carriers with company drivers
- **brokerage**: Non-asset brokerages
- **oo_heavy**: Owner-operator heavy carriers

**Key Features**:
- ✅ **Idempotent**: Safe to run multiple times
- ✅ **Non-destructive**: Never overwrites existing policies
- ✅ **Audit-logged**: Every insert creates an AuditLog entry
- ✅ **Admin-only**: Requires admin role

---

## How to Run

### Option 1: Via UI (Recommended)

1. Go to **Settings** page (admin only)
2. Find the "Seed Carrier Policies" card
3. Click **"Run Seed Operation"**
4. Review the results (inserted/skipped counts)

**Import the component**:
```jsx
import SeedCarrierPoliciesButton from "@/components/admin/SeedCarrierPoliciesButton";

// In your admin settings page:
<SeedCarrierPoliciesButton />
```

### Option 2: Via Backend Function (API)

```javascript
import { base44 } from '@/api/base44Client';

const result = await base44.functions.seedCarrierDriverPolicies();
console.log(result);
```

**Expected Response**:
```json
{
  "success": true,
  "summary": {
    "inserted_count": 19,
    "skipped_count": 0,
    "inserted_keys": [
      "asset:profit_explain",
      "asset:detention_timer",
      "brokerage:profit_explain",
      ...
    ],
    "skipped_keys": [],
    "errors": []
  },
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

---

## What Gets Seeded

### Asset-Based Carrier (5 policies)
| Feature | Enabled | Min Loads | On-Time % | Docs % | Max Dispute % |
|---------|---------|-----------|-----------|--------|---------------|
| profit_explain | ✅ | 3 | 90% | 90% | 10% |
| detention_timer | ✅ | 3 | 90% | 90% | 10% |
| accessorial_requests | ✅ | 3 | 90% | 90% | 10% |
| direct_messaging | ✅ | 1 | - | - | - |
| facility_intel | ✅ | 0 | - | - | - |

### Brokerage (7 policies)
| Feature | Enabled | Min Loads | On-Time % | Docs % | Max Dispute % |
|---------|---------|-----------|-----------|--------|---------------|
| profit_explain | ✅ | 5 | 92% | 95% | 8% |
| direct_messaging | ✅ | 3 | - | - | - |
| detention_timer | ❌ | - | - | - | - |
| accessorial_requests | ❌ | - | - | - | - |
| counteroffers | ❌ | - | - | - | - |
| what_if_pricing | ❌ | - | - | - | - |
| instant_pay | ❌ | - | - | - | - |

### Owner-Operator Heavy (8 policies)
| Feature | Enabled | Min Loads | On-Time % | Docs % | Max Dispute % |
|---------|---------|-----------|-----------|--------|---------------|
| profit_explain | ✅ | 3 | 90% | 90% | 10% |
| detention_timer | ✅ | 5 | 90% | 90% | 10% |
| accessorial_requests | ✅ | 5 | 90% | 90% | 10% |
| direct_messaging | ✅ | 3 | - | - | - |
| facility_intel | ✅ | 0 | - | - | - |
| counteroffers | ❌ | 20 | 95% | 95% | 5% |
| what_if_pricing | ❌ | 20 | 95% | 95% | 5% |
| instant_pay | ❌ | 20 | 95% | 95% | 5% |

**Total**: 19 default policy records

---

## Idempotency Test

Run the function twice and verify only the first run inserts:

```javascript
// First run
const result1 = await base44.functions.seedCarrierDriverPolicies();
console.log('First run inserted:', result1.summary.inserted_count); // 19

// Second run
const result2 = await base44.functions.seedCarrierDriverPolicies();
console.log('Second run inserted:', result2.summary.inserted_count); // 0
console.log('Second run skipped:', result2.summary.skipped_count); // 19
```

**Expected**:
- First run: `inserted_count = 19`
- Second run: `inserted_count = 0`, `skipped_count = 19`

---

## Audit Trail

Every inserted policy creates an AuditLog entry:

```javascript
{
  entity_type: 'CarrierDriverPolicy',
  entity_id: 'policy_id_here',
  action: 'CREATE',
  actor_email: 'system',
  actor_role: 'system',
  metadata: {
    seed_operation: true,
    carrier_type: 'asset',
    feature_key: 'profit_explain',
    enabled: true,
    thresholds: {
      min_loads: 3,
      min_on_time: 90,
      min_doc: 90,
      max_dispute: 10
    }
  }
}
```

**Query audit logs**:
```javascript
const auditLogs = await base44.entities.AuditLog.filter({
  entity_type: 'CarrierDriverPolicy',
  'metadata.seed_operation': true
});
```

---

## When to Run

### Initial Setup
- ✅ Run once when first deploying feature gating
- ✅ Run after creating CarrierDriverPolicy entity

### After Schema Changes
- ✅ Run if you add new carrier types
- ✅ Run if you want to add new default policies

### NOT Needed
- ❌ Do not run on every deployment
- ❌ Do not run if policies already exist

---

## Troubleshooting

### Error: "Unauthorized: admin role required"
**Solution**: Only admin users can run this function. Log in as admin.

### Error: "Entity not found"
**Solution**: Ensure `CarrierDriverPolicy` entity exists with correct schema.

### Result shows `inserted_count: 0, skipped_count: 19`
**This is normal**: Policies already exist. Function is working correctly.

### Need to Re-Seed
If you want to re-insert (e.g., after schema change):
1. Delete existing seed policies: `DELETE FROM CarrierDriverPolicy WHERE carrier_id IS NULL`
2. Run seed function again

---

## Test Suite

Run tests to verify idempotency:

```bash
npm test functions/__tests__/seed/carrierPolicySeed.test.js
```

**Tests verify**:
- ✅ First run inserts all policies
- ✅ Second run inserts nothing (idempotent)
- ✅ Non-admin users are rejected
- ✅ Correct number of policies per carrier type

---

## Next Steps After Seeding

1. **Verify Policies**:
   ```javascript
   const policies = await base44.entities.CarrierDriverPolicy.list();
   console.log('Total policies:', policies.length); // Should be 19+
   ```

2. **Check Audit Logs**:
   ```javascript
   const logs = await base44.entities.AuditLog.filter({
     entity_type: 'CarrierDriverPolicy',
     'metadata.seed_operation': true
   });
   console.log('Seeded policies:', logs.length);
   ```

3. **Test Eligibility Engine**:
   - Create a test driver
   - Complete 3 loads
   - Verify profit_explain unlocks automatically

---

**🎉 Seed Function Ready to Use**