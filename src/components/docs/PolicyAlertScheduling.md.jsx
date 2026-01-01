# Policy Alert Scheduling Guide

## Overview

The `dailyPolicyAlerts` function should run once per day at 02:00 America/New_York to generate KPI-driven policy alerts.

---

## 🔧 Scheduling Options

### Option 1: Manual Trigger (Testing & Development)

**Admin UI Button**:
```jsx
// Add to Settings page or admin dashboard
import { base44 } from '@/api/base44Client';

const handleManualRun = async () => {
  const result = await base44.functions.dailyPolicyAlerts();
  console.log('Alert generation result:', result);
};

<Button onClick={handleManualRun}>
  Run Policy Alert Generation
</Button>
```

---

### Option 2: Vercel Cron (If Deployed on Vercel)

**File**: `vercel.json` (root of project)
```json
{
  "crons": [{
    "path": "/api/cron/policy-alerts",
    "schedule": "0 2 * * *"
  }]
}
```

**API Route**: `api/cron/policy-alerts.js`
```javascript
import { base44 } from '@/api/base44Client';

export default async function handler(req, res) {
  // Verify cron secret
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = await base44.functions.dailyPolicyAlerts();
  return res.status(200).json(result);
}
```

---

### Option 3: AWS EventBridge (If on AWS)

**CloudWatch Event Rule**:
```yaml
Schedule: cron(0 7 * * ? *)  # 02:00 EST = 07:00 UTC
Target: Lambda function
```

**Lambda Handler**:
```javascript
const { base44 } = require('@base44/sdk');

exports.handler = async (event) => {
  const result = await base44.functions.dailyPolicyAlerts();
  return result;
};
```

---

### Option 4: GitHub Actions (CI/CD)

**File**: `.github/workflows/daily-alerts.yml`
```yaml
name: Daily Policy Alerts
on:
  schedule:
    - cron: '0 7 * * *'  # 02:00 EST
  workflow_dispatch:  # Allow manual trigger

jobs:
  generate-alerts:
    runs-on: ubuntu-latest
    steps:
      - name: Run Policy Alerts
        run: |
          curl -X POST https://your-app.base44.app/api/policy-alerts \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

### Option 5: Base44 Backend Function with External Cron

**Cron Service** (e.g., cron-job.org, EasyCron):
- URL: `https://your-app.base44.app/api/functions/dailyPolicyAlerts`
- Schedule: `0 2 * * *`
- Method: POST
- Headers: `Authorization: Bearer YOUR_SECRET`

**Verify in Function**:
```javascript
// In dailyPolicyAlerts.js
export default async function dailyPolicyAlerts(base44, { headers }) {
  if (headers?.authorization !== `Bearer ${process.env.POLICY_ALERT_SECRET}`) {
    return { error: 'Unauthorized', status: 401 };
  }
  
  // ... rest of logic
}
```

---

## 🔐 Security Best Practices

### 1. Secret Token
```bash
# Set environment variable
POLICY_ALERT_SECRET=your-random-secret-token-here
```

### 2. IP Allowlist (Optional)
```javascript
const ALLOWED_IPS = ['127.0.0.1', 'vercel-cron-ip'];

if (!ALLOWED_IPS.includes(req.ip)) {
  return { error: 'IP not allowed', status: 403 };
}
```

### 3. Rate Limiting
```javascript
// Ensure only runs once per day
const lastRun = await getLastRunTimestamp();
if (Date.now() - lastRun < 23 * 60 * 60 * 1000) {
  return { error: 'Already ran today', status: 429 };
}
```

---

## 📊 Monitoring

### Check Last Run
```javascript
const lastAudit = await base44.entities.AuditLog.filter({
  entity_type: 'PolicyAlert',
  action: 'POLICY_ALERT_BATCH_GENERATED'
});

console.log('Last run:', lastAudit[0].created_date);
console.log('Summary:', lastAudit[0].metadata);
```

### Alert on Failures
```javascript
// In dailyPolicyAlerts.js
if (!result.success) {
  await base44.integrations.Core.SendEmail({
    to: 'ops@company.com',
    subject: 'Policy Alert Generation Failed',
    body: `Error: ${result.error}`
  });
}
```

---

## 🧪 Testing Schedule

### Test Manually First
```javascript
// In browser console or admin UI
const result = await base44.functions.dailyPolicyAlerts();
console.log(result);
```

### Verify Output
```javascript
{
  success: true,
  summary: {
    created_count: 5,
    skipped_count: 2,
    carriers_evaluated: 10
  },
  duration_ms: 2340,
  timestamp: "2026-01-01T07:00:00.000Z"
}
```

### Check Alerts Created
```javascript
const newAlerts = await base44.entities.PolicyAlert.filter({
  created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
});

console.log('Alerts created in last 24h:', newAlerts.length);
```

---

## 🎯 Recommended Setup (For TMS.ai)

**Phase 1: Manual (Week 1)**
- Run manually from admin UI daily
- Monitor output and alerts generated
- Adjust thresholds if too noisy

**Phase 2: Scheduled (Week 2+)**
- Set up Vercel Cron or external cron service
- Monitor for failures
- Add email notifications on errors

**Phase 3: Production (Month 2+)**
- Automated with monitoring
- Alert review integrated into daily ops
- KPI dashboard tracking alert trends

---

**📅 Schedule Configuration Complete**