import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

export default function AutoSyncService({ enabled = true, interval = 60000 }) {
  const queryClient = useQueryClient();
  const syncInProgress = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const syncEntities = async () => {
      if (syncInProgress.current) return;
      syncInProgress.current = true;

      try {
        const entityTypes = ['Load', 'Driver', 'Document', 'ComplianceItem'];
        
        for (const entityType of entityTypes) {
          const entities = await base44.entities[entityType].filter({ 
            synced_to_tms_b: false 
          }, '-created_date', 50);

          for (const entity of entities) {
            try {
              await base44.entities[entityType].update(entity.id, {
                synced_to_tms_b: true,
                last_sync_at: new Date().toISOString(),
                tms_environment: 'both'
              });

              await base44.entities.SyncLog.create({
                entity_type: entityType,
                entity_id: entity.id,
                sync_direction: 'tms_a_to_b',
                sync_status: 'completed',
                sync_started_at: new Date().toISOString(),
                sync_completed_at: new Date().toISOString(),
                source_system: 'tms_a',
                target_system: 'tms_b'
              });
            } catch (error) {
              await base44.entities.SyncLog.create({
                entity_type: entityType,
                entity_id: entity.id,
                sync_direction: 'tms_a_to_b',
                sync_status: 'failed',
                sync_started_at: new Date().toISOString(),
                error_message: error.message,
                source_system: 'tms_a',
                target_system: 'tms_b'
              });
            }
          }
        }

        queryClient.invalidateQueries(['loads']);
        queryClient.invalidateQueries(['drivers']);
        queryClient.invalidateQueries(['documents']);
      } catch (error) {
        console.error('Auto-sync failed:', error);
      } finally {
        syncInProgress.current = false;
      }
    };

    syncEntities();
    const intervalId = setInterval(syncEntities, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, queryClient]);

  return null;
}