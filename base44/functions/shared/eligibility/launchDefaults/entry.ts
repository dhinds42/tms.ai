/**
 * Launch Defaults for CarrierDriverPolicy
 * Conservative, enterprise-safe values proven to reduce abuse
 */

export const LAUNCH_DEFAULTS = {
  // P1 Features - Auto-unlock enabled by default
  profit_explain: {
    enabled: true,
    min_completed_loads: 5,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 90,
    max_dispute_rate: 10,
    cooldown_days: 30,
    auto_unlock: true
  },
  
  detention_timer: {
    enabled: true,
    min_completed_loads: 5,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 90,
    max_dispute_rate: 10,
    cooldown_days: 30,
    auto_unlock: true
  },
  
  accessorial_requests: {
    enabled: true,
    min_completed_loads: 5,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 90,
    max_dispute_rate: 10,
    cooldown_days: 30,
    auto_unlock: true
  },
  
  variance_alerts: {
    enabled: true,
    min_completed_loads: 3,
    min_on_time_pct: 0,
    min_doc_on_time_pct: 0,
    max_dispute_rate: 100,
    cooldown_days: 0,
    auto_unlock: true
  },
  
  direct_messaging: {
    enabled: true,
    min_completed_loads: 3,
    min_on_time_pct: 0,
    min_doc_on_time_pct: 0,
    max_dispute_rate: 100,
    cooldown_days: 0,
    auto_unlock: true
  },

  // P2 Features - Request-based unlock, disabled by default
  counteroffers: {
    enabled: false, // Manual enable only
    min_completed_loads: 20,
    min_on_time_pct: 95,
    min_doc_on_time_pct: 95,
    max_dispute_rate: 5,
    min_days_since_dispute: 30,
    cooldown_days: 60,
    auto_unlock: false, // Requires carrier approval
    requires_approval: true
  },
  
  what_if_pricing: {
    enabled: false,
    min_completed_loads: 20,
    min_on_time_pct: 95,
    min_doc_on_time_pct: 95,
    max_dispute_rate: 5,
    min_days_since_dispute: 30,
    cooldown_days: 60,
    auto_unlock: false,
    requires_approval: true
  },
  
  facility_intel: {
    enabled: false,
    min_completed_loads: 10,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 90,
    max_dispute_rate: 10,
    cooldown_days: 0,
    auto_unlock: false,
    requires_approval: true
  },
  
  offline_mode: {
    enabled: false,
    min_completed_loads: 10,
    min_on_time_pct: 90,
    min_doc_on_time_pct: 90,
    max_dispute_rate: 10,
    cooldown_days: 0,
    auto_unlock: false,
    requires_approval: true
  },
  
  instant_pay: {
    enabled: false, // Never auto-unlock
    min_completed_loads: 20,
    min_on_time_pct: 95,
    min_doc_on_time_pct: 95,
    max_dispute_rate: 5,
    min_days_since_dispute: 30,
    cooldown_days: 90,
    auto_unlock: false,
    requires_approval: true,
    instant_pay_fee_bps: 300, // 3%
    instant_pay_max_per_load_cents: 50000 // $500
  },
  
  driver_scorecard: {
    enabled: false,
    min_completed_loads: 10,
    min_on_time_pct: 0,
    min_doc_on_time_pct: 0,
    max_dispute_rate: 100,
    cooldown_days: 0,
    auto_unlock: false,
    requires_approval: true
  }
};

/**
 * Feature unlock classification
 */
export const UNLOCK_TYPES = {
  AUTO: 'auto', // Unlocks automatically when thresholds met
  REQUEST: 'request', // Requires carrier approval even if eligible
  NEVER_AUTO: 'never_auto' // Always requires manual enablement
};

export const FEATURE_UNLOCK_CLASSIFICATION = {
  // Auto-unlock (safe, educational, low-risk)
  profit_explain: UNLOCK_TYPES.AUTO,
  detention_timer: UNLOCK_TYPES.AUTO,
  accessorial_requests: UNLOCK_TYPES.AUTO,
  variance_alerts: UNLOCK_TYPES.AUTO,
  direct_messaging: UNLOCK_TYPES.AUTO,
  
  // Request-based (pricing impact, margin risk)
  counteroffers: UNLOCK_TYPES.REQUEST,
  what_if_pricing: UNLOCK_TYPES.REQUEST,
  facility_intel: UNLOCK_TYPES.REQUEST,
  offline_mode: UNLOCK_TYPES.REQUEST,
  driver_scorecard: UNLOCK_TYPES.REQUEST,
  
  // Never auto-unlock (financial/fraud risk)
  instant_pay: UNLOCK_TYPES.NEVER_AUTO,
  advance_request: UNLOCK_TYPES.NEVER_AUTO,
  accessorial_auto_approval: UNLOCK_TYPES.NEVER_AUTO,
  detention_self_edit: UNLOCK_TYPES.NEVER_AUTO
};

/**
 * Get default policy for a feature
 */
export function getDefaultPolicy(featureKey) {
  return LAUNCH_DEFAULTS[featureKey] || null;
}

/**
 * Check if feature should auto-unlock
 */
export function shouldAutoUnlock(featureKey) {
  const classification = FEATURE_UNLOCK_CLASSIFICATION[featureKey];
  return classification === UNLOCK_TYPES.AUTO;
}

/**
 * Check if feature requires approval
 */
export function requiresApproval(featureKey) {
  const classification = FEATURE_UNLOCK_CLASSIFICATION[featureKey];
  return classification === UNLOCK_TYPES.REQUEST || classification === UNLOCK_TYPES.NEVER_AUTO;
}