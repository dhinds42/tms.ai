/**
 * OwnerOperator Settlement - Before Create Hook
 */

import { parseCurrency } from '../../shared/math/parsing';
import { calcOwnerOpNet, calcOwnerOpLease, calcOwnerOpMaintenance } from '../../shared/math/ownerOperator';
import { dollarsToCents, centsToDollars } from '../../shared/math/money';

export default async function beforeCreate({ data, user }) {
  try {
    const grossPay = parseCurrency(data.gross_pay);
    
    // Calculate lease if percentage provided
    let leasePayment = data.lease_payment 
      ? parseCurrency(data.lease_payment)
      : 0;
    
    if (!leasePayment && data.lease_percent) {
      leasePayment = calcOwnerOpLease(grossPay, data.lease_percent);
    }
    
    // Calculate maintenance reserve
    let maintenanceReserve = data.maintenance_reserve
      ? parseCurrency(data.maintenance_reserve)
      : 0;
    
    if (!maintenanceReserve && data.maintenance_reserve_percent) {
      maintenanceReserve = calcOwnerOpMaintenance(grossPay, {
        type: 'percent',
        value: data.maintenance_reserve_percent
      });
    }
    
    // Calculate net
    const result = calcOwnerOpNet({
      grossPay,
      leasePayment,
      maintenanceReserve,
      escrow: parseCurrency(data.escrow_withholding),
      fuelCharges: parseCurrency(data.fuel_charges),
      advances: parseCurrency(data.advances_total)
    });
    
    // Set calculated values
    data.total_deductions = centsToDollars(result.totalDeductions);
    data.net_pay = centsToDollars(result.netPay);
    data.calculated_at = new Date().toISOString();
    
    return { ok: true, data };
    
  } catch (error) {
    return {
      ok: false,
      errors: [{
        field: 'owner_operator_settlement',
        code: 'CALCULATION_ERROR',
        message: error.message
      }]
    };
  }
}