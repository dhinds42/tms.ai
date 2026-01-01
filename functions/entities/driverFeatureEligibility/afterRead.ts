/**
 * DriverFeatureEligibility - After Read Hook
 * Drivers see only their own eligibility
 */

export default async function afterRead({ data, user }) {
  const role = user?.role;

  // Drivers can only see their own eligibility
  if (role === 'driver' && data.driver_id !== user.id) {
    return {
      ok: false,
      error: 'Unauthorized: drivers can only view their own feature eligibility'
    };
  }

  // Customers cannot view
  if (role === 'customer') {
    return {
      ok: false,
      error: 'Unauthorized: customers cannot view driver feature eligibility'
    };
  }

  // Drivers see simplified view
  if (role === 'driver') {
    delete data.override_granted_by;
    delete data.override_reason;
  }

  return { ok: true, data };
}