/**
 * Invoice Entity - Before Update Hook
 */

import beforeCreate from './beforeCreate';
import { enforceLock } from '../../shared/security/financialLocks';

export default async function beforeUpdate({ data, user, existingData, base44 }) {
  // Check if financially locked
  enforceLock(existingData, user.role, 'update invoice');
  
  // Use same validation as create
  return await beforeCreate({ data, user, base44 });
}