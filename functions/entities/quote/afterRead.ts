/**
 * Quote - After Read Hook
 * RBAC redaction: customers see quotes, not internal broker economics
 */

export default async function afterRead({ data, user }) {
  // Customers should not see:
  // - estimated_cost (carrier cost)
  // - margin (broker margin)
  // - margin_percentage
  
  if (user.role !== 'admin' && user.role !== 'broker') {
    delete data.estimated_cost;
    delete data.margin;
    delete data.margin_percentage;
  }
  
  return { ok: true, data };
}