# Feature Gating KPIs & Tuning Guide

## Overview

These KPIs tell you **when to loosen or tighten gates** without guessing. Track weekly and monthly, review quarterly for policy adjustments.

---

## 📊 Core KPIs (Track Weekly & Monthly)

### A) Dispute Health

**Metrics**:
- Disputes per 100 loads
- % ineligible accessorial requests submitted
- Average dispute resolution time (days)
- Repeat offenders (drivers with 2+ disputes)

**Query**:
```javascript
const disputeRate = (totalDisputes / totalLoads) * 100;
const ineligibleAccessorialRate = (ineligibleAccessorials / totalAccessorials) * 100;
```

**🔧 Tuning Signals**:
| Signal | Action |
|--------|--------|
| ↑ Disputes increasing | Tighten P1 thresholds (5 → 7 loads) |
| ↓ Disputes < 5% for 60 days | Consider lowering min loads (5 → 3) |
| ↑ Ineligible accessorials > 20% | Add cooldown to accessorial_requests |
| Repeat offenders > 5% | Implement escalating cooldowns |

**Dashboard Card**:
```javascript
{
  metric: "Dispute Rate",
  value: "3.2%",
  trend: "↓ -1.1%",
  status: "healthy",
  action: "No action needed"
}
```

---

### B) Margin Protection

**Metrics**:
- Average broker margin by driver tier (bronze/silver/gold/platinum)
- Margin variance before/after counteroffers enabled
- Counteroffer acceptance vs rejection rate
- Average counteroffer amount (% of original rate)

**Query**:
```javascript
const avgMarginByTier = loads.reduce((acc, load) => {
  const tier = load.driver_tier;
  acc[tier] = acc[tier] || { total: 0, count: 0 };
  acc[tier].total += load.margin_cents;
  acc[tier].count += 1;
  return acc;
}, {});
```

**🔧 Tuning Signals**:
| Signal | Action |
|--------|--------|
| Counteroffers reduce margin > 5% | Restrict counteroffer_range_pct (10% → 5%) |
| High acceptance with stable margin | Safe to expand counteroffer range |
| Low margin for silver tier | Increase silver tier requirements |
| Platinum drivers = highest margin | Validate tier system working |

**Dashboard Card**:
```javascript
{
  metric: "Avg Margin by Tier",
  bronze: "12%",
  silver: "14%",
  gold: "16%",
  platinum: "18%",
  status: "optimal"
}
```

---

### C) Driver Reliability

**Metrics**:
- On-time delivery %
- Documents on-time %
- Escalations per load
- Days since last dispute (by driver)

**Query**:
```javascript
const onTimeRate = (onTimeLoads / totalLoads) * 100;
const escalationRate = (totalEscalations / totalLoads) * 100;
```

**🔧 Tuning Signals**:
| Signal | Action |
|--------|--------|
| High reliability but gated | Unlock P1 features faster (5 → 3 loads) |
| Low reliability but unlocked | Add cooldowns immediately |
| On-time % dropping | Increase on_time_pct threshold (90% → 92%) |
| Escalation rate > 10% | Tighten eligibility across all tiers |

**Dashboard Card**:
```javascript
{
  metric: "Fleet Reliability",
  onTime: "94%",
  docsOnTime: "96%",
  escalations: "2.1%",
  status: "excellent"
}
```

---

### D) Adoption & Retention

**Metrics**:
- Load acceptance rate (by tier)
- Active drivers (weekly active users)
- Churn after 30 / 60 / 90 days
- Feature usage rate (% using profit_explain, detention_timer, etc.)

**Query**:
```javascript
const acceptanceRate = (acceptedLoads / offeredLoads) * 100;
const churnRate30 = (driversLost30Days / totalDrivers) * 100;
```

**🔧 Tuning Signals**:
| Signal | Action |
|--------|--------|
| Low adoption of profit_explain | Unlock earlier (5 → 3 loads) |
| High churn among good drivers | Unlock P2 selectively to retain |
| Acceptance rate < 70% | Investigate pricing or feature gaps |
| Feature usage < 20% | Improve UI/education, don't loosen gates |

**Dashboard Card**:
```javascript
{
  metric: "Driver Retention",
  churn30: "8%",
  churn60: "12%",
  churn90: "15%",
  status: "monitor",
  action: "Consider P2 pilot for top 10 drivers"
}
```

---

### E) Ops Load (Hidden KPI Devs Forget)

**Metrics**:
- Support tickets per load
- Calls per dispute
- Manual overrides per week
- Time to resolve feature access issues

**Query**:
```javascript
const ticketsPerLoad = totalTickets / totalLoads;
const overrideRate = manualOverrides / totalEligibilityChecks;
```

**🔧 Tuning Signals**:
| Signal | Action |
|--------|--------|
| High ops cost (tickets/load > 0.5) | Tighten gating to reduce complexity |
| Low ops cost (tickets/load < 0.2) | Safely unlock more features |
| High override rate > 10% | Policy thresholds may be too strict |
| Low override rate < 2% | Thresholds well-calibrated |

**Dashboard Card**:
```javascript
{
  metric: "Ops Efficiency",
  ticketsPerLoad: 0.15,
  overrideRate: "3%",
  avgResolutionTime: "1.2 days",
  status: "healthy"
}
```

---

## 🔄 KPI → Policy Adjustment Loop

```
┌──────────────────────────────────────────────┐
│ 1. Track KPIs (weekly)                       │
│    - Dispute rate, margin, reliability       │
└───────────────┬──────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ 2. Weekly Review                             │
│    - Flag outliers, trends                   │
└───────────────┬──────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ 3. Adjust CarrierDriverPolicy                │
│    - Update thresholds in entity             │
└───────────────┬──────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ 4. Audit Log                                 │
│    - Record change, reason, actor            │
└───────────────┬──────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ 5. Monitor for 30 Days                       │
│    - Did KPIs improve?                       │
└───────────────┬──────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│ 6. Repeat                                    │
└──────────────────────────────────────────────┘
```

**Example Adjustment**:
```javascript
// Dispute rate increased from 3% to 8%
await base44.entities.CarrierDriverPolicy.update(policyId, {
  min_completed_loads: 7, // Raised from 5
  max_dispute_rate: 8, // Lowered from 10
  cooldown_days: 45 // Increased from 30
});

await base44.entities.AuditLog.create({
  entity_type: 'CarrierDriverPolicy',
  action: 'UPDATE',
  metadata: {
    reason: 'Dispute rate increased to 8%, tightening eligibility',
    old_thresholds: { min_loads: 5, max_dispute: 10 },
    new_thresholds: { min_loads: 7, max_dispute: 8 }
  }
});
```

---

## 📈 KPI Dashboards (Implementation)

### Weekly Operations Dashboard
```javascript
const weeklyKPIs = {
  disputes: {
    rate: 3.2,
    trend: -1.1,
    status: 'healthy'
  },
  margin: {
    avg: 14.5,
    byTier: { bronze: 12, silver: 14, gold: 16, platinum: 18 }
  },
  reliability: {
    onTime: 94,
    docsOnTime: 96,
    escalations: 2.1
  }
};
```

### Monthly Tuning Review
```javascript
const monthlyReview = {
  recommendedActions: [
    {
      policy: 'profit_explain',
      action: 'lower_threshold',
      from: { min_loads: 5 },
      to: { min_loads: 3 },
      reason: 'Low dispute rate (3%) and high adoption'
    },
    {
      policy: 'counteroffers',
      action: 'restrict_range',
      from: { range_pct: 10 },
      to: { range_pct: 5 },
      reason: 'Margin erosion detected (-2% over 30 days)'
    }
  ]
};
```

---

## 🎯 Target Ranges (Best Practice)

| KPI | Target | Warning | Critical |
|-----|--------|---------|----------|
| Dispute Rate | < 5% | 5-10% | > 10% |
| Ineligible Accessorials | < 15% | 15-25% | > 25% |
| Broker Margin | > 12% | 10-12% | < 10% |
| On-Time % | > 92% | 88-92% | < 88% |
| Driver Churn (90d) | < 20% | 20-30% | > 30% |
| Support Tickets/Load | < 0.2 | 0.2-0.4 | > 0.4 |
| Override Rate | < 5% | 5-10% | > 10% |

---

## 🚨 Automated Alerts

**Setup Alert Thresholds**:
```javascript
const alertConfig = {
  disputeRateSpike: {
    threshold: 8, // % dispute rate
    action: 'notify_admin',
    message: 'Dispute rate exceeded 8% - review eligibility thresholds'
  },
  marginErosion: {
    threshold: -3, // % drop in 30 days
    action: 'restrict_counteroffers',
    message: 'Margin dropped 3% - restricting counteroffer range'
  },
  lowAdoption: {
    threshold: 15, // % feature usage
    action: 'suggest_lower_threshold',
    message: 'Profit explain usage < 15% - consider lowering min loads'
  }
};
```

---

## 📊 Quarterly Review Checklist

- [ ] Review all 5 core KPIs
- [ ] Compare to target ranges
- [ ] Document policy changes in last 90 days
- [ ] Assess impact of changes (did disputes decrease?)
- [ ] Adjust carrier-specific policies as needed
- [ ] Update launch defaults if pattern emerges
- [ ] Present findings to leadership
- [ ] Update compliance documentation

---

**🎯 Data-Driven Policy Tuning Enabled**