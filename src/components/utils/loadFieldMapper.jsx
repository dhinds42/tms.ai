/**
 * Dual TMS.ai — Load Field Mapper
 *
 * Problem:
 * - Some creators write pickup_date / delivery_date
 * - TMSB pages + business logic expect planned_pickup_datetime / planned_delivery_datetime
 *
 * Solution:
 * - normalizeLoad(load): makes reads resilient (adds planned_* from legacy fields)
 * - toLoadCreatePayload(input): makes writes consistent (always writes planned_* + legacy)
 */

export function normalizeLoad(load) {
  if (!load) return load;

  const plannedPickup = load.planned_pickup_datetime ?? load.pickup_date ?? null;
  const plannedDelivery = load.planned_delivery_datetime ?? load.delivery_date ?? null;

  return {
    ...load,

    // Canonical planned fields
    planned_pickup_datetime: plannedPickup,
    planned_delivery_datetime: plannedDelivery,

    // Legacy aliases (keep populated for older components)
    pickup_date: load.pickup_date ?? plannedPickup,
    delivery_date: load.delivery_date ?? plannedDelivery,

    // Location alias safety (some modules use delivery_location historically)
    dropoff_location: load.dropoff_location ?? load.delivery_location ?? null,
  };
}

export function toLoadCreatePayload(input) {
  if (!input) return input;

  const plannedPickup = input.planned_pickup_datetime ?? input.pickup_date ?? null;
  const plannedDelivery = input.planned_delivery_datetime ?? input.delivery_date ?? null;

  return {
    ...input,

    // Always write canonical planned fields
    planned_pickup_datetime: plannedPickup,
    planned_delivery_datetime: plannedDelivery,

    // Backfill legacy aliases for backwards compatibility
    pickup_date: input.pickup_date ?? plannedPickup,
    delivery_date: input.delivery_date ?? plannedDelivery,

    // Normalize dropoff naming
    dropoff_location: input.dropoff_location ?? input.delivery_location ?? input.dropoff_location,
  };
}