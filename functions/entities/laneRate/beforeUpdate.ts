/**
 * LaneRate - Before Update Hook
 * Validates FSC configuration changes
 */

export default async function beforeUpdate({ data, user, base44 }) {
  try {
    // Validate FSC configuration if being modified
    if (data.fsc_enabled !== undefined) {
      if (data.fsc_enabled && !data.fsc_handling) {
        return {
          ok: false,
          errors: [{
            field: 'fsc_handling',
            code: 'REQUIRED',
            message: 'fsc_handling required when fsc_enabled=true'
          }]
        };
      }
      
      if (data.fsc_handling === 'SEPARATE' && !data.fsc_method) {
        return {
          ok: false,
          errors: [{
            field: 'fsc_method',
            code: 'REQUIRED',
            message: 'fsc_method required when fsc_handling=SEPARATE'
          }]
        };
      }
    }
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'LaneRate',
      entity_id: data.id || 'unknown',
      action: 'LANE_RATE_UPDATED',
      actor_email: user.email,
      actor_role: user.role,
      metadata: {
        updated_fields: Object.keys(data),
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