/**
 * Quote - After Create Hook
 * Create line items after quote is created
 */

export default async function afterCreate({ data, base44 }) {
  try {
    // Create line items if they were staged during beforeCreate
    if (data._line_items_to_create && data._line_items_to_create.length > 0) {
      const lineItemsToCreate = data._line_items_to_create.map(line => ({
        quote_id: data.id,
        ...line
      }));
      
      await base44.asServiceRole.entities.QuoteLineItem.bulkCreate(lineItemsToCreate);
    }
    
    return { ok: true };
  } catch (error) {
    console.error('Error creating quote line items:', error);
    return { ok: true }; // Don't fail quote creation if line items fail
  }
}