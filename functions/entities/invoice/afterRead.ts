/**
 * Invoice Entity - After Read Hook
 * RBAC redaction
 */

import { redactFinancialsByRole } from '../../shared/security/financialRedaction';

export default async function afterRead({ data, user }) {
  // Apply role-based redaction
  const redacted = redactFinancialsByRole('Invoice', data, user?.role || 'customer');
  
  if (redacted === null) {
    // Block access entirely
    throw new Error('Access denied to invoice data');
  }
  
  return { ok: true, data: redacted };
}