/**
 * LaneRate Entity - After Read Hook
 * RBAC redaction for pricing
 */

import { redactFinancialsByRole } from '../../shared/security/financialRedaction';

export default async function afterRead({ data, user }) {
  const redacted = redactFinancialsByRole('LaneRate', data, user?.role || 'carrier');
  
  if (redacted === null) {
    throw new Error('Access denied to lane rate data');
  }
  
  return { ok: true, data: redacted };
}