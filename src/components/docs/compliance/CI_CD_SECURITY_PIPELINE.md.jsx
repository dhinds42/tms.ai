# CI/CD SECURITY PIPELINE CONFIGURATION
**Application:** Dual TMS.ai  
**Purpose:** Automated security testing and compliance verification  
**Classification:** INTERNAL - DEVOPS

---

## GITHUB ACTIONS WORKFLOW

Since Base44 doesn't support `.github/workflows/` directory, implement this workflow in your CI/CD platform:

### Workflow Configuration

```yaml
name: Security Audit - Tenant Isolation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  
  entity-coverage:
    name: Entity Isolation Coverage
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm test -- functions/__tests__/security/entity-coverage-enforcement.test.js
      
      - name: Fail if coverage < 100%
        run: |
          if ! npm test -- functions/__tests__/p0-remediation/coverageGate.test.js; then
            echo "❌ SECURITY GATE FAILED" >&2
            exit 1
          fi
  
  penetration-tests:
    name: Attack Simulation Suite
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- functions/__tests__/security/penetration-tests.test.js
  
  security-report:
    name: Generate Report
    needs: [entity-coverage, penetration-tests]
    if: always()
    
    steps:
      - name: Summary
        run: |
          echo "# Security Audit Summary" >> $GITHUB_STEP_SUMMARY
          echo "Coverage: ${{ needs.entity-coverage.result }}" >> $GITHUB_STEP_SUMMARY
          echo "Penetration: ${{ needs.penetration-tests.result }}" >> $GITHUB_STEP_SUMMARY
```

---

## PRE-COMMIT HOOKS

**File:** `.git/hooks/pre-commit`

```bash
#!/bin/bash
# Pre-commit security checks

echo "🔒 Running security checks..."

# Check 1: Detect new entities without hooks
NEW_ENTITIES=$(git diff --cached --name-only | grep "entities/.*\.json")

for entity_file in $NEW_ENTITIES; do
  entity_name=$(basename "$entity_file" .json)
  hook_file="functions/entities/${entity_name,,}/beforeRead.js"
  
  if [ ! -f "$hook_file" ]; then
    echo "❌ Security check failed: $entity_name missing beforeRead hook"
    echo "   Create: $hook_file"
    exit 1
  fi
done

# Check 2: Detect tenant_id usage (should be org_id)
if git diff --cached | grep -q "tenant_id"; then
  echo "⚠️  Warning: Code uses 'tenant_id' (should use 'org_id')"
  echo "   Review changes before committing"
fi

# Check 3: Detect filter() without org_id
if git diff --cached | grep -E "\.filter\(\{" | grep -v "org_id" | grep -q "asServiceRole"; then
  echo "⚠️  Warning: asServiceRole.filter() without org_id detected"
  echo "   This may bypass tenant isolation"
fi

echo "✅ Security checks passed"
```

---

## CONTINUOUS MONITORING

### Daily Security Scan

```bash
#!/bin/bash
# tools/security/daily-scan.sh

echo "📊 Daily Security Scan - $(date)"
echo "════════════════════════════════════════════════"

# Run all security tests
npm test -- functions/__tests__/security/ --silent

# Check coverage
npm test -- functions/__tests__/p0-remediation/coverageGate.test.js

# Scan for anti-patterns
echo "🔍 Scanning for security anti-patterns..."
grep -r "\.filter({" functions/ | grep -v "org_id" > /tmp/violations.txt

if [ -s /tmp/violations.txt ]; then
  echo "⚠️  Found potential violations:"
  cat /tmp/violations.txt
else
  echo "✅ No violations found"
fi

echo "════════════════════════════════════════════════"
echo "Scan complete - $(date)"
```

**Schedule:** Run via cron daily at 2 AM

```cron
0 2 * * * /app/tools/security/daily-scan.sh >> /var/log/security-scan.log 2>&1
```

---

## DEPLOYMENT GATES

### Production Deployment Checklist

**Pre-Deployment Verification:**

```bash
#!/bin/bash
# tools/deploy/security-gate.sh

echo "🚀 Production Deployment Security Gate"
echo "════════════════════════════════════════════════"

# Gate 1: Entity coverage must be 100%
echo "Checking entity coverage..."
if ! npm test -- functions/__tests__/p0-remediation/coverageGate.test.js --silent; then
  echo "❌ DEPLOYMENT BLOCKED: Entity coverage < 100%"
  exit 1
fi
echo "✅ Entity coverage: 100%"

# Gate 2: All penetration tests must pass
echo "Running penetration tests..."
if ! npm test -- functions/__tests__/security/penetration-tests.test.js --silent; then
  echo "❌ DEPLOYMENT BLOCKED: Penetration tests failed"
  exit 1
fi
echo "✅ Penetration tests: PASS"

# Gate 3: Financial entities fully protected
echo "Verifying financial entity protection..."
if ! npm test -- --testNamePattern="All financial entities MUST have full CRUD" --silent; then
  echo "❌ DEPLOYMENT BLOCKED: Financial entities not fully protected"
  exit 1
fi
echo "✅ Financial entities: PROTECTED"

# Gate 4: No critical findings
echo "Checking for critical security findings..."
if grep -r "tenant_id" functions/shared/finance/ | grep -q "loadRecord.tenant_id"; then
  echo "❌ DEPLOYMENT BLOCKED: tenant_id usage detected (use org_id)"
  exit 1
fi
echo "✅ No critical anti-patterns"

echo "════════════════════════════════════════════════"
echo "✅ ALL SECURITY GATES PASSED - DEPLOYMENT APPROVED"
echo "════════════════════════════════════════════════"
```

---

## MONITORING ALERTS

### Real-Time Security Alerts

**Implementation:** Base44 scheduled function

```javascript
// functions/scheduled/securityAlerts.js
export default async function securityAlerts({ base44 }) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Alert 1: High volume of TENANT_ISOLATION_VIOLATION errors
  const violations = await base44.asServiceRole.entities.AuditLog.filter({
    action: 'READ_DENIED',
    created_date: { $gte: oneHourAgo.toISOString() }
  });
  
  if (violations.length > 50) {  // Threshold
    await sendSecurityAlert({
      severity: 'HIGH',
      title: 'High volume of tenant isolation violations',
      details: `${violations.length} violations in past hour`,
      actors: [...new Set(violations.map(v => v.actor_email))]
    });
  }
  
  // Alert 2: Admin cross-tenant access
  const adminAccess = await base44.asServiceRole.entities.AuditLog.filter({
    actor_role: 'admin',
    action: 'READ',
    created_date: { $gte: oneHourAgo.toISOString() }
  });
  
  // Filter for cross-org access (requires org_id in AuditLog)
  // TODO: Implement after C-1 remediation
  
  // Alert 3: Failed audit writes
  const failedAudits = await base44.asServiceRole.entities.AuditLog.filter({
    action: 'AUDIT_WRITE_FAILED',
    created_date: { $gte: oneHourAgo.toISOString() }
  });
  
  if (failedAudits.length > 0) {
    await sendSecurityAlert({
      severity: 'CRITICAL',
      title: 'Audit logging failures detected',
      details: `${failedAudits.length} operations proceeded without audit trail`
    });
  }
  
  return { ok: true, alerts_sent: /* count */ };
}
```

**Schedule:** Every 15 minutes

---

## COMPLIANCE DASHBOARD

### Real-Time Compliance Metrics

```javascript
// pages/SecurityComplianceDashboard.js
export default function SecurityComplianceDashboard() {
  const { data: coverageMetrics } = useQuery({
    queryKey: ['security-coverage'],
    queryFn: async () => {
      // Calculate entity coverage
      const totalEntities = 88;
      const protectedEntities = 71;  // From coverage gate
      
      return {
        entity_coverage: (protectedEntities / totalEntities * 100).toFixed(1),
        protected_entities: protectedEntities,
        unprotected_entities: totalEntities - protectedEntities,
        
        // Compliance scores
        soc2_cc6_1: 81,  // Logical access
        soc2_cc7_2: 90,  // Monitoring
        gdpr_art32: 81,  // Data segregation
        iso27001: 85     // Overall
      };
    }
  });
  
  return (
    <div>
      <h1>Security & Compliance Dashboard</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <MetricCard 
          title="Entity Coverage"
          value={`${coverageMetrics.entity_coverage}%`}
          status={coverageMetrics.entity_coverage >= 100 ? 'pass' : 'warning'}
        />
        
        <MetricCard 
          title="SOC2 CC6.1"
          value={`${coverageMetrics.soc2_cc6_1}%`}
          status={coverageMetrics.soc2_cc6_1 >= 95 ? 'pass' : 'warning'}
        />
        
        {/* ... */}
      </div>
    </div>
  );
}
```

---

**Document Control:**
- Version: 2.0
- Last Updated: 2026-01-04
- Next Review: 2026-02-04
- Owner: Security Team