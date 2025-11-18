import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  ChevronLeft,
  ChevronRight,
  Lock
} from "lucide-react";

export default function RolePermissionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const rolesPerPage = 6;

  // Enhanced permissions structure
  const permissionCategories = [
    {
      category: 'Load Management',
      permissions: [
        { id: 'loads.view_all', name: 'View All Loads', critical: false },
        { id: 'loads.view_assigned', name: 'View Assigned Loads Only', critical: false },
        { id: 'loads.create', name: 'Create Loads', critical: false },
        { id: 'loads.edit', name: 'Edit Loads', critical: true },
        { id: 'loads.delete', name: 'Delete Loads', critical: true },
        { id: 'loads.assign', name: 'Assign Loads', critical: false },
        { id: 'loads.cancel', name: 'Cancel Loads', critical: true }
      ]
    },
    {
      category: 'Financial Operations',
      permissions: [
        { id: 'invoices.view', name: 'View Invoices', critical: false },
        { id: 'invoices.create', name: 'Create Invoices', critical: false },
        { id: 'invoices.edit', name: 'Edit Invoices', critical: true },
        { id: 'invoices.delete', name: 'Delete Invoices', critical: true },
        { id: 'payments.view', name: 'View Payments', critical: false },
        { id: 'payments.process', name: 'Process Payments', critical: true },
        { id: 'accounting.full_access', name: 'Full Accounting Access', critical: true }
      ]
    },
    {
      category: 'Customer & Carrier Management',
      permissions: [
        { id: 'customers.view', name: 'View Customers', critical: false },
        { id: 'customers.create', name: 'Create Customers', critical: false },
        { id: 'customers.edit', name: 'Edit Customers', critical: false },
        { id: 'carriers.view', name: 'View Carriers', critical: false },
        { id: 'carriers.create', name: 'Create Carriers', critical: false },
        { id: 'carriers.edit', name: 'Edit Carriers', critical: false },
        { id: 'drivers.manage', name: 'Manage Drivers', critical: false }
      ]
    },
    {
      category: 'Documents & Compliance',
      permissions: [
        { id: 'documents.view', name: 'View Documents', critical: false },
        { id: 'documents.upload', name: 'Upload Documents', critical: false },
        { id: 'documents.process', name: 'Process with AI', critical: false },
        { id: 'documents.delete', name: 'Delete Documents', critical: true },
        { id: 'compliance.view', name: 'View Compliance', critical: false },
        { id: 'compliance.manage', name: 'Manage Compliance', critical: true }
      ]
    },
    {
      category: 'Analytics & Reporting',
      permissions: [
        { id: 'reports.view', name: 'View Reports', critical: false },
        { id: 'reports.export', name: 'Export Reports', critical: false },
        { id: 'analytics.view', name: 'View Analytics', critical: false },
        { id: 'analytics.advanced', name: 'Advanced Analytics', critical: false }
      ]
    },
    {
      category: 'System Administration',
      permissions: [
        { id: 'settings.view', name: 'View Settings', critical: false },
        { id: 'settings.edit', name: 'Edit Settings', critical: true },
        { id: 'users.view', name: 'View Users', critical: false },
        { id: 'users.manage', name: 'Manage Users', critical: true },
        { id: 'roles.manage', name: 'Manage Roles', critical: true },
        { id: 'integrations.manage', name: 'Manage Integrations', critical: true }
      ]
    }
  ];

  // Sample roles with enhanced structure
  const [roles, setRoles] = useState([
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: ['all'],
      user_count: 2,
      is_system_role: true,
      color: 'purple'
    },
    {
      id: 'dispatcher',
      name: 'Dispatcher',
      description: 'Load management and carrier coordination',
      permissions: ['loads.view_all', 'loads.create', 'loads.edit', 'loads.assign', 'carriers.view', 'drivers.manage', 'documents.view', 'documents.upload'],
      user_count: 8,
      is_system_role: false,
      color: 'blue'
    },
    {
      id: 'accounting',
      name: 'Accounting Manager',
      description: 'Full financial operations and reporting',
      permissions: ['invoices.view', 'invoices.create', 'invoices.edit', 'payments.view', 'payments.process', 'accounting.full_access', 'reports.view', 'reports.export'],
      user_count: 3,
      is_system_role: false,
      color: 'emerald'
    },
    {
      id: 'sales',
      name: 'Sales Representative',
      description: 'Customer management and quote generation',
      permissions: ['customers.view', 'customers.create', 'customers.edit', 'loads.view_all', 'loads.create', 'reports.view'],
      user_count: 12,
      is_system_role: false,
      color: 'orange'
    },
    {
      id: 'driver',
      name: 'Driver',
      description: 'Mobile app access for assigned loads',
      permissions: ['loads.view_assigned', 'documents.upload', 'documents.view'],
      user_count: 24,
      is_system_role: true,
      color: 'cyan'
    },
    {
      id: 'ops_analyst',
      name: 'Operations Analyst',
      description: 'Analytics and reporting focus',
      permissions: ['loads.view_all', 'reports.view', 'reports.export', 'analytics.view', 'analytics.advanced', 'customers.view', 'carriers.view'],
      user_count: 4,
      is_system_role: false,
      color: 'indigo'
    }
  ]);

  const filteredRoles = roles.filter(role => {
    const searchMatch = searchTerm === '' ||
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);
  const startIndex = (currentPage - 1) * rolesPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + rolesPerPage);

  const getRoleColor = (color) => {
    const colors = {
      purple: 'from-purple-500 to-indigo-500',
      blue: 'from-blue-500 to-cyan-500',
      emerald: 'from-emerald-500 to-green-500',
      orange: 'from-orange-500 to-amber-500',
      cyan: 'from-cyan-500 to-teal-500',
      indigo: 'from-indigo-500 to-purple-500'
    };
    return colors[color] || 'from-slate-500 to-gray-500';
  };

  const totalPermissions = permissionCategories.reduce((sum, cat) => sum + cat.permissions.length, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Role & Permission Management</h2>
          <p className="text-slate-600 mt-1">Define granular access controls for your team</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Custom Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Active Roles</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{roles.length}</p>
              </div>
              <Shield className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Total Permissions</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{totalPermissions}</p>
              </div>
              <Lock className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Permission Groups</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{permissionCategories.length}</p>
              </div>
              <Shield className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search roles by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedRoles.map((role) => (
          <Card key={role.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
            <CardHeader className={`border-b border-slate-100 bg-gradient-to-r ${getRoleColor(role.color)} p-6`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{role.name}</h3>
                    {role.is_system_role && (
                      <Badge className="bg-white/20 text-white border border-white/30">
                        System
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-white/90">{role.description}</p>
                </div>
                {!role.is_system_role && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">Active Users</span>
                  <Badge className="bg-slate-100 text-slate-900">{role.user_count}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Permissions</span>
                  <Badge className="bg-indigo-100 text-indigo-800">
                    {role.permissions.includes('all') ? 'All' : role.permissions.length}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Key Permissions:</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.includes('all') ? (
                    <Badge className="bg-purple-600 text-white">Full System Access</Badge>
                  ) : (
                    role.permissions.slice(0, 4).map((perm) => (
                      <Badge key={perm} className="bg-blue-100 text-blue-800 text-xs">
                        {perm.split('.')[1]}
                      </Badge>
                    ))
                  )}
                  {role.permissions.length > 4 && !role.permissions.includes('all') && (
                    <Badge className="bg-slate-100 text-slate-800 text-xs">
                      +{role.permissions.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4">
                View Full Permissions
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-600">
            Showing {startIndex + 1}-{Math.min(startIndex + rolesPerPage, filteredRoles.length)} of {filteredRoles.length} roles
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className={currentPage === pageNum ? "bg-indigo-600" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Permission Matrix Info */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="p-6">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            Permission Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {permissionCategories.map((cat) => (
              <div key={cat.category} className="p-3 bg-white rounded-lg border border-indigo-200">
                <p className="font-semibold text-sm text-slate-900">{cat.category}</p>
                <p className="text-xs text-slate-600 mt-1">{cat.permissions.length} permissions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}