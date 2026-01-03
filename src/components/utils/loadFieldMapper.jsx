/**
 * Load Field Mapper - Centralized date field normalization for Load entities
 * 
 * Ensures consistent handling of date fields across create/read operations
 * to avoid issues with CSV imports and data processing.
 */

/**
 * Normalizes a load object after reading from database
 * Ensures both legacy and canonical date fields are populated
 * 
 * @param {Object} load - Raw load object from database
 * @returns {Object} Normalized load with consistent date fields
 */
export function normalizeLoad(load) {
  if (!load) return load;

  return {
    ...load,
    // Ensure both legacy and canonical pickup date fields exist
    pickup_date: load.pickup_date || load.planned_pickup_datetime?.split('T')[0] || null,
    planned_pickup_datetime: load.planned_pickup_datetime || load.pickup_date || null,
    
    // Ensure both legacy and canonical delivery date fields exist
    delivery_date: load.delivery_date || load.planned_delivery_datetime?.split('T')[0] || null,
    planned_delivery_datetime: load.planned_delivery_datetime || load.delivery_date || null,
  };
}

/**
 * Prepares load data for database insertion
 * Ensures both legacy and canonical date fields are populated
 * 
 * @param {Object} loadData - Load data to be created
 * @returns {Object} Normalized payload ready for base44.entities.Load.create()
 */
export function toLoadCreatePayload(loadData) {
  if (!loadData) return loadData;

  const pickupDate = loadData.pickup_date || loadData.planned_pickup_datetime?.split('T')[0] || new Date().toISOString().split('T')[0];
  const deliveryDate = loadData.delivery_date || loadData.planned_delivery_datetime?.split('T')[0] || new Date().toISOString().split('T')[0];

  return {
    ...loadData,
    pickup_date: pickupDate,
    planned_pickup_datetime: pickupDate,
    delivery_date: deliveryDate,
    planned_delivery_datetime: deliveryDate,
  };
}