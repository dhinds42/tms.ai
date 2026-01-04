import { useInfiniteQuery } from "@tanstack/react-query";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";

/**
 * Cursor pagination by created_date where possible.
 * Fallback: limited pages of list() if filter isn't supported.
 */
export function usePaginatedEntityList({
  entityApi,
  key,
  pageSize = 50,
  order = "-created_date",
  extraFilter = {},
  enabled = true,
}) {
  const orgId = useCurrentOrgId();

  return useInfiniteQuery({
    queryKey: [...key, orgId ?? "org:loading", pageSize, order, extraFilter],
    enabled: enabled && !!orgId,
    initialPageParam: null, // cursor
    queryFn: async ({ pageParam }) => {
      if (!orgId) return { items: [], nextCursor: null };

      // Best case: filter supports created_date cursor
      if (entityApi.filter) {
        const filter = { org_id: orgId, ...extraFilter };
        if (pageParam) filter.created_date_lt = pageParam; // adjust to your backend operator
        const items = await entityApi.filter(filter, order, pageSize); // adapt signature if needed
        const nextCursor = items.length ? items[items.length - 1].created_date : null;
        return { items, nextCursor };
      }

      // Fallback: list() limited (no real pagination)
      const items = await entityApi.list(order, pageSize);
      return { items, nextCursor: null };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}