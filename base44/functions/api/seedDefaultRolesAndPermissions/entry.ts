/**
 * Seed Default Roles and Permissions
 * Creates baseline RBAC entities for enterprise deployment
 */

export default async function seedDefaultRolesAndPermissions({ base44 }) {
  try {
    // Check if already seeded
    const existingRoles = await base44.asServiceRole.entities.Role.list();
    if (existingRoles.length > 0) {
      return {
        ok: true,
        message: 'Roles already seeded',
        skipped: true
      };
    }
    
    // Define default permissions
    const permissions = [
      // Load permissions
      { permission_code: 'loads.create', permission_name: 'Create Loads', resource_type: 'Load', action: 'create', is_system: true },
      { permission_code: 'loads.read', permission_name: 'View Loads', resource_type: 'Load', action: 'read', is_system: true },
      { permission_code: 'loads.update', permission_name: 'Update Loads', resource_type: 'Load', action: 'update', is_system: true },
      { permission_code: 'loads.delete', permission_name: 'Delete Loads', resource_type: 'Load', action: 'delete', is_system: true },
      { permission_code: 'loads.approve', permission_name: 'Approve Loads', resource_type: 'Load', action: 'approve', is_system: true },
      
      // Invoice permissions
      { permission_code: 'invoices.create', permission_name: 'Create Invoices', resource_type: 'Invoice', action: 'create', is_system: true },
      { permission_code: 'invoices.read', permission_name: 'View Invoices', resource_type: 'Invoice', action: 'read', is_system: true },
      { permission_code: 'invoices.approve', permission_name: 'Approve Invoices', resource_type: 'Invoice', action: 'approve', is_system: true },
      
      // Rate permissions
      { permission_code: 'rates.create', permission_name: 'Create Rates', resource_type: 'LaneRate', action: 'create', is_system: true },
      { permission_code: 'rates.read', permission_name: 'View Rates', resource_type: 'LaneRate', action: 'read', is_system: true },
      { permission_code: 'rates.update', permission_name: 'Update Rates', resource_type: 'LaneRate', action: 'update', is_system: true },
      { permission_code: 'rates.override', permission_name: 'Override Rates', resource_type: 'LaneRate', action: 'override', is_system: true },
      
      // Settlement permissions
      { permission_code: 'settlements.create', permission_name: 'Create Settlements', resource_type: 'Settlement', action: 'create', is_system: true },
      { permission_code: 'settlements.approve', permission_name: 'Approve Settlements', resource_type: 'Settlement', action: 'approve', is_system: true },
      
      // Financial permissions
      { permission_code: 'financials.view_margin', permission_name: 'View Margin Data', resource_type: 'Financial', action: 'read', is_system: true },
      { permission_code: 'financials.override', permission_name: 'Override Financial Controls', resource_type: 'Financial', action: 'override', is_system: true },
    ];
    
    // Create permissions
    const createdPermissions = [];
    for (const perm of permissions) {
      const created = await base44.asServiceRole.entities.Permission.create(perm);
      createdPermissions.push(created);
    }
    
    // Define default roles
    const roles = [
      { role_key: 'broker_admin', role_name: 'Broker Admin', org_type: 'BROKER', description: 'Full admin access for broker', is_privileged: true, is_system: true },
      { role_key: 'broker_dispatcher', role_name: 'Broker Dispatcher', org_type: 'BROKER', description: 'Dispatch and load management', is_privileged: false, is_system: true },
      { role_key: 'broker_finance', role_name: 'Broker Finance', org_type: 'BROKER', description: 'Financial operations and approval', is_privileged: true, is_system: true },
      
      { role_key: 'carrier_admin', role_name: 'Carrier Admin', org_type: 'CARRIER', description: 'Full admin access for carrier', is_privileged: true, is_system: true },
      { role_key: 'carrier_dispatcher', role_name: 'Carrier Dispatcher', org_type: 'CARRIER', description: 'Fleet dispatch and driver management', is_privileged: false, is_system: true },
      
      { role_key: 'driver', role_name: 'Driver', org_type: 'CARRIER', description: 'Driver mobile access', is_privileged: false, is_system: true },
      { role_key: 'owner_operator', role_name: 'Owner Operator', org_type: 'OWNER_OPERATOR', description: 'Independent owner operator', is_privileged: false, is_system: true },
      
      { role_key: 'customer_user', role_name: 'Customer User', org_type: 'CUSTOMER', description: 'Customer portal access', is_privileged: false, is_system: true },
      { role_key: 'customer_admin', role_name: 'Customer Admin', org_type: 'CUSTOMER', description: 'Customer organization admin', is_privileged: true, is_system: true },
    ];
    
    // Create roles
    const createdRoles = [];
    for (const role of roles) {
      const created = await base44.asServiceRole.entities.Role.create(role);
      createdRoles.push(created);
    }
    
    // Map permissions to roles
    const rolePermissionMappings = {
      broker_admin: ['loads.create', 'loads.read', 'loads.update', 'loads.delete', 'loads.approve', 'invoices.create', 'invoices.read', 'invoices.approve', 'rates.create', 'rates.read', 'rates.update', 'rates.override', 'settlements.create', 'settlements.approve', 'financials.view_margin', 'financials.override'],
      broker_dispatcher: ['loads.create', 'loads.read', 'loads.update', 'rates.read'],
      broker_finance: ['invoices.create', 'invoices.read', 'invoices.approve', 'settlements.create', 'settlements.approve', 'financials.view_margin'],
      carrier_admin: ['loads.read', 'loads.update', 'settlements.read', 'rates.read'],
      carrier_dispatcher: ['loads.read', 'loads.update'],
      driver: ['loads.read'],
      owner_operator: ['loads.read', 'settlements.read'],
      customer_user: ['loads.read', 'invoices.read'],
      customer_admin: ['loads.read', 'invoices.read'],
    };
    
    // Create role-permission associations
    const createdRolePermissions = [];
    for (const role of createdRoles) {
      const permCodes = rolePermissionMappings[role.role_key] || [];
      for (const permCode of permCodes) {
        const permission = createdPermissions.find(p => p.permission_code === permCode);
        if (permission) {
          const rp = await base44.asServiceRole.entities.RolePermission.create({
            role_id: role.id,
            permission_id: permission.id,
            granted_at: new Date().toISOString(),
            granted_by: 'system'
          });
          createdRolePermissions.push(rp);
        }
      }
    }
    
    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'Role',
      entity_id: 'system',
      action: 'SEED_RBAC',
      actor_email: 'system@tms.ai',
      actor_role: 'system',
      metadata: {
        roles_created: createdRoles.length,
        permissions_created: createdPermissions.length,
        role_permissions_created: createdRolePermissions.length
      }
    });
    
    return {
      ok: true,
      roles: createdRoles.length,
      permissions: createdPermissions.length,
      role_permissions: createdRolePermissions.length
    };
    
  } catch (error) {
    console.error('Seed RBAC error:', error);
    return {
      ok: false,
      error: error.message
    };
  }
}