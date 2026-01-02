/**
 * Load - Before Create Hook
 * Enforce credit holds before load creation
 */

import { enforceCreditHold } from '../../shared/finance/creditHoldEnforcement';

export default async function beforeCreate({ data, user, base44 }) {
  try {
    // Check credit hold (HARD_HOLD blocks at creation)
    if (data.customer_id) {
      const holdCheck = await enforceCreditHold(data, 'create', base44);
      // If enforceCreditHold throws, it will be caught below
    }
    
    // Existing load validation would go here
    
    return { ok: true, data };
    
  } catch (error) {
    if (error.message.startsWith('CREDIT_HOLD_BLOCK')) {
      return {
        ok: false,
        errors: [{
          field: 'customer_id',
          code: 'CREDIT_HOLD',
          message: error.message
        }]
      };
    }
    
    return {
      ok: false,
      errors: [{
        field: 'load',
        code: 'VALIDATION_ERROR',
        message: error.message
      }]
    };
  }
}