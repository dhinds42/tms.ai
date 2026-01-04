import { useQuery } from "@tanstack/react-query";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";

/**
 * Enforces org-scoped query keys + disables queries until orgId is known.
 */
export function useOrgQuery({ key, queryFn, enabled = true, ...opts }) {
  const orgId = useCurrentOrgId();
  return useQuery({
    queryKey: [...key, orgId ?? "org:loading"],
    enabled: enabled && !!orgId,
    queryFn: () => queryFn({ orgId }),
    ...opts,
  });
}