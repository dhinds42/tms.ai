/**
 * Test: Policy Alert Generation
 * Verifies alert creation, de-duplication, and safety
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('Policy Alert Generation', () => {
  let mockBase44;
  let createdAlerts = [];
  let createdAuditLogs = [];

  beforeEach(() => {
    createdAlerts = [];
    createdAuditLogs = [];

    mockBase44 = {
      entities: {
        Carrier: {
          filter: async () => [{
            id: 'carrier_1',
            carrier_type: 'asset'
          }],
          list: async () => [{
            id: 'carrier_1',
            carrier_type: 'asset'
          }]
        },
        Driver: {
          filter: async () => [
            { id: 'driver_1', party_id: 'carrier_1' },
            { id: 'driver_2', party_id: 'carrier_1' }
          ]
        },
        Load: {
          filter: async (query) => {
            // Mock 100 loads with 10 disputes = 10% rate
            return Array.from({ length: 100 }, (_, i) => ({
              id: `load_${i}`,
              carrier_id: 'carrier_1',
              status: 'delivered',
              created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }));
          }
        },
        DriverEscalation: {
          filter: async () => {
            // 10 disputes = 10% rate (triggers warning at 8%)
            return Array.from({ length: 10 }, (_, i) => ({
              id: `dispute_${i}`,
              driver_id: 'driver_1',
              created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }));
          }
        },
        AccessorialRequest: {
          filter: async () => {
            // 30 accessorials, 10 ineligible = 33% ineligible rate (triggers at 25%)
            return Array.from({ length: 30 }, (_, i) => ({
              id: `acc_${i}`,
              requester_id: 'driver_1',
              eligibility_status: i < 10 ? 'ineligible' : 'eligible',
              created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }));
          }
        },
        DriverFeatureEligibility: {
          filter: async () => []
        },
        PolicyAlert: {
          filter: async (query) => {
            return createdAlerts.filter(a => 
              (!query.carrier_id || a.carrier_id === query.carrier_id) &&
              (!query.alert_type || a.alert_type === query.alert_type) &&
              (!query.status || a.status === query.status)
            );
          },
          create: async (data) => {
            const alert = { id: `alert_${createdAlerts.length + 1}`, ...data, created_date: new Date().toISOString() };
            createdAlerts.push(alert);
            return alert;
          },
          update: async (id, data) => {
            const alert = createdAlerts.find(a => a.id === id);
            if (alert) Object.assign(alert, data);
            return alert;
          }
        },
        AuditLog: {
          create: async (data) => {
            const log = { id: `audit_${createdAuditLogs.length + 1}`, ...data };
            createdAuditLogs.push(log);
            return log;
          }
        }
      }
    };
  });

  it('should generate dispute spike alert when threshold breached', async () => {
    const { generatePolicyAlertsForCarrier } = await import('../../shared/alerts/enhancedPolicyAlertEngine.js');
    
    const result = await generatePolicyAlertsForCarrier('carrier_1', mockBase44);
    
    expect(result.created).toBeGreaterThan(0);
    expect(createdAlerts.length).toBeGreaterThan(0);
    
    const disputeAlert = createdAlerts.find(a => a.alert_type === 'dispute_spike');
    expect(disputeAlert).toBeDefined();
    expect(disputeAlert.severity).toBe('warning');
  });

  it('should de-duplicate alerts - second run skips existing', async () => {
    const { generatePolicyAlertsForCarrier } = await import('../../shared/alerts/enhancedPolicyAlertEngine.js');
    
    // First run
    const result1 = await generatePolicyAlertsForCarrier('carrier_1', mockBase44);
    const firstCount = result1.created;
    
    // Second run (same day)
    const result2 = await generatePolicyAlertsForCarrier('carrier_1', mockBase44);
    
    expect(result2.created).toBe(0); // No new alerts
    expect(result2.skipped).toBeGreaterThan(0); // Existing alerts skipped
    expect(createdAlerts.length).toBe(firstCount); // No duplicates
  });

  it('should write audit log for each created alert', async () => {
    const { generatePolicyAlertsForCarrier } = await import('../../shared/alerts/enhancedPolicyAlertEngine.js');
    
    await generatePolicyAlertsForCarrier('carrier_1', mockBase44);
    
    const alertCreationLogs = createdAuditLogs.filter(log => 
      log.action === 'POLICY_ALERT_CREATED'
    );
    
    expect(alertCreationLogs.length).toBeGreaterThan(0);
    expect(alertCreationLogs[0].actor_email).toBe('system');
  });
});

describe('Apply Policy from Alert', () => {
  let mockBase44;
  let policies = [];
  let auditLogs = [];

  beforeEach(() => {
    policies = [{
      id: 'policy_1',
      carrier_id: 'carrier_1',
      feature_key: 'accessorial_requests',
      enabled: true,
      min_completed_loads: 3,
      cooldown_days: 30
    }];
    auditLogs = [];

    mockBase44 = {
      auth: {
        me: async () => ({ role: 'admin', email: 'admin@test.com' })
      },
      entities: {
        PolicyAlert: {
          filter: async (query) => [{
            id: 'alert_1',
            carrier_id: 'carrier_1',
            carrier_type: 'asset',
            alert_type: 'dispute_spike',
            feature_key: 'accessorial_requests',
            recommended_changes: {
              feature_key: 'accessorial_requests',
              suggested_updates: {
                min_completed_loads: 7,
                cooldown_days: 45
              }
            }
          }]
        },
        CarrierDriverPolicy: {
          filter: async (query) => policies.filter(p => 
            p.carrier_id === query.carrier_id && p.feature_key === query.feature_key
          ),
          update: async (id, data) => {
            const policy = policies.find(p => p.id === id);
            Object.assign(policy, data);
            return policy;
          }
        },
        AuditLog: {
          create: async (data) => {
            const log = { id: `audit_${auditLogs.length + 1}`, ...data };
            auditLogs.push(log);
            return log;
          }
        }
      },
      functions: {}
    };
  });

  it('should update policy with suggested changes', async () => {
    const applyFn = (await import('../../api/applyPolicyFromAlert.js')).default;
    
    const result = await applyFn({
      alertId: 'alert_1',
      appliedBy: 'admin@test.com',
      notes: 'Applying due to spike'
    }, mockBase44);
    
    expect(result.success).toBe(true);
    expect(result.policy.min_completed_loads).toBe(7);
    expect(result.policy.cooldown_days).toBe(45);
  });

  it('should write audit log with before/after diff', async () => {
    const applyFn = (await import('../../api/applyPolicyFromAlert.js')).default;
    
    await applyFn({
      alertId: 'alert_1',
      notes: 'Test'
    }, mockBase44);
    
    const policyAudit = auditLogs.find(log => 
      log.action === 'POLICY_CHANGE_APPLIED'
    );
    
    expect(policyAudit).toBeDefined();
    expect(policyAudit.before_values).toBeDefined();
    expect(policyAudit.after_values).toBeDefined();
    expect(policyAudit.metadata.source_alert_id).toBe('alert_1');
  });

  it('should reject non-admin for high-risk features', async () => {
    mockBase44.auth.me = async () => ({ role: 'carrier', email: 'carrier@test.com' });
    mockBase44.entities.Driver = {
      filter: async () => [{ id: 'driver_1', party_id: 'carrier_1', linked_user_id: 'user_1' }]
    };
    mockBase44.entities.PolicyAlert.filter = async () => [{
      id: 'alert_2',
      carrier_id: 'carrier_1',
      recommended_changes: {
        feature_key: 'instant_pay',
        suggested_updates: { enabled: true }
      }
    }];

    const applyFn = (await import('../../api/applyPolicyFromAlert.js')).default;
    const result = await applyFn({ alertId: 'alert_2' }, mockBase44);
    
    expect(result.error).toContain('high-risk');
    expect(result.status).toBe(403);
  });
});