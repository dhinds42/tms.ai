/**
 * Financial Field Redaction (RBAC)
 * Server-side removal of sensitive pricing/margin data
 */

export type UserRole = 'admin' | 'broker' | 'carrier' | 'driver' | 'customer' | 'owner_operator';

/**
 * Redact financial fields based on user role
 */
export function redactFinancialsByRole(
  entityType: string,
  entity: any,
  role: UserRole
): any {
  switch (entityType) {
    case 'Load':
      return redactLoad(entity, role);
    case 'Invoice':
      return redactInvoice(entity, role);
    case 'Settlement':
      return redactSettlement(entity, role);
    case 'LaneRate':
      return redactLaneRate(entity, role);
    default:
      return entity;
  }
}

function redactLoad(load: any, role: UserRole): any {
  const redacted = { ...load };
  
  // Admin and broker see everything
  if (role === 'admin' || role === 'broker') {
    return redacted;
  }
  
  // Carrier sees their pay, not customer pricing or margin
  if (role === 'carrier' || role === 'owner_operator') {
    delete redacted.customer_rate;
    delete redacted.fuel_surcharge_revenue;
    delete redacted.accessorial_revenue_total;
    delete redacted.total_revenue;
    delete redacted.margin;
    delete redacted.margin_percent;
    delete redacted.margin_override_approved;
    delete redacted.internal_notes;
    delete redacted.broker_notes;
    delete redacted.true_profit;
    delete redacted.overhead_allocation;
    delete redacted.insurance_allocation;
    
    return redacted;
  }
  
  // Driver sees NO financial data
  if (role === 'driver') {
    delete redacted.customer_rate;
    delete redacted.carrier_pay;
    delete redacted.fuel_surcharge_revenue;
    delete redacted.accessorial_revenue_total;
    delete redacted.total_revenue;
    delete redacted.total_carrier_cost;
    delete redacted.margin;
    delete redacted.margin_percent;
    delete redacted.internal_notes;
    delete redacted.broker_notes;
    delete redacted.carrier_notes;
    
    return redacted;
  }
  
  // Customer sees their charges only (no carrier pay or margin)
  if (role === 'customer') {
    delete redacted.carrier_pay;
    delete redacted.total_carrier_cost;
    delete redacted.margin;
    delete redacted.margin_percent;
    delete redacted.internal_notes;
    delete redacted.broker_notes;
    delete redacted.carrier_notes;
    
    return redacted;
  }
  
  return redacted;
}

function redactInvoice(invoice: any, role: UserRole): any {
  const redacted = { ...invoice };
  
  // Admin/broker see all
  if (role === 'admin' || role === 'broker') {
    return redacted;
  }
  
  // Customer sees their invoices
  if (role === 'customer') {
    // Allow invoice_total, balance_due
    // Redact internal notes
    delete redacted.internal_notes;
    delete redacted.collection_notes;
    
    return redacted;
  }
  
  // Carriers/drivers don't see customer invoices
  return null; // Block access entirely
}

function redactSettlement(settlement: any, role: UserRole): any {
  const redacted = { ...settlement };
  
  // Admin/broker see all
  if (role === 'admin' || role === 'broker') {
    return redacted;
  }
  
  // Carrier/owner-op see their own settlements
  if (role === 'carrier' || role === 'owner_operator') {
    // Allow gross_pay, deductions, net_pay
    // Redact internal notes
    delete redacted.internal_notes;
    delete redacted.accounting_notes;
    
    return redacted;
  }
  
  // Drivers see limited info
  if (role === 'driver') {
    // Only show net pay and status
    return {
      id: redacted.id,
      net_pay: redacted.net_pay,
      status: redacted.status,
      payment_date: redacted.payment_date
    };
  }
  
  // Customers don't see settlements
  return null;
}

function redactLaneRate(laneRate: any, role: UserRole): any {
  const redacted = { ...laneRate };
  
  // Admin/broker see all
  if (role === 'admin' || role === 'broker') {
    return redacted;
  }
  
  // Carrier/driver see only their pay rate
  if (role === 'carrier' || role === 'owner_operator' || role === 'driver') {
    delete redacted.customer_rate;
    delete redacted.broker_fee_customer_side;
    delete redacted.broker_fee_carrier_side;
    delete redacted.total_margin;
    delete redacted.margin_percentage;
    
    return redacted;
  }
  
  // Customer sees customer rate only
  if (role === 'customer') {
    delete redacted.carrier_rate;
    delete redacted.owner_operator_rate;
    delete redacted.driver_rate;
    delete redacted.broker_fee_customer_side;
    delete redacted.broker_fee_carrier_side;
    delete redacted.total_margin;
    delete redacted.margin_percentage;
    
    return redacted;
  }
  
  return redacted;
}

/**
 * Get list of redacted fields for a role
 */
export function getRedactedFields(entityType: string, role: UserRole): string[] {
  if (role === 'admin' || role === 'broker') {
    return []; // No redaction
  }
  
  switch (entityType) {
    case 'Load':
      if (role === 'carrier' || role === 'owner_operator') {
        return [
          'customer_rate', 'fuel_surcharge_revenue', 'accessorial_revenue_total',
          'total_revenue', 'margin', 'margin_percent', 'internal_notes'
        ];
      }
      if (role === 'driver') {
        return [
          'customer_rate', 'carrier_pay', 'margin', 'margin_percent',
          'total_revenue', 'total_carrier_cost'
        ];
      }
      if (role === 'customer') {
        return ['carrier_pay', 'total_carrier_cost', 'margin', 'margin_percent'];
      }
      break;
  }
  
  return [];
}