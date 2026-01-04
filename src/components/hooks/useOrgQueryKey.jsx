import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";

export function useOrgQueryKey(baseKey) {
  const orgId = useCurrentOrgId();
  return [baseKey, orgId ?? "org:loading"];
}