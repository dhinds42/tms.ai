/**
 * Payment - Before Update Hook
 * P0 REMEDIATION: Tenant isolation + audit
 */

import { enforceUpdate } from '../../shared/enforcement/requestContext';

export default async function beforeUpdate({ id, data, existingData, user, base44 }) {
  return await enforceUpdate({ base44, user, entityName: 'Payment', existingData, data, requireAudit: true });
}