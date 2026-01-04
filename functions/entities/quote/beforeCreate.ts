/**
 * Quote - Before Create Hook
 * P0 REMEDIATION: Enforce tenant isolation on create
 * FAIL-CLOSED: Blocks if no valid org_id
 */

import { enforceCreateIsolation } from '../../shared/enforcement/tenantIsolation';

export default async function beforeCreate({ data, user, base44 }) {
  return await enforceCreateIsolation({ data, user, base44 });
}