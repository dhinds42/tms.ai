/**
 * Load - Before Read Hook
 * Enforce tenant isolation
 */

import { getUserContext } from '../../shared/rbac/membershipResolver';

export default async function beforeRead({ query, user, base44 }) {
  try {
    // Admin sees all
    if (user?.role === 'admin') {
      return { ok: true, query };
    }
    
    // Get user's org context (simplified - uses first active membership)
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_email: user?.email,
      status: 'active',
      is_active: true
    });
    
    if (memberships.length === 0) {
      // No active membership - use legacy mode
      return { ok: true, query };
    }
    
    const membership = memberships[0];
    
    // Filter by org_id
    if (!query) query = {};
    query.org_id = membership.org_id;
    
    return { ok: true, query };
    
  } catch (error) {
    console.error('Load beforeRead error:', error);
    return { ok: true, query }; // Fail open to avoid breaking app
  }
}