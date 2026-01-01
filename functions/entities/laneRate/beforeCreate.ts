/**
 * LaneRate - Before Create Hook
 * Validates FSC configuration and applies customer defaults
 */

export default async function beforeCreate({ data, user, base44 }) {
  try {
    // Apply customer FSC defaults if lane_id references a Lane with customer_id
    if (data.lane_id && !data.fsc_enabled) {
      const lanes = await base44.asServiceRole.entities.Lane.filter({ id: data.lane_id });
      if (lanes.length > 0) {
        const lane = lanes[0];
        const customers = await base44.asServiceRole.entities.Customer.filter({ id: lane.customer_id });
        
        if (customers.length > 0) {
          const customer = customers[0];
          if (customer.default_fsc_enabled) {
            data.fsc_enabled = customer.default_fsc_enabled;
            data.fsc_handling = customer.default_fsc_handling;
            data.fsc_method = customer.default_fsc_method;
            data.fsc_table_id = customer.default_fsc_table_id;
          }
        }
      }
    }
    
    // Validate FSC configuration
    if (data.fsc_enabled) {
      if (!data.fsc_handling) {
        return {
          ok: false,
          errors: [{
            field: 'fsc_handling',
            code: 'REQUIRED',
            message: 'fsc_handling required when fsc_enabled=true (INCLUDED or SEPARATE)'
          }]
        };
      }
      
      if (data.fsc_handling === 'SEPARATE') {
        if (!data.fsc_method) {
          return {
            ok: false,
            errors: [{
              field: 'fsc_method',
              code: 'REQUIRED',
              message: 'fsc_method required when fsc_handling=SEPARATE'
            }]
          };
        }
        
        // Validate method-specific requirements
        if (data.fsc_method === 'FLAT_PER_MILE' && !data.fsc_cpm_cents) {
          return {
            ok: false,
            errors: [{
              field: 'fsc_cpm_cents',
              code: 'REQUIRED',
              message: 'fsc_cpm_cents required for FLAT_PER_MILE method'
            }]
          };
        }
        
        if (data.fsc_method === 'PERCENT_OF_LINEHAUL' && !data.fsc_percent_bps) {
          return {
            ok: false,
            errors: [{
              field: 'fsc_percent_bps',
              code: 'REQUIRED',
              message: 'fsc_percent_bps required for PERCENT_OF_LINEHAUL method'
            }]
          };
        }
        
        if (data.fsc_method === 'TABLE_LOOKUP' && !data.fsc_table_id) {
          return {
            ok: false,
            errors: [{
              field: 'fsc_table_id',
              code: 'REQUIRED',
              message: 'fsc_table_id required for TABLE_LOOKUP method'
            }]
          };
        }
      }
    }
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'LaneRate',
      entity_id: data.id || 'new',
      action: 'LANE_RATE_CREATED',
      actor_email: user.email,
      actor_role: user.role,
      metadata: {
        origin: `${data.origin_city}, ${data.origin_state}`,
        destination: `${data.destination_city}, ${data.destination_state}`,
        fsc_enabled: data.fsc_enabled,
        fsc_method: data.fsc_method
      }
    });
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{
        field: 'laneRate',
        code: 'HOOK_ERROR',
        message: error.message
      }]
    };
  }
}