/**
 * Default Carrier Policies Seed Data
 * One-time initialization for new carriers
 */

/**
 * Apply default policies for a new carrier based on carrier type
 */
export async function applyDefaultCarrierPolicies(carrierId, carrierType, base44) {
  const defaults = getDefaultPoliciesByType(carrierType);
  
  const createdPolicies = [];
  
  for (const policy of defaults) {
    // Check if policy already exists
    const existing = await base44.entities.CarrierDriverPolicy.filter({
      carrier_id: carrierId,
      feature_key: policy.feature_key
    });
    
    if (existing.length === 0) {
      const created = await base44.entities.CarrierDriverPolicy.create({
        ...policy,
        carrier_id: carrierId
      });
      createdPolicies.push(created);
    }
  }
  
  // Audit log
  if (createdPolicies.length > 0) {
    await base44.entities.AuditLog.create({
      entity_type: 'CarrierDriverPolicy',
      entity_id: carrierId,
      action: 'CREATE',
      actor_email: 'system',
      actor_role: 'system',
      metadata: {
        carrier_type: carrierType,
        policies_created: createdPolicies.length,
        auto_seeded: true
      }
    });
  }
  
  return createdPolicies;
}

/**
 * Get default policies by carrier type
 */
function getDefaultPoliciesByType(carrierType) {
  const policies = {
    asset: [
      {
        feature_key: 'profit_explain',
        enabled: true,
        min_completed_loads: 3,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate: 10,
        cooldown_days: 30,
        additional_notes: 'Asset-based carrier default - lower threshold for company drivers'
      },
      {
        feature_key: 'detention_timer',
        enabled: true,
        min_completed_loads: 3,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate: 10,
        cooldown_days: 30,
        additional_notes: 'Asset-based carrier default'
      },
      {
        feature_key: 'accessorial_requests',
        enabled: true,
        min_completed_loads: 3,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate: 10,
        cooldown_days: 30,
        additional_notes: 'Asset-based carrier default'
      },
      {
        feature_key: 'direct_messaging',
        enabled: true,
        min_completed_loads: 1,
        additional_notes: 'Asset-based carrier - communication enabled early'
      },
      {
        feature_key: 'facility_intel',
        enabled: true,
        min_completed_loads: 5,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate: 10,
        additional_notes: 'Asset-based carrier - improves planning'
      }
    ],
    
    brokerage: [
      {
        feature_key: 'profit_explain',
        enabled: true,
        min_completed_loads: 5,
        min_on_time_pct: 92,
        min_doc_on_time_pct: 95,
        max_dispute_rate: 8,
        cooldown_days: 30,
        additional_notes: 'Brokerage carrier - stricter thresholds for margin protection'
      },
      {
        feature_key: 'detention_timer',
        enabled: false,
        additional_notes: 'Brokerage carrier - manually enable after vetting'
      },
      {
        feature_key: 'accessorial_requests',
        enabled: false,
        additional_notes: 'Brokerage carrier - manually enable after 10+ clean loads'
      },
      {
        feature_key: 'direct_messaging',
        enabled: true,
        min_completed_loads: 3,
        additional_notes: 'Brokerage carrier - basic communication'
      },
      {
        feature_key: 'counteroffers',
        enabled: false,
        additional_notes: 'Brokerage carrier - enable only for elite drivers'
      }
    ],
    
    oo_heavy: [
      {
        feature_key: 'profit_explain',
        enabled: true,
        min_completed_loads: 3,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate: 10,
        cooldown_days: 30,
        additional_notes: 'OO-heavy carrier - transparency expected'
      },
      {
        feature_key: 'detention_timer',
        enabled: true,
        min_completed_loads: 5,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate: 10,
        cooldown_days: 30,
        additional_notes: 'OO-heavy carrier default'
      },
      {
        feature_key: 'accessorial_requests',
        enabled: true,
        min_completed_loads: 5,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate: 10,
        cooldown_days: 30,
        additional_notes: 'OO-heavy carrier default'
      },
      {
        feature_key: 'direct_messaging',
        enabled: true,
        min_completed_loads: 1,
        additional_notes: 'OO-heavy carrier - early communication'
      },
      {
        feature_key: 'counteroffers',
        enabled: false,
        min_completed_loads: 20,
        min_on_time_pct: 95,
        min_doc_on_time_pct: 95,
        max_dispute_rate: 5,
        cooldown_days: 60,
        additional_notes: 'OO-heavy carrier - enable after 20 clean loads'
      },
      {
        feature_key: 'facility_intel',
        enabled: true,
        min_completed_loads: 5,
        min_on_time_pct: 90,
        min_doc_on_time_pct: 90,
        max_dispute_rate: 10,
        additional_notes: 'OO-heavy carrier - business planning tool'
      }
    ]
  };
  
  return policies[carrierType] || policies.asset; // Default to asset if unknown
}