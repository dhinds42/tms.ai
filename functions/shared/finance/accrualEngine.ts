/**
 * Accrual Engine
 * Generates accrual entries based on revenue recognition events
 */

import { dollarsToCents } from '../math/money';

export async function generateAccrualsForLoadEvent(loadId, event, base44) {
  /**
   * event: 'BOOKED' | 'PICKED_UP' | 'DELIVERED' | 'INVOICED' | 'PAID'
   */
  
  try {
    const load = await base44.asServiceRole.entities.Load.filter({ id: loadId });
    if (!load || load.length === 0) {
      throw new Error(`Load ${loadId} not found`);
    }
    
    const loadRecord = load[0];
    const orgId = loadRecord.tenant_id || 'default';
    const accountingPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    const accruals = [];
    
    // AR Revenue Accrual
    if (event === 'DELIVERED' && loadRecord.customer_rate) {
      const revenueAccrual = {
        org_id: orgId,
        load_id: loadId,
        accrual_type: 'AR_REVENUE',
        amount_cents: dollarsToCents(loadRecord.customer_rate),
        event_basis: event,
        accounting_period: accountingPeriod,
        accrual_status: 'OPEN'
      };
      
      accruals.push(revenueAccrual);
    }
    
    // AP Carrier Cost Accrual
    if (event === 'DELIVERED' && loadRecord.carrier_pay) {
      const costAccrual = {
        org_id: orgId,
        load_id: loadId,
        accrual_type: 'AP_CARRIER_COST',
        amount_cents: dollarsToCents(loadRecord.carrier_pay),
        event_basis: event,
        accounting_period: accountingPeriod,
        accrual_status: 'OPEN'
      };
      
      accruals.push(costAccrual);
    }
    
    // Create accrual entries
    const created = [];
    for (const accrual of accruals) {
      const result = await base44.asServiceRole.entities.AccrualEntry.create(accrual);
      created.push(result);
    }
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'AccrualEntry',
      entity_id: loadId,
      action: 'CREATE',
      actor_email: 'system@tms.ai',
      actor_role: 'system',
      metadata: {
        event,
        accruals_created: created.length,
        accounting_period: accountingPeriod
      }
    });
    
    return { ok: true, accruals: created };
    
  } catch (error) {
    console.error('Accrual generation error:', error);
    return { ok: false, error: error.message };
  }
}

export async function reverseAccruals(loadId, reason, base44) {
  try {
    const accruals = await base44.asServiceRole.entities.AccrualEntry.filter({
      load_id: loadId,
      accrual_status: 'OPEN'
    });
    
    const reversed = [];
    for (const accrual of accruals) {
      const updated = await base44.asServiceRole.entities.AccrualEntry.update(accrual.id, {
        accrual_status: 'REVERSED',
        reversed_at: new Date().toISOString(),
        reversed_by: 'system',
        notes: reason
      });
      reversed.push(updated);
    }
    
    return { ok: true, reversed_count: reversed.length };
    
  } catch (error) {
    console.error('Accrual reversal error:', error);
    return { ok: false, error: error.message };
  }
}

export async function postAccrualsToGL(accrualIds, base44) {
  /**
   * Mark accruals as POSTED when exported to GL
   */
  try {
    const posted = [];
    for (const accrualId of accrualIds) {
      const updated = await base44.asServiceRole.entities.AccrualEntry.update(accrualId, {
        accrual_status: 'POSTED',
        posted_at: new Date().toISOString(),
        posted_by: 'system'
      });
      posted.push(updated);
    }
    
    return { ok: true, posted_count: posted.length };
    
  } catch (error) {
    return { ok: false, error: error.message };
  }
}