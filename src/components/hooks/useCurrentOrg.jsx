/**
 * useCurrentOrg Hook
 * Provides current organization context for entity isolation
 * P0 FRONTEND FIX: Enables org-scoped caching and UI display
 */

import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Get current user's active organization
 * Caches result for 5 minutes to avoid excessive Membership queries
 */
export function useCurrentOrg() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });
  
  return useQuery({
    queryKey: ['currentOrg', user?.email],
    queryFn: async () => {
      if (!user) return null;
      
      // Get active membership
      const memberships = await base44.entities.Membership.filter({
        user_email: user.email,
        status: 'active'
      });
      
      if (memberships.length === 0) {
        console.warn('No active membership found for user');
        return null;
      }
      
      const activeMembership = memberships[0];
      
      // Get organization details
      const organizations = await base44.entities.Organization.filter({
        id: activeMembership.org_id
      });
      
      if (organizations.length === 0) {
        console.error('Organization not found:', activeMembership.org_id);
        return null;
      }
      
      return {
        ...organizations[0],
        membership: activeMembership,
        membership_id: activeMembership.id
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false
  });
}

/**
 * Get current org_id only (lightweight)
 */
export function useCurrentOrgId() {
  const { data: org } = useCurrentOrg();
  return org?.id;
}

/**
 * Hook to validate entity belongs to current org
 */
export function useOrgValidator() {
  const orgId = useCurrentOrgId();
  
  const validateEntity = (entity, entityName = 'entity') => {
    if (!entity) return true;
    if (!orgId) return true; // No org context yet
    
    if (entity.org_id && entity.org_id !== orgId) {
      console.error(`SECURITY: Cross-org ${entityName} detected`, {
        entity_org: entity.org_id,
        user_org: orgId,
        entity_id: entity.id
      });
      return false;
    }
    
    return true;
  };
  
  const validateEntityArray = (entities, entityName = 'entities') => {
    if (!Array.isArray(entities)) return true;
    if (!orgId) return true;
    
    const orgIds = [...new Set(entities.map(e => e.org_id).filter(Boolean))];
    
    if (orgIds.length > 1) {
      console.error(`SECURITY: Multiple org_ids in ${entityName} array`, orgIds);
      return false;
    }
    
    if (orgIds.length === 1 && orgIds[0] !== orgId) {
      console.error(`SECURITY: Wrong org_id in ${entityName} array`, {
        expected: orgId,
        received: orgIds[0]
      });
      return false;
    }
    
    return true;
  };
  
  return { validateEntity, validateEntityArray, orgId };
}