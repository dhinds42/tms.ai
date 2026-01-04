/**
 * Invoice - Before Update Hook
 * P0 REMEDIATION: Enforce tenant isolation + audit logging
 * FAIL-CLOSED: Blocks cross-tenant updates
 */

import { enforceUpdateIsolation } from '../../shared/enforcement/tenantIsolation';
import { logFinancialChange } from '../../shared/security/auditLogger';

export default async function beforeUpdate({ id, data, existingData, user, base44 }) {
  try {
    // Enforce tenant isolation
    const isolationCheck = await enforceUpdateIsolation({ data, existingData, user, base44 });
    if (!isolationCheck.ok) {
      return isolationCheck;
    }
    data = isolationCheck.data;
    
    // Audit log the update
    if (user) {
      await logFinancialChange(
        base44,
        'Invoice',
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
    return {
      ok: false,
      errors: [{
        field: 'invoice',
        code: 'UPDATE_ERROR',
        message: error.message
      }]
    };
  }
}