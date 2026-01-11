import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building, Plus, Edit, Users, Shield, AlertCircle, Search, Filter, ChevronDown } from "lucide-react";
import { PageHeader, EmptyState, FormField, SkeletonCard } from "@/components/design-system";
import { useCurrentUser } from "@/components/hooks/useCurrentUser";
import { getOrgTypeColor } from "@/components/utils/constants";
import CreateOrgModal from "../components/organizations/CreateOrgModal";

export default function OrganizationAdmin() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useCurrentUser();

  const { data: organizations = [], isLoading } = useScopedEntity('Organization', { limit: 100 });

  const { data: memberships = [] } = useScopedEntity('Membership', { 
    filter: selectedOrg ? { org_id: selectedOrg.id } : null,
    enabled: !!selectedOrg 
  });

  const createOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setShowCreateModal(false);
      setEditingOrg(null);
    },
    onError: (error) => {
      alert(`Failed to create organization: ${error.message}`);
    }
  });

  const updateOrgMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Organization.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setShowCreateModal(false);
      setEditingOrg(null);
    },
    onError: (error) => {
      alert(`Failed to update organization: ${error.message}`);
    }
  });



  // Check if user is broker admin
  const isBrokerAdmin = user?.role === 'admin';

  if (!isBrokerAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="Organizations" subtitle="Multi-tenant organization management" icon={Building} />
        <div className="max-w-7xl mx-auto p-6">
          <EmptyState
            icon={AlertCircle}
            title="Access Denied"
            description="Only broker administrators can access organization management."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Organizations"
        subtitle="Manage multi-tenant organizations and members"
        icon={Building}
        primaryAction={{
          label: 'Create Organization',
          icon: Plus,
          onClick: () => setShowCreateModal(true)
        }}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['BROKER', 'CARRIER', 'OWNER_OPERATOR', 'CUSTOMER'].map(type => {
            const count = organizations?.filter(o => o.org_type === type && o.is_active).length || 0;
            return (
              <Card key={type} className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-slate-600 mb-2">{type.replace('_', ' ')}</p>
                  <p className="text-3xl font-bold text-indigo-600">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Organizations List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-xl">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <CardTitle>Organizations ({organizations?.filter(o => o.is_active && 
                  (filterType === 'all' || o.org_type === filterType) &&
                  (searchTerm === '' || o.name.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length})</CardTitle>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input 
                      placeholder="Search organizations..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="BROKER">Broker</SelectItem>
                      <SelectItem value="CARRIER">Carrier</SelectItem>
                      <SelectItem value="OWNER_OPERATOR">Owner Op</SelectItem>
                      <SelectItem value="CUSTOMER">Customer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {organizations?.filter(o => o.is_active && 
                (filterType === 'all' || o.org_type === filterType) &&
                (searchTerm === '' || o.name.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map(org => (
                <Card key={org.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedOrg(org)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="w-4 h-4 text-indigo-600" />
                          <h3 className="font-bold text-slate-900">{org.name}</h3>
                          <Badge className={getOrgTypeColor(org.org_type)}>
                            {org.org_type}
                          </Badge>
                        </div>
                        {org.legal_name && <p className="text-sm text-slate-600">{org.legal_name}</p>}
                        <div className="flex gap-2 mt-2 text-xs text-slate-500">
                          {org.mc_number && <span>MC: {org.mc_number}</span>}
                          {org.dot_number && <span>DOT: {org.dot_number}</span>}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={(e) => {
                        e.stopPropagation();
                        setEditingOrg(org);
                        setShowCreateModal(true);
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Organization Details */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm">
                {selectedOrg ? 'Organization Details' : 'Select Organization'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedOrg ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Name</p>
                    <p className="text-sm text-slate-900">{selectedOrg.name}</p>
                  </div>
                  {selectedOrg.legal_name && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Legal Name</p>
                      <p className="text-sm text-slate-900">{selectedOrg.legal_name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Type</p>
                    <Badge className={getOrgTypeColor(selectedOrg.org_type)}>
                      {selectedOrg.org_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Members</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-slate-900">{memberships.length}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setEditingOrg(selectedOrg);
                    setShowCreateModal(true);
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Organization
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Building className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Select an organization to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create/Edit Org Modal */}
        <CreateOrgModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingOrg(null);
          }}
          onSave={(data) => {
            if (editingOrg) {
              updateOrgMutation.mutate({ id: editingOrg.id, data });
            } else {
              createOrgMutation.mutate(data);
            }
          }}
          isLoading={createOrgMutation.isPending || updateOrgMutation.isPending}
          organization={editingOrg}
        />
      </div>
    </div>
  );
}