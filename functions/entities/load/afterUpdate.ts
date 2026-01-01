/**
 * Load - After Update Hook
 * Auto-generate and send rate confirmation when carrier is assigned
 */

export default async function afterUpdate({ data, previousData, user, base44 }) {
  try {
    // Check if carrier was just assigned
    const carrierJustAssigned = !previousData.assigned_carrier_id && data.assigned_carrier_id;
    
    if (carrierJustAssigned && data.carrier_rate) {
      // Auto-generate rate confirmation
      const confirmationNumber = `RC-${Date.now()}-${data.id.slice(-6)}`;
      
      const rateConfirmation = {
        load_id: data.id,
        carrier_id: data.assigned_carrier_id,
        confirmation_number: confirmationNumber,
        carrier_rate_cents: Math.round(data.carrier_rate * 100),
        pickup_location: data.pickup_location,
        delivery_location: data.delivery_location,
        pickup_date: data.pickup_date,
        delivery_date: data.delivery_date,
        equipment_type: data.equipment_type,
        commodity: data.commodity,
        weight_lbs: data.weight,
        special_instructions: data.special_instructions,
        status: 'draft',
        auto_generated: true
      };
      
      // Create rate confirmation record
      const confirmation = await base44.asServiceRole.entities.RateConfirmation.create(rateConfirmation);
      
      // Fetch carrier email
      const carriers = await base44.asServiceRole.entities.Carrier.filter({ id: data.assigned_carrier_id });
      const carrier = carriers[0];
      
      if (carrier?.email) {
        // Generate rate confirmation document content
        const emailBody = `
Rate Confirmation: ${confirmationNumber}

Dear ${carrier.company_name || 'Carrier'},

This confirms your acceptance to transport the following shipment:

PICKUP:
${data.pickup_location?.address || ''}
${data.pickup_location?.city}, ${data.pickup_location?.state} ${data.pickup_location?.zip}
Date: ${new Date(data.pickup_date).toLocaleDateString()}

DELIVERY:
${data.delivery_location?.address || ''}
${data.delivery_location?.city}, ${data.delivery_location?.state} ${data.delivery_location?.zip}
Date: ${new Date(data.delivery_date).toLocaleDateString()}

SHIPMENT DETAILS:
Equipment: ${data.equipment_type}
Commodity: ${data.commodity}
Weight: ${data.weight} lbs

RATE: $${(rateConfirmation.carrier_rate_cents / 100).toFixed(2)}

${data.special_instructions ? `Special Instructions:\n${data.special_instructions}` : ''}

Please confirm receipt by replying to this email.

Thank you,
Dispatch Team
        `.trim();
        
        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: carrier.email,
          subject: `Rate Confirmation ${confirmationNumber}`,
          body: emailBody
        });
        
        // Update confirmation as sent
        await base44.asServiceRole.entities.RateConfirmation.update(confirmation.id, {
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_to_email: carrier.email
        });
        
        // Log audit event
        await base44.asServiceRole.entities.AuditLog.create({
          entity_type: 'RateConfirmation',
          entity_id: confirmation.id,
          action: 'AUTO_SENT',
          actor_email: 'system',
          actor_role: 'system',
          metadata: {
            load_id: data.id,
            carrier_id: data.assigned_carrier_id,
            confirmation_number: confirmationNumber,
            sent_to: carrier.email
          }
        });
      }
    }
    
    return { ok: true, data };
    
  } catch (error) {
    console.error('Rate confirmation auto-generation error:', error);
    // Don't fail the load update if rate confirmation fails
    return { ok: true, data };
  }
}