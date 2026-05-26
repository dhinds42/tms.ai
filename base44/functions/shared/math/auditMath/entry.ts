/**
 * Audit Math Utilities
 * Recompute, verify, diff, explain calculations
 */

import { calculateLoadFinancials } from './rates';
import { calculateSettlement } from './settlements';
import { calcInvoiceTotal, calcBalanceDue } from './invoice';
import { dollarsToCents, centsToDollars, Cents } from './money';
import crypto from 'crypto';

/**
 * Recompute all derived fields for an entity
 */
export function recomputeDerivedFields(entityType: string, entity: any): any {
  switch (entityType) {
    case 'Load':
      return recomputeLoadFields(entity);
    case 'Invoice':
      return recomputeInvoiceFields(entity);
    case 'Settlement':
      return recomputeSettlementFields(entity);
    default:
      return entity;
  }
}

function recomputeLoadFields(load: any): any {
  const financials = calculateLoadFinancials({
    customerRate: dollarsToCents(load.customer_rate || 0),
    fuelSurcharge: dollarsToCents(load.fuel_surcharge_revenue || 0),
    accessorials: load.accessorial_revenue_total ? [dollarsToCents(load.accessorial_revenue_total)] : [],
    carrierPay: dollarsToCents(load.carrier_pay || 0),
    carrierAccessorials: [],
    overheadPercent: 15,
    insurancePercent: 2
  });
  
  return {
    ...load,
    total_revenue: centsToDollars(financials.totalCustomerCharge),
    total_carrier_cost: centsToDollars(financials.totalCarrierCost),
    margin: centsToDollars(financials.grossMargin),
    margin_percent: financials.marginPercent
  };
}

function recomputeInvoiceFields(invoice: any): any {
  const lineItems = invoice.line_items || [];
  const total = calcInvoiceTotal(
    lineItems.map(item => ({ amount: dollarsToCents(item.amount) }))
  );
  
  const payments = invoice.payments_applied || [];
  const balance = calcBalanceDue(
    total,
    payments.map(p => dollarsToCents(p))
  );
  
  return {
    ...invoice,
    invoice_total: centsToDollars(total),
    balance_due: centsToDollars(balance)
  };
}

function recomputeSettlementFields(settlement: any): any {
  const loadPays = settlement.load_pays || [];
  const result = calculateSettlement({
    loadPays: loadPays.map(p => dollarsToCents(p)),
    advances: (settlement.advances || []).map(a => dollarsToCents(a)),
    deductions: (settlement.deductions || []).map(d => ({ 
      type: d.type, 
      amount: dollarsToCents(d.amount) 
    }))
  });
  
  return {
    ...settlement,
    gross_pay: centsToDollars(result.grossPay),
    total_deductions: centsToDollars(result.totalDeductions),
    net_pay: centsToDollars(result.netPay)
  };
}

/**
 * Assert invariants (data integrity checks)
 */
export function assertInvariants(entityType: string, entity: any): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  switch (entityType) {
    case 'Load':
      // Total revenue should equal rate + FSC + accessorials
      const expectedRevenue = (entity.customer_rate || 0) + 
                             (entity.fuel_surcharge_revenue || 0) + 
                             (entity.accessorial_revenue_total || 0);
      
      if (entity.total_revenue && Math.abs(entity.total_revenue - expectedRevenue) > 0.02) {
        errors.push(`total_revenue mismatch: ${entity.total_revenue} != ${expectedRevenue}`);
      }
      
      // Margin should equal revenue - cost
      const expectedMargin = (entity.total_revenue || 0) - (entity.total_carrier_cost || 0);
      if (entity.margin && Math.abs(entity.margin - expectedMargin) > 0.02) {
        errors.push(`margin mismatch: ${entity.margin} != ${expectedMargin}`);
      }
      break;
      
    case 'Invoice':
      // Balance due should equal total - payments
      const expectedBalance = (entity.invoice_total || 0) - 
                             ((entity.payments_applied || []).reduce((sum, p) => sum + p, 0));
      
      if (entity.balance_due && Math.abs(entity.balance_due - expectedBalance) > 0.02) {
        errors.push(`balance_due mismatch`);
      }
      break;
      
    case 'Settlement':
      // Net should equal gross - deductions
      const expectedNet = (entity.gross_pay || 0) - (entity.total_deductions || 0);
      if (entity.net_pay && Math.abs(entity.net_pay - expectedNet) > 0.02) {
        errors.push(`net_pay mismatch`);
      }
      break;
  }
  
  return {
    ok: errors.length === 0,
    errors
  };
}

/**
 * Calculate variance between actual and expected
 */
export function calcVariance(actual: Cents, expected: Cents): {
  cents: Cents;
  percent: number;
} {
  const cents = actual - expected;
  const percent = expected !== 0 ? (cents / expected) * 100 : 0;
  
  return { cents, percent };
}

/**
 * Diff financial fields (before/after comparison)
 */
export function diffFinancialFields(before: any, after: any): {
  field: string;
  before: any;
  after: any;
  changed: boolean;
}[] {
  const financialFields = [
    'customer_rate', 'carrier_pay', 'margin', 'margin_percent',
    'total_revenue', 'total_carrier_cost',
    'fuel_surcharge_revenue', 'accessorial_revenue_total',
    'invoice_total', 'balance_due',
    'gross_pay', 'net_pay', 'total_deductions'
  ];
  
  return financialFields
    .filter(field => before[field] !== undefined || after[field] !== undefined)
    .map(field => ({
      field,
      before: before[field],
      after: after[field],
      changed: before[field] !== after[field]
    }))
    .filter(diff => diff.changed);
}

/**
 * Explain calculation in human-readable format
 */
export function explainCalculation(entityType: string, entity: any): string {
  switch (entityType) {
    case 'Load':
      return `Load ${entity.load_number}:
Customer Rate: $${entity.customer_rate || 0}
Fuel Surcharge: $${entity.fuel_surcharge_revenue || 0}
Accessorials: $${entity.accessorial_revenue_total || 0}
= Total Revenue: $${entity.total_revenue || 0}

Carrier Pay: $${entity.carrier_pay || 0}
= Total Cost: $${entity.total_carrier_cost || 0}

Margin: $${entity.margin || 0} (${entity.margin_percent || 0}%)`;
      
    case 'Invoice':
      return `Invoice ${entity.invoice_number}:
Line Items Total: $${entity.invoice_total || 0}
Payments Applied: $${(entity.payments_applied || []).reduce((s, p) => s + p, 0)}
= Balance Due: $${entity.balance_due || 0}`;
      
    case 'Settlement':
      return `Settlement ${entity.id}:
Gross Pay: $${entity.gross_pay || 0}
Deductions: $${entity.total_deductions || 0}
= Net Pay: $${entity.net_pay || 0}`;
      
    default:
      return 'Calculation details not available';
  }
}

/**
 * Hash financial snapshot for tamper detection (optional)
 */
export function hashFinancialSnapshot(entity: any): string {
  const financialData = {
    customer_rate: entity.customer_rate,
    carrier_pay: entity.carrier_pay,
    margin: entity.margin,
    total_revenue: entity.total_revenue,
    total_carrier_cost: entity.total_carrier_cost
  };
  
  const json = JSON.stringify(financialData, Object.keys(financialData).sort());
  return crypto.createHash('sha256').update(json).digest('hex');
}