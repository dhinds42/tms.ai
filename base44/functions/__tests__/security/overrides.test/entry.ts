/**
 * Override Policy Tests
 */

import { 
  canOverrideMargin, 
  canOverrideLock,
  canDelete,
  canApprove
} from '../../../shared/security/overridePolicy';

describe('Override Policies', () => {
  
  test('admin can override margin', () => {
    expect(canOverrideMargin('admin')).toBe(true);
  });
  
  test('broker can override margin', () => {
    expect(canOverrideMargin('broker')).toBe(true);
  });
  
  test('carrier cannot override margin', () => {
    expect(canOverrideMargin('carrier')).toBe(false);
  });
  
  test('driver cannot override margin', () => {
    expect(canOverrideMargin('driver')).toBe(false);
  });
  
  test('only admin can override invoice lock', () => {
    expect(canOverrideLock('admin', 'invoiced')).toBe(true);
    expect(canOverrideLock('broker', 'invoiced')).toBe(false);
  });
  
  test('admin and broker can override pending lock', () => {
    expect(canOverrideLock('admin', 'pending_approval')).toBe(true);
    expect(canOverrideLock('broker', 'pending_approval')).toBe(true);
  });
  
  test('only admin can delete', () => {
    expect(canDelete('Load', 'admin', 'available')).toBe(true);
    expect(canDelete('Load', 'broker', 'available')).toBe(false);
  });
  
  test('cannot delete invoiced records even as admin', () => {
    expect(canDelete('Load', 'admin', 'invoiced')).toBe(false);
  });
  
  test('broker can approve loads', () => {
    expect(canApprove('Load', 'broker')).toBe(true);
  });
});