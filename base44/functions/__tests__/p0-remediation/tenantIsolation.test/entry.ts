/**
 * P0 REMEDIATION TESTS - Tenant Isolation
 * Proves cross-tenant access is BLOCKED
 */

import { enforceReadIsolation, enforceCreateIsolation, enforceUpdateIsolation } from '../../../shared/enforcement/tenantIsolation';

describe('P0: Tenant Isolation - Fail-Closed Enforcement', () => {
  
  const mockBase44 = {
    asServiceRole: {
      entities: {
        Membership: {
          filter: jest.fn()
        }
      }
    }
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('enforceReadIsolation', () => {
    test('BLOCKS read when no active membership', async () => {
      mockBase44.asServiceRole.entities.Membership.filter.mockResolvedValue([]);
      
      const result = await enforceReadIsolation({
        query: {},
        user: { email: 'user@test.com' },
        base44: mockBase44
      });
      
      expect(result.ok).toBe(false);
      expect(result.errors[0].code).toBe('NO_ACTIVE_MEMBERSHIP');
    });
    
    test('BLOCKS cross-tenant read attempt', async () => {
      mockBase44.asServiceRole.entities.Membership.filter.mockResolvedValue([
        { org_id: 'org-123' }
      ]);
      
      const result = await enforceReadIsolation({
        query: { org_id: 'org-456' }, // User trying to access different org
        user: { email: 'user@test.com' },
        base44: mockBase44
      });
      
      expect(result.ok).toBe(false);
      expect(result.errors[0].code).toBe('TENANT_ISOLATION_VIOLATION');
    });
    
    test('ALLOWS admin bypass', async () => {
      const result = await enforceReadIsolation({
        query: {},
        user: { email: 'admin@test.com', role: 'admin' },
        base44: mockBase44,
        allowAdmin: true
      });
      
      expect(result.ok).toBe(true);
    });
    
    test('INJECTS org_id for valid user', async () => {
      mockBase44.asServiceRole.entities.Membership.filter.mockResolvedValue([
        { org_id: 'org-123' }
      ]);
      
      const result = await enforceReadIsolation({
        query: {},
        user: { email: 'user@test.com' },
        base44: mockBase44
      });
      
      expect(result.ok).toBe(true);
      expect(result.query.org_id).toBe('org-123');
    });
  });
  
  describe('enforceCreateIsolation', () => {
    test('BLOCKS create when no active membership', async () => {
      mockBase44.asServiceRole.entities.Membership.filter.mockResolvedValue([]);
      
      const result = await enforceCreateIsolation({
        data: { name: 'Test' },
        user: { email: 'user@test.com' },
        base44: mockBase44
      });
      
      expect(result.ok).toBe(false);
      expect(result.errors[0].code).toBe('NO_ACTIVE_MEMBERSHIP');
    });
    
    test('BLOCKS cross-tenant create attempt', async () => {
      mockBase44.asServiceRole.entities.Membership.filter.mockResolvedValue([
        { org_id: 'org-123' }
      ]);
      
      const result = await enforceCreateIsolation({
        data: { name: 'Test', org_id: 'org-456' }, // User trying to create for different org
        user: { email: 'user@test.com' },
        base44: mockBase44
      });
      
      expect(result.ok).toBe(false);
      expect(result.errors[0].code).toBe('TENANT_ISOLATION_VIOLATION');
    });
    
    test('INJECTS org_id for valid user', async () => {
      mockBase44.asServiceRole.entities.Membership.filter.mockResolvedValue([
        { org_id: 'org-123' }
      ]);
      
      const result = await enforceCreateIsolation({
        data: { name: 'Test' },
        user: { email: 'user@test.com' },
        base44: mockBase44
      });
      
      expect(result.ok).toBe(true);
      expect(result.data.org_id).toBe('org-123');
    });
  });
  
  describe('enforceUpdateIsolation', () => {
    test('BLOCKS update of record from different org', async () => {
      mockBase44.asServiceRole.entities.Membership.filter.mockResolvedValue([
        { org_id: 'org-123' }
      ]);
      
      const result = await enforceUpdateIsolation({
        data: { status: 'delivered' },
        existingData: { id: 'load-1', org_id: 'org-456' }, // Record belongs to different org
        user: { email: 'user@test.com' },
        base44: mockBase44
      });
      
      expect(result.ok).toBe(false);
      expect(result.errors[0].code).toBe('TENANT_ISOLATION_VIOLATION');
    });
    
    test('BLOCKS org_id tampering attempt', async () => {
      mockBase44.asServiceRole.entities.Membership.filter.mockResolvedValue([
        { org_id: 'org-123' }
      ]);
      
      const result = await enforceUpdateIsolation({
        data: { org_id: 'org-456' }, // Trying to change org_id
        existingData: { id: 'load-1', org_id: 'org-123' },
        user: { email: 'user@test.com' },
        base44: mockBase44
      });
      
      expect(result.ok).toBe(false);
      expect(result.errors[0].code).toBe('TENANT_ISOLATION_VIOLATION');
    });
    
    test('ALLOWS update of own org record', async () => {
      mockBase44.asServiceRole.entities.Membership.filter.mockResolvedValue([
        { org_id: 'org-123' }
      ]);
      
      const result = await enforceUpdateIsolation({
        data: { status: 'delivered' },
        existingData: { id: 'load-1', org_id: 'org-123' },
        user: { email: 'user@test.com' },
        base44: mockBase44
      });
      
      expect(result.ok).toBe(true);
    });
  });
});

describe('P0: Audit Log Persistence', () => {
  test('THROWS on audit write failure', async () => {
    const mockBase44 = {
      asServiceRole: {
        entities: {
          AuditLog: {
            create: jest.fn().mockRejectedValue(new Error('Database error'))
          }
        }
      }
    };
    
    const { logFinancialChange } = require('../../shared/security/auditLogger');
    
    await expect(
      logFinancialChange(
        mockBase44,
        'Load',
        'load-123',
        'UPDATE',
        { id: 'user-1', email: 'user@test.com', role: 'broker' },
        { status: 'booked' },
        { status: 'delivered' }
      )
    ).rejects.toThrow('AUDIT_WRITE_FAILED');
  });
  
  test('PERSISTS audit entry on success', async () => {
    const mockBase44 = {
      asServiceRole: {
        entities: {
          AuditLog: {
            create: jest.fn().mockResolvedValue({ id: 'audit-1' })
          }
        }
      }
    };
    
    const { logFinancialChange } = require('../../shared/security/auditLogger');
    
    await logFinancialChange(
      mockBase44,
      'Load',
      'load-123',
      'UPDATE',
      { id: 'user-1', email: 'user@test.com', role: 'broker' },
      { status: 'booked' },
      { status: 'delivered' }
    );
    
    expect(mockBase44.asServiceRole.entities.AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'Load',
        entity_id: 'load-123',
        action: 'UPDATE',
        is_active: true
      })
    );
  });
});