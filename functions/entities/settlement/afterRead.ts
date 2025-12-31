/**
 * Settlement Entity - After Read Hook
 * RBAC redaction
 */

import { redactFinancialsByRole } from '../../shared/security/financialRedaction';

export default async function afterRead({ data, user }) {
  // Apply role-based redaction
  const redacted = redactFinancialsByRole('Settlement', data, user?.role || 'driver');
  
  if (redacted === null) {
    throw new Error('Access denied to settlement data');
  }
  
  return { ok: true, data: redacted };
}