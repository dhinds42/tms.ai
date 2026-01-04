import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useCurrentOrgId() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get org_id from user metadata or primary membership
  return user?.org_id || user?.primary_org_id || null;
}

export function useCurrentOrg() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  return {
    orgId: user?.org_id || user?.primary_org_id || null,
    user,
  };
}