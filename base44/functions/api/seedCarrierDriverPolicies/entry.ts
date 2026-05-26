/**
 * Seed default CarrierDriverPolicy records
 * Idempotent: safe to run multiple times
 * Only inserts missing policies, never overwrites existing ones
 */

export default async function seedCarrierDriverPolicies(base44) {
  // Authorization: admin only
  const user = await base44.auth.me();
  if (user.role !== 'admin') {
    return {
      error: 'Unauthorized: admin role required',
      status: 403
    };
  }

  const seedData = getSeedData();
  const results = {
    inserted_count: 0,
    skipped_count: 0,
    inserted_keys: [],
    skipped_keys: [],
    errors: []
  };

  for (const carrierType of Object.keys(seedData)) {
    const policies = seedData[carrierType];
    
    for (const policy of policies) {
      try {
        // Check if policy already exists
        const existing = await base44.entities.CarrierDriverPolicy.filter({
          carrier_type: carrierType,
          feature_key: policy.feature_key,
          carrier_id: null
        });

        if (existing.length > 0) {
          results.skipped_count++;
          results.skipped_keys.push(`${carrierType}:${policy.feature_key}`);
          continue;
        }

        // Insert new policy
        const created = await base44.entities.CarrierDriverPolicy.create({
          carrier_id: null,
          carrier_type: carrierType,
          feature_key: policy.feature_key,
          enabled: policy.enabled,
          min_completed_loads: policy.min_completed_loads || null,
          min_on_time_pct: policy.min_on_time_pct || null,
          min_doc_on_time_pct: policy.min_doc_on_time_pct || null,
          max_dispute_rate: policy.max_dispute_rate_pct || null,
          min_days_since_last_dispute: policy.min_days_since_last_dispute || null,
          cooldown_days: policy.cooldown_days || null,
          additional_notes: policy.notes || `Default ${carrierType} policy`,
          is_active: true
        });

        results.inserted_count++;
        results.inserted_keys.push(`${carrierType}:${policy.feature_key}`);

        // Create audit log
        await base44.entities.AuditLog.create({
          entity_type: 'CarrierDriverPolicy',
          entity_id: created.id,
          action: 'CREATE',
          actor_email: 'system',
          actor_role: 'system',
          metadata: {
            seed_operation: true,
            carrier_type: carrierType,
            feature_key: policy.feature_key,
            enabled: policy.enabled,
            thresholds: {
              min_loads: policy.min_completed_loads,
              min_on_time: policy.min_on_time_pct,
              min_doc: policy.min_doc_on_time_pct,
              max_dispute: policy.max_dispute_rate_pct
            }
          }
        });

      } catch (error) {
        results.errors.push({
          carrier_type: carrierType,
          feature_key: policy.feature_key,
          error: error.message
        });
      }
    }
  }

  return {
    success: true,
    summary: results,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get seed data for all carrier types
 */
function getSeedData() {
  return {
    asset: [
      {
        feature_key: 'profit_explain',
        enabled: true,
        min_completed_loads: 3,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate_pct: 10,
        cooldown_days: 30,
        notes: 'Asset-based carrier - educational transparency'
      },
      {
        feature_key: 'detention_timer',
        enabled: true,
        min_completed_loads: 3,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate_pct: 10,
        cooldown_days: 30,
        notes: 'Asset-based carrier - auto-capture detention'
      },
      {
        feature_key: 'accessorial_requests',
        enabled: true,
        min_completed_loads: 3,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate_pct: 10,
        cooldown_days: 30,
        notes: 'Asset-based carrier - accessorial submissions'
      },
      {
        feature_key: 'direct_messaging',
        enabled: true,
        min_completed_loads: 1,
        notes: 'Asset-based carrier - basic communication'
      },
      {
        feature_key: 'facility_intel',
        enabled: true,
        min_completed_loads: 0,
        notes: 'Asset-based carrier - facility insights for planning'
      }
    ],

    brokerage: [
      {
        feature_key: 'profit_explain',
        enabled: true,
        min_completed_loads: 5,
        min_on_time_pct: 92,
        min_doc_on_time_pct: 95,
        max_dispute_rate_pct: 8,
        cooldown_days: 30,
        notes: 'Brokerage - stricter thresholds for margin protection'
      },
      {
        feature_key: 'direct_messaging',
        enabled: true,
        min_completed_loads: 3,
        notes: 'Brokerage - basic communication after vetting'
      },
      {
        feature_key: 'detention_timer',
        enabled: false,
        notes: 'Brokerage - manually enable after 5+ clean loads'
      },
      {
        feature_key: 'accessorial_requests',
        enabled: false,
        notes: 'Brokerage - manually enable after 10+ clean loads'
      },
      {
        feature_key: 'counteroffers',
        enabled: false,
        notes: 'Brokerage - enable only for elite drivers'
      },
      {
        feature_key: 'what_if_pricing',
        enabled: false,
        notes: 'Brokerage - high reverse-engineering risk'
      },
      {
        feature_key: 'instant_pay',
        enabled: false,
        notes: 'Brokerage - high fraud risk, manual approval only'
      }
    ],

    oo_heavy: [
      {
        feature_key: 'profit_explain',
        enabled: true,
        min_completed_loads: 3,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate_pct: 10,
        cooldown_days: 30,
        notes: 'OO-heavy - transparency expected by business owners'
      },
      {
        feature_key: 'detention_timer',
        enabled: true,
        min_completed_loads: 5,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate_pct: 10,
        cooldown_days: 30,
        notes: 'OO-heavy - detention tracking'
      },
      {
        feature_key: 'accessorial_requests',
        enabled: true,
        min_completed_loads: 5,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate_pct: 10,
        cooldown_days: 30,
        notes: 'OO-heavy - accessorial submissions'
      },
      {
        feature_key: 'direct_messaging',
        enabled: true,
        min_completed_loads: 3,
        notes: 'OO-heavy - business owner communication'
      },
      {
        feature_key: 'facility_intel',
        enabled: true,
        min_completed_loads: 0,
        notes: 'OO-heavy - route planning tool'
      },
      {
        feature_key: 'counteroffers',
        enabled: false,
        min_completed_loads: 20,
        min_on_time_pct: 95,
        min_doc_on_time_pct: 95,
        max_dispute_rate_pct: 5,
        min_days_since_last_dispute: 30,
        cooldown_days: 60,
        notes: 'OO-heavy - unlock after 20 clean loads'
      },
      {
        feature_key: 'what_if_pricing',
        enabled: false,
        min_completed_loads: 20,
        min_on_time_pct: 95,
        min_doc_on_time_pct: 95,
        max_dispute_rate_pct: 5,
        min_days_since_last_dispute: 30,
        cooldown_days: 60,
        notes: 'OO-heavy - business planning after trust earned'
      },
      {
        feature_key: 'instant_pay',
        enabled: false,
        min_completed_loads: 20,
        min_on_time_pct: 95,
        min_doc_on_time_pct: 95,
        max_dispute_rate_pct: 5,
        min_days_since_last_dispute: 30,
        cooldown_days: 90,
        notes: 'OO-heavy - after KYC + trust period'
      }
    ]
  };
}