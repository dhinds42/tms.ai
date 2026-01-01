/**
 * Load - Before Update Hook
 * Enforces business rules and validates driver acceptance requires acknowledgement
 */

export default async function beforeUpdate({ id, data, base44, user }) {
  // Fetch existing load
  const existingLoads = await base44.entities.Load.filter({ id });
  if (existingLoads.length === 0) {
    return { ok: false, error: 'Load not found' };
  }
  const existingLoad = existingLoads[0];

  // RULE: Driver accepting load (status change to 'assigned') requires acknowledgement
  if (data.status === 'assigned' && existingLoad.status !== 'assigned') {
    if (user?.role === 'driver' || data.driver_id) {
      const driverId = user?.role === 'driver' ? user.id : data.driver_id;
      
      // Find active offer for this load
      const activeOffers = await base44.entities.OfferVersion.filter({
        load_id: id,
        status: 'active'
      });

      if (activeOffers.length > 0) {
        const activeOffer = activeOffers[0];
        
        // Check for valid acknowledgement
        const acks = await base44.entities.DriverAcknowledgement.filter({
          load_id: id,
          offer_version_id: activeOffer.version_id,
          driver_id: driverId,
          is_valid: true
        });

        if (acks.length === 0) {
          return {
            ok: false,
            error: 'Cannot accept load: driver must acknowledge current offer terms first'
          };
        }

        // Mark offer as accepted
        await base44.entities.OfferVersion.update(activeOffer.id, {
          status: 'accepted'
        });
      }
    }
  }

  // Log audit for status changes
  if (data.status && data.status !== existingLoad.status) {
    await base44.entities.AuditLog.create({
      entity_type: 'Load',
      entity_id: id,
      action: 'UPDATE',
      actor_user_id: user?.id,
      actor_email: user?.email,
      actor_role: user?.role,
      before_values: { status: existingLoad.status },
      after_values: { status: data.status },
      changed_fields: { status: { from: existingLoad.status, to: data.status } }
    });
  }

  return { ok: true, data };
}