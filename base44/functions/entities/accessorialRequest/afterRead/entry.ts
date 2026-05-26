/**
 * AccessorialRequest - After Read Hook
 * RBAC redaction for accessorial requests
 */

export default async function afterRead({ data, user }) {
  const role = user?.role;

  // Customers cannot view accessorial requests
  if (role === 'customer') {
    return {
      ok: false,
      error: 'Unauthorized: customers cannot view accessorial requests'
    };
  }

  // Drivers can only see their own requests
  if (role === 'driver') {
    if (data.requester_id !== user.id) {
      return {
        ok: false,
        error: 'Unauthorized: drivers can only view their own accessorial requests'
      };
    }
  }

  return { ok: true, data };
}