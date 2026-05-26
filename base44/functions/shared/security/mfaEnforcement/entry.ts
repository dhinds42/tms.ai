/**
 * MFA Enforcement
 * Verify MFA for privileged operations
 */

/**
 * Check if user has MFA enabled
 * Note: Base44 doesn't expose MFA status directly, so we'll use a flag
 */
export async function hasMFAEnabled(base44, user) {
  try {
    // Check if user has mfa_enabled flag
    // In production, this should check Base44's actual MFA status
    return user?.mfa_enabled === true;
  } catch (error) {
    console.error('Error checking MFA status:', error);
    return false;
  }
}

/**
 * Require MFA for privileged operation
 */
export async function requireMFA(base44, user, operation) {
  const mfaEnabled = await hasMFAEnabled(base44, user);
  
  if (!mfaEnabled) {
    // Log security event
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Security',
      entity_id: user.id,
      action: 'MFA_REQUIRED',
      actor_email: user.email,
      actor_role: user.role,
      metadata: {
        operation,
        blocked: true,
        reason: 'MFA not enabled'
      }
    });
    
    return {
      ok: false,
      error: 'MFA_REQUIRED',
      message: 'Multi-factor authentication required for this operation. Please enable MFA in your account settings.'
    };
  }
  
  return { ok: true };
}

/**
 * Check if role requires MFA
 */
export function roleRequiresMFA(roleKey) {
  const privilegedRoles = [
    'broker_admin',
    'carrier_admin',
    'broker_finance',
    'carrier_finance',
    'customer_admin',
    'oo_admin'
  ];
  
  return privilegedRoles.includes(roleKey);
}

/**
 * Enforce MFA for membership
 */
export async function enforceMembershipMFA(base44, membership, roles) {
  const requiresMFA = roles.some(role => roleRequiresMFA(role.role_key));
  
  if (!requiresMFA) {
    return { ok: true };
  }
  
  // Get user
  const users = await base44.asServiceRole.entities.User.filter({
    id: membership.user_id
  });
  
  if (users.length === 0) {
    return { ok: false, error: 'User not found' };
  }
  
  return await requireMFA(base44, users[0], 'privileged_role_access');
}