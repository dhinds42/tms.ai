/**
 * DriverAcknowledgement - Before Create Hook
 * Validates offer version is active before allowing acknowledgement
 */

export default async function beforeCreate({ data, base44, user }) {
  // Verify offer version exists and is active
  const offers = await base44.entities.OfferVersion.filter({
    version_id: data.offer_version_id,
    status: 'active'
  });

  if (offers.length === 0) {
    return {
      ok: false,
      error: 'Cannot acknowledge: offer version is no longer active or does not exist'
    };
  }

  // Set timestamp
  data.acknowledged_at = new Date().toISOString();
  data.is_valid = true;

  // Log audit
  await base44.entities.AuditLog.create({
    entity_type: 'DriverAcknowledgement',
    entity_id: data.offer_version_id,
    action: 'CREATE',
    actor_user_id: user?.id,
    actor_email: user?.email,
    actor_role: user?.role || 'driver',
    after_values: data,
    metadata: {
      acknowledgement_type: data.acknowledgement_type,
      load_id: data.load_id
    }
  });

  return { ok: true, data };
}