/**
 * Financial Lock Enforcement
 * Prevent editing of invoiced/settled records
 */

export interface LockStatus {
  locked: boolean;
  reason?: string;
  lockedAt?: string;
  lockedBy?: string;
}

/**
 * Check if entity is financially locked
 */
export function isFinanciallyLocked(entity: any): LockStatus {
  // Load locked after invoiced
  if (entity.invoice_status === 'sent' || entity.invoice_status === 'paid') {
    return {
      locked: true,
      reason: 'Load has been invoiced',
      lockedAt: entity.invoice_sent_at,
      lockedBy: entity.invoiced_by
    };
  }
  
  // Settlement locked after paid
  if (entity.settlement_status === 'paid') {
    return {
      locked: true,
      reason: 'Settlement has been paid',
      lockedAt: entity.paid_at,
      lockedBy: entity.paid_by
    };
  }
  
  // Explicit lock flag
  if (entity.financial_lock === true) {
    return {
      locked: true,
      reason: entity.lock_reason || 'Manually locked',
      lockedAt: entity.locked_at,
      lockedBy: entity.locked_by
    };
  }
  
  return { locked: false };
}

/**
 * Enforce lock (throw error if locked and no override)
 */
export function enforceLock(
  entity: any,
  userRole: string,
  action: string
): void {
  const lockStatus = isFinanciallyLocked(entity);
  
  if (!lockStatus.locked) return; // Not locked
  
  // Check if user can override
  const canOverride = userRole === 'admin';
  
  if (!canOverride) {
    throw new Error(
      `Cannot ${action}: ${lockStatus.reason}. Contact administrator for override.`
    );
  }
}

/**
 * Lock entity after invoicing/settlement
 */
export function lockEntity(entity: any, reason: string, userId: string): any {
  return {
    ...entity,
    financial_lock: true,
    lock_reason: reason,
    locked_at: new Date().toISOString(),
    locked_by: userId
  };
}

/**
 * Unlock entity (admin only)
 */
export function unlockEntity(entity: any, userId: string, unlockReason: string): any {
  return {
    ...entity,
    financial_lock: false,
    lock_reason: null,
    locked_at: null,
    locked_by: null,
    unlocked_at: new Date().toISOString(),
    unlocked_by: userId,
    unlock_reason: unlockReason
  };
}