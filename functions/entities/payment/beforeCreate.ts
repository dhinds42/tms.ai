/**
 * Payment - Before Create Hook
 * P0 REMEDIATION: Tenant isolation + audit
 */

import { enforceCreate } from '../../shared/enforcement/requestContext';

export default async function beforeCreate({ data, user, base44 }) {
  return await enforceCreate({ base44, user, entityName: 'Payment', data, requireAudit: true });
}