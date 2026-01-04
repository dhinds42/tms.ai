/**
 * Tenant Isolation Enforcement - Centralized P0 Control
 * FAIL-CLOSED: Blocks cross-tenant access attempts
 */

/**
 * Get active org_id for user
 * FAIL-CLOSED: Returns null if no membership (caller must handle)
 */
export async function getUserOrgId(base44, user) {
  if (!user || !user.email) {
    return null;
  }
  
  try {
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_email: user.email,
      status: 'active'
    }, undefined, 1);
    
    if (memberships.length === 0) {
      return null;
    }
    
    return memberships[0].org_id;
  } catch (error) {
    console.error('[TENANT_ISOLATION_ERROR]', error);
    // FAIL-CLOSED: Do not return default org
    return null;
  }
}

/**
 * Enforce org_id on read queries
 * FAIL-CLOSED: Blocks if no valid org_id
 */
export async function enforceReadIsolation({ query, user, base44, allowAdmin = true }) {
  // Admin bypass (optional)
  if (allowAdmin && user?.role === 'admin') {
    return { ok: true, query };
  }
  
  // If query already has org_id, validate it
  if (query?.org_id) {
    const userOrgId = await getUserOrgId(base44, user);
    
    // FAIL-CLOSED: If user has org but trying to read different org
    if (userOrgId && query.org_id !== userOrgId) {
      return {
        ok: false,
        errors: [{
          code: 'TENANT_ISOLATION_VIOLATION',
          message: 'Cannot access data from different organization'
        }]
      };
    }
    
    return { ok: true, query };
  }
  
  // Get user's org_id
  const orgId = await getUserOrgId(base44, user);
  
  // FAIL-CLOSED: Require valid org_id
  if (!orgId) {
    return {
      ok: false,
      errors: [{
        code: 'NO_ACTIVE_MEMBERSHIP',
        message: 'No active organization membership found'
      }]
    };
  }
  
  // Apply org_id filter
  return {
    ok: true,
    query: { ...query, org_id: orgId }
  };
}

/**
 * Enforce org_id on create operations
 * FAIL-CLOSED: Injects user's org_id, blocks if no membership
 */
export async function enforceCreateIsolation({ data, user, base44 }) {
  const orgId = await getUserOrgId(base44, user);
  
  // FAIL-CLOSED: Require valid org_id
  if (!orgId) {
    return {
      ok: false,
      errors: [{
        code: 'NO_ACTIVE_MEMBERSHIP',
        message: 'Cannot create record without active organization membership'
      }]
    };
  }
  
  // If data has org_id, validate it matches user's org
  if (data.org_id && data.org_id !== orgId) {
    return {
      ok: false,
      errors: [{
        code: 'TENANT_ISOLATION_VIOLATION',
        message: 'Cannot create record for different organization'
      }]
    };
  }
  
  // Inject org_id
  return {
    ok: true,
    data: { ...data, org_id: orgId }
  };
}

/**
 * Enforce org_id on update operations
 * FAIL-CLOSED: Validates ownership before allowing update
 */
export async function enforceUpdateIsolation({ data, existingData, user, base44 }) {
  const orgId = await getUserOrgId(base44, user);
  
  // FAIL-CLOSED: Require valid org_id
  if (!orgId) {
    return {
      ok: false,
      errors: [{
        code: 'NO_ACTIVE_MEMBERSHIP',
        message: 'Cannot update record without active organization membership'
      }]
    };
  }
  
  // Validate existing record belongs to user's org
  if (existingData.org_id && existingData.org_id !== orgId) {
    return {
      ok: false,
      errors: [{
        code: 'TENANT_ISOLATION_VIOLATION',
        message: 'Cannot update record from different organization'
      }]
    };
  }
  
  // Prevent org_id tampering
  if (data.org_id && data.org_id !== orgId) {
    return {
      ok: false,
      errors: [{
        code: 'TENANT_ISOLATION_VIOLATION',
        message: 'Cannot change record organization'
      }]
    };
  }
  
  return { ok: true, data };
}

/**
 * Enforce org_id on delete operations
 * FAIL-CLOSED: Validates ownership before allowing delete
 */
export async function enforceDeleteIsolation({ existingData, user, base44 }) {
  const orgId = await getUserOrgId(base44, user);
  
  // FAIL-CLOSED: Require valid org_id
  if (!orgId) {
    return {
      ok: false,
      errors: [{
        code: 'NO_ACTIVE_MEMBERSHIP',
        message: 'Cannot delete record without active organization membership'
      }]
    };
  }
  
  // Validate existing record belongs to user's org
  if (existingData.org_id && existingData.org_id !== orgId) {
    return {
      ok: false,
      errors: [{
        code: 'TENANT_ISOLATION_VIOLATION',
        message: 'Cannot delete record from different organization'
      }]
    };
  }
  
  return { ok: true };
}