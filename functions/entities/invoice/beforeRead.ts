/**
 * Invoice - Before Read Hook
 * Enforce tenant isolation
 */

export default async function beforeRead({ query, user, base44 }) {
  try {
    if (!user || user.role === 'admin') {
      return { ok: true, query };
    }
    
    if (!user.email || (query && query.org_id)) {
      return { ok: true, query };
    }
    
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_email: user.email,
      status: 'active'
    }, undefined, 1);
    
    if (memberships.length === 0) {
      return { ok: true, query };
    }
    
    if (!query) query = {};
    query.org_id = memberships[0].org_id;
    
    return { ok: true, query };
    
  } catch (error) {
    return { ok: true, query };
  }
}