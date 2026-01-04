/**
 * Data Retention Job - Scheduled Function
 * P0 REMEDIATION: Enforce DataRetentionPolicy
 * Schedule: Daily at 01:00 America/New_York
 */

export default async function dataRetentionJob(base44) {
  const startTime = Date.now();
  const results = {
    policies_processed: 0,
    records_archived: 0,
    records_deleted: 0,
    errors: []
  };
  
  try {
    console.log('[DATA RETENTION] Starting job...');
    
    // Get active retention policies
    const policies = await base44.asServiceRole.entities.DataRetentionPolicy.filter({
      is_active: true
    });
    
    console.log(`[DATA RETENTION] Found ${policies.length} active policies`);
    
    for (const policy of policies) {
      try {
        results.policies_processed++;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);
        
        // Get records older than retention period
        const entityName = policy.entity_type;
        const dateField = policy.date_field || 'created_date';
        
        const expiredRecords = await base44.asServiceRole.entities[entityName].filter({
          [dateField]: { $lt: cutoffDate.toISOString() }
        });
        
        console.log(`[DATA RETENTION] ${entityName}: Found ${expiredRecords.length} expired records`);
        
        for (const record of expiredRecords) {
          if (policy.action === 'ARCHIVE') {
            // Move to archive entity (if exists)
            try {
              await base44.asServiceRole.entities.ArchivedData.create({
                original_entity: entityName,
                original_id: record.id,
                data: record,
                archived_at: new Date().toISOString(),
                retention_policy_id: policy.id
              });
              results.records_archived++;
            } catch (archiveError) {
              console.error('[DATA RETENTION] Archive failed:', archiveError);
              results.errors.push({
                entity: entityName,
                record_id: record.id,
                error: 'Archive failed'
              });
            }
          } else if (policy.action === 'DELETE') {
            // Hard delete
            try {
              await base44.asServiceRole.entities[entityName].delete(record.id);
              results.records_deleted++;
            } catch (deleteError) {
              console.error('[DATA RETENTION] Delete failed:', deleteError);
              results.errors.push({
                entity: entityName,
                record_id: record.id,
                error: 'Delete failed'
              });
            }
          }
        }
      } catch (policyError) {
        console.error('[DATA RETENTION] Policy processing failed:', policyError);
        results.errors.push({
          policy_id: policy.id,
          error: policyError.message
        });
      }
    }
    
    const duration = Date.now() - startTime;
    console.log('[DATA RETENTION] Job completed:', {
      ...results,
      duration_ms: duration
    });
    
    return {
      success: true,
      ...results,
      duration_ms: duration
    };
    
  } catch (error) {
    console.error('[DATA RETENTION] Job failed:', error);
    return {
      success: false,
      error: error.message,
      ...results
    };
  }
}