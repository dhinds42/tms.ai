# Disaster Recovery Runbook
## TMS.ai Business Continuity

**Version:** 1.0  
**Date:** 2025-11-25  
**Classification:** Confidential  

---

## 1. Recovery Objectives

### RTO/RPO Targets

| Service Tier | RTO | RPO | Services |
|--------------|-----|-----|----------|
| Critical | 1 hour | 15 min | Auth, Load Management, Dispatch |
| High | 4 hours | 1 hour | Invoicing, Documents, Tracking |
| Medium | 8 hours | 4 hours | Reporting, Analytics |
| Low | 24 hours | 24 hours | Archives, Historical Data |

### Availability Targets

| Metric | Target |
|--------|--------|
| Annual Uptime | 99.9% |
| Max Monthly Downtime | 43 minutes |
| Max Single Incident | 4 hours |

---

## 2. Contact Directory

### Incident Command

| Role | Primary | Backup | Phone |
|------|---------|--------|-------|
| Incident Commander | [Name] | [Name] | +1-XXX-XXX-XXXX |
| Engineering Lead | [Name] | [Name] | +1-XXX-XXX-XXXX |
| DBA | [Name] | [Name] | +1-XXX-XXX-XXXX |
| Security Officer | [Name] | [Name] | +1-XXX-XXX-XXXX |
| Customer Success | [Name] | [Name] | +1-XXX-XXX-XXXX |

### External Vendors

| Vendor | Service | Contact | Account |
|--------|---------|---------|---------|
| Base44 | Platform | support@base44.com | ACCT-XXXXX |
| Cloudflare | CDN | enterprise@cloudflare.com | CF-XXXXX |
| PagerDuty | Alerting | support@pagerduty.com | PD-XXXXX |

### Escalation Path

```
0-15 min  → On-Call Engineer
15-30 min → Engineering Lead + IC
30-60 min → Security + Customer Success
60+ min   → CEO + Legal
```

---

## 3. Incident Classification

| Severity | Definition | Response |
|----------|------------|----------|
| SEV-1 | Complete outage | Immediate all-hands |
| SEV-2 | Major feature down | 15-min response |
| SEV-3 | Degraded performance | 30-min response |
| SEV-4 | Minor issue | 2-hour response |

---

## 4. Recovery Procedures

### 4.1 Initial Response (All Incidents)

```
□ 1. Acknowledge alert in PagerDuty
□ 2. Join #incident-response Slack channel
□ 3. Assess severity using classification matrix
□ 4. Notify Incident Commander (SEV-1/2)
□ 5. Start incident timeline documentation
□ 6. Determine customer communication needs
```

### 4.2 Database Recovery

#### Connection Failure

```bash
# 1. Verify database status
curl -s https://api.base44.com/health/db

# 2. Contact Base44 support if platform issue

# 3. If application issue, restart instances

# 4. Verify recovery
curl -s https://api.tms.ai/health
```

#### Data Corruption

```
□ 1. STOP all write operations
□ 2. Enable maintenance mode
□ 3. Identify corruption scope via audit logs
□ 4. Select recovery point (last good backup)
□ 5. Contact Base44 for point-in-time restore
□ 6. Validate data integrity post-restore
□ 7. Reconcile any lost transactions
□ 8. Resume operations
```

### 4.3 Application Recovery

#### Deployment Rollback

```bash
# 1. Identify last working version
git log --oneline -20

# 2. Rollback via Base44 dashboard or CI/CD

# 3. Verify rollback
curl -s https://api.tms.ai/health
curl -s https://api.tms.ai/version
```

#### Full Application Restore

```
□ 1. Assess infrastructure status
□ 2. Check cloud provider status page
□ 3. Activate failover if available
□ 4. If no failover, deploy to new infrastructure
□ 5. Restore database from backup
□ 6. Update DNS records
□ 7. Verify all integrations
□ 8. Monitor for 24 hours
```

### 4.4 Security Incident Response

```
┌─────────────────────────────────────────────┐
│         SECURITY INCIDENT RESPONSE          │
│              DO NOT SKIP STEPS              │
├─────────────────────────────────────────────┤
│ PHASE 1: CONTAIN (0-15 min)                 │
│ □ Alert Security Officer                    │
│ □ Do NOT modify affected systems            │
│ □ Revoke compromised credentials            │
│ □ Block suspicious IPs                      │
│ □ Preserve all logs                         │
│                                             │
│ PHASE 2: ASSESS (15-60 min)                 │
│ □ Determine attack vector                   │
│ □ Identify affected data/systems            │
│ □ Assess data exfiltration scope            │
│ □ Document timeline                         │
│                                             │
│ PHASE 3: NOTIFY (Within 1 hour SEV-1)       │
│ □ Notify CEO and Legal                      │
│ □ Contact cyber insurance                   │
│ □ Prepare customer notification             │
│                                             │
│ PHASE 4: REMEDIATE                          │
│ □ Patch vulnerability                       │
│ □ Reset affected credentials                │
│ □ Restore from clean backup                 │
│                                             │
│ PHASE 5: RECOVER                            │
│ □ Verify system integrity                   │
│ □ Enhanced monitoring 30 days               │
│ □ Post-incident review                      │
└─────────────────────────────────────────────┘
```

### 4.5 Regional Outage

```
□ 1. Verify outage (check provider status)
□ 2. Document start time
□ 3. Failover to secondary region
□ 4. Update DNS to failover endpoints
□ 5. Verify data consistency
□ 6. Monitor secondary region
□ 7. Plan failback when primary restored
```

---

## 5. Verification & Validation

### Post-Recovery Checklist

```
INFRASTRUCTURE
□ All health checks passing
□ Database connections stable
□ File storage accessible
□ CDN functioning
□ SSL certificates valid

APPLICATION
□ Users can log in
□ Load creation working
□ Status updates working
□ Document upload working
□ Search operational

INTEGRATIONS
□ ELD data flowing
□ Load board connections active
□ Payment processing functional
□ Email delivery working

DATA INTEGRITY
□ Recent transactions visible
□ No duplicate records
□ Audit logs intact
□ User permissions correct

MONITORING
□ Alerting systems active
□ Dashboards showing data
□ Log aggregation working
```

### Smoke Test Endpoints

| Test | URL | Expected |
|------|-----|----------|
| Health | /health | 200 |
| Auth | /api/auth/status | 200 |
| Loads | /api/loads?limit=1 | 200 |
| Drivers | /api/drivers?limit=1 | 200 |
| Documents | /api/documents/test | 200 |

---

## 6. Communication Templates

### Internal Alert

```
SUBJECT: [SEV-X] TMS.ai Incident - [Description]

Severity: SEV-[X]
Start Time: [TIME UTC]
Status: [Investigating/Identified/Resolved]
IC: [Name]

IMPACT: [Description]
ACTIONS: [Current steps]
NEXT UPDATE: [Time]

Join: #incident-response
```

### Customer Notice (During)

```
SUBJECT: TMS.ai Service Disruption

We are experiencing a service disruption affecting [features].

Start Time: [Time]
Est. Resolution: [Time or "investigating"]

Updates every [30 min/hour].

Contact: support@tms.ai
```

### Customer Notice (Resolution)

```
SUBJECT: RESOLVED - TMS.ai Service Disruption

The disruption from [START] has been resolved.

Resolution Time: [Time]
Duration: [X hours]
Root Cause: [Brief explanation]

All services operating normally.
Post-incident report available upon request.
```

---

## 7. Backup Schedule

| Data | Frequency | Retention | Location |
|------|-----------|-----------|----------|
| Database | Continuous + Daily | 30 days | Multi-region |
| Files | 4x daily | 90 days | Multi-region |
| Config | Daily | 90 days | Git + backup |
| Audit Logs | Hourly | 3 years | Archive |

---

## 8. Testing Schedule

| Test | Frequency | Last | Next |
|------|-----------|------|------|
| Tabletop Exercise | Quarterly | - | Q1 2026 |
| Database Restore | Monthly | - | Monthly |
| Failover Test | Semi-annual | - | Q2 2026 |
| Full DR Test | Annual | - | Q4 2026 |

---

## 9. Approval

| Role | Name | Date |
|------|------|------|
| CTO | | |
| Security Officer | | |
| Operations Lead | | |

---

*Last Updated: 2025-11-25*  
*Next Review: 2026-02-25*