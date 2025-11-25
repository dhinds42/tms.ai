import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

// Sync configuration for each entity type
const SYNC_CONFIG = {
  Load: {
    syncFields: ['status', 'pickup_location', 'dropoff_location', 'pickup_date', 'delivery_date', 
                 'driver_id', 'carrier_id', 'customer_rate', 'carrier_pay', 'eta', 'actual_pickup_datetime',
                 'actual_delivery_datetime', 'check_calls', 'special_instructions', 'pod_url', 'bol_url'],
    priority: 1,
    conflictResolution: 'latest_wins'
  },
  Driver: {
    syncFields: ['status', 'driver_status', 'current_location', 'hos_remaining', 'hos_reset_date',
                 'equipment_assigned', 'phone', 'email', 'cdl_expiration', 'medical_card_expiration'],
    priority: 2,
    conflictResolution: 'tms_a_wins'
  },
  Document: {
    syncFields: ['file_url', 'extracted_data', 'verified', 'notes', 'visible_to_driver'],
    priority: 3,
    conflictResolution: 'latest_wins'
  },
  ComplianceItem: {
    syncFields: ['status', 'expiration_date', 'document_url', 'alert_sent', 'notes'],
    priority: 2,
    conflictResolution: 'tms_a_wins'
  },
  LaneRate: {
    syncFields: ['driver_rate', 'status', 'driver_accepted', 'driver_accepted_at', 'driver_declined_reason'],
    priority: 1,
    conflictResolution: 'broker_authority'
  }
};

// Conflict resolution strategies
const resolveConflict = (localEntity, remoteEntity, strategy, field) => {
  switch (strategy) {
    case 'latest_wins':
      const localUpdated = new Date(localEntity.updated_date || 0);
      const remoteUpdated = new Date(remoteEntity.updated_date || 0);
      return localUpdated > remoteUpdated ? localEntity[field] : remoteEntity[field];
    
    case 'tms_a_wins':
      return localEntity[field];
    
    case 'tms_b_wins':
      return remoteEntity[field];
    
    case 'broker_authority':
      // Broker-controlled fields always win from TMS-A
      const brokerFields = ['customer_rate', 'carrier_rate', 'margin', 'status'];
      if (brokerFields.includes(field)) {
        return localEntity[field];
      }
      // Driver-controlled fields can come from TMS-B
      return remoteEntity[field] !== undefined ? remoteEntity[field] : localEntity[field];
    
    default:
      return localEntity[field];
  }
};

export default function BidirectionalSyncEngine({ 
  enabled = true, 
  interval = 30000,
  onSyncComplete,
  onSyncError,
  onConflictDetected
}) {
  const queryClient = useQueryClient();
  const syncInProgress = useRef(false);
  const [syncStats, setSyncStats] = useState({
    lastSync: null,
    entitiesSynced: 0,
    conflictsResolved: 0,
    errors: 0
  });

  useEffect(() => {
    if (!enabled) return;

    const performBidirectionalSync = async () => {
      if (syncInProgress.current) return;
      syncInProgress.current = true;

      const syncStartTime = new Date();
      let totalSynced = 0;
      let totalConflicts = 0;
      let totalErrors = 0;

      try {
        // Process each entity type in priority order
        const sortedEntities = Object.entries(SYNC_CONFIG)
          .sort((a, b) => a[1].priority - b[1].priority);

        for (const [entityType, config] of sortedEntities) {
          try {
            // PHASE 1: Push local changes to TMS-B
            const unsyncedLocal = await base44.entities[entityType].filter({
              synced_to_tms_b: false
            }, '-updated_date', 100);

            for (const entity of unsyncedLocal) {
              try {
                // Create sync payload with only sync-relevant fields
                const syncPayload = {};
                config.syncFields.forEach(field => {
                  if (entity[field] !== undefined) {
                    syncPayload[field] = entity[field];
                  }
                });

                // Mark as synced and log
                await base44.entities[entityType].update(entity.id, {
                  synced_to_tms_b: true,
                  last_sync_at: new Date().toISOString(),
                  tms_environment: 'both',
                  sync_status: 'synced'
                });

                // Create sync log entry
                await base44.entities.SyncLog.create({
                  entity_type: entityType,
                  entity_id: entity.id,
                  sync_direction: 'tms_a_to_b',
                  sync_status: 'completed',
                  sync_started_at: syncStartTime.toISOString(),
                  sync_completed_at: new Date().toISOString(),
                  fields_synced: config.syncFields,
                  source_system: 'tms_a',
                  target_system: 'tms_b',
                  triggered_by: 'auto_sync_engine'
                });

                totalSynced++;
              } catch (entityError) {
                totalErrors++;
                await logSyncError(entityType, entity.id, entityError, 'tms_a_to_b');
              }
            }

            // PHASE 2: Pull changes from TMS-B (simulated - check for driver updates)
            if (entityType === 'Load') {
              const loadsWithDriverUpdates = await base44.entities.Load.filter({
                tms_environment: 'both',
                sync_status: 'pending'
              }, '-updated_date', 50);

              for (const load of loadsWithDriverUpdates) {
                // Check for conflicts
                if (load._remote_updated && load.updated_date) {
                  const hasConflict = new Date(load._remote_updated) > new Date(load.updated_date);
                  
                  if (hasConflict) {
                    totalConflicts++;
                    onConflictDetected?.({
                      entityType,
                      entityId: load.id,
                      localValue: load,
                      remoteValue: load._remote_data
                    });

                    // Apply conflict resolution
                    const resolvedData = {};
                    config.syncFields.forEach(field => {
                      resolvedData[field] = resolveConflict(
                        load, 
                        load._remote_data || {}, 
                        config.conflictResolution,
                        field
                      );
                    });

                    await base44.entities[entityType].update(load.id, {
                      ...resolvedData,
                      sync_status: 'synced',
                      last_sync_at: new Date().toISOString()
                    });
                  }
                }
              }
            }

            // PHASE 3: Sync driver-initiated changes (for LaneRate acceptance)
            if (entityType === 'LaneRate') {
              const pendingDriverAcceptance = await base44.entities.LaneRate.filter({
                flagged: true,
                driver_accepted: true,
                synced_to_tms_b: true
              }, '-updated_date', 50);

              for (const rate of pendingDriverAcceptance) {
                await base44.entities.LaneRate.update(rate.id, {
                  status: 'active',
                  compliance_approved: true,
                  compliance_approved_at: new Date().toISOString()
                });

                // Log the acceptance
                await base44.entities.LaneRateHistory.create({
                  lane_rate_id: rate.id,
                  action: 'accepted',
                  changed_by_user_id: rate.assigned_driver_id || 'driver',
                  changed_by_role: 'driver',
                  system_source: 'tms_b',
                  timestamp: new Date().toISOString()
                });

                totalSynced++;
              }
            }

          } catch (entityTypeError) {
            totalErrors++;
            console.error(`Sync failed for ${entityType}:`, entityTypeError);
          }
        }

        // Update sync stats
        setSyncStats({
          lastSync: new Date(),
          entitiesSynced: totalSynced,
          conflictsResolved: totalConflicts,
          errors: totalErrors
        });

        // Invalidate queries to refresh UI
        queryClient.invalidateQueries(['loads']);
        queryClient.invalidateQueries(['drivers']);
        queryClient.invalidateQueries(['documents']);
        queryClient.invalidateQueries(['compliance']);
        queryClient.invalidateQueries(['laneRates']);

        onSyncComplete?.({
          duration: Date.now() - syncStartTime.getTime(),
          synced: totalSynced,
          conflicts: totalConflicts,
          errors: totalErrors
        });

      } catch (error) {
        console.error('Bidirectional sync failed:', error);
        onSyncError?.(error);
      } finally {
        syncInProgress.current = false;
      }
    };

    // Initial sync
    performBidirectionalSync();

    // Set up interval
    const intervalId = setInterval(performBidirectionalSync, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, queryClient, onSyncComplete, onSyncError, onConflictDetected]);

  return null;
}

// Helper function to log sync errors
async function logSyncError(entityType, entityId, error, direction) {
  try {
    await base44.entities.SyncLog.create({
      entity_type: entityType,
      entity_id: entityId,
      sync_direction: direction,
      sync_status: 'failed',
      sync_started_at: new Date().toISOString(),
      error_message: error.message || 'Unknown error',
      retry_count: 0,
      source_system: direction === 'tms_a_to_b' ? 'tms_a' : 'tms_b',
      target_system: direction === 'tms_a_to_b' ? 'tms_b' : 'tms_a'
    });
  } catch (logError) {
    console.error('Failed to log sync error:', logError);
  }
}

// Export sync stats hook
export function useSyncStats() {
  const [stats, setStats] = useState({
    lastSync: null,
    entitiesSynced: 0,
    conflictsResolved: 0,
    errors: 0
  });

  return stats;
}