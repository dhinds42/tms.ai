# Carrier Type Default Policies (Launch-Ready)

## Overview

Conservative, opinionated defaults based on real operational risk profiles. System baselines (compliance valid, RBAC, audit logging) are non-overridable across all carrier types.

---

## 🟦 A) Asset-Based Carrier (Company Drivers)

### Risk Profile
- ✅ High payroll exposure
- ✅ Lower fraud risk
- ✅ Strong dispatch control
- ✅ Predictable driver behavior

### Recommended Defaults

#### P1 Features (Auto-Unlock)
| Feature | Enabled | Min Loads | On-Time % | Docs % | Max Dispute % | Cooldown |
|---------|---------|-----------|-----------|--------|---------------|----------|
| PROFIT_EXPLAIN | ✅ | 3 | 90% | 90% | 10% | 30 days |
| DETENTION_TIMER | ✅ | 3 | 90% | 90% | 10% | 30 days |
| ACCESSORIAL_REQUESTS | ✅ | 3 | 90% | 90% | 10% | 30 days |
| MESSAGE_TEMPLATES | ✅ | 1 | - | - | - | none |

#### P2 Features (Manual Approval)
| Feature | Default | Notes |
|---------|---------|-------|
| COUNTEROFFERS | ❌ | Rarely needed for company drivers |
| WHAT_IF_PRICING | ❌ | Internal dispatch handles pricing |
| INSTANT_PAY | ❌ | Payroll-driven, not ad-hoc |
| FACILITY_INTEL | ✅ | Improves planning, low risk |

### Why These Defaults Work
- Asset carriers benefit from **operational tools**, not pricing leverage
- Company drivers are employees with less pricing autonomy
- Focus on **education and efficiency**, not negotiation
- Lower thresholds (3 loads vs 5) because of higher oversight

---

## 🟩 B) Brokerage-Only Carrier (Non-Asset, High Margin Sensitivity)

### Risk Profile
- ⚠️ Margin leakage risk
- ⚠️ Accessorial abuse risk
- ⚠️ Pricing strategy sensitive
- ⚠️ Limited driver oversight

### Recommended Defaults

#### P1 Features (Auto-Unlock, Stricter)
| Feature | Enabled | Min Loads | On-Time % | Docs % | Max Dispute % | Cooldown |
|---------|---------|-----------|-----------|--------|---------------|----------|
| PROFIT_EXPLAIN | ✅ | 5 | 92% | 95% | 8% | 30 days |
| DETENTION_TIMER | ❌ | - | - | - | - | - |
| ACCESSORIAL_REQUESTS | ❌ | - | - | - | - | - |
| MESSAGE_TEMPLATES | ✅ | 3 | - | - | - | none |

#### P1 Features (Manual Enable After Vetting)
| Feature | Unlock Rule | Notes |
|---------|-------------|-------|
| DETENTION_TIMER | After 5 clean loads | Must prove reliability first |
| ACCESSORIAL_REQUESTS | After 10 clean loads | High abuse potential |

#### P2 Features (Manual Only)
| Feature | Default | Notes |
|---------|---------|-------|
| COUNTEROFFERS | ❌ | Enable only for top-tier drivers after 20+ loads |
| WHAT_IF_PRICING | ❌ | High reverse-engineering risk |
| INSTANT_PAY | ❌ | High fraud risk, KYC required |
| FACILITY_INTEL | ❌ | Enable selectively after 15+ loads |

### Why These Defaults Work
- Brokerages must **protect margin first**, then selectively unlock
- Higher thresholds (5 loads, 92% on-time vs 90%) due to less oversight
- **Detention/accessorials disabled by default** to prevent gaming
- Stricter doc requirements (95% vs 90%) to reduce billing delays

---

## 🟨 C) Owner-Operator–Heavy Carrier

### Risk Profile
- ⚙️ Drivers are business owners (sophisticated)
- ⚙️ Higher pricing sophistication expected
- ⚙️ Moderate fraud risk
- ⚙️ Strong autonomy expectations

### Recommended Defaults

#### P1 Features (Auto-Unlock)
| Feature | Enabled | Min Loads | On-Time % | Docs % | Max Dispute % | Cooldown |
|---------|---------|-----------|-----------|--------|---------------|----------|
| PROFIT_EXPLAIN | ✅ | 3 | 90% | 90% | 10% | 30 days |
| DETENTION_TIMER | ✅ | 5 | 90% | 90% | 10% | 30 days |
| ACCESSORIAL_REQUESTS | ✅ | 5 | 90% | 90% | 10% | 30 days |
| MESSAGE_TEMPLATES | ✅ | 1 | - | - | - | none |

#### P2 Features (Manual → Auto After Probation)
| Feature | Default | Unlock Rule | Notes |
|---------|---------|-------------|-------|
| COUNTEROFFERS | ❌ | Enable after 20 clean loads | OOs expect negotiation rights |
| WHAT_IF_PRICING | ❌ | Enable after 30 days no disputes | Business planning tool |
| FACILITY_INTEL | ✅ | Auto at 10 loads | Helps route planning |
| INSTANT_PAY | ❌ | After KYC + 30 days + 15 loads | Fraud protection |

### Why These Defaults Work
- OO drivers **expect transparency and autonomy**, but must earn leverage
- Balance between **business owner mindset** and carrier risk management
- Counteroffers unlocked faster than brokerages but slower than never
- Instant pay available but with strong guardrails

---

## 🔧 Implementation Guide

### Carrier Onboarding Checklist

**Step 1: Identify Carrier Type**
```javascript
const carrierType = determineCarrierType({
  hasOwnAssets: boolean,
  percentageOwnerOperators: number,
  isBrokerage: boolean
});
```

**Step 2: Apply Default Policies**
```javascript
const defaults = getCarrierTypeDefaults(carrierType);
await applyDefaultPolicies(carrier_id, defaults);
```

**Step 3: Document in Carrier Profile**
```javascript
await base44.entities.Carrier.update(carrier_id, {
  carrier_type: carrierType,
  policy_profile: 'launch_defaults',
  last_policy_review: new Date()
});
```

**Step 4: Audit Log**
```javascript
await base44.entities.AuditLog.create({
  entity_type: 'CarrierDriverPolicy',
  action: 'BULK_CREATE',
  metadata: {
    carrier_type: carrierType,
    policies_applied: defaults.length
  }
});
```

---

## 📊 Comparison Matrix

| Feature | Asset-Based | Brokerage-Only | Owner-Operator |
|---------|-------------|----------------|----------------|
| **Min Loads (P1)** | 3 | 5 | 3-5 |
| **On-Time % (P1)** | 90% | 92% | 90% |
| **Detention** | Auto @ 3 | Manual @ 5 | Auto @ 5 |
| **Accessorials** | Auto @ 3 | Manual @ 10 | Auto @ 5 |
| **Counteroffers** | Disabled | Elite only | After 20 loads |
| **Instant Pay** | Via payroll | Disabled | After KYC |

---

## 🎯 Launch Recommendations by Carrier Type

### Asset-Based Carriers
- ✅ Launch with P1 auto-unlock immediately
- ✅ Keep P2 features disabled for 60 days
- ✅ Monitor detention accuracy for first 30 days
- ✅ Enable facility intel after 30 days if clean

### Brokerage-Only Carriers
- 🔒 Launch with stricter P1 thresholds (5 loads, 92%)
- 🔒 Manually enable detention/accessorials per driver
- 🔒 Keep P2 disabled for 90 days
- 🔒 Require carrier approval for ALL pricing features

### Owner-Operator Carriers
- ⚙️ Launch with P1 auto-unlock at 5 loads
- ⚙️ Enable facility intel immediately (planning tool)
- ⚙️ Pilot counteroffers with top 3 drivers after 30 days
- ⚙️ Enable instant pay after KYC verification

---

## 🚀 Post-Launch Tuning

### 30-Day Review
- Review dispute rate by carrier type
- Adjust min_completed_loads if needed
- Enable facility_intel if not already

### 60-Day Review
- Consider enabling counteroffers for OO carriers
- Review instant pay fraud metrics
- Adjust on-time % thresholds based on data

### 90-Day Review
- Full policy review with carrier stakeholders
- Adjust based on KPI data (see FeatureGatingKPIs.md)
- Document changes in audit log

---

**🎉 Launch-Ready Policies Defined**