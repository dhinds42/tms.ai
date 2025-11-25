import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Advanced condition operators
const OPERATORS = {
  equals: (a, b) => a === b,
  not_equals: (a, b) => a !== b,
  greater_than: (a, b) => Number(a) > Number(b),
  less_than: (a, b) => Number(a) < Number(b),
  greater_or_equal: (a, b) => Number(a) >= Number(b),
  less_or_equal: (a, b) => Number(a) <= Number(b),
  contains: (a, b) => String(a).toLowerCase().includes(String(b).toLowerCase()),
  not_contains: (a, b) => !String(a).toLowerCase().includes(String(b).toLowerCase()),
  starts_with: (a, b) => String(a).toLowerCase().startsWith(String(b).toLowerCase()),
  ends_with: (a, b) => String(a).toLowerCase().endsWith(String(b).toLowerCase()),
  is_empty: (a) => !a || a === '' || (Array.isArray(a) && a.length === 0),
  is_not_empty: (a) => a && a !== '' && (!Array.isArray(a) || a.length > 0),
  in_list: (a, b) => Array.isArray(b) ? b.includes(a) : String(b).split(',').map(s => s.trim()).includes(a),
  not_in_list: (a, b) => Array.isArray(b) ? !b.includes(a) : !String(b).split(',').map(s => s.trim()).includes(a),
  date_before: (a, b) => new Date(a) < new Date(b),
  date_after: (a, b) => new Date(a) > new Date(b),
  date_within_days: (a, b) => {
    const date = new Date(a);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= Number(b);
  }
};

// Action executors
const ACTION_EXECUTORS = {
  send_notification: async (action, entity, context) => {
    await base44.entities.Notification.create({
      user_id: action.target || context.currentUser?.id,
      notification_type: action.notification_type || 'system_alert',
      title: interpolateTemplate(action.title || 'Workflow Alert', entity),
      message: interpolateTemplate(action.message || action.template || '', entity),
      entity_type: context.entityType,
      entity_id: entity.id,
      priority: action.priority || 'medium',
      link_url: action.link_url ? interpolateTemplate(action.link_url, entity) : null
    });
    return { success: true, action: 'notification_sent' };
  },

  send_email: async (action, entity, context) => {
    const recipient = interpolateTemplate(action.to || action.target, entity);
    const subject = interpolateTemplate(action.subject || 'TMS Notification', entity);
    const body = interpolateTemplate(action.body || action.template || '', entity);

    await base44.integrations.Core.SendEmail({
      to: recipient,
      subject: subject,
      body: body,
      from_name: action.from_name || 'TMS.ai'
    });
    return { success: true, action: 'email_sent', recipient };
  },

  update_entity: async (action, entity, context) => {
    const updateData = {};
    Object.entries(action.data || {}).forEach(([key, value]) => {
      updateData[key] = interpolateTemplate(String(value), entity);
    });

    await base44.entities[context.entityType].update(entity.id, updateData);
    return { success: true, action: 'entity_updated', fields: Object.keys(updateData) };
  },

  create_task: async (action, entity, context) => {
    await base44.entities.Task.create({
      title: interpolateTemplate(action.title || 'New Task', entity),
      description: interpolateTemplate(action.description || '', entity),
      assigned_to: action.assigned_to,
      due_date: action.due_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: action.priority || 'medium',
      status: 'pending',
      related_entity_type: context.entityType,
      related_entity_id: entity.id
    });
    return { success: true, action: 'task_created' };
  },

  sync_to_tms_b: async (action, entity, context) => {
    await base44.entities[context.entityType].update(entity.id, {
      synced_to_tms_b: true,
      last_sync_at: new Date().toISOString(),
      tms_environment: 'both'
    });
    return { success: true, action: 'synced_to_tms_b' };
  },

  auto_tender: async (action, entity, context) => {
    if (context.entityType !== 'Load') return { success: false, reason: 'Not a load' };
    
    // Find best carrier based on criteria
    const carriers = await base44.entities.Carrier.filter({
      status: 'active'
    }, '-on_time_percentage', 10);

    if (carriers.length > 0) {
      const selectedCarrier = carriers[0];
      await base44.entities.Load.update(entity.id, {
        carrier_id: selectedCarrier.id,
        status: 'tendered',
        tendered_at: new Date().toISOString()
      });

      // Send notification to carrier
      await base44.entities.Notification.create({
        user_id: selectedCarrier.contact_email,
        notification_type: 'load_assigned',
        title: 'New Load Tendered',
        message: `Load ${entity.load_number || entity.id} has been tendered to you`,
        entity_type: 'Load',
        entity_id: entity.id,
        priority: 'high'
      });

      return { success: true, action: 'auto_tendered', carrier: selectedCarrier.company_name };
    }
    return { success: false, reason: 'No available carriers' };
  },

  auto_approve: async (action, entity, context) => {
    const approvalField = action.approval_field || 'approved';
    const approvalDateField = action.approval_date_field || 'approved_at';
    
    await base44.entities[context.entityType].update(entity.id, {
      [approvalField]: true,
      [approvalDateField]: new Date().toISOString(),
      approved_by: 'auto_workflow'
    });
    return { success: true, action: 'auto_approved' };
  },

  escalate: async (action, entity, context) => {
    await base44.entities.Notification.create({
      user_id: action.escalate_to || 'admin',
      notification_type: 'system_alert',
      title: `Escalation: ${interpolateTemplate(action.title || 'Action Required', entity)}`,
      message: interpolateTemplate(action.message || `Entity ${entity.id} requires attention`, entity),
      entity_type: context.entityType,
      entity_id: entity.id,
      priority: 'urgent'
    });
    return { success: true, action: 'escalated' };
  },

  call_webhook: async (action, entity, context) => {
    // Log webhook call (actual HTTP call would require backend)
    console.log('Webhook triggered:', action.url, entity.id);
    return { success: true, action: 'webhook_logged', url: action.url };
  }
};

// Template interpolation helper
function interpolateTemplate(template, entity) {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (match, field) => {
    if (field === 'id') return entity.id || '';
    if (field === 'today') return new Date().toLocaleDateString();
    if (field === 'now') return new Date().toLocaleString();
    return entity[field] !== undefined ? entity[field] : match;
  });
}

// Evaluate complex conditions
function evaluateConditions(entity, conditions, logic = 'AND') {
  if (!conditions || (Array.isArray(conditions) && conditions.length === 0)) return true;
  if (typeof conditions === 'object' && !Array.isArray(conditions) && Object.keys(conditions).length === 0) return true;

  // Handle array of condition groups
  if (Array.isArray(conditions)) {
    const results = conditions.map(condition => evaluateSingleCondition(entity, condition));
    return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
  }

  // Handle simple object conditions (legacy format)
  if (typeof conditions === 'object') {
    // Check if it's a condition group with logic
    if (conditions.logic && conditions.conditions) {
      return evaluateConditions(entity, conditions.conditions, conditions.logic);
    }
    
    // Legacy simple key-value matching
    return Object.entries(conditions).every(([key, value]) => {
      return entity[key] === value;
    });
  }

  return true;
}

function evaluateSingleCondition(entity, condition) {
  const { field, operator, value } = condition;
  const entityValue = entity[field];
  
  const operatorFn = OPERATORS[operator];
  if (!operatorFn) {
    console.warn(`Unknown operator: ${operator}`);
    return false;
  }

  return operatorFn(entityValue, value);
}

export default function EnhancedWorkflowEngine({ 
  enabled = true, 
  interval = 30000,
  onWorkflowExecuted,
  onWorkflowError
}) {
  const queryClient = useQueryClient();
  const executionInProgress = useRef(false);
  const processedEntities = useRef(new Set());
  const [executionStats, setExecutionStats] = useState({
    totalExecutions: 0,
    successfulActions: 0,
    failedActions: 0,
    lastExecution: null
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null,
  });

  const { data: triggers } = useQuery({
    queryKey: ['workflowTriggers'],
    queryFn: () => base44.entities.WorkflowTrigger.filter({ enabled: true }),
    initialData: [],
    refetchInterval: interval,
  });

  useEffect(() => {
    if (!enabled || !triggers.length) return;

    const executeWorkflows = async () => {
      if (executionInProgress.current) return;
      executionInProgress.current = true;

      let totalSuccess = 0;
      let totalFailed = 0;

      try {
        // Sort triggers by priority
        const sortedTriggers = [...triggers].sort((a, b) => (a.priority || 5) - (b.priority || 5));

        for (const trigger of sortedTriggers) {
          try {
            // Get entities to evaluate
            const entities = await base44.entities[trigger.entity_type]?.list?.('-updated_date', 200) || [];
            
            for (const entity of entities) {
              // Skip if already processed in this cycle (prevent duplicate executions)
              const entityKey = `${trigger.id}_${entity.id}_${entity.updated_date}`;
              if (processedEntities.current.has(entityKey)) continue;

              // Evaluate trigger conditions
              const shouldExecute = evaluateConditions(entity, trigger.conditions, trigger.condition_logic);
              
              if (shouldExecute) {
                const context = {
                  entityType: trigger.entity_type,
                  trigger: trigger,
                  currentUser: currentUser
                };

                // Execute all actions
                for (const action of trigger.actions || []) {
                  try {
                    const executor = ACTION_EXECUTORS[action.action_type];
                    if (executor) {
                      const result = await executor(action, entity, context);
                      if (result.success) {
                        totalSuccess++;
                      } else {
                        totalFailed++;
                      }
                      
                      onWorkflowExecuted?.({
                        trigger: trigger.trigger_name,
                        entity: entity.id,
                        action: action.action_type,
                        result
                      });
                    }
                  } catch (actionError) {
                    totalFailed++;
                    onWorkflowError?.({
                      trigger: trigger.trigger_name,
                      entity: entity.id,
                      action: action.action_type,
                      error: actionError.message
                    });
                  }
                }

                // Mark entity as processed
                processedEntities.current.add(entityKey);

                // Update trigger execution stats
                await base44.entities.WorkflowTrigger.update(trigger.id, {
                  last_executed_at: new Date().toISOString(),
                  execution_count: (trigger.execution_count || 0) + 1
                });
              }
            }
          } catch (triggerError) {
            console.error(`Workflow trigger ${trigger.trigger_name} failed:`, triggerError);
          }
        }

        // Clean up old processed entries (keep only last hour)
        if (processedEntities.current.size > 10000) {
          processedEntities.current.clear();
        }

        setExecutionStats(prev => ({
          totalExecutions: prev.totalExecutions + 1,
          successfulActions: prev.successfulActions + totalSuccess,
          failedActions: prev.failedActions + totalFailed,
          lastExecution: new Date()
        }));

        // Refresh data
        queryClient.invalidateQueries(['notifications']);
        queryClient.invalidateQueries(['loads']);

      } catch (error) {
        console.error('Workflow engine error:', error);
      } finally {
        executionInProgress.current = false;
      }
    };

    executeWorkflows();
    const intervalId = setInterval(executeWorkflows, interval);

    return () => clearInterval(intervalId);
  }, [enabled, triggers, interval, currentUser, queryClient, onWorkflowExecuted, onWorkflowError]);

  return null;
}

export { OPERATORS, ACTION_EXECUTORS, evaluateConditions, interpolateTemplate };