/**
 * Data Retention Job
 * 
 * Reads rules from DataRetentionPolicy table and purges/anonymizes data
 * for entities: Load, Document, AuditLog, SessionToken
 * 
 * NOTE: Full automated execution requires Backend Functions.
 * This provides the logic that can be triggered manually or via scheduled job.
 */

import { base44 } from '@/api/base44Client';

// Supported retention actions
export const RETENTION_ACTIONS = {
  DELETE: 'delete',
  ANONYMIZE: 'anonymize',
  ARCHIVE: 'archive',
  RETAIN: 'retain'
};

// Fields to anonymize per entity type
const ANONYMIZATION_FIELDS = {
  Load: ['contact_person', 'special_instructions', 'check_calls'],
  Document: ['extracted_data', 'notes'],
  AuditLog: ['ip_address', 'user_agent', 'details'],
  SessionToken: ['ip_address', 'user_agent', 'token_hash']
};

// Default retention periods (days) if no policy exists
const DEFAULT_RETENTION_DAYS = {
  Load: 2555, // 7 years (FMCSA requirement)
  Document: 2555, // 7 years
  AuditLog: 2555, // 7 years
  SessionToken: 90
};

/**
 * Data Retention Job Class
 */
export class DataRetentionJob {
  constructor(config = {}) {
    this.dryRun = config.dryRun ?? true;
    this.batchSize = config.batchSize || 100;
    this.log = [];
  }

  /**
   * Execute retention job for all configured entities
   */
  async execute() {
    this.log = [];
    this.logMessage('info', 'Starting data retention job', { dryRun: this.dryRun });

    try {
      // Fetch all active retention policies
      const policies = await this.fetchPolicies();
      this.logMessage('info', `Found ${policies.length} retention policies`);

      const results = {
        Load: { processed: 0, deleted: 0, anonymized: 0, errors: 0 },
        Document: { processed: 0, deleted: 0, anonymized: 0, errors: 0 },
        AuditLog: { processed: 0, deleted: 0, anonymized: 0, errors: 0 },
        SessionToken: { processed: 0, deleted: 0, anonymized: 0, errors: 0 }
      };

      // Process each entity type
      for (const entityType of ['Load', 'Document', 'AuditLog', 'SessionToken']) {
        const policy = policies.find(p => p.entity_type === entityType) || this.getDefaultPolicy(entityType);
        const entityResults = await this.processEntity(entityType, policy);
        results[entityType] = entityResults;
      }

      this.logMessage('info', 'Data retention job completed', { results });
      return { success: true, results, log: this.log };

    } catch (error) {
      this.logMessage('error', 'Data retention job failed', { error: error.message });
      return { success: false, error: error.message, log: this.log };
    }
  }

  /**
   * Fetch retention policies from database
   */
  async fetchPolicies() {
    try {
      return await base44.entities.DataRetentionPolicy.filter({ is_active: true });
    } catch {
      this.logMessage('warn', 'Could not fetch policies, using defaults');
      return [];
    }
  }

  /**
   * Get default policy for entity type
   */
  getDefaultPolicy(entityType) {
    return {
      entity_type: entityType,
      retention_days: DEFAULT_RETENTION_DAYS[entityType] || 2555,
      action: entityType === 'SessionToken' ? RETENTION_ACTIONS.DELETE : RETENTION_ACTIONS.ANONYMIZE,
      is_active: true
    };
  }

  /**
   * Process a single entity type
   */
  async processEntity(entityType, policy) {
    const results = { processed: 0, deleted: 0, anonymized: 0, archived: 0, errors: 0 };
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);
    
    this.logMessage('info', `Processing ${entityType}`, {
      retentionDays: policy.retention_days,
      action: policy.action,
      cutoffDate: cutoffDate.toISOString()
    });

    try {
      // Fetch records older than cutoff
      const oldRecords = await this.fetchOldRecords(entityType, cutoffDate);
      this.logMessage('info', `Found ${oldRecords.length} ${entityType} records to process`);

      for (const record of oldRecords) {
        try {
          results.processed++;

          if (this.dryRun) {
            this.logMessage('debug', `[DRY RUN] Would ${policy.action} ${entityType} ${record.id}`);
            if (policy.action === RETENTION_ACTIONS.DELETE) results.deleted++;
            if (policy.action === RETENTION_ACTIONS.ANONYMIZE) results.anonymized++;
            continue;
          }

          switch (policy.action) {
            case RETENTION_ACTIONS.DELETE:
              await this.deleteRecord(entityType, record);
              results.deleted++;
              break;
            case RETENTION_ACTIONS.ANONYMIZE:
              await this.anonymizeRecord(entityType, record);
              results.anonymized++;
              break;
            case RETENTION_ACTIONS.ARCHIVE:
              await this.archiveRecord(entityType, record);
              results.archived++;
              break;
            default:
              // RETAIN - do nothing
              break;
          }
        } catch (error) {
          results.errors++;
          this.logMessage('error', `Failed to process ${entityType} ${record.id}`, { error: error.message });
        }
      }
    } catch (error) {
      this.logMessage('error', `Failed to fetch ${entityType} records`, { error: error.message });
    }

    return results;
  }

  /**
   * Fetch records older than cutoff date
   */
  async fetchOldRecords(entityType, cutoffDate) {
    const entityMap = {
      Load: base44.entities.Load,
      Document: base44.entities.Document,
      AuditLog: base44.entities.AuditLog
    };

    const entity = entityMap[entityType];
    if (!entity) return [];

    // Fetch all and filter by date (Base44 limitation)
    const allRecords = await entity.list('-created_date', 1000);
    return allRecords.filter(r => new Date(r.created_date) < cutoffDate);
  }

  /**
   * Delete a record
   */
  async deleteRecord(entityType, record) {
    const entityMap = {
      Load: base44.entities.Load,
      Document: base44.entities.Document,
      AuditLog: base44.entities.AuditLog
    };

    const entity = entityMap[entityType];
    if (entity) {
      await entity.delete(record.id);
      this.logMessage('info', `Deleted ${entityType} ${record.id}`);
    }
  }

  /**
   * Anonymize a record
   */
  async anonymizeRecord(entityType, record) {
    const entityMap = {
      Load: base44.entities.Load,
      Document: base44.entities.Document,
      AuditLog: base44.entities.AuditLog
    };

    const entity = entityMap[entityType];
    const fieldsToAnonymize = ANONYMIZATION_FIELDS[entityType] || [];

    const anonymizedData = { ...record, anonymized: true, anonymized_at: new Date().toISOString() };

    for (const field of fieldsToAnonymize) {
      if (anonymizedData[field]) {
        if (typeof anonymizedData[field] === 'string') {
          anonymizedData[field] = '[REDACTED]';
        } else if (typeof anonymizedData[field] === 'object') {
          anonymizedData[field] = { redacted: true };
        }
      }
    }

    if (entity) {
      await entity.update(record.id, anonymizedData);
      this.logMessage('info', `Anonymized ${entityType} ${record.id}`);
    }
  }

  /**
   * Archive a record (mark as archived)
   */
  async archiveRecord(entityType, record) {
    const entityMap = {
      Load: base44.entities.Load,
      Document: base44.entities.Document,
      AuditLog: base44.entities.AuditLog
    };

    const entity = entityMap[entityType];
    if (entity) {
      await entity.update(record.id, { ...record, archived: true, archived_at: new Date().toISOString() });
      this.logMessage('info', `Archived ${entityType} ${record.id}`);
    }
  }

  /**
   * Log message
   */
  logMessage(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    };
    this.log.push(entry);
    console.log(`[DataRetention] [${level.toUpperCase()}] ${message}`, data);
  }
}

/**
 * Execute retention job (callable from UI or scheduled job)
 */
export async function executeRetentionJob(dryRun = true) {
  const job = new DataRetentionJob({ dryRun });
  return job.execute();
}

/**
 * Preview what would be affected by retention job
 */
export async function previewRetentionJob() {
  const job = new DataRetentionJob({ dryRun: true });
  return job.execute();
}

export default DataRetentionJob;