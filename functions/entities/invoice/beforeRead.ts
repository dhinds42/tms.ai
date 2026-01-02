/**
 * Invoice - Before Read Hook
 * Enforce tenant isolation
 */

export default async function beforeRead({ query, user, base44 }) {
  try {
    // Admin sees all
    if (user?.role === 'admin') {
      return { ok: true, query };
    }
    
    // Get user's org context
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_email: user?.email,
      status: 'active',
      is_active: true
    });
    
    if (memberships.length === 0) {
      return { ok: true, query }; // Legacy mode
    }
    
    const membership = memberships[0];
    
    // Filter by org_id
    if (!query) query = {};
    query.org_id = membership.org_id;
    
    return { ok: true, query };
    
  } catch (error) {
    console.error('Invoice beforeRead error:', error);
    return { ok: true, query };
  }
}