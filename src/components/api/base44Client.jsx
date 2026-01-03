import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';
import { normalizeLoad, toLoadCreatePayload } from '@/components/utils/loadFieldMapper';

// Create a client with authentication required
const client = createClient({
  appId: "690ad9e79a3ab2ecec0ce973",
  requiresAuth: true // Ensure authentication is required for all operations
});

/**
 * DEV-ONLY: Load schema runtime guard to prevent field drift.
 * - Logs unknown/invalid Load fields on create/update.
 * - Validates payload value types using Load.schema() (JSON-schema style).
 * - Validates required fields based on load status.
 * - Adds a QA toggle: window.__LOAD_GUARD__ = true/false
 *
 * IMPORTANT:
 * - Runs only in development (Vite: import.meta.env.DEV).
 * - Never throws (logs only) so it won't break dev flow.
 */
const __DEV__ = typeof import.meta !== "undefined" && !!import.meta.env?.DEV;

let _loadSchemaPromise = null;
let _loadSchema = null;         // full schema object
let _loadAllowedKeys = null;    // Set<string>
let _loadPropTypes = null;      // Map<string, { type, nullable, itemsType }>

function isGuardEnabled() {
  // DEV only; additionally allow QA toggle in browser:
  // window.__LOAD_GUARD__ = false to disable warnings
  if (!__DEV__) return false;
  if (typeof window === "undefined") return true;
  if (typeof window.__LOAD_GUARD__ === "boolean") return window.__LOAD_GUARD__;
  // default enabled in dev
  return true;
}

function initGuardToggle() {
  if (!__DEV__) return;
  if (typeof window === "undefined") return;
  // default true if unset
  if (typeof window.__LOAD_GUARD__ !== "boolean") window.__LOAD_GUARD__ = true;
}

initGuardToggle();

async function getLoadSchema(base44) {
  if (!_loadSchemaPromise) {
    _loadSchemaPromise = (async () => {
      try {
        const schema = await base44.entities.Load.schema();
        _loadSchema = schema || null;
        const props = schema?.properties || {};

        _loadAllowedKeys = new Set(Object.keys(props));
        _loadPropTypes = new Map();

        // Precompute minimal type metadata per field
        for (const [key, def] of Object.entries(props)) {
          // JSON schema "type" can be string OR array (e.g., ["string","null"])
          const t = def?.type;
          const nullable =
            Array.isArray(t) ? t.includes("null") :
            t === "null" ? true :
            false;

          const baseType = Array.isArray(t)
            ? (t.find((x) => x !== "null") || t[0])
            : t;

          // For arrays, also capture items type (if present)
          let itemsType = null;
          if (baseType === "array" && def?.items) {
            const it = def.items.type;
            itemsType = Array.isArray(it) ? (it.find((x) => x !== "null") || it[0]) : it;
          }

          _loadPropTypes.set(key, {
            type: baseType,
            nullable,
            itemsType,
          });
        }

        return _loadSchema;
      } catch (err) {
        console.warn("[LoadGuard] Unable to load Load.schema() (guard disabled):", err);
        _loadSchema = null;
        _loadAllowedKeys = null;
        _loadPropTypes = null;
        return null;
      }
    })();
  }
  return _loadSchemaPromise;
}

function logUnknownFields(payload, allowedKeys, contextLabel) {
  if (!payload || !allowedKeys) return;

  const keys = Object.keys(payload);
  const unknown = keys.filter((k) => !allowedKeys.has(k));
  if (!unknown.length) return;

  // Common mistakes/aliases (helps devs immediately fix drift)
  const hints = {
    pickupDate: "Did you mean pickup_date or planned_pickup_datetime?",
    deliveryDate: "Did you mean delivery_date or planned_delivery_datetime?",
    pickup_datetime: "Did you mean planned_pickup_datetime?",
    delivery_datetime: "Did you mean planned_delivery_datetime?",
    dropoffLocation: "Did you mean dropoff_location?",
    delivery_location: "Did you mean dropoff_location?",
    rate: "Did you mean customer_rate or total_rate_usd?",
  };

  const hintLines = unknown
    .filter((k) => hints[k])
    .map((k) => `  - ${k}: ${hints[k]}`);

  console.warn(
    `[LoadGuard] Unknown Load fields detected during ${contextLabel}:`,
    unknown
  );

  if (hintLines.length) {
    console.warn("[LoadGuard] Hints:\n" + hintLines.join("\n"));
  }

  // Optional: show the payload keys for quick debugging
  console.debug("[LoadGuard] Payload keys:", keys);
}

function logMissingCanonicalFields(payload, contextLabel) {
  if (!payload) return;

  // Canonical fields that other modules (TMSB + validators) expect
  const requiredCanonical = [
    "planned_pickup_datetime",
    "planned_delivery_datetime",
  ];

  const missing = requiredCanonical.filter((k) => !payload[k]);
  if (!missing.length) return;

  console.warn(
    `[LoadGuard] Missing canonical Load fields during ${contextLabel}:`,
    missing,
    "\nThis can cause pages/validators to break (e.g., TMSB pages expect planned_* fields)."
  );
}

function typeLabel(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function isTypeCompatible(value, expectedType) {
  // JSON schema base types: string, number, integer, boolean, object, array, null
  if (expectedType == null) return true; // unknown schema type -> skip
  if (value === null || value === undefined) return true; // nullability handled upstream

  switch (expectedType) {
    case "string": return typeof value === "string";
    case "number": return typeof value === "number" && Number.isFinite(value);
    case "integer": return typeof value === "number" && Number.isInteger(value);
    case "boolean": return typeof value === "boolean";
    case "object": return typeof value === "object" && !Array.isArray(value);
    case "array": return Array.isArray(value);
    default: return true;
  }
}

function logTypeMismatches(payload, propTypes, contextLabel) {
  if (!payload || !propTypes) return;

  const errors = [];

  for (const [key, value] of Object.entries(payload)) {
    const meta = propTypes.get(key);
    if (!meta) continue; // unknown keys handled elsewhere

    // null handling
    if ((value === null || value === undefined)) {
      // if schema says non-nullable and value is null-ish, warn
      if (!meta.nullable && value === null) {
        errors.push({
          field: key,
          expected: meta.type,
          actual: "null",
          note: "Field is null but schema is non-nullable.",
        });
      }
      continue;
    }

    if (!isTypeCompatible(value, meta.type)) {
      errors.push({
        field: key,
        expected: meta.type,
        actual: typeLabel(value),
      });
      continue;
    }

    // If array, validate items type (shallow)
    if (meta.type === "array" && meta.itemsType && Array.isArray(value)) {
      const badIndex = value.findIndex((item) => !isTypeCompatible(item, meta.itemsType));
      if (badIndex !== -1) {
        errors.push({
          field: key,
          expected: `array<${meta.itemsType}>`,
          actual: `array<${typeLabel(value[badIndex])}>`,
          note: `First mismatch at index ${badIndex}.`,
        });
      }
    }
  }

  if (!errors.length) return;

  console.warn(`[LoadGuard] Type mismatches detected during ${contextLabel}:`);
  for (const e of errors) {
    console.warn(`  - ${e.field}: expected ${e.expected}, got ${e.actual}${e.note ? ` (${e.note})` : ""}`);
  }
}

function logMissingFieldsByStatus(payload, contextLabel) {
  if (!payload) return;

  // Normalize status to string
  const status = (payload.status || "").toString().toLowerCase();
  if (!status) return;

  // Normalize planned datetime with legacy fallbacks
  const pickupDT = payload.planned_pickup_datetime ?? payload.pickup_date ?? null;
  const deliveryDT = payload.planned_delivery_datetime ?? payload.delivery_date ?? null;

  const hasPickupLocation =
    !!(payload.pickup_location?.city || payload.pickup_location?.address || payload.pickup_location?.address1) ||
    !!payload.pickup?.city ||
    !!payload.pickup?.address1;

  const hasDropoffLocation =
    !!((payload.dropoff_location ?? payload.delivery_location)?.city || (payload.dropoff_location ?? payload.delivery_location)?.address || (payload.dropoff_location ?? payload.delivery_location)?.address1) ||
    !!payload.delivery?.city ||
    !!payload.delivery?.address1;

  const hasRate =
    payload.total_rate_usd != null ||
    payload.customer_rate != null ||
    payload.linehaul_usd != null;

  const hasEquipment = 
    !!(typeof payload.equipment_type === 'string' && payload.equipment_type.trim()) || 
    !!(typeof payload.equipment?.equipment_type === 'string' && payload.equipment.equipment_type.trim());

  const hasCustomer =
    !!(typeof payload.customer_name === 'string' && payload.customer_name.trim()) ||
    !!(typeof payload.broker_name === 'string' && payload.broker_name.trim()) ||
    !!(typeof payload.customer_id === 'string' && payload.customer_id.trim());

  // Load-level invoice fields in your codebase: invoice_number, invoice_due_date, invoice_status
  const hasInvoiceNumber = !!(typeof payload.invoice_number === 'string' && payload.invoice_number.trim());
  const hasInvoiceStatus = !!(typeof payload.invoice_status === 'string' && payload.invoice_status.trim());
  const hasInvoiceDueDate = !!payload.invoice_due_date;

  const hasCarrierPay = payload.carrier_pay_usd != null || payload.carrier_pay != null;

  // Status-based requirements (matches tendered → assigned → dispatched → picked_up → in_transit → delivered → invoiced)
  const requirements = {
    tendered: [
      { key: "customer/broker", ok: hasCustomer, msg: "Tendered loads should identify customer/broker (customer_name/broker_name/customer_id)." },
      { key: "pickup_location", ok: hasPickupLocation, msg: "Tendered loads should include pickup location details." },
      { key: "dropoff_location", ok: hasDropoffLocation, msg: "Tendered loads should include dropoff/delivery location details." },
      { key: "equipment_type", ok: hasEquipment, msg: "Tendered loads should include equipment_type (or equipment.equipment_type)." },
      { key: "rate", ok: hasRate, msg: "Tendered loads should include pricing (total_rate_usd/customer_rate/linehaul_usd)." },
      { key: "planned_pickup_datetime", ok: !!pickupDT, msg: "Tendered loads should include planned pickup datetime (or pickup_date fallback)." },
      { key: "planned_delivery_datetime", ok: !!deliveryDT, msg: "Tendered loads should include planned delivery datetime (or delivery_date fallback)." },
    ],
    assigned: [
      { key: "customer/broker", ok: hasCustomer, msg: "Assigned loads should identify customer/broker." },
      { key: "pickup_location", ok: hasPickupLocation, msg: "Assigned loads require pickup location details." },
      { key: "dropoff_location", ok: hasDropoffLocation, msg: "Assigned loads require dropoff/delivery location details." },
      { key: "equipment_type", ok: hasEquipment, msg: "Assigned loads require equipment_type." },
      { key: "rate", ok: hasRate, msg: "Assigned loads should include pricing." },
      { key: "planned_pickup_datetime", ok: !!pickupDT, msg: "Assigned loads require planned pickup datetime (or pickup_date fallback)." },
      { key: "planned_delivery_datetime", ok: !!deliveryDT, msg: "Assigned loads require planned delivery datetime (or delivery_date fallback)." },
      { key: "driver_id", ok: !!payload.driver_id, msg: "Assigned loads should have driver_id once a driver is allocated." },
    ],
    dispatched: [
      { key: "driver_id", ok: !!payload.driver_id, msg: "Dispatched loads require driver_id." },
      { key: "equipment_type", ok: hasEquipment, msg: "Dispatched loads require equipment_type." },
      { key: "planned_pickup_datetime", ok: !!pickupDT, msg: "Dispatched loads require planned pickup datetime (or pickup_date fallback)." },
      { key: "planned_delivery_datetime", ok: !!deliveryDT, msg: "Dispatched loads require planned delivery datetime (or delivery_date fallback)." },
      { key: "pickup_location", ok: hasPickupLocation, msg: "Dispatched loads require pickup location details." },
      { key: "dropoff_location", ok: hasDropoffLocation, msg: "Dispatched loads require dropoff/delivery location details." },
    ],
    picked_up: [
      { key: "actual_pickup_datetime", ok: !!payload.actual_pickup_datetime, msg: "Picked_up loads require actual_pickup_datetime." },
      { key: "driver_id", ok: !!payload.driver_id, msg: "Picked_up loads should retain driver_id." },
    ],
    in_transit: [
      { key: "actual_pickup_datetime", ok: !!payload.actual_pickup_datetime, msg: "In_transit loads require actual_pickup_datetime (pickup must be recorded before transit)." },
      { key: "driver_id", ok: !!payload.driver_id, msg: "In_transit loads should retain driver_id." },
    ],
    delivered: [
      { key: "actual_delivery_datetime", ok: !!payload.actual_delivery_datetime, msg: "Delivered loads require actual_delivery_datetime." },
      { key: "actual_pickup_datetime", ok: !!payload.actual_pickup_datetime, msg: "Delivered loads should have actual_pickup_datetime as well." },
      { key: "carrier_pay", ok: hasCarrierPay, msg: "Delivered loads should include carrier pay (carrier_pay_usd/carrier_pay) for settlement readiness." },
    ],
    invoiced: [
      { key: "delivered", ok: !!payload.actual_delivery_datetime, msg: "Invoiced loads should already be delivered (actual_delivery_datetime required)." },
      { key: "invoice_id", ok: hasInvoiceId, msg: "Invoiced loads should have an invoice identifier (invoice_id/invoice_number)." },
      { key: "invoice_total", ok: hasInvoiceTotal || hasRate, msg: "Invoiced loads should include invoice total (invoice_total_usd) or at minimum a rate." },
    ],
  };

  const rules = requirements[status];
  if (!rules) return;

  const missing = rules.filter((r) => !r.ok);
  if (!missing.length) return;

  console.warn(`[LoadGuard] Missing required fields for status="${status}" during ${contextLabel}:`);
  for (const m of missing) {
    console.warn(`  - ${m.key}: ${m.msg}`);
  }
}

/**
 * Patch the Load entity boundary so:
 * - create/update always write canonical planned_* fields
 * - list/filter/get always return normalized loads
 *
 * This prevents "data not flowing into perspective fields" across modules.
 */
function patchLoadEntityBoundary(base44) {
  const loadEntity = base44?.entities?.Load;
  if (!loadEntity) return;

  // Patch create
  if (typeof loadEntity.create === 'function') {
    const _create = loadEntity.create.bind(loadEntity);
    loadEntity.create = async (data) => {
      const payload = toLoadCreatePayload(data);

      // DEV guard: validate schema keys + types + status requirements
      if (isGuardEnabled()) {
        await getLoadSchema(base44);
        logUnknownFields(payload, _loadAllowedKeys, "Load.create()");
        logTypeMismatches(payload, _loadPropTypes, "Load.create()");
        logMissingCanonicalFields(payload, "Load.create()");
        logMissingFieldsByStatus(payload, "Load.create()");
      }

      return normalizeLoad(await _create(payload));
    };
  }

  // Patch update
  if (typeof loadEntity.update === 'function') {
    const _update = loadEntity.update.bind(loadEntity);
    loadEntity.update = async (id, data) => {
      const payload = toLoadCreatePayload(data);

      // DEV guard: validate schema keys + types + status requirements
      if (isGuardEnabled()) {
        await getLoadSchema(base44);
        logUnknownFields(payload, _loadAllowedKeys, "Load.update()");
        logTypeMismatches(payload, _loadPropTypes, "Load.update()");
        logMissingCanonicalFields(payload, "Load.update()");
        logMissingFieldsByStatus(payload, "Load.update()");
      }

      return normalizeLoad(await _update(id, payload));
    };
  }

  // Patch list
  if (typeof loadEntity.list === 'function') {
    const _list = loadEntity.list.bind(loadEntity);
    loadEntity.list = async (...args) => (await _list(...args)).map(normalizeLoad);
  }

  // Patch filter
  if (typeof loadEntity.filter === 'function') {
    const _filter = loadEntity.filter.bind(loadEntity);
    loadEntity.filter = async (...args) => (await _filter(...args)).map(normalizeLoad);
  }

  // Patch get (if present in SDK)
  if (typeof loadEntity.get === 'function') {
    const _get = loadEntity.get.bind(loadEntity);
    loadEntity.get = async (...args) => normalizeLoad(await _get(...args));
  }
}

patchLoadEntityBoundary(client);

export const base44 = client;