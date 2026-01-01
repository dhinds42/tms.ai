# Feature Unlock Decision Matrix

## 🎯 Executive Summary

Feature gating enables **safe scaling without losing control**. This matrix defines which features unlock automatically vs. require carrier approval.

---

## ✅ Auto-Unlock Features (System-Controlled)

These unlock **automatically** when eligibility thresholds are met. No human approval required.

| Feature | Min Loads | Performance | Dispute Rate | Why Auto-Unlock |
|---------|-----------|-------------|--------------|-----------------|
| **Profit Explain** | 5 | 90% | ≤10% | Educational, low risk |
| **Detention Timer** | 5 | 90% | ≤10% | Timestamp-driven, auditable |
| **Accessorial Requests** | 5 | 90% | ≤10% | Server-calculated eligibility |
| **Variance Alerts** | 3 | - | - | Informational only |
| **Message Templates** | 3 | - | - | Reduces noise, improves clarity |

**Benefits**:
- ✅ Driver empowerment
- ✅ Reduced support load
- ✅ Predictable behavior
- ✅ Auditable unlock events

---

## 🟨 Request-Based Unlock (Approval Required)

These require **explicit carrier approval** even when technical eligibility is met.

| Feature | Min Loads | Performance | Dispute Rate | Days Since Dispute | Why Requires Approval |
|---------|-----------|-------------|--------------|-------------------|----------------------|
| **Counteroffers** | 20 | 95% | ≤5% | 30 | Pricing strategy impact |
| **What-If Pricing** | 20 | 95% | ≤5% | 30 | Margin reverse-engineering risk |
| **Facility Intel** | 10 | 90% | ≤10% | - | Data quality/completeness risk |
| **Offline Mode** | 10 | 90% | ≤10% | - | Support & reconciliation risk |
| **Driver Scorecard** | 10 | - | - | - | Competitive sensitivity |

**Approval Workflow**:
1. Driver meets technical thresholds
2. System creates `FeatureApprovalRequest` (status: pending)
3. Carrier admin reviews metrics + context
4. Approves/denies with reason
5. If approved: Feature access granted via carrier override
6. Audit log records decision

**Benefits**:
- ✅ Carrier maintains control
- ✅ Protects pricing strategy
- ✅ Manages data quality
- ✅ Reduces fraud risk

---

## 🚫 Never Auto-Unlock (Always Manual)

These should **always** require explicit carrier enablement, regardless of driver performance.

| Feature | Min Loads | Performance | Dispute Rate | Days Since Dispute | Why Never Auto-Unlock |
|---------|-----------|-------------|--------------|-------------------|----------------------|
| **Instant Pay** | 20 | 95% | ≤5% | 30 | Financial/fraud risk |
| **Advance Request** | 15 | 85% | ≤10% | - | Cash flow impact |
| **Accessorial Auto-Approval** | 20 | 95% | ≤5% | 30 | Payment authority risk |
| **Detention Self-Edit** | 30 | 95% | ≤5% | 30 | Abuse potential |

**Enablement Process**:
1. Carrier evaluates business case
2. Reviews driver track record (20+ loads minimum)
3. Sets limits (e.g., instant pay max $500/load)
4. Manually enables in `CarrierDriverPolicy`
5. Feature unlocks for qualified drivers only

**Risk Mitigation**:
- ✅ Prevents unauthorized money flow changes
- ✅ Protects carrier cash position
- ✅ Limits fraud exposure
- ✅ Maintains pricing authority

---

## 📊 Feature Classification Summary

```
Total Features: 14

Auto-Unlock:     5 (36%)  ✅ Safe, educational, low-risk
Request-Based:   5 (36%)  🟨 Pricing/data/support impact
Never Auto:      4 (28%)  🚫 Financial/fraud risk
```

---

## 🔧 Implementation Details

### Auto-Unlock Flow
```javascript
// Eligibility met → Immediate grant
if (metricsPass && shouldAutoUnlock(feature_key)) {
  grantAccess(driver_id, feature_key);
  auditLog('AUTO_UNLOCK', driver_id, feature_key);
}
```

### Request-Based Flow
```javascript
// Eligibility met → Create approval request
if (metricsPass && requiresApproval(feature_key)) {
  if (!hasApprovedRequest(driver_id, feature_key)) {
    createApprovalRequest({
      driver_id,
      feature_key,
      status: 'pending',
      metrics_at_request: snapshot
    });
    return { eligible: false, pending_approval: true };
  }
}
```

### Never Auto-Unlock Flow
```javascript
// Carrier must explicitly enable in policy
const policy = getCarrierPolicy(carrier_id, feature_key);
if (!policy || !policy.enabled) {
  return { eligible: false, reason: 'Feature disabled by carrier' };
}
```

---

## 🎯 Launch Recommendations

### Phase 1 (Days 0-30): Conservative Start
- ✅ Enable all **Auto-Unlock** features
- 🔒 Disable all **Request-Based** features
- 🔒 Disable all **Never Auto-Unlock** features

### Phase 2 (Days 30-60): Selective Expansion
- ✅ Enable **Facility Intel** for select carriers
- ✅ Enable **Driver Scorecard** for transparency
- 🔒 Keep pricing features (counteroffers, what-if) disabled

### Phase 3 (Days 60+): Mature Operations
- ✅ Enable **Request-Based** features per carrier
- ✅ Pilot **Instant Pay** with 2-3 trusted carriers
- ✅ Monitor metrics, adjust thresholds

---

## 🔐 Security Guarantees

✅ **Server-side enforcement**: All eligibility checked in hooks  
✅ **Audit trail**: Every unlock/approval logged  
✅ **Carrier control**: Can disable any feature anytime  
✅ **Cooldown protection**: Violations trigger temporary locks  
✅ **No UI bypass**: Frontend cannot override decisions  

---

## 📈 Success Metrics

**Auto-Unlock Features**:
- Unlock rate: % of eligible drivers who unlock within 7 days
- Re-lock rate: % who lose access due to performance drop
- Support tickets: Measure reduction in "why can't I see X?" requests

**Request-Based Features**:
- Approval rate: % of requests approved
- Time to approval: Days from request to decision
- Post-approval disputes: Track if approved drivers cause issues

**Never Auto-Unlock Features**:
- Enablement rate: % of carriers who enable
- Fraud incidents: Track abuse per 1000 transactions
- ROI: Revenue/efficiency gain vs. risk cost

---

## 🎉 Final Decision Matrix

| Feature | Launch Status | Unlock Type | Carrier Adjustable | Recommendation |
|---------|---------------|-------------|-------------------|----------------|
| Profit Explain | ✅ Enabled | Auto | Thresholds only | Safe for launch |
| Detention Timer | ✅ Enabled | Auto | Thresholds only | Safe for launch |
| Accessorial Requests | ✅ Enabled | Auto | Thresholds only | Safe for launch |
| Variance Alerts | ✅ Enabled | Auto | No | Safe for launch |
| Message Templates | ✅ Enabled | Auto | No | Safe for launch |
| Counteroffers | 🔒 Disabled | Request | Yes | Enable after 30d |
| What-If Pricing | 🔒 Disabled | Request | Yes | Enable after 30d |
| Facility Intel | 🔒 Disabled | Request | Yes | Enable after 30d |
| Offline Mode | 🔒 Disabled | Request | Yes | Enable after 60d |
| Driver Scorecard | 🔒 Disabled | Request | No | Enable after 60d |
| Instant Pay | 🔒 Disabled | Never Auto | Full control | Pilot only |
| Advance Request | 🔒 Disabled | Never Auto | Full control | Pilot only |
| Accessorial Auto-Approval | 🔒 Disabled | Never Auto | Full control | Elite drivers only |
| Detention Self-Edit | 🔒 Disabled | Never Auto | Full control | Elite drivers only |

---

**🚀 Ready for Production Launch**