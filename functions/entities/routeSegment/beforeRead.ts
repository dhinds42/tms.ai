/**
 * RouteSegment - Before Read Hook
 * P0 REMEDIATION: Tenant isolation + RBAC
 */

import { enforceRead } from '../../shared/enforcement/requestContext';

export default async function beforeRead({ query, user, base44 }) {
  return await enforceRead({ base44, user, entityName: 'RouteSegment', query });
}