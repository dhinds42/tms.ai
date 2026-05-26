/**
 * CANONICAL ENTITY SCOPE DEFINITIONS
 * P0 REMEDIATION: Defines which entities require tenant isolation
 */

/**
 * TENANT-SCOPED ENTITIES (require org_id enforcement)
 * ALL entities in this list MUST have:
 * - beforeRead hook (enforces org_id filter)
 * - beforeCreate hook (injects org_id)
 * - beforeUpdate hook (validates ownership)
 */
export const TENANT_SCOPED_ENTITIES = [
  // Financial entities (P0 - highest priority)
  'Settlement',
  'Invoice',
  'Payment',
  'Chargeback',
  'AccrualEntry',
  'VarianceCase',
  'PayrollRecord',
  
  // Operational entities
  'Load',
  'Quote',
  'Lane',
  'LaneRate',
  'LaneRateHistory',
  'LoadTemplate',
  'Stop',
  'RouteSegment',
  'RoutePlan',
  'TrackingEvent',
  
  // Network/relationship entities
  'Driver',
  'Carrier',
  'OwnerOperator',
  'Customer',
  'Shipper',
  'Prospect',
  'Contact',
  'Vehicle',
  'Trailer',
  'Tractor',
  'Equipment',
  
  // Compliance entities
  'Document',
  'ComplianceItem',
  'ComplianceProfile',
  'SafetyIncident',
  'Claim',
  'ClaimLine',
  'InsurancePolicy',
  
  // Contract/rate entities
  'CustomerContract',
  'CarrierContract',
  'CustomerFSCTable',
  'CustomerFSCTableRow',
  'FSCTableVersion',
  'RateConfirmation',
  'Tender',
  
  // Approval/workflow entities
  'ApprovalRequest',
  'FeatureApprovalRequest',
  'WorkflowTrigger',
  'Task',
  
  // Policy/config entities
  'CarrierDriverPolicy',
  'PolicyAlert',
  'DriverFeatureEligibility',
  'FieldRedactionPolicy',
  
  // Communication/tracking
  'LoadMessage',
  'Notification',
  'AccessorialRequest',
  'DriverEscalation',
  'DriverAcknowledgement',
  
  // Detention/accessorial
  'DetentionSession',
  'OfferVersion',
  'PayConfidence',
  'VarianceAlert',
  
  // Analytics/reporting
  'KPISnapshot',
  'ReportSubscription',
  'SavedReportView',
  
  // Maintenance/asset
  'MaintenanceRecord',
  'InspectionRecord',
  'FuelTransaction',
  'TollTransaction',
  
  // HR/employee
  'Employee',
  'RecruitingCandidate',
  'TrainingRecord',
  'PerformanceReview',
  'TimeOffRequest',
  
  // Warehouse/yard
  'Warehouse',
  'Yard',
  'YardAssetPosition',
  'DockSchedule',
  'Container',
  
  // Import/sync
  'ImportRun',
  'SyncLog',
  'IntegrationError',
  
  // Customer portal
  'CustomerPortalUser',
  'CustomerBookingPreference',
  'CustomerOrder',
  'ShipmentReference'
];

/**
 * GLOBAL ENTITIES (no org_id enforcement)
 * These entities are shared across all organizations
 */
export const GLOBAL_ENTITIES = [
  'Organization',        // Parent entity
  'Membership',          // User-org association
  'Role',               // RBAC role definitions
  'Permission',         // RBAC permission definitions
  'RolePermission',     // Role-permission mappings
  'UserRole',           // User-role assignments
  'DataScope',          // Data visibility scopes
  'AuditLog',           // Audit trail (read-only for non-admins)
  'DataRetentionPolicy', // System-wide policies
  'MessageTemplate',    // Shared message templates
  'AccessorialCode',    // Shared accessorial definitions
  'Location',           // Shared location database
  'Commodity',          // Shared commodity types
  'ServiceLevel',       // Shared service levels
  'DOEFuelPrice',       // Public DOE fuel data
  'USSFuelSurchargeBracket', // USS contract data
  'USSMileageRate',     // USS contract data
  'USSRateSchedule',    // USS contract data
  'USSLaneRate',        // USS contract data
  'USSRuleCharge',      // USS contract data
  'HTSCode',            // Harmonized tariff codes
  'EmissionFactor',     // Carbon emission factors
  'CommodityPricingIndex' // Market indices
];

/**
 * Check if entity requires tenant isolation
 */
export function isTenantScoped(entityName) {
  return TENANT_SCOPED_ENTITIES.includes(entityName);
}

/**
 * Check if entity is global (no tenant isolation)
 */
export function isGlobalEntity(entityName) {
  return GLOBAL_ENTITIES.includes(entityName);
}

/**
 * Get all entities requiring beforeRead hooks
 */
export function getEntitiesRequiringReadIsolation() {
  return TENANT_SCOPED_ENTITIES;
}

/**
 * Get all entities requiring beforeCreate hooks
 */
export function getEntitiesRequiringCreateIsolation() {
  // All tenant-scoped entities need org_id injection on create
  return TENANT_SCOPED_ENTITIES;
}

/**
 * Get all entities requiring beforeUpdate hooks
 */
export function getEntitiesRequiringUpdateIsolation() {
  // All tenant-scoped entities need ownership validation on update
  return TENANT_SCOPED_ENTITIES;
}

/**
 * COVERAGE GATE - Throws if any entity lacks required hooks
 * Use this in tests to enforce 100% coverage
 */
export function validateTenantIsolationCoverage(deployedHooks) {
  const missing = {
    beforeRead: [],
    beforeCreate: [],
    beforeUpdate: []
  };
  
  for (const entity of TENANT_SCOPED_ENTITIES) {
    if (!deployedHooks[entity]?.beforeRead) {
      missing.beforeRead.push(entity);
    }
    if (!deployedHooks[entity]?.beforeCreate) {
      missing.beforeCreate.push(entity);
    }
    if (!deployedHooks[entity]?.beforeUpdate) {
      missing.beforeUpdate.push(entity);
    }
  }
  
  if (missing.beforeRead.length > 0 || 
      missing.beforeCreate.length > 0 || 
      missing.beforeUpdate.length > 0) {
    throw new Error(
      `TENANT_ISOLATION_COVERAGE_FAILURE:\n` +
      `  Missing beforeRead: ${missing.beforeRead.length} entities\n` +
      `  Missing beforeCreate: ${missing.beforeCreate.length} entities\n` +
      `  Missing beforeUpdate: ${missing.beforeUpdate.length} entities\n` +
      `  See TENANT_SCOPED_ENTITIES list for required coverage.`
    );
  }
  
  return { ok: true, message: '100% tenant isolation coverage' };
}