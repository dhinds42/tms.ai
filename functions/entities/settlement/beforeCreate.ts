/**
 * Settlement Entity - Before Create Hook
 */

import { parseCurrency } from '../../shared/math/parsing';
import { calculateSettlement, validateSettlement } from '../../shared/math/settlements';
import { dollarsToCents, centsToDollars } from '../../shared/math/money';
import { logFinancialChange, detectAnomalies } from '../../shared/security/auditLogger';

export default async function beforeCreate({ data, user, base44 }) {
  const errors = [];
  
  try {
    // Parse inputs
    const loadPays = (data.load_pays || []).map(p => parseCurrency(p));
    const advances = (data.advances || []).map(a => parseCurrency(a));
    const fuelAdvances = (data.fuel_advances || []).map(f => parseCurrency(f));
    const deductions = (data.deductions || []).map(d => ({
      type: d.type,
      amount: parseCurrency(d.amount)
    }));
    
    // Calculate settlement
    const settlement = calculateSettlement({
      loadPays,
      advances,
      fuelAdvances,
      deductions
    });
    
    // Validate
    const validation = validateSettlement(settlement, {
      allowNegativeNet: true,  // Allow but flag
      maxNegativeNet: dollarsToCents(-1000)  // Max -$1000
    });
    
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
    
    // Check for duplicates
    if (data.driver_id || data.carrier_id) {
      const entityId = data.driver_id || data.carrier_id;
      const startDate = data.period_start;
      const endDate = data.period_end;
      
      if (startDate && endDate) {
        const existing = await base44.asServiceRole.entities.Settlement.filter({
          $or: [
            { driver_id: entityId },
            { carrier_id: entityId }
          ],
          period_start: startDate,
          period_end: endDate
        });
        
        if (existing && existing.length > 0) {
          errors.push('Duplicate settlement for this period');
        }
      }
    }
    
    if (errors.length > 0) {
      return { ok: false, errors: errors.map(msg => ({ field: 'settlement', code: 'VALIDATION_ERROR', message: msg })) };
    }
    
    // Set server-calculated values
    data.gross_pay = centsToDollars(settlement.grossPay);
    data.total_advances = centsToDollars(settlement.totalAdvances);
    data.total_deductions = centsToDollars(settlement.totalDeductions);
    data.net_pay = centsToDollars(settlement.netPay);
    data.calculated_at = new Date().toISOString();
    data.calculated_by_server = true;
    
    // Flag negative net
    if (settlement.netPay < 0) {
      data.requires_review = true;
      data.review_reason = 'Negative net pay';
    }
    
    // Audit log
    await logFinancialChange('Settlement', data.id || 'new', 'CREATE', {
      id: user.id,
      email: user.email,
      role: user.role
    }, null, data);
    
    // Check for anomalies
    await detectAnomalies('Settlement', data, user);
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{
        field: 'settlement',
        code: 'CALCULATION_ERROR',
        message: error.message
      }]
    };
  }
}