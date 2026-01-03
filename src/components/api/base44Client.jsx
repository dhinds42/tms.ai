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

function runtimePolicyWarnings() {
  if (!__DEV__) return;

  // QA toggle to silence these warnings in dev: window.__POLICY_WARNINGS__ = false
  if (typeof window !== "undefined") {
    if (typeof window.__POLICY_WARNINGS__ !== "boolean") window.__POLICY_WARNINGS__ = true;
    if (!window.__POLICY_WARNINGS__) return;

    // Detect multiple Base44 client instances (heuristic)
    window.__BASE44_CLIENT_COUNT__ = (window.__BASE44_CLIENT_COUNT__ || 0) + 1;
    if (window.__BASE44_CLIENT_COUNT__ > 1) {
      console.warn(
        "[Base44 Policy] Multiple Base44 clients detected. This violates the single-client rule.\n" +
          "Only components/api/base44Client.js should create the client.\n" +
          "Fix: remove other createClient() usage and import { base44 } from '@/api/base44Client'."
      );
    }

    // Warn if someone is using deprecated client path (best-effort)
    if (window.__USING_DEPRECATED_BASE44_CLIENT__) {
      console.warn(
        "[Base44 Policy] Deprecated Base44 client path detected. Use '@/api/base44Client' only."
      );
    }
  }

  console.info(
    "[Base44 Policy] Single-client enforcement active (dev). " +
      "All entity writes must go through the canonical client boundary: components/api/base44Client.js"
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

          // Known write operations - normalize before write
          const writeOps = ["create", "bulkCreate", "update"];
          if (writeOps.includes(method)) {
            return async function (...args) {
              warnIfBypassDetected(`Load.${method}`);
              
              if (method === "create") {
                const [data] = args;
                return originalMethod.call(entityTarget, toLoadCreatePayload(data));
              }
              
              if (method === "bulkCreate") {
                const [dataArray] = args;
                const normalized = dataArray.map(toLoadCreatePayload);
                return originalMethod.call(entityTarget, normalized);
              }
              
              if (method === "update") {
                const [id, data] = args;
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