/**
 * Load Entity - Before Update Hook
 */

import beforeCreate from './beforeCreate';
import { enforceLock } from '../../shared/security/financialLocks';
import { logFinancialChange } from '../../shared/security/auditLogger';
import { diffFinancialFields } from '../../shared/math/auditMath';

export default async function beforeUpdate({ data, user, existingData, base44 }) {
  // Check if financially locked
  try {
    enforceLock(existingData, user.role, 'update load');
  } catch (error) {
    return {
      ok: false,
      errors: [{
        field: 'load',
        code: 'LOCKED',
        message: error.message
      }]
    };
  }
  
  // Validate using same logic as create
  const result = await beforeCreate({ data, user, base44 });
  
  if (result.ok) {
    // Log changes
    const diffs = diffFinancialFields(existingData, result.data);
    
    if (diffs.length > 0) {
      await logFinancialChange('Load', existingData.id, 'UPDATE', {
        id: user.id,
        email: user.email,
        role: user.role
      }, existingData, result.data);
    }
  }
  
  return result;
}