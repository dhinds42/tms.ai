/**
 * Credit Hold Enforcement
 * Blocks load creation/dispatch when customer on credit hold
 */

export async function checkCreditHold(customerId, base44) {
  try {
    // Get customer credit hold status
    const customer = await base44.asServiceRole.entities.Customer.filter({ party_id: customerId });
    
    if (!customer || customer.length === 0) {
      return { allowed: true, hold_status: 'OFF' };
    }
    
    const customerRecord = customer[0];
    const holdStatus = customerRecord.credit_hold_status || 'OFF';
    
    if (holdStatus === 'OFF') {
      return { allowed: true, hold_status: 'OFF' };
    }
    
    return {
      allowed: false,
      hold_status: holdStatus,
      hold_reason: customerRecord.credit_hold_reason,
      requires_override: true,
      hold_set_by: customerRecord.credit_hold_set_by,
      hold_set_at: customerRecord.credit_hold_set_at
    };
    
  } catch (error) {
    console.error('Credit hold check error:', error);
    // Fail open (allow) to prevent blocking operations on errors
    return { allowed: true, hold_status: 'ERROR', error: error.message };
  }
}

export async function enforceCreditHold(load, stage, base44) {
  /**
   * stage: 'create' | 'dispatch' | 'award'
   * HARD_HOLD => blocks at 'create'
   * SOFT_HOLD => blocks at 'dispatch' or 'award'
   */
  
  const holdCheck = await checkCreditHold(load.customer_id, base44);
  
  if (!holdCheck.allowed) {
    if (holdCheck.hold_status === 'HARD_HOLD' && stage === 'create') {
      throw new Error(`CREDIT_HOLD_BLOCK: Customer on HARD credit hold. Reason: ${holdCheck.hold_reason}. Requires finance override approval.`);
    }
    
    if (holdCheck.hold_status === 'SOFT_HOLD' && ['dispatch', 'award'].includes(stage)) {
      throw new Error(`CREDIT_HOLD_BLOCK: Customer on SOFT credit hold. Reason: ${holdCheck.hold_reason}. Requires finance override approval before dispatch.`);
    }
  }
  
  return holdCheck;
}

export async function checkCreditLimitExceeded(customerId, newLoadAmount, base44) {
  try {
    const customer = await base44.asServiceRole.entities.Customer.filter({ party_id: customerId });
    if (!customer || customer.length === 0) return { exceeded: false };
    
    const customerRecord = customer[0];
    if (!customerRecord.credit_limit_cents) return { exceeded: false };
    
    // Get all open invoices for this customer
    const openInvoices = await base44.asServiceRole.entities.Invoice.filter({
      customer_party_id: customerId,
      status: { $in: ['open', 'sent', 'overdue', 'partial'] }
    });
    
    const totalOutstanding = openInvoices.reduce((sum, inv) => sum + (inv.amount_remaining || inv.total_amount || 0), 0);
    const totalOutstandingCents = totalOutstanding * 100; // Convert to cents
    
    const projectedTotal = totalOutstandingCents + newLoadAmount;
    
    if (projectedTotal > customerRecord.credit_limit_cents) {
      return {
        exceeded: true,
        credit_limit_cents: customerRecord.credit_limit_cents,
        current_outstanding_cents: totalOutstandingCents,
        new_load_amount_cents: newLoadAmount,
        projected_total_cents: projectedTotal,
        overage_cents: projectedTotal - customerRecord.credit_limit_cents
      };
    }
    
    return { exceeded: false };
    
  } catch (error) {
    console.error('Credit limit check error:', error);
    return { exceeded: false, error: error.message };
  }
}