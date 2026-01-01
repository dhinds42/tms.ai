/**
 * Apply Policy Changes from Alert
 * Safely updates CarrierDriverPolicy with validation and audit logging
 */

import { validateCarrierPolicy } from '../shared/eligibility/systemMinimums.js';

export default async function applyPolicyFromAlert({ alertId, appliedBy, notes }, base44) {
  // 1. Authorization check
  const user = await base44.auth.me();
  
  const alerts = await base44.entities.PolicyAlert.filter({ id: alertId });
  if (alerts.length === 0) {
    return { error: 'Alert not found', status: 404 };
  }
  
  const alert = alerts[0];
  
  // Carrier ops can only modify their own carrier's policies
  if (user.role === 'carrier') {
    const drivers = await base44.entities.Driver.filter({ linked_user_id: user.id });
    if (drivers.length === 0 || drivers[0].party_id !== alert.carrier_id) {
      return { error: 'Unauthorized: Can only modify your own carrier policies', status: 403 };
    }
  } else if (user.role !== 'admin' && user.role !== 'broker') {
    return { error: 'Unauthorized: Admin, broker, or carrier ops role required', status: 403 };
  }

  // 2. Get recommended changes
  if (!alert.recommended_changes?.suggested_updates) {
    return { error: 'No suggested changes in this alert', status: 400 };
  }

  const suggestedUpdates = alert.recommended_changes.suggested_updates;
  const targetFeatureKey = alert.recommended_changes.feature_key || alert.feature_key;

  if (!targetFeatureKey) {
    return { error: 'No feature key specified for policy update', status: 400 };
  }

  // 3. Find existing policy
  const query = {
    carrier_id: alert.carrier_id,
    feature_key: targetFeatureKey
  };

  // If no carrier-specific policy, look for carrier_type default
  let policies = await base44.entities.CarrierDriverPolicy.filter(query);
  
  if (policies.length === 0 && alert.carrier_type) {
    policies = await base44.entities.CarrierDriverPolicy.filter({
      carrier_id: null,
      carrier_type: alert.carrier_type,
      feature_key: targetFeatureKey
    });
  }

  let policy = policies.length > 0 ? policies[0] : null;
  let beforeValues = null;

  // 4. Safety check: Validate against system minimums
  if (policy) {
    beforeValues = { ...policy };
    
    const proposedPolicy = {
      ...policy,
      ...suggestedUpdates
    };

    // Validate doesn't weaken system baselines
    const validation = validateCarrierPolicy(targetFeatureKey, proposedPolicy);
    if (!validation.valid) {
      return {
        error: `Policy validation failed: ${validation.reason}`,
        status: 400,
        validation
      };
    }
  }

  // 5. Extra safety for high-risk P2 features
  const highRiskFeatures = ['counteroffers', 'what_if_pricing', 'instant_pay'];
  
  if (highRiskFeatures.includes(targetFeatureKey) && suggestedUpdates.enabled === true) {
    if (user.role !== 'admin' && user.role !== 'broker') {
      return {
        error: 'Only admin/broker can enable high-risk P2 features',
        status: 403
      };
    }
  }

  // 6. Apply changes
  let updatedPolicy;
  
  if (policy) {
    // Update existing policy
    updatedPolicy = await base44.entities.CarrierDriverPolicy.update(policy.id, suggestedUpdates);
  } else {
    // Create new carrier-specific policy
    updatedPolicy = await base44.entities.CarrierDriverPolicy.create({
      carrier_id: alert.carrier_id,
      carrier_type: alert.carrier_type,
      feature_key: targetFeatureKey,
      ...suggestedUpdates,
      additional_notes: `Created from PolicyAlert ${alertId}: ${notes || alert.recommendation}`
    });
  }

  // 7. Audit log with before/after diff
  await base44.entities.AuditLog.create({
    entity_type: 'CarrierDriverPolicy',
    entity_id: updatedPolicy.id,
    action: 'POLICY_CHANGE_APPLIED',
    actor_email: user.email,
    actor_role: user.role,
    before_values: beforeValues,
    after_values: updatedPolicy,
    changed_fields: Object.keys(suggestedUpdates).reduce((acc, key) => {
      acc[key] = {
        from: beforeValues?.[key],
        to: suggestedUpdates[key]
      };
      return acc;
    }, {}),
    metadata: {
      source_alert_id: alertId,
      alert_type: alert.alert_type,
      trigger_metric: alert.trigger_metric,
      current_value: alert.current_value,
      threshold_value: alert.threshold_value,
      applied_by_notes: notes
    }
  });

  // 8. Update alert status
  await base44.entities.PolicyAlert.update(alertId, {
    status: 'implemented',
    action_taken: notes || `Applied suggested policy changes to ${targetFeatureKey}`,
    acknowledged_by: user.email,
    acknowledged_at: new Date().toISOString(),
    resolved_at: new Date().toISOString()
  });

  return {
    success: true,
    policy: updatedPolicy,
    before: beforeValues,
    after: updatedPolicy,
    changes_applied: Object.keys(suggestedUpdates),
    alert_id: alertId
  };
}