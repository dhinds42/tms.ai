# Driver Journey Stages - Feature Eligibility

## 🟦 Stage 1: New Driver (Day 0–14)

### Profile
- **0-4 completed loads**
- Learning the system
- High risk for confusion

### What They See
✅ Loads + status updates  
✅ Offered pay  
✅ Pay confidence state  
✅ Document checklist  
✅ "I'm stuck" escalation  
✅ Profitability badges only (✅/❌)  

### What's Hidden
❌ Profit breakdown  
❌ Detention timer  
❌ Accessorial requests  
❌ Counteroffers  
❌ Facility intelligence  

### Why
- Prevents confusion
- Prevents abuse
- Keeps onboarding simple

---

## 🟨 Stage 2: Established Driver (P1 Unlocked)

### Eligibility Thresholds
```
completed_loads ≥ 5
on_time_pct ≥ 90%
doc_on_time_pct ≥ 90%
dispute_rate ≤ 10%
```

### Newly Unlocked
✅ **Profitability explain drawer** - "Now I understand my pay"  
✅ **Detention timer** (auto-captured) - Accurate tracking  
✅ **Accessorial requests** - Submit claims with evidence  
✅ **Structured messaging templates** - Clear communication  
✅ **Variance alerts** - Proactive notification of pay differences  

### Driver Experience
> "Now I understand why I get paid what I get — and I can submit detention properly."

### System Benefit
- Fewer disputes
- Better evidence
- Faster approvals

---

## 🟩 Stage 3: Power Driver (P2 Unlocked)

### Eligibility Thresholds
```
completed_loads ≥ 20
on_time_pct ≥ 95%
doc_on_time_pct ≥ 95%
dispute_rate ≤ 5%
days_since_last_dispute ≥ 30
```

### Newly Unlocked
✅ **Counteroffers** (limited range) - Negotiate rates  
✅ **What-if pricing simulator** - Plan better routes  
✅ **Facility intelligence** - Know wait times before accepting  
✅ **Offline mode** - Work without connectivity  
✅ **Instant pay** (if enabled) - Faster payment  
✅ **Personal lane profitability history** - Data-driven decisions  

### Driver Experience
> "I get better loads, more control, and faster pay because I'm reliable."

### System Benefit
- Higher acceptance rates
- Better pricing signals
- Retention of best drivers

---

## 🔁 Cool-down Scenario (Feature-Specific)

### Trigger Events
If a power driver:
- Submits **repeated ineligible detention** claims
- **Misses docs repeatedly**
- Creates **multiple disputes** within short period

### Action Taken
```javascript
{
  feature: "accessorial_requests",
  cooldown_until: now + 30 days,
  reason: "Multiple ineligible claims submitted"
}
```

### Important: Granular Revocation
They **don't lose everything** — only the abused feature.

Other features (profit_explain, facility_intel, etc.) remain accessible.

---

## ⚙️ Carrier-Adjustable Gates

### 🚫 Never Adjustable (Global, Non-Negotiable)
These protect legal, financial, and security boundaries:

| Feature | Reason |
|---------|--------|
| Broker margin visibility | Legal + competitive |
| Customer rate exposure | Contractual |
| Server-side math | Financial correctness |
| Audit logging | Compliance |
| Acknowledgements | Legal defensibility |

### ✅ Carrier-Adjustable Gates
These should be policy-driven per carrier:

#### 1. Accessorial Eligibility Rules
- Free time minutes
- Detention rate per hour
- Required evidence

#### 2. P1 / P2 Thresholds (Within System Bounds)
**Example**:
- **Carrier A**: `completed_loads ≥ 3` (relaxed)
- **Carrier B**: `completed_loads ≥ 10` (strict)

With **system-enforced minimums** to prevent abuse.

#### 3. Counteroffer Range
- ±5%, ±10%, or disabled
- Flat vs RPM allowed

#### 4. Instant Pay Eligibility
- Enabled/disabled
- Fee %
- Max payout per load/week

#### 5. Facility Intelligence Visibility
- Enabled for all drivers
- Enabled only for trusted drivers
- Disabled entirely

---

## Carrier Policy Model

### Entity: CarrierDriverPolicy
```json
{
  "carrier_id": "carrier123",
  "feature_key": "instant_pay",
  "enabled": true,
  "min_completed_loads": 8,
  "min_on_time_pct": 92,
  "min_doc_on_time_pct": 90,
  "max_dispute_rate": 8,
  "cooldown_days": 30,
  "additional_notes": "Trial period for instant pay"
}
```

### Final Eligibility Formula
```
ELIGIBLE = system_rules AND carrier_policy AND driver_metrics
```

---

## UI Integration (No Hard-Coding)

Base44 will:
- ✅ Store entities
- ✅ Enforce eligibility in hooks
- ✅ Redact fields automatically
- ✅ Return `allowed_actions` to UI

The UI simply renders:
```javascript
if (allowed_actions.includes("DETENTION_TIMER")) {
  showDetentionTimer();
}
```

**No hard-coding. No guesswork.**

---

## Stage Progression Summary

| Stage | Loads | On-Time | Doc On-Time | Dispute Rate | Tier | Key Features |
|-------|-------|---------|-------------|--------------|------|--------------|
| **New** | 0-4 | - | - | - | Bronze | Basic status, escalation |
| **Established** | 5+ | 90%+ | 90%+ | ≤10% | Silver | Detention, accessorials, profit explain |
| **Power** | 20+ | 95%+ | 95%+ | ≤5% | Platinum | Counteroffers, what-if, instant pay |

---

**Implementation Complete** ✅  
**Driver Journey Enforced** ✅  
**Carrier Policies Supported** ✅