/**
 * Load - Before Update Hook
 * Enforce credit holds on dispatch/award + generate accruals on delivery
 */

import { enforceCreditHold } from '../../shared/finance/creditHoldEnforcement';
import { generateAccrualsForLoadEvent } from '../../shared/finance/accrualEngine';

export default async function beforeUpdate({ id, data, existingData, user, base44 }) {
  try {
    // Check if status is changing to dispatched or assigned (SOFT_HOLD blocks here)
    if (data.status && ['dispatched', 'assigned'].includes(data.status) && existingData.status !== data.status) {
      if (existingData.customer_id) {
        const holdCheck = await enforceCreditHold(existingData, 'dispatch', base44);
      }
    }
    
    // Generate accruals on delivery
    if (data.status === 'delivered' && existingData.status !== 'delivered') {
      await generateAccrualsForLoadEvent(id, 'DELIVERED', base44);
    }
    
    return { ok: true, data };
    
  } catch (error) {
    if (error.message.startsWith('CREDIT_HOLD_BLOCK')) {
      return {
        ok: false,
        errors: [{
          field: 'status',
          code: 'CREDIT_HOLD',
          message: error.message
        }]
      };
    }
    
    return {
      ok: false,
      errors: [{
        field: 'load',
        code: 'UPDATE_ERROR',
        message: error.message
      }]
    };
  }
}