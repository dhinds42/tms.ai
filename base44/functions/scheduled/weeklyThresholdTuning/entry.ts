/**
 * Weekly Automated Threshold Tuning
 * Runs every Sunday at 03:00 to auto-tune high-confidence policy adjustments
 */

import { autoTuneCarrierThresholds, applyHighConfidenceTuning } from '../shared/tuning/automatedThresholdTuner.js';

export default async function weeklyThresholdTuning(base44) {
  console.log('[ThresholdTuning] Starting weekly auto-tuning...');
  
  const carriers = await base44.entities.Carrier.filter({ status: 'active' });
  
  const summary = {
    carriers_evaluated: carriers.length,
    auto_applied_count: 0,
    review_queue_count: 0,
    carriers_tuned: []
  };

  for (const carrier of carriers) {
    try {
      const tuningResult = await autoTuneCarrierThresholds(carrier.id, base44);
      
      // Auto-apply high-confidence changes (≥80% confidence)
      if (tuningResult.auto_apply_recommended > 0) {
        const applied = await applyHighConfidenceTuning(carrier.id, base44);
        summary.auto_applied_count += applied.auto_applied;
        summary.carriers_tuned.push({
          carrier_id: carrier.id,
          company_name: carrier.company_name,
          policies_tuned: applied.auto_applied
        });
      }

      summary.review_queue_count += tuningResult.review_required;

    } catch (error) {
      console.error(`[ThresholdTuning] Error for carrier ${carrier.id}:`, error);
    }
  }

  // Log summary
  await base44.entities.AuditLog.create({
    entity_type: 'CarrierDriverPolicy',
    entity_id: 'system',
    action: 'AUTO_TUNING_BATCH_COMPLETED',
    actor_email: 'system',
    actor_role: 'system',
    metadata: summary
  });

  console.log('[ThresholdTuning] Completed:', summary);
  
  return {
    success: true,
    summary,
    timestamp: new Date().toISOString()
  };
}