import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import RolePermissionsTab from "../components/settings/RolePermissionsTab";
import { PageHeader, EmptyState, PrimaryButton } from "@/components/design-system";

export default function UserRoles() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState('enhanced'); // 'enhanced' or 'simple'
  const rolesPerPage = 5;

  const queryClient = useQueryClient();

  // Mock roles data - in production, fetch from database
  const [roles, setRoles] = useState([
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: ['all'],
      user_count: 2
    },
    {
      id: 'dispatcher',
      name: 'Dispatcher',
      description: 'Load management and carrier coordination',
      permissions: ['loads.view', 'loads.create', 'loads.edit', 'carriers.view', 'documents.view'],
      user_count: 5
    },
    {
      id: 'accounting',
      name: 'Accounting',
      description: 'Financial operations and reporting',
      permissions: ['accounting.view', 'accounting.edit', 'invoices.view', 'invoices.create', 'payments.view'],
      user_count: 3
    },
    {
      id: 'sales',
      name: 'Sales Representative',
      description: 'Customer management and quotes',
      permissions: ['customers.view', 'customers.create', 'quotes.view', 'quotes.create', 'loads.view'],
      user_count: 8
    },
    {
      id: 'driver',
      name: 'Driver',
      description: 'Mobile app access for drivers',
      permissions: ['loads.view_assigned', 'documents.upload', 'status.update'],
      user_count: 15
    }
  ]);

  const allPermissions = [
    { category: 'Loads', permissions: [
      { id: 'loads.view', name: 'View Loads' },
      { id: 'loads.create', name: 'Create Loads' },
      { id: 'loads.edit', name: 'Edit Loads' },
      { id: 'loads.delete', name: 'Delete Loads' },
      { id: 'loads.view_assigned', name: 'View Assigned Loads Only' }
    ]},
    { category: 'Carriers', permissions: [
      { id: 'carriers.view', name: 'View Carriers' },
      { id: 'carriers.create', name: 'Create Carriers' },
      { id: 'carriers.edit', name: 'Edit Carriers' },
      { id: 'carriers.delete', name: 'Delete Carriers' }
    ]},
    { category: 'Customers', permissions: [
      { id: 'customers.view', name: 'View Customers' },
      { id: 'customers.create', name: 'Create Customers' },
      { id: 'customers.edit', name: 'Edit Customers' },
      { id: 'customers.delete', name: 'Delete Customers' }
    ]},
    { category: 'Accounting', permissions: [
      { id: 'accounting.view', name: 'View Accounting' },
      { id: 'accounting.edit', name: 'Edit Accounting' },
      { id: 'invoices.view', name: 'View Invoices' },
      { id: 'invoices.create', name: 'Create Invoices' },
      { id: 'payments.view', name: 'View Payments' },
      { id: 'payments.process', name: 'Process Payments' }
    ]},
    { category: 'Documents', permissions: [
      { id: 'documents.view', name: 'View Documents' },
      { id: 'documents.upload', name: 'Upload Documents' },
      { id: 'documents.delete', name: 'Delete Documents' }
    ]},
    { category: 'Reports', permissions: [
      { id: 'reports.view', name: 'View Reports' },
      { id: 'reports.export', name: 'Export Reports' }
    ]},
    { category: 'Settings', permissions: [
      { id: 'settings.view', name: 'View Settings' },
      { id: 'settings.edit', name: 'Edit Settings' },
      { id: 'users.manage', name: 'Manage Users' },
      { id: 'roles.manage', name: 'Manage Roles' }
    ]}
  ];

  const CreateRoleModal = () => {
    const [formData, setFormData] = useState(selectedRole || {
      name: '',
      description: '',
      permissions: []
    });

    const handleSave = () => {
      if (selectedRole) {
        setRoles(roles.map(r => r.id === selectedRole.id ? {...formData, id: selectedRole.id} : r));
        alert('Role updated successfully');
      } else {
        const newRole = {
          id: Date.now().toString(),
          ...formData,
          user_count: 0
        };
        setRoles([...roles, newRole]);
        alert('Role created successfully');
      }
      setShowCreateModal(false);
      setSelectedRole(null);
    };

    const togglePermission = (permId) => {
      if (formData.permissions.includes(permId)) {
        setFormData({...formData, permissions: formData.permissions.filter(p => p !== permId)});
      } else {
        setFormData({...formData, permissions: [...formData.permissions, permId]});
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <button 
              onClick={() => {
                setShowCreateModal(false);
                setSelectedRole(null);
              }} 
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            <div>
              <Label>Role Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Dispatcher, Sales Rep"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of this role"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="mb-4 block">Permissions</Label>
              <div className="space-y-6">
                {allPermissions.map((category) => (
                  <div key={category.category} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">{category.category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {category.permissions.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.permissions?.includes(perm.id) || formData.permissions?.includes('all')}
                            onChange={() => togglePermission(perm.id)}
                            disabled={formData.permissions?.includes('all')}
                          />
                          <span>{perm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions?.includes('all')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, permissions: ['all']});
                        } else {
                          setFormData({...formData, permissions: []});
                        }
                      }}
                    />
                    <span className="font-semibold text-indigo-900">
                      Grant All Permissions (Administrator)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 bg-indigo-600 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                {selectedRole ? 'Update Role' : 'Create Role'}
              </Button>
              <Button 
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedRole(null);
                }} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const handleDeleteRole = (roleId) => {
    if (confirm('Delete this role? Users with this role will need to be reassigned.')) {
      setRoles(roles.filter(r => r.id !== roleId));
      alert('Role deleted');
    }
  };

  // Filter and pagination
  const filteredRoles = roles.filter(role => {
    const searchMatch = searchTerm === '' ||
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    return searchMatch;
  });

  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);
  const startIndex = (currentPage - 1) * rolesPerPage;
  const paginatedRoles = filteredRoles.slice(startIndex, startIndex + rolesPerPage);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="User Roles & Permissions"
        subtitle="Define roles and manage access control for your team"
        icon={Shield}
        primaryAction={{
          label: 'Create Role',
          icon: Plus,
          onClick: () => setShowCreateModal(true)
        }}
        secondaryActions={[
          { 
            label: activeView === 'simple' ? 'Enhanced View' : 'Simple View', 
            onClick: () => setActiveView(activeView === 'simple' ? 'enhanced' : 'simple')
          }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Enhanced View */}
        {activeView === 'enhanced' && <RolePermissionsTab />}

        {/* Simple View */}
        {activeView === 'simple' && (
          <>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Total Roles</p>
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
                  <p className="text-sm font-semibold text-slate-600">Total Users</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {roles.reduce((sum, r) => sum + r.user_count, 0)}
                  </p>
                </div>
                <Users className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Permission Groups</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{allPermissions.length}</p>
                </div>
                <Settings className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles List */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Roles</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedRoles.map((role) => (
                <div key={role.id} className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{role.name}</h3>
                        <Badge className="bg-indigo-100 text-indigo-800">
                          {role.user_count} users
                        </Badge>
                        {role.permissions.includes('all') && (
                          <Badge className="bg-amber-100 text-amber-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Full Access
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-600 mb-4">{role.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.includes('all') ? (
                          <Badge className="bg-purple-100 text-purple-800">All Permissions</Badge>
                        ) : (
                          role.permissions.slice(0, 5).map((perm) => (
                            <Badge key={perm} className="bg-blue-100 text-blue-800 text-xs">
                              {perm}
                            </Badge>
                          ))
                        )}
                        {role.permissions.length > 5 && !role.permissions.includes('all') && (
                          <Badge className="bg-slate-100 text-slate-800 text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setSelectedRole(role);
                          setShowCreateModal(true);
                        }}
                        size="sm" 
                        variant="outline"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {role.id !== 'admin' && (
                        <Button 
                          onClick={() => handleDeleteRole(role.id)}
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + rolesPerPage, filteredRoles.length)} of {filteredRoles.length}
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={currentPage === page ? "bg-indigo-600" : ""}
                      >
                        {page}
                      </Button>
                    ))}
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
          </CardContent>
        </Card>

          {showCreateModal && <CreateRoleModal />}
          </>
        )}

      </div>
    </div>
  );
}