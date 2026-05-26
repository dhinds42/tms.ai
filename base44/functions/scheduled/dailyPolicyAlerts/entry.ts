/**
 * Daily Policy Alert Generation
 * Scheduled to run daily at 02:00 America/New_York
 * 
 * SETUP INSTRUCTIONS:
 * This function should be called by a scheduled job (cron, Base44 scheduler, or cloud function trigger)
 * 
 * Example cron: 0 2 * * * (daily at 2 AM)
 * 
 * Base44 Scheduling Options:
 * 1. Vercel Cron (if deployed on Vercel)
 * 2. AWS EventBridge (if on AWS)
 * 3. Manual trigger via admin UI (for testing)
 * 4. CI/CD pipeline scheduled task
 */

import { generateAllPolicyAlerts } from '../shared/alerts/enhancedPolicyAlertEngine.js';

export default async function dailyPolicyAlerts(base44) {
  console.log('[PolicyAlerts] Starting daily policy alert generation...');
  
  const startTime = Date.now();
  
  try {
    const summary = await generateAllPolicyAlerts(base44);
    
    const duration = Date.now() - startTime;
    
    console.log('[PolicyAlerts] Completed:', {
      carriers_evaluated: summary.carriers_evaluated,
      created: summary.created_count,
      skipped: summary.skipped_count,
      duration_ms: duration
    });

    return {
      success: true,
      summary,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[PolicyAlerts] Error:', error);
    
    // Log failure
    await base44.entities.AuditLog.create({
      entity_type: 'PolicyAlert',
      entity_id: 'system',
      action: 'POLICY_ALERT_BATCH_FAILED',
      actor_email: 'system',
      actor_role: 'system',
      metadata: {
        error: error.message,
        stack: error.stack
      }
    });

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}