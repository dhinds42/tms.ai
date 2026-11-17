# Test Backlog (Stage 0.5)

These legacy suites were never executable before Stage 0 (broken imports,
no runner). With the Stage 0 harness in place they now run and reveal
pre-existing failures. They are excluded from CI via `jest.known-failures.cjs`
until repaired. Each must be fixed (code or test) and re-enabled one by one.

## Failure classes

- **Assertion mismatch** — the test asserts behavior the code does not
  implement (or vice versa). Repair the correct side per the spec.
- **Coverage gate** — `entity-coverage-enforcement` demands 100% entity
  coverage; actual is ~29%. Either implement the missing hooks or stage the
  threshold up as coverage work lands.
- **SDK-data assertions** — tests assert on records that require live Base44
  data; the unit-test stub returns empty. Convert to proper mocks or move to
  a verified integration test tier.

## Excluded suites (30)

| Suite | Class | First observed failure |
|---|---|---|
| lane-profitability/laneProfitability | Assertion | per_mile requires customer_rpm_cents, test expects computation |
| lane-profitability/enforcement | Assertion | enforcement behavior mismatch |
| alerts/policyAlertGeneration | Assertion | generation expectations mismatch |
| alerts/applyPolicyFromAlert | Assertion | policy application mismatch |
| security/entity-coverage-enforcement | Coverage gate | expected 100, actual ~28.9 |
| security/authorize | Assertion | RBAC default mismatch |
| validation | Assertion | rule expectations mismatch |
| validation/businessRules | Assertion | rule expectations mismatch |
| trust-features/payConfidence | Assertion/SDK-data | confidence score mismatch |
| trust-features/offerAcknowledgement | Assertion/SDK-data | acknowledgement flow mismatch |
| trust-features/documentChecklist | Assertion/SDK-data | checklist mismatch |
| trust-features/rbacRedaction | Assertion/SDK-data | redaction mismatch |
| trust-features/escalations | Assertion/SDK-data | escalation mismatch |
| dispute-reduction/accessorialApproval | Assertion/SDK-data | approval rule mismatch |
| dispute-reduction/accessorialEligibility | Assertion/SDK-data | eligibility mismatch |
| dispute-reduction/detentionAutoCapture | Assertion/SDK-data | capture mismatch |
| dispute-reduction/varianceAlerts | Assertion/SDK-data | alert thresholds mismatch |
| dispute-reduction/messageTemplates | Assertion | template output mismatch |
| dispute-reduction/driverEdits | Assertion | edit policy mismatch |
| dispute-reduction/duplicateDetection | Assertion | detection mismatch |
| eligibility/carrierOverrides | Assertion | override precedence mismatch |
| freight/truckPricing | Assertion | pricing expectation mismatch |
| finance/variance | Assertion | variance math mismatch |
| finance/accruals | Assertion | accrual expectations mismatch |
| rbac/loadRedaction | Assertion | redaction mismatch |
| integration/load-workflow | SDK-data | workflow needs live entities |
| integration/settlement-workflow | SDK-data | workflow needs live entities |
| integration/invoice-workflow | SDK-data | workflow needs live entities |
| math/compliance | Assertion | compliance math mismatch |
| math/parsing | Assertion | parser expectations mismatch |

## Still enabled (50 suites, ~383 tests)

All other suites pass and gate CI, including the full `math/*` core,
`security/*` (locks, overrides, entity-coverage enforcement excluded),
`rbac`, `finance`, `freight`, `hooks`, `imports`, `p0-remediation`, and
`validation` (base).

## Added during Stage 0 CI bring-up (4)

| Suite | Class | Detail |
|---|---|---|
| security/penetration-tests | Mock scaffolding | PT-6 expects AUDIT_WRITE_FAILED; needs Organization/Role/active-membership mocks so authorization passes and the audit-rejection path is reached. authorizationEngine base44-audit-call fix landed in Stage 0. |
| p0-remediation/coverageGate | Mock scaffolding + coverage | Audit fail-closed tests need full RBAC mock chain; entity hook coverage check unmet (~29%). |
| eligibility/featureGating | Mock scaffolding | Mock lacks asServiceRole nesting used by RBAC helpers; "detention_timer after 1 load" blocked. |
| hooks/loadHooks | Mock scaffolding | afterRead redaction test trips RBAC helpers before reaching redaction assertions. |

**Fixed in Stage 0 (production code):** authorizationEngine passed a string
where logAccessDenied expects the base44 client (3 call sites) — audit writes
on denial crashed. Now fail-closed denial audit works end to end.
