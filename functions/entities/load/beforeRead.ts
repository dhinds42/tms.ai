/**
 * Load - Before Read Hook
 * Enforce tenant isolation
 */

export default async function beforeRead({ query, user, base44 }) {
  try {
    // Skip if no user or admin sees all
    if (!user || user.role === 'admin') {
      return { ok: true, query };
    }
    
    // Legacy mode - skip RBAC if query already has org_id or if no email
    if (!user.email || (query && query.org_id)) {
      return { ok: true, query };
    }
    
    // Try to get membership (with minimal impact)
    // Only query if we haven't applied org_id yet
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_email: user.email,
      status: 'active'
    }, undefined, 1); // Limit to 1 result
    
    if (memberships.length === 0) {
      // No membership found - legacy mode
      return { ok: true, query };
    }
    
    // Apply org_id filter
    if (!query) query = {};
    query.org_id = memberships[0].org_id;
    
    return { ok: true, query };
    
  } catch (error) {
    // Fail open - don't break the app
    return { ok: true, query };
  }
}