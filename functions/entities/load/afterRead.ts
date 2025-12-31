/**
 * Load Entity - After Read Hook
 * RBAC-based field redaction
 */

export default async function afterRead({ data, user }) {
  // Role-based field redaction
  const role = user?.role;
  
  // If user is a carrier (not broker/admin), redact pricing
  if (role === 'carrier' || role === 'driver') {
    // Redact customer-side pricing
    delete data.customer_rate;
    delete data.fuel_surcharge_revenue;
    delete data.accessorial_revenue_total;
    delete data.total_revenue;
    
    // Redact margin calculations
    delete data.margin;
    delete data.margin_percent;
    delete data.margin_override_approved;
    
    // Redact broker notes
    delete data.internal_notes;
    delete data.broker_notes;
  }
  
  // If user is a driver (not carrier admin), further restrict
  if (role === 'driver') {
    // Drivers should not see carrier pay either
    delete data.carrier_pay;
    delete data.total_carrier_cost;
  }
  
  // If user is a customer, show only relevant fields
  if (role === 'customer') {
    // Allow: their charges, status, tracking
    // Redact: carrier pay, margin, internal notes
    delete data.carrier_pay;
    delete data.total_carrier_cost;
    delete data.margin;
    delete data.margin_percent;
    delete data.internal_notes;
    delete data.broker_notes;
    delete data.carrier_notes;
  }
  
  return { ok: true, data };
}