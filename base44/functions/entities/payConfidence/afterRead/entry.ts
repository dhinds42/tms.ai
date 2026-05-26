/**
 * PayConfidence - After Read Hook
 * Drivers see pay amounts but not internal variance reasoning
 */

export default async function afterRead({ data, user }) {
  const role = user?.role;

  // Drivers can see their pay confidence data
  if (role === 'driver') {
    // Redact internal fields
    delete data.variance_reason;
    delete data.updated_by;
  }

  // Customers should not see driver pay
  if (role === 'customer') {
    return {
      ok: false,
      error: 'Unauthorized: customers cannot view driver pay information'
    };
  }

  return { ok: true, data };
}