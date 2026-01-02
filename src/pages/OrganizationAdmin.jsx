import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building, Plus, Edit, Users, Shield, AlertCircle } from "lucide-react";

export default function OrganizationAdmin() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list('-created_date', 100),
    initialData: []
  });

  const { data: memberships } = useQuery({
    queryKey: ['memberships', selectedOrg?.id],
    queryFn: () => base44.entities.Membership.filter({ org_id: selectedOrg.id }),
    initialData: [],
    enabled: !!selectedOrg
  });

  const createOrgMutation = useMutation({
    mutationFn: (data) => base44.entities.Organization.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setShowCreateModal(false);
    }
  });

  const updateOrgMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Organization.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setShowEditModal(false);
    }
  });

  const CreateOrgModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      legal_name: '',
      org_type: 'BROKER',
      mc_number: '',
      dot_number: '',
      tax_id: '',
      billing_email: ''
    });

    return (
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            createOrgMutation.mutate(formData);
          }} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Organization Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <Label>Legal Name</Label>
                <Input value={formData.legal_name} onChange={(e) => setFormData({...formData, legal_name: e.target.value})} />
              </div>
            </div>

            <div>
              <Label>Organization Type *</Label>
              <Select value={formData.org_type} onValueChange={(val) => setFormData({...formData, org_type: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BROKER">Broker</SelectItem>
                  <SelectItem value="CARRIER">Carrier</SelectItem>
                  <SelectItem value="OWNER_OPERATOR">Owner Operator</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>MC Number</Label>
                <Input value={formData.mc_number} onChange={(e) => setFormData({...formData, mc_number: e.target.value})} />
              </div>
              <div>
                <Label>DOT Number</Label>
                <Input value={formData.dot_number} onChange={(e) => setFormData({...formData, dot_number: e.target.value})} />
              </div>
              <div>
                <Label>Tax ID</Label>
                <Input value={formData.tax_id} onChange={(e) => setFormData({...formData, tax_id: e.target.value})} />
              </div>
            </div>

            <div>
              <Label>Billing Email</Label>
              <Input type="email" value={formData.billing_email} onChange={(e) => setFormData({...formData, billing_email: e.target.value})} />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600">Create Organization</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const getOrgTypeColor = (type) => {
    switch(type) {
      case 'BROKER': return 'bg-purple-100 text-purple-800';
      case 'CARRIER': return 'bg-blue-100 text-blue-800';
      case 'OWNER_OPERATOR': return 'bg-emerald-100 text-emerald-800';
      case 'CUSTOMER': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Check if user is broker admin
  const isBrokerAdmin = user?.role === 'admin';

  if (!isBrokerAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-600">Only broker administrators can access organization management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Organization Management
            </h1>
            <p className="text-slate-600 mt-1">Manage multi-tenant organizations and members</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['BROKER', 'CARRIER', 'OWNER_OPERATOR', 'CUSTOMER'].map(type => {
            const count = organizations.filter(o => o.org_type === type && o.is_active).length;
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
              <CardTitle>Organizations ({organizations.filter(o => o.is_active).length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {organizations.filter(o => o.is_active).map(org => (
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
                        setSelectedOrg(org);
                        setShowEditModal(true);
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
                  <Button variant="outline" className="w-full" onClick={() => setShowEditModal(true)}>
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

        {showCreateModal && <CreateOrgModal />}
      </div>
    </div>
  );
}