# Disaster Recovery Runbook
## TMS.ai - Business Continuity & Recovery Procedures

**Document Version:** 1.0  
**Date:** 2025-11-25  
**Classification:** Confidential - Internal Use Only  
**Owner:** Engineering & Operations  
**Review Cycle:** Quarterly  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Recovery Objectives](#2-recovery-objectives)
3. [Contact Directory](#3-contact-directory)
4. [Incident Classification](#4-incident-classification)
5. [Recovery Procedures](#5-recovery-procedures)
6. [Verification & Validation](#6-verification--validation)
7. [Communication Templates](#7-communication-templates)
8. [Appendices](#8-appendices)

---

## 1. Executive Summary

This runbook provides step-by-step procedures for recovering TMS.ai services following a disaster or major outage. It covers infrastructure failures, data corruption, security incidents, and regional outages.

### Scope

- Production environment (api.tms.ai, app.tms.ai)
- Database systems
- File storage
- Integration services
- Authentication systems

### Out of Scope

- Development/staging environments
- Third-party service outages (handled separately)
- Individual user issues

---

## 2. Recovery Objectives

### 2.1 Recovery Time Objective (RTO)

| Service Tier | RTO | Description |
|--------------|-----|-------------|
| Critical | 1 hour | Authentication, Load Management, Dispatch |
| High | 4 hours | Invoicing, Documents, Tracking |
| Medium | 8 hours | Reporting, Analytics |
| Low | 24 hours | Historical data, Archives |

### 2.2 Recovery Point Objective (RPO)

| Data Type | RPO | Backup Frequency |
|-----------|-----|------------------|
| Transaction Data | 15 minutes | Continuous replication |
| User Data | 1 hour | Hourly snapshots |
| Documents | 4 hours | 4x daily sync |
| Audit Logs | 1 hour | Hourly export |
| Configuration | 24 hours | Daily backup |

### 2.3 Service Level Targets

| Metric | Target | Maximum Acceptable |
|--------|--------|-------------------|
| Availability | 99.9% | 99.5% |
| Monthly Downtime | 43 minutes | 3.6 hours |
| Data Loss | 0 | 1 hour |
| Full Recovery | 4 hours | 8 hours |

---

## 3. Contact Directory

### 3.1 Internal Contacts

| Role | Name | Phone | Email | Escalation |
|------|------|-------|-------|------------|
| Incident Commander (Primary) | [Name] | +1-XXX-XXX-XXXX | ic@tms.ai | 1st |
| Incident Commander (Backup) | [Name] | +1-XXX-XXX-XXXX | ic-backup@tms.ai | 2nd |
| Engineering Lead | [Name] | +1-XXX-XXX-XXXX | eng-lead@tms.ai | Technical |
| Database Administrator | [Name] | +1-XXX-XXX-XXXX | dba@tms.ai | Data |
| Security Officer | [Name] | +1-XXX-XXX-XXXX | security@tms.ai | Security |
| Customer Success Lead | [Name] | +1-XXX-XXX-XXXX | cs-lead@tms.ai | Communication |
| CEO | [Name] | +1-XXX-XXX-XXXX | ceo@tms.ai | Executive |

### 3.2 External Contacts

| Vendor | Service | Support Number | Account ID |
|--------|---------|----------------|------------|
| Base44 | Platform | support@base44.com | ACCT-XXXXX |
| AWS | Cloud Infrastructure | +1-XXX-XXX-XXXX | XXXX-XXXX-XXXX |
| Cloudflare | CDN/Security | enterprise@cloudflare.com | CF-XXXXX |
| PagerDuty | Alerting | +1-XXX-XXX-XXXX | PD-XXXXX |
| [Insurance] | Cyber Insurance | +1-XXX-XXX-XXXX | POL-XXXXX |

### 3.3 Escalation Matrix

```
Level 1 (0-15 min)    → On-call Engineer
Level 2 (15-30 min)   → Engineering Lead + Incident Commander
Level 3 (30-60 min)   → Security Officer + Customer Success
Level 4 (60+ min)     → CEO + Legal (if needed)
```

---

## 4. Incident Classification

### 4.1 Severity Levels

| Severity | Definition | Examples | Response Time |
|----------|------------|----------|---------------|
| SEV-1 | Complete outage, all users affected | Total system down, data breach | Immediate |
| SEV-2 | Major feature unavailable | Dispatch down, cannot create loads | 15 minutes |
| SEV-3 | Degraded performance | Slow response times, partial outage | 30 minutes |
| SEV-4 | Minor issue, workaround available | Single integration down | 2 hours |

### 4.2 Incident Types

| Type | Code | Description |
|------|------|-------------|
| Infrastructure | INF | Server, network, cloud failures |
| Database | DB | Data corruption, replication failure |
| Security | SEC | Breach, unauthorized access |
| Application | APP | Code bugs, deployment failures |
| Integration | INT | Third-party service failures |
| Data | DAT | Data loss, corruption |

---

## 5. Recovery Procedures

### 5.1 Initial Response (All Incidents)

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIAL RESPONSE                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Acknowledge alert in PagerDuty                           │
│ 2. Join incident Slack channel (#incident-response)         │
│ 3. Assess severity using classification matrix              │
│ 4. Notify Incident Commander if SEV-1 or SEV-2             │
│ 5. Begin incident timeline documentation                    │
│ 6. Determine if customer communication needed               │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Database Recovery

#### 5.2.1 Database Connection Failure

**Symptoms:** Application errors, "Database unavailable" messages

**Steps:**
```bash
# 1. Verify database status
curl -s https://api.base44.com/health/db

# 2. Check recent deployments
git log --oneline -10

# 3. If Base44 managed:
#    - Contact Base44 support immediately
#    - Check Base44 status page

# 4. If connection pool exhausted:
#    - Restart application instances
#    - Review connection pool settings

# 5. Verify recovery
curl -s https://api.tms.ai/health
```

#### 5.2.2 Data Corruption Recovery

**Symptoms:** Inconsistent data, application errors on specific records

**Steps:**
```
1. STOP all write operations immediately
   - Enable maintenance mode
   - Notify users of read-only mode

2. IDENTIFY corruption scope
   - Query affected records
   - Check audit logs for anomalies
   - Determine corruption timestamp

3. SELECT recovery point
   - Identify last known good backup
   - Verify backup integrity
   - Calculate data loss window

4. EXECUTE recovery
   - Restore from point-in-time backup
   - Replay transaction logs if available
   - Verify data integrity

5. VALIDATE
   - Run data consistency checks
   - Verify critical business data
   - Test application functionality

6. RESUME operations
   - Disable maintenance mode
   - Monitor for issues
   - Notify users of restoration
```

#### 5.2.3 Point-in-Time Recovery

**Prerequisites:**
- Backup timestamp identified
- Incident Commander approval
- Customer communication sent

**Steps:**
```bash
# 1. Contact Base44 support for database restore
# Include:
#   - Target restore timestamp (UTC)
#   - Reason for restore
#   - Incident ticket number

# 2. While waiting for restore:
#   - Document all transactions since backup
#   - Prepare data reconciliation plan
#   - Notify affected customers

# 3. Post-restore validation
#   - Verify record counts
#   - Check recent transactions
#   - Test critical workflows

# 4. Data reconciliation
#   - Re-enter lost transactions if needed
#   - Document any unrecoverable data
```

### 5.3 Application Recovery

#### 5.3.1 Deployment Rollback

**Symptoms:** Application errors after deployment, new features broken

**Steps:**
```bash
# 1. Identify last working version
git log --oneline -20

# 2. Revert to previous version
# (Via Base44 dashboard or CI/CD)

# 3. Verify rollback
curl -s https://api.tms.ai/health
curl -s https://api.tms.ai/version

# 4. Document issues for post-mortem
# - Capture error logs
# - Screenshot user reports
# - Note exact failure time
```

#### 5.3.2 Full Application Restore

**Symptoms:** Application completely unavailable, infrastructure failure

**Steps:**
```
1. ASSESS infrastructure status
   - Check cloud provider status
   - Verify DNS resolution
   - Test network connectivity

2. ACTIVATE failover (if available)
   - Switch DNS to backup region
   - Activate standby instances
   - Verify database replication

3. RESTORE from backup (if no failover)
   - Deploy application to new infrastructure
   - Restore database from backup
   - Restore file storage
   - Update DNS records

4. VERIFY functionality
   - Health checks passing
   - Critical workflows operational
   - Integrations connected

5. MONITOR closely for 24 hours
```

### 5.4 Security Incident Response

#### 5.4.1 Suspected Data Breach

**CRITICAL: Follow in exact order**

```
┌─────────────────────────────────────────────────────────────┐
│              SECURITY INCIDENT RESPONSE                      │
│                    DO NOT SKIP STEPS                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ PHASE 1: CONTAIN (First 15 minutes)                         │
│ ─────────────────────────────────────                        │
│ □ Alert Security Officer immediately                         │
│ □ Do NOT reboot or modify affected systems                  │
│ □ Revoke compromised credentials                            │
│ □ Block suspicious IP addresses                             │
│ □ Preserve all logs (do not delete anything)                │
│                                                              │
│ PHASE 2: ASSESS (15-60 minutes)                             │
│ ─────────────────────────────────────                        │
│ □ Determine attack vector                                   │
│ □ Identify affected data/systems                            │
│ □ Assess data exfiltration scope                            │
│ □ Check for persistence mechanisms                          │
│ □ Document timeline of events                               │
│                                                              │
│ PHASE 3: NOTIFY (Within 1 hour for SEV-1)                   │
│ ─────────────────────────────────────                        │
│ □ Notify CEO and Legal                                      │
│ □ Contact cyber insurance carrier                           │
│ □ Prepare customer notification (if PII affected)           │
│ □ Report to authorities if required                         │
│                                                              │
│ PHASE 4: REMEDIATE                                          │
│ ─────────────────────────────────────                        │
│ □ Patch vulnerability                                       │
│ □ Reset all potentially affected credentials                │
│ □ Implement additional monitoring                           │
│ □ Restore from clean backup if needed                       │
│                                                              │
│ PHASE 5: RECOVER                                            │
│ ─────────────────────────────────────                        │
│ □ Verify system integrity                                   │
│ □ Resume normal operations                                  │
│ □ Enhanced monitoring for 30 days                           │
│ □ Conduct post-incident review                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 5.4.2 Ransomware Response

```
⚠️  CRITICAL: DO NOT PAY RANSOM WITHOUT LEGAL/EXECUTIVE APPROVAL

1. ISOLATE immediately
   - Disconnect affected systems from network
   - Do NOT power off (preserves evidence)
   - Block lateral movement

2. ASSESS scope
   - Which systems encrypted?
   - Is backup infrastructure affected?
   - Are backups intact?

3. CONTACT
   - FBI IC3 (ic3.gov) - Required for insurance
   - Cyber insurance carrier
   - Legal counsel
   - Forensics firm (from insurance panel)

4. RECOVER (only after forensics approval)
   - Rebuild systems from known good images
   - Restore data from offline backups
   - Change all credentials
   - Implement additional controls
```

### 5.5 Regional/Cloud Outage

#### 5.5.1 Single Region Failure

**Steps:**
```
1. VERIFY outage
   - Check cloud provider status page
   - Confirm not application issue
   - Document start time

2. FAILOVER to secondary region
   - Update DNS to failover endpoints
   - Activate read replicas as primary
   - Verify data consistency

3. MONITOR
   - Track primary region recovery
   - Monitor secondary region performance
   - Prepare for failback

4. FAILBACK (when primary restored)
   - Verify primary region healthy
   - Sync data changes
   - Gradual traffic shift back
   - Confirm stability before full cutover
```

### 5.6 Integration Recovery

#### 5.6.1 ELD Integration Failure

**Impact:** No real-time GPS/HOS data

**Steps:**
```
1. Check ELD provider status page
2. Test API connectivity manually
3. If provider issue:
   - Enable manual check-call mode
   - Notify dispatch team
   - Monitor for resolution
4. If our issue:
   - Check API credentials
   - Review recent code changes
   - Verify webhook endpoints
5. Once restored:
   - Backfill missing data if possible
   - Resume normal tracking
```

#### 5.6.2 Payment Integration Failure

**Impact:** Cannot process payments

**Steps:**
```
1. Identify affected integration (QuickBooks, TriumphPay, etc.)
2. Check provider status
3. If critical:
   - Enable manual payment recording
   - Queue payments for processing
4. Once restored:
   - Process queued payments
   - Reconcile records
```

---

## 6. Verification & Validation

### 6.1 Post-Recovery Checklist

```
┌─────────────────────────────────────────────────────────────┐
│              POST-RECOVERY VERIFICATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ INFRASTRUCTURE                                               │
│ □ All services responding to health checks                  │
│ □ Database connections stable                               │
│ □ File storage accessible                                   │
│ □ CDN functioning correctly                                 │
│ □ SSL certificates valid                                    │
│                                                              │
│ APPLICATION                                                  │
│ □ Users can log in                                          │
│ □ Load creation working                                     │
│ □ Load status updates working                               │
│ □ Document upload working                                   │
│ □ Search functionality operational                          │
│                                                              │
│ INTEGRATIONS                                                 │
│ □ ELD data flowing                                          │
│ □ Load board connections active                             │
│ □ Payment processing functional                             │
│ □ Email delivery working                                    │
│                                                              │
│ DATA INTEGRITY                                               │
│ □ Recent transactions visible                               │
│ □ No duplicate records                                      │
│ □ Audit logs intact                                         │
│ □ User permissions correct                                  │
│                                                              │
│ MONITORING                                                   │
│ □ Alerting systems active                                   │
│ □ Dashboards showing data                                   │
│ □ Log aggregation working                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Smoke Test Script

```javascript
// Post-recovery automated validation
const smokeTests = [
  { name: 'Health Check', url: '/health', expect: 200 },
  { name: 'Auth Service', url: '/api/auth/status', expect: 200 },
  { name: 'Load List', url: '/api/loads?limit=1', expect: 200 },
  { name: 'Driver List', url: '/api/drivers?limit=1', expect: 200 },
  { name: 'Document Upload', url: '/api/documents/test', expect: 200 },
];

async function runSmokeTests() {
  console.log('🔍 Running post-recovery smoke tests...\n');
  
  for (const test of smokeTests) {
    try {
      const response = await fetch(`${BASE_URL}${test.url}`);
      const status = response.status === test.expect ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }
}
```

### 6.3 Data Integrity Validation

```sql
-- Record count validation (compare to pre-incident baseline)
SELECT 'loads' as entity, COUNT(*) as count FROM loads
UNION ALL
SELECT 'drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'carriers', COUNT(*) FROM carriers
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices;

-- Check for data anomalies
SELECT * FROM loads 
WHERE created_date > '[INCIDENT_START_TIME]'
AND created_date < '[RECOVERY_TIME]';

-- Verify audit log continuity
SELECT DATE(created_date), COUNT(*) 
FROM audit_logs 
GROUP BY DATE(created_date) 
ORDER BY DATE(created_date) DESC 
LIMIT 7;
```

---

## 7. Communication Templates

### 7.1 Internal Notification

```
SUBJECT: [SEV-X] TMS.ai Incident - [Brief Description]

INCIDENT SUMMARY
━━━━━━━━━━━━━━━━
Severity: SEV-[X]
Start Time: [TIME UTC]
Current Status: [Investigating/Identified/Monitoring/Resolved]
Incident Commander: [Name]

IMPACT
━━━━━━
[Description of user impact]

CURRENT ACTIONS
━━━━━━━━━━━━━━━
[What's being done]

NEXT UPDATE
━━━━━━━━━━━
[Time of next update]

Join: #incident-response
```

### 7.2 Customer Notification (During Incident)

```
SUBJECT: TMS.ai Service Disruption - [Date]

Dear Valued Customer,

We are currently experiencing a service disruption affecting 
[specific features/all services].

IMPACT: [What customers cannot do]
START TIME: [Time] [Timezone]
ESTIMATED RESOLUTION: [Time or "Under investigation"]

Our team is actively working to resolve this issue. We will 
provide updates every [30 minutes/hour].

For urgent matters, please contact support@tms.ai.

We apologize for any inconvenience.

TMS.ai Operations Team
```

### 7.3 Customer Notification (Resolution)

```
SUBJECT: RESOLVED - TMS.ai Service Disruption - [Date]

Dear Valued Customer,

The service disruption that began at [START TIME] has been resolved.

RESOLUTION TIME: [Time] [Timezone]
TOTAL DURATION: [X hours Y minutes]
ROOT CAUSE: [Brief, non-technical explanation]

All services are now operating normally. If you experience any 
issues, please contact support@tms.ai.

We apologize for any inconvenience and thank you for your patience.

A detailed post-incident report will be available upon request.

TMS.ai Operations Team
```

### 7.4 Post-Incident Report Template

```markdown
# Post-Incident Report

**Incident ID:** INC-YYYY-MMDD-XXX
**Date:** [Date]
**Duration:** [X hours Y minutes]
**Severity:** SEV-[X]
**Author:** [Name]

## Summary
[2-3 sentence summary of what happened]

## Timeline (UTC)
| Time | Event |
|------|-------|
| HH:MM | First alert received |
| HH:MM | Incident declared |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Service restored |

## Root Cause
[Technical explanation of what caused the incident]

## Impact
- Users affected: [Number]
- Features impacted: [List]
- Data loss: [Yes/No, details]
- Revenue impact: [Estimate if applicable]

## Response Assessment
### What went well
- [Item]

### What could be improved
- [Item]

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action] | [Name] | [Date] | [Status] |

## Lessons Learned
[Key takeaways to prevent recurrence]
```

---

## 8. Appendices

### Appendix A: Recovery Runbook Testing Schedule

| Test Type | Frequency | Last Tested | Next Test |
|-----------|-----------|-------------|-----------|
| Tabletop Exercise | Quarterly | [Date] | [Date] |
| Database Restore | Monthly | [Date] | [Date] |
| Failover Test | Semi-annual | [Date] | [Date] |
| Full DR Test | Annual | [Date] | [Date] |

### Appendix B: Backup Schedule

| Data | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Database | Continuous + Daily full | 30 days | Multi-region |
| File Storage | 4x daily | 90 days | Multi-region |
| Configuration | Daily | 90 days | Git + backup |
| Audit Logs | Hourly | 3 years | Archive storage |

### Appendix C: Recovery Tools

| Tool | Purpose | Access |
|------|---------|--------|
| Base44 Dashboard | Platform management | admin.base44.com |
| PagerDuty | Alerting & on-call | pagerduty.com |
| Slack | Incident communication | #incident-response |
| GitHub | Code & configuration | github.com/tms-ai |

### Appendix D: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-25 | TMS Team | Initial release |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | _____________ | ________ | _________ |
| VP Engineering | _____________ | ________ | _________ |
| Security Officer | _____________ | ________ | _________ |
| Operations Lead | _____________ | ________ | _________ |

---

**⚠️ This document contains sensitive operational information. Handle according to classification.**

*Last Updated: 2025-11-25*  
*Next Review: 2026-02-25*