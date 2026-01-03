/**
 * Dual TMS.ai — Load Field Mapper
 *
 * Problem:
 * - Some creators write pickup_date / delivery_date
 * - TMSB pages + business logic expect planned_pickup_datetime / planned_delivery_datetime
 * - Some intake flows produce pickup/delivery nested objects instead of pickup_location/dropoff_location
 *
 * Solution:
 * - normalizeLoad(load): makes reads resilient (adds planned_* from legacy fields)
 * - toLoadCreatePayload(input): makes writes consistent (always writes planned_* + legacy)
 * - toLoadCreatePayload also maps pickup/delivery <-> pickup_location/dropoff_location so both styles work.
 */

// ============================================================================
// HELPER FUNCTIONS (defined once, no duplicates)
// ============================================================================

function pick(obj, keys) {
  if (!obj) return null;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return null;
}

function toLocationObject(src) {
  if (!src || typeof src !== "object" || Array.isArray(src)) return null;

  // Normalize common variants
  const city = pick(src, ["city", "City"]);
  const state = pick(src, ["state", "State"]);
  const zip = pick(src, ["zip", "Zip", "postal_code", "postalCode"]);

  // Optional address keys commonly used
  const address1 = pick(src, ["address1", "address", "street", "street1"]);
  const address2 = pick(src, ["address2", "street2"]);
  const location_name = pick(src, ["location_name", "locationName", "name", "facility_name"]);

  // If it has *no* meaningful location attributes, return null
  const hasAny =
    city || state || zip || address1 || address2 || location_name;
  if (!hasAny) return null;

  return {
    ...(location_name ? { location_name } : {}),
    ...(address1 ? { address1 } : {}),
    ...(address2 ? { address2 } : {}),
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(zip ? { zip } : {}),
  };
}

function toNestedLocation(src) {
  // Mirror back into pickup/delivery style (only keys used by intake schema)
  if (!src || typeof src !== "object" || Array.isArray(src)) return null;
  const city = src.city ?? null;
  const state = src.state ?? null;
  const zip = src.zip ?? null;
  const address1 = src.address1 ?? null;

  const hasAny = city || state || zip || address1;
  if (!hasAny) return null;

  return {
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(zip ? { zip } : {}),
    ...(address1 ? { address: address1 } : {}), // intake often uses `address`
  };
}

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

export function normalizeLoad(load) {
  if (!load) return load;

  const plannedPickup = load.planned_pickup_datetime ?? load.pickup_date ?? null;
  const plannedDelivery = load.planned_delivery_datetime ?? load.delivery_date ?? null;

  /**
   * IMPOSSIBLE-TO-BREAK LOCATION NORMALIZATION (READ PATH)
   *
   * Guarantee:
   * - pickup_location and dropoff_location ALWAYS exist in-memory when we can infer them
   * - even if DB record only has nested pickup/delivery, or uses delivery_location
   *
   * This ensures every UI module behaves consistently, regardless of how older records were stored.
   */
  const pickupLocFromCanonical = toLocationObject(load.pickup_location);
  const pickupLocFromNested = toLocationObject(load.pickup);
  const pickupLoc = pickupLocFromCanonical ?? pickupLocFromNested ?? null;

  const dropoffLocFromCanonical = toLocationObject(load.dropoff_location);
  const dropoffLocFromDeliveryAlias = toLocationObject(load.delivery_location);
  const dropoffLocFromNested = toLocationObject(load.delivery);
  const dropoffLoc =
    dropoffLocFromCanonical ?? dropoffLocFromDeliveryAlias ?? dropoffLocFromNested ?? null;

  // Also synthesize nested pickup/delivery if missing but canonical exists
  const pickupNested = load.pickup ?? (pickupLoc ? toNestedLocation(pickupLoc) : null);
  const deliveryNested = load.delivery ?? (dropoffLoc ? toNestedLocation(dropoffLoc) : null);

  return {
    ...load,

    // Canonical planned fields
    planned_pickup_datetime: plannedPickup,
    planned_delivery_datetime: plannedDelivery,

    // Legacy aliases (keep populated for older components)
    pickup_date: load.pickup_date ?? plannedPickup,
    delivery_date: load.delivery_date ?? plannedDelivery,

    /**
     * Canonical locations (guaranteed in-memory when inferable):
     * - pickup_location
     * - dropoff_location
     */
    pickup_location: pickupLoc ?? null,
    dropoff_location: dropoffLoc ?? null,

    /**
     * Keep delivery_location in sync as an alias for backward compatibility,
     * because some modules historically referenced delivery_location.
     */
    delivery_location: dropoffLoc ?? load.delivery_location ?? null,

    /**
     * Keep nested pickup/delivery available too:
     * - helps intake / audit / template views
     * - prevents breakage if some UI still reads pickup/delivery
     */
    ...(pickupNested ? { pickup: pickupNested } : {}),
    ...(deliveryNested ? { delivery: deliveryNested } : {}),
  };
}

export function toLoadCreatePayload(input, options = {}) {
  if (!input) return input;

  // Options:
  // - keepNested: if true (default), preserve pickup/delivery objects alongside pickup_location/dropoff_location
  // - nestedOnly: if true, do NOT write pickup_location/dropoff_location (not recommended, but supported)
  const keepNested = options.keepNested ?? true;
  const nestedOnly = options.nestedOnly ?? false;

  const plannedPickup = input.planned_pickup_datetime ?? input.pickup_date ?? null;
  const plannedDelivery = input.planned_delivery_datetime ?? input.delivery_date ?? null;

  const pickupLoc =
    toLocationObject(input.pickup_location) ??
    toLocationObject(input.pickup) ??
    null;

  const dropoffLoc =
    toLocationObject(input.dropoff_location) ??
    toLocationObject(input.delivery_location) ??
    toLocationObject(input.delivery) ??
    null;

  const pickupNested =
    input.pickup ?? (pickupLoc ? toNestedLocation(pickupLoc) : null);

  const deliveryNested =
    input.delivery ?? (dropoffLoc ? toNestedLocation(dropoffLoc) : null);

  return {
    ...input,

    // Always write canonical planned fields
    planned_pickup_datetime: plannedPickup,
    planned_delivery_datetime: plannedDelivery,

    // Backfill legacy aliases for backwards compatibility
    pickup_date: input.pickup_date ?? plannedPickup,
    delivery_date: input.delivery_date ?? plannedDelivery,

    // Canonical dropoff naming + location mapping
    ...(nestedOnly
      ? {}
      : {
          pickup_location: pickupLoc ?? input.pickup_location ?? null,
          dropoff_location: dropoffLoc ?? input.dropoff_location ?? input.delivery_location ?? null,
        }),

    // Optional nested representation for intake schema compatibility
    ...(keepNested
      ? {
          ...(pickupNested ? { pickup: pickupNested } : {}),
          ...(deliveryNested ? { delivery: deliveryNested } : {}),
        }
      : {}),
  };
}