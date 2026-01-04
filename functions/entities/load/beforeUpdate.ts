/**
 * Load - Before Update Hook
 * Enforce credit holds on dispatch/award + generate accruals on delivery
 * P0 REMEDIATION: Added tenant isolation + audit logging
 */

import { enforceCreditHold } from '../../shared/finance/creditHoldEnforcement';
import { generateAccrualsForLoadEvent } from '../../shared/finance/accrualEngine';
import { enforceUpdateIsolation } from '../../shared/enforcement/tenantIsolation';
import { logFinancialChange } from '../../shared/security/auditLogger';

export default async function beforeUpdate({ id, data, existingData, user, base44 }) {
  try {
    // P0: Enforce tenant isolation
    const isolationCheck = await enforceUpdateIsolation({ data, existingData, user, base44 });
    if (!isolationCheck.ok) {
      return isolationCheck;
    }
    data = isolationCheck.data;
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
    
    // P0: Audit log the update
    if (user) {
      await logFinancialChange(
        base44,
        'Load',
        id,
        'UPDATE',
        { id: user.id || 'system', email: user.email || 'system', role: user.role || 'system' },
        existingData,
        { ...existingData, ...data },
        { updated_fields: Object.keys(data) }
      );
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