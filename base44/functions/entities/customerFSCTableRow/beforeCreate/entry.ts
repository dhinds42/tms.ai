/**
 * CustomerFSCTableRow - Before Create Hook
 * Validates ranges and detects overlaps
 */

export default async function beforeCreate({ data, user, base44 }) {
  try {
    // Load parent table to determine basis_type
    const tables = await base44.asServiceRole.entities.CustomerFSCTable.filter({ id: data.fsc_table_id });
    
    if (tables.length === 0) {
      return {
        ok: false,
        errors: [{
          field: 'fsc_table_id',
          code: 'NOT_FOUND',
          message: 'FSC table not found'
        }]
      };
    }
    
    const table = tables[0];
    
    // Validate basis ranges
    if (table.basis_type === 'FUEL_PRICE') {
      if (data.fuel_price_min === null || data.fuel_price_min === undefined || 
          data.fuel_price_max === null || data.fuel_price_max === undefined) {
        return {
          ok: false,
          errors: [{
            field: 'fuel_price',
            code: 'REQUIRED',
            message: 'fuel_price_min and fuel_price_max required for FUEL_PRICE basis'
          }]
        };
      }
      
      if (data.fuel_price_min >= data.fuel_price_max) {
        return {
          ok: false,
          errors: [{
            field: 'fuel_price',
            code: 'INVALID_RANGE',
            message: 'fuel_price_min must be less than fuel_price_max'
          }]
        };
      }
    } else if (table.basis_type === 'DISTANCE_BAND') {
      if (data.miles_min === null || data.miles_min === undefined || 
          data.miles_max === null || data.miles_max === undefined) {
        return {
          ok: false,
          errors: [{
            field: 'miles',
            code: 'REQUIRED',
            message: 'miles_min and miles_max required for DISTANCE_BAND basis'
          }]
        };
      }
      
      if (data.miles_min >= data.miles_max) {
        return {
          ok: false,
          errors: [{
            field: 'miles',
            code: 'INVALID_RANGE',
            message: 'miles_min must be less than miles_max'
          }]
        };
      }
    }
    
    // Validate charge value matches table charge_type
    const chargeFields = {
      CPM_CENTS: 'cpm_cents',
      PERCENT_BPS: 'percent_bps',
      FLAT_CENTS: 'flat_cents'
    };
    
    const requiredField = chargeFields[table.charge_type];
    if (!data[requiredField]) {
      return {
        ok: false,
        errors: [{
          field: requiredField,
          code: 'REQUIRED',
          message: `${requiredField} required for ${table.charge_type} charge type`
        }]
      };
    }
    
    // Check for overlapping ranges
    const existingRows = await base44.asServiceRole.entities.CustomerFSCTableRow.filter({ 
      fsc_table_id: data.fsc_table_id,
      is_active: true
    });
    
    for (const row of existingRows) {
      if (table.basis_type === 'FUEL_PRICE') {
        const overlaps = !(data.fuel_price_max <= row.fuel_price_min || data.fuel_price_min >= row.fuel_price_max);
        if (overlaps) {
          return {
            ok: false,
            errors: [{
              field: 'fuel_price_range',
              code: 'OVERLAP',
              message: `Range overlaps with existing row: $${row.fuel_price_min}-$${row.fuel_price_max}`
            }]
          };
        }
      } else if (table.basis_type === 'DISTANCE_BAND') {
        const overlaps = !(data.miles_max <= row.miles_min || data.miles_min >= row.miles_max);
        if (overlaps) {
          return {
            ok: false,
            errors: [{
              field: 'miles_range',
              code: 'OVERLAP',
              message: `Range overlaps with existing row: ${row.miles_min}-${row.miles_max} miles`
            }]
          };
        }
      }
    }
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'CustomerFSCTableRow',
      entity_id: data.id || 'new',
      action: 'FSC_TABLE_ROW_CREATED',
      actor_email: user.email,
      actor_role: user.role,
      metadata: {
        fsc_table_id: data.fsc_table_id,
        basis_type: table.basis_type,
        charge_type: table.charge_type
      }
    });
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{
        field: 'fscTableRow',
        code: 'HOOK_ERROR',
        message: error.message
      }]
    };
  }
}