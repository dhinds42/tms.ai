/**
 * Override Policy Enforcement
 * Who can override margin rules, financial locks, etc.
 */

import { UserRole } from './financialRedaction';

/**
 * Check if user can override negative margin
 */
export function canOverrideMargin(role: UserRole): boolean {
  return role === 'admin' || role === 'broker';
}

/**
 * Check if user can edit financial fields after lock
 */
export function canOverrideLock(role: UserRole, lockReason: string): boolean {
  // Only admin can override invoice/settlement locks
  if (lockReason === 'invoiced' || lockReason === 'settled') {
    return role === 'admin';
  }
  
  // Broker can override pending locks
  if (lockReason === 'pending_approval') {
    return role === 'admin' || role === 'broker';
  }
  
  return false;
}

/**
 * Check if user can delete entity
 */
export function canDelete(entityType: string, role: UserRole, entityStatus: string): boolean {
  // Only admin can delete
  if (role !== 'admin') return false;
  
  // Cannot delete invoiced or settled records
  if (['invoiced', 'settled', 'paid'].includes(entityStatus)) {
    return false;
  }
  
  return true;
}

/**
 * Check if user can approve/reject
 */
export function canApprove(entityType: string, role: UserRole): boolean {
  if (entityType === 'Load' || entityType === 'Invoice' || entityType === 'Settlement') {
    return role === 'admin' || role === 'broker';
  }
  
  return role === 'admin';
}

/**
 * Get required approval level for action
 */
export function getRequiredApprovalLevel(
  action: string,
  amount?: number
): 'auto' | 'supervisor' | 'manager' | 'executive' {
  // Auto-approve small amounts
  if (action === 'margin_override' && amount && Math.abs(amount) < 100) {
    return 'supervisor';
  }
  
  if (action === 'margin_override' && amount && Math.abs(amount) >= 500) {
    return 'executive';
  }
  
  if (action === 'margin_override') {
    return 'manager';
  }
  
  if (action === 'credit_memo' && amount && amount < 500) {
    return 'manager';
  }
  
  if (action === 'credit_memo') {
    return 'executive';
  }
  
  return 'manager';
}