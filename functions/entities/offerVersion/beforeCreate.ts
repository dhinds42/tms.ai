/**
 * OfferVersion - Before Create Hook
 * Ensures version_id is unique and marks previous versions as superseded
 */

export default async function beforeCreate({ data, base44 }) {
  // Generate version_id if not provided
  if (!data.version_id) {
    const timestamp = Date.now();
    data.version_id = `v${data.load_id.slice(0, 8)}_${timestamp}`;
  }

  // Set defaults
  data.status = data.status || 'active';
  data.is_active = true;

  // If this is a new active offer, supersede previous ones for this load
  if (data.status === 'active') {
    const existingOffers = await base44.entities.OfferVersion.filter({
      load_id: data.load_id,
      status: 'active'
    });

    for (const existingOffer of existingOffers) {
      await base44.entities.OfferVersion.update(existingOffer.id, {
        status: 'superseded',
        superseded_by_version_id: data.version_id
      });

      // Invalidate any acknowledgements for superseded offers
      const acks = await base44.entities.DriverAcknowledgement.filter({
        offer_version_id: existingOffer.version_id
      });

      for (const ack of acks) {
        await base44.entities.DriverAcknowledgement.update(ack.id, {
          is_valid: false
        });
      }
    }
  }

  return { ok: true, data };
}