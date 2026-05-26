/**
 * System-Enforced Minimums (Non-Negotiable)
 * Carriers cannot set thresholds below these values
 */

export const SYSTEM_MINIMUMS = {
  // Stage 1 (Basic/Bronze) - Day 0-14
  detention_timer: {
    min_completed_loads: 1,
    min_on_time_pct: 0,
    min_doc_on_time_pct: 0,
    max_dispute_rate: 100,
    tier: 'bronze'
  },
  
  accessorial_requests: {
    min_completed_loads: 3,
    min_on_time_pct: 0,
    min_doc_on_time_pct: 0,
    max_dispute_rate: 100,
    tier: 'bronze'
  },
  
  direct_messaging: {
    min_completed_loads: 3,
    min_on_time_pct: 0,
    min_doc_on_time_pct: 0,
    max_dispute_rate: 100,
    tier: 'bronze'
  },

  // Stage 2 (Established/Silver) - P1 unlocked
  profit_explain: {
    min_completed_loads: 5,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 90,
    max_dispute_rate: 10,
    tier: 'silver'
  },

  counteroffers: {
    min_completed_loads: 5,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 90,
    max_dispute_rate: 10,
    tier: 'silver'
  },

  what_if_pricing: {
    min_completed_loads: 5,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 90,
    max_dispute_rate: 10,
    tier: 'silver'
  },

  facility_intel: {
    min_completed_loads: 5,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 90,
    max_dispute_rate: 10,
    tier: 'silver'
  },

  load_selection_priority: {
    min_completed_loads: 5,
    min_on_time_pct: 80,
    min_doc_on_time_pct: 80,
    max_dispute_rate: 15,
    tier: 'silver'
  },

  // Stage 3 (Power/Gold+) - P2 unlocked
  instant_pay: {
    min_completed_loads: 10,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 85,
    max_dispute_rate: 10,
    tier: 'gold'
  },

  advance_request: {
    min_completed_loads: 15,
    min_on_time_pct: 85,
    min_doc_on_time_pct: 85,
    max_dispute_rate: 10,
    tier: 'gold'
  },

  flexible_home_time: {
    min_completed_loads: 25,
    min_on_time_pct: 88,
    min_doc_on_time_pct: 85,
    max_dispute_rate: 10,
    tier: 'gold'
  },

  // Elite (Platinum)
  accessorial_auto_approval: {
    min_completed_loads: 20,
    min_on_time_pct: 95,
    min_doc_on_time_pct: 95,
    max_dispute_rate: 5,
    min_days_since_dispute: 30,
    tier: 'platinum'
  },

  detention_self_edit: {
    min_completed_loads: 30,
    min_on_time_pct: 95,
    min_doc_on_time_pct: 95,
    max_dispute_rate: 5,
    min_days_since_dispute: 30,
    tier: 'platinum'
  },

  premium_loads: {
    min_completed_loads: 50,
    min_on_time_pct: 95,
    min_doc_on_time_pct: 95,
    max_dispute_rate: 5,
    min_rating: 4.5,
    tier: 'platinum'
  }
};

/**
 * Non-Adjustable Features (Global, Non-Negotiable)
 * These protect legal, financial, and security boundaries
 */
export const NON_ADJUSTABLE_FEATURES = [
  'broker_margin_visibility',
  'customer_rate_exposure',
  'audit_logging',
  'acknowledgements'
];

/**
 * Validate carrier policy against system minimums
 */
export function validateCarrierPolicy(featureKey, policy) {
  const systemMin = SYSTEM_MINIMUMS[featureKey];
  if (!systemMin) {
    return { valid: false, reason: 'Unknown feature key' };
  }

  const errors = [];

  if (policy.min_completed_loads !== undefined && policy.min_completed_loads < systemMin.min_completed_loads) {
    errors.push(`min_completed_loads cannot be below ${systemMin.min_completed_loads}`);
  }

  if (policy.min_on_time_pct !== undefined && policy.min_on_time_pct < systemMin.min_on_time_pct) {
    errors.push(`min_on_time_pct cannot be below ${systemMin.min_on_time_pct}%`);
  }

  if (policy.min_doc_on_time_pct !== undefined && policy.min_doc_on_time_pct < systemMin.min_doc_on_time_pct) {
    errors.push(`min_doc_on_time_pct cannot be below ${systemMin.min_doc_on_time_pct}%`);
  }

  if (policy.max_dispute_rate !== undefined && policy.max_dispute_rate > systemMin.max_dispute_rate) {
    errors.push(`max_dispute_rate cannot exceed ${systemMin.max_dispute_rate}%`);
  }

  if (errors.length > 0) {
    return { valid: false, reason: errors.join('; ') };
  }

  return { valid: true };
}