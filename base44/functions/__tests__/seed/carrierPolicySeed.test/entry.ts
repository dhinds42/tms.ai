/**
 * Test: Carrier Policy Seed Function
 * Verifies idempotency and correct insertion
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

describe('seedCarrierDriverPolicies - Idempotency', () => {
  let mockBase44;
  let createdPolicies = [];

  beforeEach(() => {
    createdPolicies = [];
    
    mockBase44 = {
      auth: {
        me: async () => ({ role: 'admin', email: 'admin@test.com' })
      },
      entities: {
        CarrierDriverPolicy: {
          filter: async (query) => {
            // Return existing policies that match the query
            return createdPolicies.filter(p => 
              p.carrier_type === query.carrier_type &&
              p.feature_key === query.feature_key &&
              p.carrier_id === query.carrier_id
            );
          },
          create: async (data) => {
            const policy = { id: `policy_${createdPolicies.length + 1}`, ...data };
            createdPolicies.push(policy);
            return policy;
          }
        },
        AuditLog: {
          create: async (data) => ({ id: `audit_${Date.now()}`, ...data })
        }
      }
    };
  });

  it('should insert all policies on first run', async () => {
    const seedFn = (await import('../api/seedCarrierDriverPolicies.js')).default;
    
    const result1 = await seedFn(mockBase44);
    
    expect(result1.success).toBe(true);
    expect(result1.summary.inserted_count).toBeGreaterThan(0);
    expect(result1.summary.skipped_count).toBe(0);
    expect(createdPolicies.length).toBe(result1.summary.inserted_count);
  });

  it('should be idempotent - second run inserts nothing', async () => {
    const seedFn = (await import('../api/seedCarrierDriverPolicies.js')).default;
    
    // First run
    const result1 = await seedFn(mockBase44);
    const firstCount = result1.summary.inserted_count;
    
    // Second run
    const result2 = await seedFn(mockBase44);
    
    expect(result2.success).toBe(true);
    expect(result2.summary.inserted_count).toBe(0);
    expect(result2.summary.skipped_count).toBe(firstCount);
    expect(createdPolicies.length).toBe(firstCount); // No new records
  });

  it('should reject non-admin users', async () => {
    mockBase44.auth.me = async () => ({ role: 'user', email: 'user@test.com' });
    
    const seedFn = (await import('../api/seedCarrierDriverPolicies.js')).default;
    const result = await seedFn(mockBase44);
    
    expect(result.error).toContain('Unauthorized');
    expect(result.status).toBe(403);
  });

  it('should insert correct number of policies per carrier type', async () => {
    const seedFn = (await import('../api/seedCarrierDriverPolicies.js')).default;
    
    const result = await seedFn(mockBase44);
    
    const assetPolicies = createdPolicies.filter(p => p.carrier_type === 'asset');
    const brokeragePolicies = createdPolicies.filter(p => p.carrier_type === 'brokerage');
    const ooHeavyPolicies = createdPolicies.filter(p => p.carrier_type === 'oo_heavy');
    
    expect(assetPolicies.length).toBeGreaterThan(0);
    expect(brokeragePolicies.length).toBeGreaterThan(0);
    expect(ooHeavyPolicies.length).toBeGreaterThan(0);
    
    // Verify asset policies have profit_explain enabled
    const assetProfitExplain = assetPolicies.find(p => p.feature_key === 'profit_explain');
    expect(assetProfitExplain.enabled).toBe(true);
    expect(assetProfitExplain.min_completed_loads).toBe(3);
  });
});