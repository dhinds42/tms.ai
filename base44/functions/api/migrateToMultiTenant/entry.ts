/**
 * Migration to Multi-Tenant RBAC
 * Run ONCE to migrate existing data
 */

export default async function migrateToMultiTenant({ base44, user }) {
  try {
    const results = {
      default_org_created: false,
      memberships_created: 0,
      org_id_backfilled: 0,
      errors: []
    };
    
    // 1. Check if default org exists
    const existingOrgs = await base44.asServiceRole.entities.Organization.filter({
      name: 'Default TMS Organization'
    });
    
    let defaultOrg;
    if (existingOrgs.length === 0) {
      defaultOrg = await base44.asServiceRole.entities.Organization.create({
        name: 'Default TMS Organization',
        legal_name: 'Default TMS Organization',
        org_type: 'BROKER',
        tenant_id: 'default',
        is_active: true
      });
      results.default_org_created = true;
    } else {
      defaultOrg = existingOrgs[0];
    }
    
    // 2. Get all existing users (Base44 built-in)
    // Note: Cannot query User entity directly, so we'll create memberships on-demand
    
    // 3. Backfill org_id on critical entities
    const entitiesToBackfill = [
      'Load',
      'Carrier', 
      'Driver',
      'Lane',
      'LaneRate',
      'Quote',
      'Invoice',
      'Settlement',
      'Document',
      'ComplianceItem'
    ];
    
    for (const entityName of entitiesToBackfill) {
      try {
        // Get records without org_id
        const records = await base44.asServiceRole.entities[entityName].filter({
          org_id: null
        });
        
        // Update each with default org_id
        for (const record of records) {
          await base44.asServiceRole.entities[entityName].update(record.id, {
            org_id: defaultOrg.id
          });
          results.org_id_backfilled++;
        }
      } catch (error) {
        results.errors.push(`${entityName}: ${error.message}`);
      }
    }
    
    // 4. Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'System',
      entity_id: 'migration',
      action: 'MULTI_TENANT_MIGRATION',
      actor_email: user?.email || 'system',
      actor_role: user?.role || 'admin',
      metadata: results
    });
    
    return {
      ok: true,
      message: 'Multi-tenant migration completed',
      results
    };
    
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}