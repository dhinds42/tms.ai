/**
 * Test: Apply Policy from Alert
 * Verifies safety checks, permissions, and baseline protection
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('applyPolicyFromAlert - Safety & Permissions', () => {
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
      min_on_time_pct: 90,
      max_dispute_rate: 10,
      cooldown_days: 30
    }];
    auditLogs = [];

    mockBase44 = {
      auth: {
        me: async () => ({ role: 'admin', email: 'admin@test.com', id: 'admin_1' })
      },
      entities: {
        PolicyAlert: {
          filter: async () => [{
            id: 'alert_1',
            carrier_id: 'carrier_1',
            carrier_type: 'asset',
            alert_type: 'dispute_spike',
            feature_key: 'accessorial_requests',
            status: 'new',
            recommended_changes: {
              feature_key: 'accessorial_requests',
              suggested_updates: {
                min_completed_loads: 7,
                cooldown_days: 45
              }
            }
          }],
          update: async (id, data) => ({ id, ...data })
        },
        CarrierDriverPolicy: {
          filter: async (query) => policies.filter(p => 
            p.carrier_id === query.carrier_id && p.feature_key === query.feature_key
          ),
          update: async (id, data) => {
            const policy = policies.find(p => p.id === id);
            const updated = { ...policy, ...data };
            Object.assign(policy, updated);
            return updated;
          }
        },
        AuditLog: {
          create: async (data) => {
            const log = { id: `audit_${auditLogs.length + 1}`, ...data };
            auditLogs.push(log);
            return log;
          }
        },
        Driver: {
          filter: async () => []
        }
      }
    };
  });

  it('should successfully apply policy changes', async () => {
    const applyFn = (await import('../../api/applyPolicyFromAlert.js')).default;
    
    const result = await applyFn({
      alertId: 'alert_1',
      appliedBy: 'admin@test.com',
      notes: 'Applying due to dispute spike'
    }, mockBase44);
    
    expect(result.success).toBe(true);
    expect(result.policy.min_completed_loads).toBe(7);
    expect(result.policy.cooldown_days).toBe(45);
    expect(result.changes_applied).toContain('min_completed_loads');
  });

  it('should write audit log with before/after values', async () => {
    const applyFn = (await import('../../api/applyPolicyFromAlert.js')).default;
    
    await applyFn({
      alertId: 'alert_1',
      notes: 'Test apply'
    }, mockBase44);
    
    const policyAudit = auditLogs.find(log => 
      log.action === 'POLICY_CHANGE_APPLIED'
    );
    
    expect(policyAudit).toBeDefined();
    expect(policyAudit.before_values.min_completed_loads).toBe(3);
    expect(policyAudit.after_values.min_completed_loads).toBe(7);
    expect(policyAudit.changed_fields.min_completed_loads).toEqual({ from: 3, to: 7 });
    expect(policyAudit.metadata.source_alert_id).toBe('alert_1');
  });

  it('should update alert status to implemented', async () => {
    const applyFn = (await import('../../api/applyPolicyFromAlert.js')).default;
    let updatedAlert = null;
    
    mockBase44.entities.PolicyAlert.update = async (id, data) => {
      updatedAlert = { id, ...data };
      return updatedAlert;
    };
    
    await applyFn({ alertId: 'alert_1', notes: 'Applied' }, mockBase44);
    
    expect(updatedAlert.status).toBe('implemented');
    expect(updatedAlert.action_taken).toContain('accessorial_requests');
  });

  it('should reject non-admin trying to enable high-risk features', async () => {
    mockBase44.auth.me = async () => ({ role: 'carrier', email: 'carrier@test.com', id: 'carrier_user_1' });
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

  it('should prevent weakening below system minimums', async () => {
    mockBase44.entities.PolicyAlert.filter = async () => [{
      id: 'alert_3',
      carrier_id: 'carrier_1',
      recommended_changes: {
        feature_key: 'accessorial_auto_approval',
        suggested_updates: {
          min_completed_loads: 1  // System min is 20
        }
      }
    }];

    const applyFn = (await import('../../api/applyPolicyFromAlert.js')).default;
    const result = await applyFn({ alertId: 'alert_3' }, mockBase44);
    
    expect(result.error).toContain('validation failed');
    expect(result.status).toBe(400);
  });
});