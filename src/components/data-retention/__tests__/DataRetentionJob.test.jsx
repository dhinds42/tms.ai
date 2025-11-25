/**
 * Tests for Data Retention Job
 * 
 * Verifies that:
 * - Data older than retention threshold is anonymized/deleted
 * - Data newer than retention threshold is untouched
 */

import { DataRetentionJob, RETENTION_ACTIONS } from '../DataRetentionJob';

// Mock base44 client
jest.mock('@/api/base44Client', () => ({
  base44: {
    entities: {
      DataRetentionPolicy: { filter: jest.fn() },
      Load: { list: jest.fn(), update: jest.fn(), delete: jest.fn() },
      Document: { list: jest.fn(), update: jest.fn(), delete: jest.fn() },
      AuditLog: { list: jest.fn(), update: jest.fn(), delete: jest.fn() }
    }
  }
}));

import { base44 } from '@/api/base44Client';

describe('DataRetentionJob', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create test records
  const createTestRecord = (id, daysOld, extra = {}) => ({
    id,
    created_date: new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString(),
    ...extra
  });

  // ==========================================
  // Threshold Tests
  // ==========================================

  describe('Retention Threshold', () => {
    
    test('should anonymize data OLDER than retention threshold', async () => {
      // Policy: 30 days retention, anonymize action
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([{
        entity_type: 'Load',
        retention_days: 30,
        action: RETENTION_ACTIONS.ANONYMIZE,
        is_active: true
      }]);

      // Records: 45 days old (should be anonymized)
      base44.entities.Load.list.mockResolvedValue([
        createTestRecord('load_1', 45, { contact_person: { name: 'John' } }),
        createTestRecord('load_2', 60, { contact_person: { name: 'Jane' } })
      ]);

      // Empty for other entities
      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([]);

      const job = new DataRetentionJob({ dryRun: false });
      const result = await job.execute();

      expect(result.success).toBe(true);
      expect(result.results.Load.anonymized).toBe(2);
      expect(base44.entities.Load.update).toHaveBeenCalledTimes(2);
      
      // Verify anonymization was applied
      const updateCalls = base44.entities.Load.update.mock.calls;
      expect(updateCalls[0][1].contact_person).toEqual({ redacted: true });
      expect(updateCalls[0][1].anonymized).toBe(true);
    });

    test('should NOT touch data NEWER than retention threshold', async () => {
      // Policy: 30 days retention
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([{
        entity_type: 'Load',
        retention_days: 30,
        action: RETENTION_ACTIONS.ANONYMIZE,
        is_active: true
      }]);

      // Records: 10 days old (should NOT be touched)
      base44.entities.Load.list.mockResolvedValue([
        createTestRecord('load_1', 10, { contact_person: { name: 'John' } }),
        createTestRecord('load_2', 15, { contact_person: { name: 'Jane' } })
      ]);

      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([]);

      const job = new DataRetentionJob({ dryRun: false });
      const result = await job.execute();

      expect(result.success).toBe(true);
      expect(result.results.Load.processed).toBe(0);
      expect(result.results.Load.anonymized).toBe(0);
      expect(base44.entities.Load.update).not.toHaveBeenCalled();
    });

    test('should process mixed old and new data correctly', async () => {
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([{
        entity_type: 'Document',
        retention_days: 60,
        action: RETENTION_ACTIONS.ANONYMIZE,
        is_active: true
      }]);

      base44.entities.Load.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([]);
      
      // Mix of old and new documents
      base44.entities.Document.list.mockResolvedValue([
        createTestRecord('doc_1', 90, { extracted_data: { po: '12345' } }), // Old - process
        createTestRecord('doc_2', 30, { extracted_data: { po: '67890' } }), // New - skip
        createTestRecord('doc_3', 120, { extracted_data: { po: '11111' } }), // Old - process
        createTestRecord('doc_4', 45, { extracted_data: { po: '22222' } })  // New - skip
      ]);

      const job = new DataRetentionJob({ dryRun: false });
      const result = await job.execute();

      expect(result.results.Document.processed).toBe(2);
      expect(result.results.Document.anonymized).toBe(2);
      expect(base44.entities.Document.update).toHaveBeenCalledTimes(2);
    });
  });

  // ==========================================
  // Delete Action Tests
  // ==========================================

  describe('Delete Action', () => {
    
    test('should DELETE data when policy action is delete', async () => {
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([{
        entity_type: 'AuditLog',
        retention_days: 90,
        action: RETENTION_ACTIONS.DELETE,
        is_active: true
      }]);

      base44.entities.Load.list.mockResolvedValue([]);
      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([
        createTestRecord('log_1', 100),
        createTestRecord('log_2', 120)
      ]);

      const job = new DataRetentionJob({ dryRun: false });
      const result = await job.execute();

      expect(result.results.AuditLog.deleted).toBe(2);
      expect(base44.entities.AuditLog.delete).toHaveBeenCalledTimes(2);
      expect(base44.entities.AuditLog.delete).toHaveBeenCalledWith('log_1');
      expect(base44.entities.AuditLog.delete).toHaveBeenCalledWith('log_2');
    });
  });

  // ==========================================
  // Dry Run Tests
  // ==========================================

  describe('Dry Run Mode', () => {
    
    test('should NOT modify data in dry run mode', async () => {
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([{
        entity_type: 'Load',
        retention_days: 30,
        action: RETENTION_ACTIONS.DELETE,
        is_active: true
      }]);

      base44.entities.Load.list.mockResolvedValue([
        createTestRecord('load_1', 60)
      ]);
      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([]);

      const job = new DataRetentionJob({ dryRun: true });
      const result = await job.execute();

      expect(result.success).toBe(true);
      expect(result.results.Load.deleted).toBe(1); // Counted but not executed
      expect(base44.entities.Load.delete).not.toHaveBeenCalled();
      expect(base44.entities.Load.update).not.toHaveBeenCalled();
    });

    test('should log what WOULD be done in dry run', async () => {
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([{
        entity_type: 'Document',
        retention_days: 7,
        action: RETENTION_ACTIONS.ANONYMIZE,
        is_active: true
      }]);

      base44.entities.Load.list.mockResolvedValue([]);
      base44.entities.Document.list.mockResolvedValue([
        createTestRecord('doc_1', 10)
      ]);
      base44.entities.AuditLog.list.mockResolvedValue([]);

      const job = new DataRetentionJob({ dryRun: true });
      const result = await job.execute();

      const dryRunLogs = result.log.filter(l => l.message.includes('DRY RUN'));
      expect(dryRunLogs.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // Default Policy Tests
  // ==========================================

  describe('Default Policies', () => {
    
    test('should use default 7-year retention for Load when no policy', async () => {
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([]);
      
      // Record is 6 years old (within 7 year default)
      base44.entities.Load.list.mockResolvedValue([
        createTestRecord('load_1', 365 * 6)
      ]);
      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([]);

      const job = new DataRetentionJob({ dryRun: false });
      const result = await job.execute();

      // Should NOT process (within 7 year retention)
      expect(result.results.Load.processed).toBe(0);
    });

    test('should use default 7-year retention and process older records', async () => {
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([]);
      
      // Record is 8 years old (beyond 7 year default)
      base44.entities.Load.list.mockResolvedValue([
        createTestRecord('load_1', 365 * 8, { contact_person: { name: 'Old' } })
      ]);
      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([]);

      const job = new DataRetentionJob({ dryRun: false });
      const result = await job.execute();

      // Should process (beyond 7 year retention)
      expect(result.results.Load.processed).toBe(1);
      expect(result.results.Load.anonymized).toBe(1);
    });
  });

  // ==========================================
  // Anonymization Field Tests
  // ==========================================

  describe('Anonymization Fields', () => {
    
    test('should anonymize correct fields for Load entity', async () => {
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([{
        entity_type: 'Load',
        retention_days: 30,
        action: RETENTION_ACTIONS.ANONYMIZE,
        is_active: true
      }]);

      base44.entities.Load.list.mockResolvedValue([
        createTestRecord('load_1', 45, {
          contact_person: { name: 'John Doe', phone: '555-1234' },
          special_instructions: 'Call before delivery',
          check_calls: [{ user: 'dispatcher', notes: 'On time' }],
          load_number: 'LD-12345', // Should NOT be anonymized
          customer_rate: 1500 // Should NOT be anonymized
        })
      ]);
      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([]);

      const job = new DataRetentionJob({ dryRun: false });
      await job.execute();

      const updateCall = base44.entities.Load.update.mock.calls[0][1];
      
      // These should be redacted
      expect(updateCall.contact_person).toEqual({ redacted: true });
      expect(updateCall.special_instructions).toBe('[REDACTED]');
      expect(updateCall.check_calls).toEqual({ redacted: true });
      
      // These should be preserved
      expect(updateCall.load_number).toBe('LD-12345');
      expect(updateCall.customer_rate).toBe(1500);
      
      // Metadata should be added
      expect(updateCall.anonymized).toBe(true);
      expect(updateCall.anonymized_at).toBeDefined();
    });

    test('should anonymize correct fields for AuditLog entity', async () => {
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([{
        entity_type: 'AuditLog',
        retention_days: 30,
        action: RETENTION_ACTIONS.ANONYMIZE,
        is_active: true
      }]);

      base44.entities.Load.list.mockResolvedValue([]);
      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([
        createTestRecord('log_1', 45, {
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0...',
          details: { action: 'login', user: 'john@example.com' },
          action: 'user_login', // Should NOT be anonymized
          entity_type: 'User' // Should NOT be anonymized
        })
      ]);

      const job = new DataRetentionJob({ dryRun: false });
      await job.execute();

      const updateCall = base44.entities.AuditLog.update.mock.calls[0][1];
      
      expect(updateCall.ip_address).toBe('[REDACTED]');
      expect(updateCall.user_agent).toBe('[REDACTED]');
      expect(updateCall.details).toEqual({ redacted: true });
      expect(updateCall.action).toBe('user_login');
      expect(updateCall.entity_type).toBe('User');
    });
  });

  // ==========================================
  // Error Handling Tests
  // ==========================================

  describe('Error Handling', () => {
    
    test('should continue processing after single record failure', async () => {
      base44.entities.DataRetentionPolicy.filter.mockResolvedValue([{
        entity_type: 'Load',
        retention_days: 30,
        action: RETENTION_ACTIONS.DELETE,
        is_active: true
      }]);

      base44.entities.Load.list.mockResolvedValue([
        createTestRecord('load_1', 45),
        createTestRecord('load_2', 50),
        createTestRecord('load_3', 55)
      ]);
      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([]);

      // First delete fails, others succeed
      base44.entities.Load.delete
        .mockRejectedValueOnce(new Error('Delete failed'))
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();

      const job = new DataRetentionJob({ dryRun: false });
      const result = await job.execute();

      expect(result.success).toBe(true);
      expect(result.results.Load.processed).toBe(3);
      expect(result.results.Load.deleted).toBe(2);
      expect(result.results.Load.errors).toBe(1);
    });

    test('should handle policy fetch failure gracefully', async () => {
      base44.entities.DataRetentionPolicy.filter.mockRejectedValue(new Error('DB error'));
      base44.entities.Load.list.mockResolvedValue([]);
      base44.entities.Document.list.mockResolvedValue([]);
      base44.entities.AuditLog.list.mockResolvedValue([]);

      const job = new DataRetentionJob({ dryRun: false });
      const result = await job.execute();

      // Should still complete with default policies
      expect(result.success).toBe(true);
    });
  });
});