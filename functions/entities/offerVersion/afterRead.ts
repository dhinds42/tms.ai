/**
 * OfferVersion - After Read Hook
 * RBAC redaction - drivers see only their offered pay
 */

export default async function afterRead({ data, user }) {
  const role = user?.role;

  // Brokers/admins see everything
  if (role === 'broker' || role === 'admin') {
    return { ok: true, data };
  }

  // Drivers/carriers see only offered pay (no customer rates or margins)
  if (role === 'driver' || role === 'carrier') {
    // Keep only driver-facing fields
    const allowedFields = [
      'id',
      'load_id',
      'version_id',
      'offered_pay_cents',
      'offered_pay_type',
      'terms_text',
      'accessorials_included',
      'estimated_miles',
      'pickup_window_start',
      'pickup_window_end',
      'delivery_window_start',
      'delivery_window_end',
      'status',
      'expires_at',
      'created_date',
      'updated_date'
    ];

    const redactedData = {};
    for (const field of allowedFields) {
      if (data.hasOwnProperty(field)) {
        redactedData[field] = data[field];
      }
    }

    return { ok: true, data: redactedData };
  }

  // Customers should not see offer details
  if (role === 'customer') {
    return {
      ok: false,
      error: 'Unauthorized: customers cannot view offer details'
    };
  }

  return { ok: true, data };
}