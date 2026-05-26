/**
 * Invoice - After Create Hook
 * Detect variance and generate accruals
 */

import { detectAndFlagVariance } from '../../shared/finance/varianceEngine';
import { generateAccrualsForLoadEvent } from '../../shared/finance/accrualEngine';

export default async function afterCreate({ data, user, base44 }) {
  try {
    // Detect variance against quote
    if (data.quote_id) {
      await detectAndFlagVariance(data, base44);
    }
    
    // Generate AR revenue accrual
    if (data.load_id) {
      await generateAccrualsForLoadEvent(data.load_id, 'INVOICED', base44);
    }
    
    return { ok: true };
    
  } catch (error) {
    console.error('Invoice after-create error:', error);
    // Don't block invoice creation, just log error
    return { ok: true };
  }
}