/**
 * LoadMessage - Before Create Hook
 * Resolves template variables server-side
 */

export default async function beforeCreate({ data, base44, user }) {
  data.sender_role = user?.role || 'driver';
  data.sent_at = new Date().toISOString();

  // If template_key provided, resolve template variables
  if (data.template_key) {
    const templates = await base44.entities.MessageTemplate.filter({
      template_key: data.template_key,
      role: data.sender_role
    });

    if (templates.length > 0) {
      const template = templates[0];
      let messageText = template.template_text;

      // Fetch load context if needed
      if (template.requires_load_context && data.load_id) {
        const loads = await base44.entities.Load.filter({ id: data.load_id });
        if (loads.length > 0) {
          const load = loads[0];
          
          // Replace template variables
          messageText = messageText
            .replace(/{{load_number}}/g, load.load_number || load.id.slice(0, 8))
            .replace(/{{pickup_city}}/g, load.pickup_location?.city || 'N/A')
            .replace(/{{pickup_state}}/g, load.pickup_location?.state || '')
            .replace(/{{delivery_city}}/g, load.dropoff_location?.city || 'N/A')
            .replace(/{{delivery_state}}/g, load.dropoff_location?.state || '')
            .replace(/{{pickup_date}}/g, load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : 'N/A')
            .replace(/{{delivery_date}}/g, load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : 'N/A')
            .replace(/{{eta}}/g, load.eta ? new Date(load.eta).toLocaleString() : 'N/A');
        }
      }

      data.message_text = messageText;
    }
  }

  // Generate thread_id if not provided
  if (!data.thread_id && data.load_id) {
    data.thread_id = `load_${data.load_id}`;
  }

  return { ok: true, data };
}