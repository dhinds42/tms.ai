/**
 * Seed RBAC Defaults
 * Idempotently creates default roles, permissions, and policies
 */

export default async function seedRbacDefaults({ base44, user }) {
  try {
    const results = {
      roles_created: 0,
      permissions_created: 0,
      policies_created: 0,
      role_permissions_created: 0,
      errors: []
    };
    
    // 1. Seed Permissions
    const permissions = [
      // Load Management
      { code: 'load.create', description: 'Create loads', category: 'loads' },
      { code: 'load.read', description: 'Read loads', category: 'loads' },
      { code: 'load.update', description: 'Update loads', category: 'loads' },
      { code: 'load.delete', description: 'Delete loads', category: 'loads' },
      { code: 'load.assign', description: 'Assign loads to carriers/drivers', category: 'loads' },
      
      // Lane & Rate Management
      { code: 'lane.create', description: 'Create lanes', category: 'customers' },
      { code: 'lane.read', description: 'Read lanes', category: 'customers' },
      { code: 'lane.update', description: 'Update lanes', category: 'customers' },
      { code: 'laneRate.create', description: 'Create lane rates', category: 'finance' },
      { code: 'laneRate.update', description: 'Update lane rates', category: 'finance' },
      { code: 'laneRate.approve', description: 'Approve lane rates', category: 'finance' },
      
      // Quote & Invoice
      { code: 'quote.create', description: 'Create quotes', category: 'finance' },
      { code: 'quote.read', description: 'Read quotes', category: 'finance' },
      { code: 'quote.update', description: 'Update quotes', category: 'finance' },
      { code: 'invoice.create', description: 'Create invoices', category: 'finance' },
      { code: 'invoice.read', description: 'Read invoices', category: 'finance' },
      { code: 'invoice.approve', description: 'Approve invoices', category: 'finance' },
      
      // Settlement & Payment
      { code: 'settlement.create', description: 'Create settlements', category: 'finance' },
      { code: 'settlement.read', description: 'Read settlements', category: 'finance' },
      { code: 'settlement.approve', description: 'Approve settlements', category: 'finance' },
      
      // Document Management
      { code: 'document.upload', description: 'Upload documents', category: 'compliance' },
      { code: 'document.read', description: 'Read documents', category: 'compliance' },
      { code: 'document.delete', description: 'Delete documents', category: 'compliance' },
      
      // Carrier/Driver Management
      { code: 'carrier.create', description: 'Create carriers', category: 'carriers' },
      { code: 'carrier.read', description: 'Read carriers', category: 'carriers' },
      { code: 'carrier.update', description: 'Update carriers', category: 'carriers' },
      { code: 'driver.create', description: 'Create drivers', category: 'carriers' },
      { code: 'driver.read', description: 'Read drivers', category: 'carriers' },
      { code: 'driver.update', description: 'Update drivers', category: 'carriers' },
      
      // Customer Management
      { code: 'customer.create', description: 'Create customers', category: 'customers' },
      { code: 'customer.read', description: 'Read customers', category: 'customers' },
      { code: 'customer.update', description: 'Update customers', category: 'customers' },
      
      // Analytics & Reports
      { code: 'reports.view', description: 'View reports', category: 'analytics' },
      { code: 'reports.export', description: 'Export reports', category: 'analytics' },
      { code: 'analytics.view', description: 'View analytics', category: 'analytics' },
      
      // Admin Operations
      { code: 'user.invite', description: 'Invite users', category: 'admin' },
      { code: 'user.manage', description: 'Manage users', category: 'admin' },
      { code: 'role.assign', description: 'Assign roles', category: 'admin' },
      { code: 'settings.update', description: 'Update settings', category: 'admin' },
      { code: 'audit.read', description: 'Read audit logs', category: 'admin' }
    ];
    
    for (const perm of permissions) {
      const existing = await base44.asServiceRole.entities.Permission.filter({
        code: perm.code
      });
      
      if (existing.length === 0) {
        await base44.asServiceRole.entities.Permission.create(perm);
        results.permissions_created++;
      }
    }
    
    // 2. Seed Roles
    const roles = [
      // Broker Roles
      {
        name: 'Broker Admin',
        role_key: 'broker_admin',
        org_type: 'BROKER',
        description: 'Full access to broker operations',
        role_type: 'system',
        is_admin: true
      },
      {
        name: 'Broker Operations',
        role_key: 'broker_ops',
        org_type: 'BROKER',
        description: 'Load management and carrier coordination',
        role_type: 'system'
      },
      {
        name: 'Broker Finance',
        role_key: 'broker_finance',
        org_type: 'BROKER',
        description: 'Financial operations and settlements',
        role_type: 'system'
      },
      {
        name: 'Broker Sales',
        role_key: 'broker_sales',
        org_type: 'BROKER',
        description: 'Customer quotes and sales',
        role_type: 'system'
      },
      
      // Carrier Roles
      {
        name: 'Carrier Admin',
        role_key: 'carrier_admin',
        org_type: 'CARRIER',
        description: 'Full access to carrier operations',
        role_type: 'system',
        is_admin: true
      },
      {
        name: 'Dispatcher',
        role_key: 'dispatcher',
        org_type: 'CARRIER',
        description: 'Driver and load assignment',
        role_type: 'system'
      },
      {
        name: 'Safety Manager',
        role_key: 'safety_manager',
        org_type: 'CARRIER',
        description: 'Compliance and safety management',
        role_type: 'system'
      },
      {
        name: 'Carrier Finance',
        role_key: 'carrier_finance',
        org_type: 'CARRIER',
        description: 'Receivables and driver settlements',
        role_type: 'system'
      },
      
      // Owner Operator Roles
      {
        name: 'Owner Operator Admin',
        role_key: 'oo_admin',
        org_type: 'OWNER_OPERATOR',
        description: 'Full access for owner operator',
        role_type: 'system',
        is_admin: true
      },
      {
        name: 'Owner Operator Driver',
        role_key: 'oo_driver',
        org_type: 'OWNER_OPERATOR',
        description: 'Driver portal access',
        role_type: 'system'
      },
      
      // Customer Roles
      {
        name: 'Customer Admin',
        role_key: 'customer_admin',
        org_type: 'CUSTOMER',
        description: 'Manage lanes, rates, and users',
        role_type: 'system',
        is_admin: true
      },
      {
        name: 'Customer User',
        role_key: 'customer_user',
        org_type: 'CUSTOMER',
        description: 'View quotes and invoices',
        role_type: 'system'
      },
      
      // Driver Role (cross-org)
      {
        name: 'Driver',
        role_key: 'driver',
        org_type: null,
        description: 'Driver portal access',
        role_type: 'system'
      }
    ];
    
    const createdRoles = [];
    for (const role of roles) {
      const existing = await base44.asServiceRole.entities.Role.filter({
        name: role.name
      });
      
      if (existing.length === 0) {
        const created = await base44.asServiceRole.entities.Role.create(role);
        createdRoles.push(created);
        results.roles_created++;
      } else {
        createdRoles.push(existing[0]);
      }
    }
    
    // 3. Assign Permissions to Roles
    const rolePermissionMappings = [
      // broker_admin gets all
      { role_key: 'broker_admin', permissions: permissions.map(p => p.code) },
      
      // broker_ops
      { role_key: 'broker_ops', permissions: [
        'load.create', 'load.read', 'load.update', 'load.assign',
        'carrier.read', 'driver.read', 'document.upload', 'document.read'
      ]},
      
      // broker_finance
      { role_key: 'broker_finance', permissions: [
        'load.read', 'invoice.create', 'invoice.read', 'invoice.approve',
        'settlement.create', 'settlement.read', 'settlement.approve',
        'reports.view', 'reports.export'
      ]},
      
      // broker_sales
      { role_key: 'broker_sales', permissions: [
        'customer.create', 'customer.read', 'customer.update',
        'quote.create', 'quote.read', 'quote.update',
        'load.create', 'load.read', 'reports.view'
      ]},
      
      // carrier_admin gets all carrier-side
      { role_key: 'carrier_admin', permissions: [
        'load.read', 'load.update', 'driver.create', 'driver.read', 'driver.update',
        'document.upload', 'document.read', 'settlement.read', 'reports.view'
      ]},
      
      // dispatcher
      { role_key: 'dispatcher', permissions: [
        'load.read', 'load.update', 'load.assign', 'driver.read', 'driver.update'
      ]},
      
      // safety_manager
      { role_key: 'safety_manager', permissions: [
        'driver.read', 'document.upload', 'document.read', 'reports.view'
      ]},
      
      // customer_admin
      { role_key: 'customer_admin', permissions: [
        'lane.create', 'lane.read', 'lane.update',
        'laneRate.create', 'laneRate.update',
        'quote.read', 'invoice.read', 'user.invite', 'role.assign'
      ]},
      
      // customer_user
      { role_key: 'customer_user', permissions: [
        'quote.read', 'invoice.read', 'load.read'
      ]},
      
      // driver
      { role_key: 'driver', permissions: [
        'load.read', 'load.update', 'document.upload', 'document.read'
      ]}
    ];
    
    for (const mapping of rolePermissionMappings) {
      const role = createdRoles.find(r => r.role_key === mapping.role_key);
      if (!role) continue;
      
      for (const permCode of mapping.permissions) {
        const perm = await base44.asServiceRole.entities.Permission.filter({ code: permCode });
        if (perm.length === 0) continue;
        
        const existing = await base44.asServiceRole.entities.RolePermission.filter({
          role_id: role.id,
          permission_id: perm[0].id
        });
        
        if (existing.length === 0) {
          await base44.asServiceRole.entities.RolePermission.create({
            role_id: role.id,
            permission_id: perm[0].id,
            granted_by: 'system_seed',
            granted_at: new Date().toISOString()
          });
          results.role_permissions_created++;
        }
      }
    }
    
    // 4. Seed Field Redaction Policies
    const policies = [
      // Driver cannot see customer rates or margins
      {
        role_key: 'driver',
        entity_name: 'Load',
        hidden_fields: ['customer_rate', 'carrier_pay', 'margin', 'margin_percent', 'total_revenue', 'total_carrier_cost', 'broker_fee_customer_side', 'broker_fee_carrier_side'],
        description: 'Driver load redaction',
        is_system_policy: true
      },
      {
        role_key: 'driver',
        entity_name: 'LaneRate',
        hidden_fields: ['customer_rate', 'carrier_rate', 'broker_fee_customer_side', 'broker_fee_carrier_side', 'total_margin', 'margin_percentage'],
        description: 'Driver lane rate redaction',
        is_system_policy: true
      },
      
      // Carrier cannot see customer rates or broker margins
      {
        role_key: 'carrier_admin',
        entity_name: 'Load',
        hidden_fields: ['customer_rate', 'margin', 'margin_percent', 'total_revenue', 'broker_fee_customer_side', 'broker_fee_carrier_side'],
        description: 'Carrier load redaction',
        is_system_policy: true
      },
      {
        role_key: 'dispatcher',
        entity_name: 'Load',
        hidden_fields: ['customer_rate', 'carrier_pay', 'margin', 'margin_percent', 'total_revenue', 'broker_fee_customer_side'],
        description: 'Dispatcher load redaction',
        is_system_policy: true
      },
      
      // Customer cannot see carrier pay or margins
      {
        role_key: 'customer_admin',
        entity_name: 'Load',
        hidden_fields: ['carrier_pay', 'total_carrier_cost', 'margin', 'margin_percent', 'broker_fee_customer_side', 'broker_fee_carrier_side'],
        description: 'Customer load redaction',
        is_system_policy: true
      },
      {
        role_key: 'customer_user',
        entity_name: 'Load',
        hidden_fields: ['carrier_pay', 'total_carrier_cost', 'margin', 'margin_percent', 'broker_fee_customer_side', 'broker_fee_carrier_side'],
        description: 'Customer user load redaction',
        is_system_policy: true
      },
      {
        role_key: 'customer_admin',
        entity_name: 'LaneRate',
        hidden_fields: ['carrier_rate', 'driver_rate', 'owner_operator_rate', 'broker_fee_customer_side', 'broker_fee_carrier_side', 'total_margin', 'margin_percentage'],
        description: 'Customer lane rate redaction',
        is_system_policy: true
      },
      {
        role_key: 'customer_user',
        entity_name: 'Invoice',
        hidden_fields: ['internal_notes', 'collection_notes', 'margin'],
        description: 'Customer invoice redaction',
        is_system_policy: true
      },
      
      // Broker sales has limited margin visibility
      {
        role_key: 'broker_sales',
        entity_name: 'Load',
        hidden_fields: ['total_carrier_cost', 'broker_fee_carrier_side'],
        description: 'Broker sales load redaction (limited internals)',
        is_system_policy: true
      }
    ];
    
    for (const policy of policies) {
      const existing = await base44.asServiceRole.entities.FieldRedactionPolicy.filter({
        role_key: policy.role_key,
        entity_name: policy.entity_name,
        is_system_policy: true
      });
      
      if (existing.length === 0) {
        await base44.asServiceRole.entities.FieldRedactionPolicy.create({
          ...policy,
          priority: 100
        });
        results.policies_created++;
      }
    }
    
    // 5. Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      entity_type: 'RBAC',
      entity_id: 'seed',
      action: 'RBAC_SEED_COMPLETED',
      actor_email: user?.email || 'system',
      actor_role: user?.role || 'system',
      metadata: results
    });
    
    return {
      ok: true,
      message: 'RBAC defaults seeded successfully',
      results
    };
    
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}