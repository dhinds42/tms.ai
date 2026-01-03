/**
 * Enhanced Base44 API Client with Load Normalization
 * 
 * This is the SINGLE canonical client for all Base44 entity operations.
 * DO NOT create another client elsewhere.
 * 
 * Enforces Load field normalization:
 * - planned_pickup_datetime / planned_delivery_datetime (canonical)
 * - pickup_location / dropoff_location (canonical)
 * - Backward compatibility with legacy fields (pickup_date, delivery_date, delivery_location)
 * - Nested intake compatibility (pickup/delivery objects)
 */

import { createClient } from "@base44/sdk";
import { normalizeLoad, toLoadCreatePayload } from "@/components/utils/loadFieldMapper";

// DEV-only runtime warnings to mirror ESLint "single client" policy
const __DEV__ = typeof import.meta !== "undefined" && !!import.meta.env?.DEV;

/**
 * Load Schema Validation (DEV-only, non-blocking)
 * Warns about schema violations to help developers catch issues early
 */
const LOAD_SCHEMA = {
  // Core identifiers
  load_number: "string",
  customer_id: "string",
  carrier_id: "string",
  driver_id: "string",
  
  // Canonical datetime fields
  planned_pickup_datetime: "datetime",
  planned_delivery_datetime: "datetime",
  actual_pickup_datetime: "datetime",
  actual_delivery_datetime: "datetime",
  
  // Legacy datetime fields
  pickup_date: "datetime",
  delivery_date: "datetime",
  
  // Canonical location objects
  pickup_location: "object",
  dropoff_location: "object",
  delivery_location: "object", // alias
  
  // Nested intake objects
  pickup: "object",
  delivery: "object",
  
  // Status and type fields
  status: "string",
  equipment_type: "string",
  commodity: "string",
  
  // Financial fields
  customer_rate: "number",
  carrier_pay: "number",
  broker_margin: "number",
  fuel_surcharge: "number",
  
  // Measurement fields
  distance_miles_planned: "number",
  distance_miles_actual: "number",
  weight_lbs: "number",
  
  // Invoice fields
  invoice_number: "string",
  invoice_status: "string",
  invoice_date: "datetime",
  invoice_due_date: "datetime",
  
  // Customer details
  customer_name: "string",
  customer_reference: "string",
  
  // Instructions and notes
  special_instructions: "string",
  notes: "string",
  
  // Sync flags
  synced_to_tms_b: "boolean",
  
  // Boolean flags
  is_active: "boolean",
  is_hazmat: "boolean",
  requires_reefer: "boolean",
};

const MEANINGFUL_STRING_FIELDS = [
  "customer_name",
  "equipment_type",
  "invoice_number",
  "invoice_status",
  "status",
  "commodity",
];

/**
 * Lifecycle-aware validation rules
 * Each status has expected required fields
 */
const LIFECYCLE_RULES = {
  tendered: {
    required: ["customer_id", "pickup_location", "dropoff_location", "equipment_type", "planned_pickup_datetime", "planned_delivery_datetime"],
    description: "Tendered loads need customer, locations, equipment, and planned dates"
  },
  assigned: {
    required: ["customer_id", "pickup_location", "dropoff_location", "equipment_type", "planned_pickup_datetime", "planned_delivery_datetime"],
    description: "Assigned loads need customer, locations, equipment, and planned dates"
  },
  dispatched: {
    required: ["driver_id", "equipment_type", "planned_pickup_datetime", "planned_delivery_datetime"],
    description: "Dispatched loads need driver, equipment, and planned dates"
  },
  picked_up: {
    required: ["actual_pickup_datetime"],
    description: "Picked up loads need actual pickup datetime"
  },
  in_transit: {
    required: ["actual_pickup_datetime"],
    description: "In-transit loads need actual pickup datetime"
  },
  delivered: {
    required: ["actual_delivery_datetime", "carrier_pay"],
    description: "Delivered loads need actual delivery datetime and carrier pay"
  },
  invoiced: {
    required: ["actual_delivery_datetime", "invoice_number", "invoice_status", "invoice_due_date"],
    description: "Invoiced loads need actual delivery datetime and invoice details"
  }
};

function validateLoadData(data, operation) {
  if (!__DEV__) return;
  if (typeof window === "undefined") return;
  if (window.__POLICY_WARNINGS__ === false) return;
  
  const warnings = [];
  
  // Check for unknown fields
  const knownFields = new Set(Object.keys(LOAD_SCHEMA));
  for (const field of Object.keys(data)) {
    if (!knownFields.has(field) && field !== "id" && !field.startsWith("created_") && !field.startsWith("updated_")) {
      warnings.push(`Unknown field "${field}" in Load.${operation}`);
    }
  }
  
  // Validate field types and values
  for (const [field, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    
    const expectedType = LOAD_SCHEMA[field];
    if (!expectedType) continue;
    
    // Type validation
    if (expectedType === "string" && typeof value !== "string") {
      warnings.push(`Field "${field}" should be string, got ${typeof value}`);
    }
    
    if (expectedType === "number" && typeof value !== "number") {
      warnings.push(`Field "${field}" should be number, got ${typeof value}`);
    }
    
    if (expectedType === "boolean" && typeof value !== "boolean") {
      warnings.push(`Field "${field}" should be boolean, got ${typeof value}`);
    }
    
    if (expectedType === "object" && (typeof value !== "object" || Array.isArray(value))) {
      warnings.push(`Field "${field}" should be object, got ${Array.isArray(value) ? "array" : typeof value}`);
    }
    
    // Datetime validation
    if (expectedType === "datetime" && typeof value === "string") {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        warnings.push(`Field "${field}" has invalid datetime format: "${value}"`);
      }
    }
    
    // Empty string warnings for meaningful fields
    if (MEANINGFUL_STRING_FIELDS.includes(field) && typeof value === "string" && value.trim() === "") {
      warnings.push(`Field "${field}" is empty string (consider null instead)`);
    }
  }
  
  // Deep validation for location objects
  const locationFields = ["pickup_location", "dropoff_location", "delivery_location"];
  for (const locField of locationFields) {
    const loc = data[locField];
    if (loc && typeof loc === "object" && !Array.isArray(loc)) {
      if (!loc.city && !loc.state && !loc.zip) {
        warnings.push(`Location "${locField}" is empty object (no city/state/zip)`);
      }
      
      // Validate location field types
      if (loc.city && typeof loc.city !== "string") {
        warnings.push(`${locField}.city should be string`);
      }
      if (loc.state && typeof loc.state !== "string") {
        warnings.push(`${locField}.state should be string`);
      }
      if (loc.zip && typeof loc.zip !== "string") {
        warnings.push(`${locField}.zip should be string`);
      }
    }
  }
  
  // Deep validation for nested pickup/delivery objects
  const nestedFields = ["pickup", "delivery"];
  for (const nestedField of nestedFields) {
    const nested = data[nestedField];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      if (!nested.city && !nested.state && !nested.address) {
        warnings.push(`Nested "${nestedField}" is empty object (no city/state/address)`);
      }
    }
  }
  
  // Lifecycle-aware validation
  if (data.status && LIFECYCLE_RULES[data.status]) {
    const rule = LIFECYCLE_RULES[data.status];
    const missingFields = [];
    
    for (const field of rule.required) {
      const value = data[field];
      
      // Check if field is missing or empty
      if (value === null || value === undefined) {
        missingFields.push(field);
      } else if (typeof value === "string" && value.trim() === "") {
        missingFields.push(`${field} (empty string)`);
      } else if (typeof value === "object" && !Array.isArray(value)) {
        // For location objects, check if they have meaningful data
        if ((field === "pickup_location" || field === "dropoff_location") && 
            !value.city && !value.state && !value.zip) {
          missingFields.push(`${field} (empty object)`);
        }
      }
    }
    
    if (missingFields.length > 0) {
      warnings.push(
        `Lifecycle validation for status "${data.status}": ${rule.description}` +
        `\n    Missing: ${missingFields.join(", ")}`
      );
    }
  }
  
  // Log all warnings
  if (warnings.length > 0) {
    console.warn(
      `[Load Validation] ${warnings.length} issue(s) in Load.${operation}:`,
      "\n  - " + warnings.join("\n  - "),
      "\nData:",
      data
    );
  }
}

function runtimePolicyWarnings() {
  if (!__DEV__) return;
  if (typeof window === "undefined") return;

  // QA toggle to silence these warnings: window.__POLICY_WARNINGS__ = false
  if (typeof window.__POLICY_WARNINGS__ !== "boolean") window.__POLICY_WARNINGS__ = true;
  if (!window.__POLICY_WARNINGS__) {
    console.info("[Base44 Policy] Runtime warnings suppressed via window.__POLICY_WARNINGS__ = false");
    return;
  }

  // Detect multiple Base44 client instances
  window.__BASE44_CLIENT_COUNT__ = (window.__BASE44_CLIENT_COUNT__ || 0) + 1;
  if (window.__BASE44_CLIENT_COUNT__ > 1) {
    console.error(
      "🚨 [Base44 Policy Violation] Multiple Base44 clients detected!\n" +
        "  ❌ Count: " + window.__BASE44_CLIENT_COUNT__ + " instances\n" +
        "  ✅ Expected: 1 instance (components/api/base44Client.js)\n" +
        "  🔧 Fix: Remove createClient() calls and import { base44 } from '@/api/base44Client'\n" +
        "  📝 Suppress: window.__POLICY_WARNINGS__ = false"
    );
  }

  // Detect direct SDK usage (bypass attempts)
  if (window.__BASE44_SDK_DIRECT_USAGE__) {
    console.error(
      "🚨 [Base44 Policy Violation] Direct SDK usage detected!\n" +
        "  ❌ Bypassing: Enhanced API Client normalization boundary\n" +
        "  ✅ Expected: All Load operations via { base44 } from '@/api/base44Client'\n" +
        "  ⚠️  Risk: Data inconsistency, missing field normalization\n" +
        "  🔧 Fix: Use the canonical client for all entity operations\n" +
        "  📝 Suppress: window.__POLICY_WARNINGS__ = false"
    );
  }

  console.info(
    "✅ [Base44 Policy] Enhanced API Client active (dev mode)\n" +
      "  • Single-client boundary enforced\n" +
      "  • Load normalization active on all reads/writes\n" +
      "  • Schema validation active (warnings only)\n" +
      "  • Lifecycle validation enabled\n" +
      "  • Suppress: window.__POLICY_WARNINGS__ = false"
  );
}

function warnIfBypassDetected(contextLabel) {
  if (!__DEV__) return;
  if (typeof window === "undefined") return;
  if (window.__POLICY_WARNINGS__ === false) return;

  // If someone calls base44Raw or another client, you can flip a flag there.
  if (window.__BASE44_BYPASS_DETECTED__) {
    console.warn(
      `[Base44 Policy] Detected bypass attempt during ${contextLabel}. ` +
        "All Load writes must use the canonical client boundary."
    );
  }
}

runtimePolicyWarnings();

// Create the raw Base44 client
const base44Raw = createClient();

/**
 * Enhanced Base44 client with Load normalization boundary
 */
export const base44 = {
  // Pass through all non-entity APIs
  auth: base44Raw.auth,
  integrations: base44Raw.integrations,
  users: base44Raw.users,

  // Enhanced entities with Load normalization
  entities: new Proxy(base44Raw.entities, {
    get(target, entityName) {
      const originalEntity = target[entityName];

      // Only apply normalization to Load entity
      if (entityName !== "Load") {
        return originalEntity;
      }

      // Return a proxy that intercepts ALL Load operations
      return new Proxy(originalEntity, {
        get(entityTarget, method) {
          const originalMethod = entityTarget[method];

          // Known write operations - validate and normalize before write
          const writeOps = ["create", "bulkCreate", "update"];
          if (writeOps.includes(method)) {
            return async function (...args) {
              warnIfBypassDetected(`Load.${method}`);
              
              if (method === "create") {
                const [data] = args;
                validateLoadData(data, "create");
                return originalMethod.call(entityTarget, toLoadCreatePayload(data));
              }
              
              if (method === "bulkCreate") {
                const [dataArray] = args;
                dataArray.forEach((item, idx) => validateLoadData(item, `bulkCreate[${idx}]`));
                const normalized = dataArray.map(toLoadCreatePayload);
                return originalMethod.call(entityTarget, normalized);
              }
              
              if (method === "update") {
                const [id, data] = args;
                validateLoadData(data, "update");
                return originalMethod.call(entityTarget, id, toLoadCreatePayload(data));
              }
            };
          }

          // Known read operations - normalize after read
          const readOps = ["list", "filter", "get"];
          if (readOps.includes(method)) {
            return async function (...args) {
              const result = await originalMethod.call(entityTarget, ...args);
              
              // Normalize single Load object
              if (result && typeof result === "object" && !Array.isArray(result)) {
                return normalizeLoad(result);
              }
              
              // Normalize array of Loads
              if (Array.isArray(result)) {
                return result.map(normalizeLoad);
              }
              
              return result;
            };
          }

          // For any other method that might return Load data - defensive normalization
          return async function (...args) {
            const result = await originalMethod.call(entityTarget, ...args);
            
            // If result looks like a Load or array of Loads, normalize it
            if (!result) return result;
            
            // Single Load object (has id and appears to be a Load)
            if (typeof result === "object" && !Array.isArray(result) && result.id) {
              return normalizeLoad(result);
            }
            
            // Array of Loads
            if (Array.isArray(result) && result.length > 0 && result[0]?.id) {
              return result.map(normalizeLoad);
            }
            
            return result;
          };
        },
      });
    },
  }),
};