/**
 * Invoice - Before Read Hook
 * P0 REMEDIATION: Enforce tenant isolation (FAIL-CLOSED)
 */

import { enforceReadIsolation } from '../../shared/enforcement/tenantIsolation';

export default async function beforeRead({ query, user, base44 }) {
  return await enforceReadIsolation({ query, user, base44, allowAdmin: true });
}