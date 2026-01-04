import { base44 } from "@/api/base44Client";

export function scopedList(entityApi, orgId, options = {}) {
  if (!orgId) return [];
  
  const { sort, limit } = options;
  
  // Prefer filter if available for org_id filtering
  if (entityApi.filter) {
    return entityApi.filter({ org_id: orgId }, sort, limit);
  }
  
  // Fallback to list (backend hooks should enforce isolation)
  return entityApi.list(sort, limit);
}