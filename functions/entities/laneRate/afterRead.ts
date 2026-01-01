/**
 * LaneRate - After Read Hook
 * Apply RBAC redaction - customers should not see carrier rates, margins, or internal costs
 */

import { redactFinancialFields } from '../../shared/security/financialRedaction.js';

export default async function afterRead({ data, user, base44 }) {
  try {
    // Determine user's role and apply redaction
    const isCustomer = user.role === 'customer' || user.role === 'shipper';
    const isDriver = user.role === 'driver';
    const isCarrier = user.role === 'carrier';
    const isAdminOrBroker = user.role === 'admin' || user.role === 'broker';
    
    if (isCustomer) {
      // Customer sees only customer-facing fields
      const allowedFields = [
        'id',
        'lane_id',
        'origin_city',
        'origin_state',
        'origin_zip',
        'destination_city',
        'destination_state',
        'destination_zip',
        'lane_miles',
        'customer_rate',
        'status',
        'effective_date',
        'expiration_date',
        'fsc_enabled',
        'fsc_handling',
        'fsc_method',
        'fsc_cpm_cents',
        'fsc_percent_bps',
        'fsc_table_id',
        'computed_total_cents',
        'itemized_charges_json',
        'explain_calculation_json',
        'created_date',
        'updated_date'
      ];
      
      // Redact all other fields
      const redactedData = {};
      allowedFields.forEach(field => {
        if (data[field] !== undefined) {
          redactedData[field] = data[field];
        }
      });
      
      return { ok: true, data: redactedData };
    }
    
    if (isDriver) {
      // Driver sees only driver_rate if assigned
      return {
        ok: true,
        data: {
          id: data.id,
          lane_id: data.lane_id,
          origin_city: data.origin_city,
          origin_state: data.origin_state,
          destination_city: data.destination_city,
          destination_state: data.destination_state,
          lane_miles: data.lane_miles,
          driver_rate: data.driver_rate,
          assigned_driver_id: data.assigned_driver_id,
          status: data.status
        }
      };
    }
    
    if (isCarrier) {
      // Carrier sees carrier_rate but not customer rates or broker margins
      const carrierFields = [
        'id',
        'lane_id',
        'origin_city',
        'origin_state',
        'destination_city',
        'destination_state',
        'lane_miles',
        'carrier_rate',
        'owner_operator_rate',
        'driver_rate',
        'assigned_driver_id',
        'assigned_carrier_id',
        'status',
        'effective_date',
        'expiration_date'
      ];
      
      const redactedData = {};
      carrierFields.forEach(field => {
        if (data[field] !== undefined) {
          redactedData[field] = data[field];
        }
      });
      
      return { ok: true, data: redactedData };
    }
    
    // Admin/Broker see everything
    if (isAdminOrBroker) {
      return { ok: true, data };
    }
    
    // Default: minimal data
    return {
      ok: true,
      data: {
        id: data.id,
        status: data.status
      }
    };
    
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