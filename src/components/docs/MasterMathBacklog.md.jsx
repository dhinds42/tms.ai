# TMS.ai Master Math & Finance Implementation Backlog
**Generated: 2025-12-31**

## Priority Legend
- **P0** - Go-Live Critical (blocking production)
- **P1** - Next Sprint (required for full operations)
- **P2+** - Future Enhancements

---

## GROUP A: Money Foundations (Precision + Consistency)
**Priority: P0**

| # | Function | Purpose | Status |
|---|----------|---------|--------|
| 1 | `Cents` type | Integer-cents type definition | ✅ DONE |
| 2 | `addMoney/subMoney/mulMoney/divMoney` | Safe arithmetic operations | ✅ DONE |
| 3 | `roundMoney` | Currency rounding with strategy | ✅ DONE |
| 4 | `allocateCents` | Penny-perfect proportional allocation | ✅ DONE |
| 5 | `parseCurrency` | String to cents conversion | ✅ DONE |
| 6 | `formatCurrency` | Cents to display string | ✅ DONE |
| 7 | `parsePercent` | Parse percentage strings | 🔨 TODO |
| 8 | `formatPercent` | Format percentage for display | 🔨 TODO |
| 9 | `safePercent` | Safe percentage calc (handles zero) | 🔨 TODO |
| 10 | `isWithinTolerance` | Compare with tolerance | 🔨 TODO |
| 11 | `reconcileHeaderToLines` | Ensure header = sum(lines) | 🔨 TODO |

---

## GROUP B: Load Pricing & Profitability (Broker Core)
**Priority: P0**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 12 | `calcCustomerTotal` | Total customer charges | Load | ✅ DONE |
| 13 | `calcCarrierTotal` | Total carrier costs | Load | ✅ DONE |
| 14 | `calcMarginAmount` | Gross margin calculation | Load | ✅ DONE |
| 15 | `calcMarginPercent` | Margin percentage | Load | ✅ DONE |
| 16 | `validateMarginPolicy` | Enforce margin rules | Load | ✅ DONE |
| 17 | `calcRatePerMile` | Revenue/cost per mile | Load | ✅ DONE |
| 18 | `calcAllInRate` | Total rate including FSC | Load | 🔨 TODO |
| 19 | `calcProfitPerLoad` | Net profit after overhead | Load | ✅ DONE |
| 20 | `calcContributionMargin` | Margin before fixed costs | Load | 🔨 TODO |

---

## GROUP C: Accessorial Calculations + Eligibility + Dupes
**Priority: P1**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 21 | `sumAccessorials` | Sum accessorial charges | Load | 🔨 TODO |
| 22 | `calcDetention` | Detention charge calc | Load | 🔨 TODO |
| 23 | `isDetentionEligible` | Check if detention applies | Load | 🔨 TODO |
| 24 | `calcLayover` | Layover charge calc | Load | 🔨 TODO |
| 25 | `isLayoverEligible` | Check if layover applies | Load | 🔨 TODO |
| 26 | `calcTONU` | TONU charge calc | Load | 🔨 TODO |
| 27 | `isToNuEligible` | Check TONU eligibility | Load | 🔨 TODO |
| 28 | `calcLumper` | Lumper fee calc | Load | 🔨 TODO |
| 29 | `validateLumper` | Validate lumper receipt | Load | 🔨 TODO |
| 30 | `calcStopOff` | Stop-off charge calc | Load | 🔨 TODO |
| 31 | `detectDuplicateAccessorial` | Prevent double billing | Load | 🔨 TODO |

---

## GROUP D: Multi-Stop / Allocation / Stop-Level Profitability
**Priority: P2+**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 32 | `allocateRevenueAcrossStops` | Split revenue by stops | Load | 🔨 TODO |
| 33 | `allocateCostAcrossStops` | Split costs by stops | Load | 🔨 TODO |
| 34 | `calcStopCost` | Cost per stop | Stop | 🔨 TODO |
| 35 | `calcProfitByStop` | Profit attribution | Stop | 🔨 TODO |
| 36 | `calcLaneProfitability` | Lane-level P&L | Analytics | 🔨 TODO |

---

## GROUP E: Invoice / AR (Customer Billing)
**Priority: P0 (33-35), P1 (36-41)**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 37 | `calcInvoiceTotal` | Sum of line items | Invoice | 🔨 TODO |
| 38 | `calcBalanceDue` | Invoice - payments | Invoice | 🔨 TODO |
| 39 | `calcCreditMemo` | Credit memo calculation | Invoice | 🔨 TODO |
| 40 | `applyAdjustments` | Apply invoice adjustments | Invoice | 🔨 TODO |
| 41 | `calcDisputeBalance` | Disputed amount tracking | Invoice | 🔨 TODO |
| 42 | `calcDueDate` | Payment terms → due date | Invoice | 🔨 TODO |
| 43 | `calcAgingBuckets` | AR aging (0-30, 31-60, etc.) | Invoice | 🔨 TODO |
| 44 | `calcDSO` | Days sales outstanding | Analytics | ✅ DONE |
| 45 | `detectDuplicateInvoice` | Prevent duplicate billing | Invoice | 🔨 TODO |

---

## GROUP F: Carrier Settlements / AP (Carrier & Owner-Operator)
**Priority: P0 (42-45), P1 (46-49)**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 46 | `calcSettlementGross` | Total gross pay | Settlement | ✅ DONE |
| 47 | `calcDeductionsTotal` | Sum all deductions | Settlement | ✅ DONE |
| 48 | `calcSettlementNet` | Net pay calculation | Settlement | ✅ DONE |
| 49 | `validateNetPolicy` | Enforce negative net rules | Settlement | ✅ DONE |
| 50 | `calcAdvanceRemaining` | Outstanding advance balance | Settlement | 🔨 TODO |
| 51 | `calcEscrowContribution` | Escrow withholding | Settlement | 🔨 TODO |
| 52 | `calcOwnerOpLease` | Owner-operator lease % | Settlement | 🔨 TODO |
| 53 | `calcOwnerOpMaintenance` | Maintenance reserve | Settlement | 🔨 TODO |
| 54 | `detectDuplicateSettlement` | Prevent double payment | Settlement | 🔨 TODO |

---

## GROUP G: Driver Pay (If Supported)
**Priority: P1**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 55 | `calcDriverPayCPM` | Cents-per-mile pay | Driver | 🔨 TODO |
| 56 | `calcDriverPayPercent` | Percentage-based pay | Driver | ✅ DONE |
| 57 | `calcDriverPayFlat` | Flat fee per load | Driver | 🔨 TODO |
| 58 | `calcPerDiem` | Per diem allowance | Driver | 🔨 TODO |
| 59 | `calcDriverDeductions` | Driver deductions | Driver | 🔨 TODO |

---

## GROUP H: Fuel Surcharge (FSC)
**Priority: P1**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 60 | `calcFSC` | FSC from DOE price | Load | ✅ DONE |
| 61 | `calcFSCFromIndex` | FSC from custom index | Load | 🔨 TODO |
| 62 | `getEffectiveFSC` | FSC with effective dates | Load | 🔨 TODO |

---

## GROUP I: Contracts / Tariffs / Pricing Rules
**Priority: P2+**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 63 | `getEffectiveRate` | Rate with effective dating | Contract | 🔨 TODO |
| 64 | `calcContractRate` | Apply contract pricing | Load | 🔨 TODO |
| 65 | `applyMinCharge` | Enforce minimum charge | Load | 🔨 TODO |
| 66 | `applyRateCap` | Apply rate cap/ceiling | Load | 🔨 TODO |
| 67 | `applyEscalators` | Annual rate escalation | Contract | 🔨 TODO |
| 68 | `pricingRuleVersioning` | Version control for rules | Contract | 🔨 TODO |

---

## GROUP J: Claims / Penalties / Bonuses
**Priority: P2+**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 69 | `calcLatePenalty` | Late delivery penalty | Load | 🔨 TODO |
| 70 | `calcOTDBonus` | On-time delivery bonus | Load | 🔨 TODO |
| 71 | `calcClaimExposure` | Potential claim value | Claim | 🔨 TODO |

---

## GROUP K: KPIs & Analytics (Ops + Finance)
**Priority: P1**

| # | Function | Purpose | Analytics | Status |
|---|----------|---------|-----------|--------|
| 72 | `calcOnTimePercent` | On-time delivery % | Dashboard | ✅ DONE |
| 73 | `calcTenderAcceptanceRate` | Acceptance rate % | Dashboard | 🔨 TODO |
| 74 | `calcEmptyMilesPercent` | Deadhead miles % | Dashboard | 🔨 TODO |
| 75 | `calcFleetUtilization` | Asset utilization % | Dashboard | 🔨 TODO |
| 76 | `calcRevenuePerTruck` | Revenue per asset | Dashboard | 🔨 TODO |
| 77 | `calcRevenuePerMile` | Revenue efficiency | Dashboard | ✅ DONE |
| 78 | `calcCostPerMile` | Cost efficiency | Dashboard | ✅ DONE |
| 79 | `calcProfitByCustomer` | Customer profitability | Analytics | 🔨 TODO |

---

## GROUP L: Compliance Timing Math
**Priority: P0**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 80 | `daysUntil` | Days until date | Compliance | 🔨 TODO |
| 81 | `isExpiring` | Check expiration window | Compliance | 🔨 TODO |
| 82 | `nextReviewDate` | Calculate next review | Compliance | 🔨 TODO |
| 83 | `calcComplianceRiskScore` | Risk score from expiry | Compliance | 🔨 TODO |

---

## GROUP M: Imports, Parsing, Normalization (Data Integrity)
**Priority: P0**

| # | Function | Purpose | Import | Status |
|---|----------|---------|--------|--------|
| 84 | `parseNumberStrict` | Reject invalid numbers | Import | ✅ DONE |
| 85 | `normalizeUnits` | Convert lbs/kg, mi/km | Import | 🔨 TODO |
| 86 | `validateNumericBounds` | Range validation | Import | 🔨 TODO |
| 87 | `validateRateSanity` | Outlier detection | Import | 🔨 TODO |
| 88 | `rowErrorSchema` | Structured error format | Import | 🔨 TODO |

---

## GROUP N: Auditability & Reconciliation (SOC 2 / Finance-Grade)
**Priority: P0**

| # | Function | Purpose | Audit | Status |
|---|----------|---------|-------|--------|
| 89 | `recomputeDerivedFields` | Recalc all derived fields | All | 🔨 TODO |
| 90 | `assertInvariants` | Verify data integrity | All | 🔨 TODO |
| 91 | `calcVariance` | Difference analysis | Analytics | 🔨 TODO |
| 92 | `diffFinancialFields` | Before/after diff | Audit | 🔨 TODO |
| 93 | `explainCalculation` | Human-readable calc log | Audit | 🔨 TODO |
| 94 | `hashFinancialSnapshot` | Tamper detection | Audit | 🔨 TODO |

---

## GROUP O: Security Controls Tied to Math (Dual System Critical)
**Priority: P0**

| # | Function | Purpose | Security | Status |
|---|----------|---------|----------|--------|
| 95 | `redactFinancialsByRole` | Role-based field stripping | All | ✅ DONE |
| 96 | `canOverrideMargin` | Permission check | Load | 🔨 TODO |
| 97 | `isFinanciallyLocked` | Check if editable | All | 🔨 TODO |
| 98 | `logAccessDenied` | Security audit logging | Audit | 🔨 TODO |
| 99 | `detectAnomalies` | Flag suspicious values | Audit | 🔨 TODO |

---

## GROUP P: Feasibility & Scheduling Math (Optional Future)
**Priority: P2+**

| # | Function | Purpose | Entity | Status |
|---|----------|---------|--------|--------|
| 100 | `calcTransitHours` | Estimated transit time | Load | 🔨 TODO |
| 101 | `isLate` | Late delivery detection | Load | 🔨 TODO |
| 102 | `calcOnTimeClassification` | On-time status | Load | 🔨 TODO |
| 103 | `calcHOSFeasibility` | HOS validation | Driver | 🔨 TODO |

---

## Implementation Phases

### Phase 0: Foundation (✅ 60% COMPLETE)
- [x] Money math library (money.ts)
- [x] Parsing utilities (parsing.ts)
- [x] Rounding rules (rounding.ts)
- [x] Basic rate calculations (rates.ts)
- [x] Settlement calculations (settlements.ts)
- [x] Basic KPIs (kpis.ts)
- [x] Load hooks (beforeCreate/beforeUpdate/afterRead)
- [x] Basic tests (money, rates, RBAC)

### Phase 1: P0 Completion (NOW)
- [ ] Complete Group A (percent utilities)
- [ ] Complete Group B (all load pricing)
- [ ] Complete Group L (compliance timing)
- [ ] Complete Group M (import validation)
- [ ] Complete Group N (audit + invariants)
- [ ] Complete Group O (security + locks)
- [ ] Invoice entity hooks
- [ ] Settlement entity hooks
- [ ] Comprehensive P0 tests

### Phase 2: P1 Features
- [ ] Group C (accessorials + eligibility)
- [ ] Group H (FSC variations)
- [ ] Group E (AR/aging/terms)
- [ ] Group K (advanced KPIs)
- [ ] Group G (driver pay variants)

### Phase 3: P2+ Features
- [ ] Group D (multi-stop allocation)
- [ ] Group I (contract pricing)
- [ ] Group J (claims/penalties)
- [ ] Group P (scheduling math)

---

## Current Status
- **Total Functions:** 103
- **Completed:** 18 (17%)
- **In Progress:** 85 (83%)
- **Priority Breakdown:**
  - P0: 55 functions (33% complete)
  - P1: 30 functions (10% complete)
  - P2+: 18 functions (0% complete)