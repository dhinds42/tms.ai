import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function AutoWorkflowEngine({ enabled = true, interval = 30000 }) {
  const queryClient = useQueryClient();
  const executionInProgress = useRef(false);

  const { data: triggers } = useQuery({
    queryKey: ['enabledTriggers'],
    queryFn: () => base44.entities.WorkflowTrigger.filter({ enabled: true }),
    initialData: [],
    refetchInterval: interval,
  });

  useEffect(() => {
    if (!enabled || !triggers.length) return;

    const executeWorkflows = async () => {
      if (executionInProgress.current) return;
      executionInProgress.current = true;

      try {
        for (const trigger of triggers) {
          const entities = await base44.entities[trigger.entity_type]?.list?.('-created_date', 100) || [];
          
          for (const entity of entities) {
            const shouldExecute = evaluateConditions(entity, trigger.conditions);
            
            if (shouldExecute) {
              for (const action of trigger.actions || []) {
                await executeAction(action, entity);
              }

              await base44.entities.WorkflowTrigger.update(trigger.id, {
                last_executed_at: new Date().toISOString(),
                execution_count: (trigger.execution_count || 0) + 1
              });
            }
          }
        }
      } catch (error) {
        console.error('Workflow execution failed:', error);
      } finally {
        executionInProgress.current = false;
      }
    };

    executeWorkflows();
    const intervalId = setInterval(executeWorkflows, interval);

    return () => clearInterval(intervalId);
  }, [enabled, triggers, interval]);

  const evaluateConditions = (entity, conditions) => {
    if (!conditions || Object.keys(conditions).length === 0) return true;
    
    return Object.entries(conditions).every(([key, value]) => {
      return entity[key] === value;
    });
  };

  const executeAction = async (action, entity) => {
    switch (action.action_type) {
      case 'send_notification':
        await base44.entities.Notification.create({
          user_id: action.target,
          notification_type: 'system_alert',
          title: action.template || 'Workflow Notification',
          message: `Triggered by ${entity.id}`,
          entity_type: entity.__typename || 'Unknown',
          entity_id: entity.id,
          priority: 'medium'
        });
        break;
      
      case 'sync_to_tms_b':
        if (entity.id && entity.__typename) {
          await base44.entities[entity.__typename].update(entity.id, {
            synced_to_tms_b: true,
            last_sync_at: new Date().toISOString()
          });
        }
        break;
      
      case 'update_entity':
        if (action.data && entity.id && entity.__typename) {
          await base44.entities[entity.__typename].update(entity.id, action.data);
        }
        break;
    }
  };

  return null;
}