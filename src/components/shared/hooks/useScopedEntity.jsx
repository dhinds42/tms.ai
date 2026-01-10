import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useOrgQueryKey } from "@/components/hooks/useOrgQueryKey";
import { scopedList } from "@/components/api/scopedEntities";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";

export function useScopedEntity(entityName, options = {}) {
  const orgId = useCurrentOrgId();
  const queryKey = useOrgQueryKey(entityName.toLowerCase());
  
  const { sort = '-created_date', limit = 100, enabled = true } = options;

  return useQuery({
    queryKey,
    queryFn: () => scopedList(base44.entities[entityName], orgId, { sort, limit }),
    initialData: [],
    enabled,
    ...options
  });
}