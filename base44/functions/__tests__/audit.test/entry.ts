/**
 * Audit Logging Tests
 * Verify audit trail creation and completeness
 */

import { getChangedFields, shouldAudit, sanitizeForAudit } from '../audit/auditLogger.js';

describe('Audit Logging', () => {
  test('detects changed fields', () => {
    const before = {
      status: 'available',
      customer_rate: 1500,
      notes: 'Original'
    };
    
    const after = {
      status: 'dispatched',
      customer_rate: 1500, // Unchanged
      notes: 'Updated'
    };
    
    const changes = getChangedFields(before, after);
    
    expect(changes.status).toEqual({ from: 'available', to: 'dispatched' });
    expect(changes.notes).toEqual({ from: 'Original', to: 'Updated' });
    expect(changes.customer_rate).toBeUndefined(); // Unchanged
  });
  
  test('identifies critical entities for auditing', () => {
    expect(shouldAudit('Load', 'CREATE')).toBe(true);
    expect(shouldAudit('Carrier', 'UPDATE')).toBe(true);
    expect(shouldAudit('Invoice', 'DELETE')).toBe(true);
    expect(shouldAudit('Task', 'CREATE')).toBe(false); // Non-critical
  });
  
  test('sanitizes sensitive data', () => {
    const data = {
      company_name: 'ABC Trucking',
      api_key: 'secret-key-123',
      password: 'password123',
      mc_number: '123456'
    };
    
    const sanitized = sanitizeForAudit(data);
    
    expect(sanitized.company_name).toBe('ABC Trucking');
    expect(sanitized.mc_number).toBe('123456');
    expect(sanitized.api_key).toBe('[REDACTED]');
    expect(sanitized.password).toBe('[REDACTED]');
  });
});

describe('Audit Log Creation', () => {
  test('creates audit log with all required fields', async () => {
    // Mock base44 client
    const mockCreate = jest.fn();
    const mockBase44 = {
      entities: {
        AuditLog: {
          create: mockCreate
        }
      }
    };
    
    const { logAudit } = await import('../audit/auditLogger.js');
    
    await logAudit(mockBase44, {
      entityType: 'Load',
      entityId: 'load-123',
      action: 'UPDATE',
      userId: 'user-456',
      userEmail: 'broker@company.com',
      userRole: 'broker',
      changes: { status: { from: 'available', to: 'dispatched' } }
    });
    
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'Load',
        entity_id: 'load-123',
        action: 'UPDATE',
        user_email: 'broker@company.com'
      })
    );
  });
});