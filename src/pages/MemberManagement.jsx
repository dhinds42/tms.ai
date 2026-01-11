import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { useCurrentUser } from "@/components/hooks/useCurrentUser";
import { getOrgTypeColor, getMembershipStatusColor } from "@/components/utils/constants";
import AddMemberModal from "../components/members/AddMemberModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Plus, UserPlus, Lock, LogOut, Shield, Mail, CheckCircle, Search, Filter, Trash2, Download, Building } from "lucide-react";
import { PageHeader, EmptyState, FormField } from "@/components/design-system";



export default function MemberManagement() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bulkSelected, setBulkSelected] = useState([]);
  const queryClient = useQueryClient();

  const { data: organizations } = useScopedEntity('Organization', { limit: 100 });

  const { data: memberships } = useScopedEntity('Membership', { 
    filter: selectedOrg ? { org_id: selectedOrg.id } : null,
    enabled: !!selectedOrg 
  });

  const { data: roles } = useScopedEntity('Role', { limit: 100, sort: '-created_date' });

  const { data: userRoles } = useScopedEntity('UserRole', { 
    filter: selectedMember ? { membership_id: selectedMember.id } : null,
    enabled: !!selectedMember 
  });

  const inviteMutation = useMutation({
    mutationFn: async (data) => {
      // Invite user to platform
      await base44.users.inviteUser(data.email, 'user');
      
      // Create membership
      const membership = await base44.entities.Membership.create({
        user_email: data.email,
        org_id: data.org_id,
        title: data.title,
        status: 'invited',
        invited_by: (await base44.auth.me()).email,
        invited_at: new Date().toISOString()
      });
      
      // Assign default role
      if (data.role_id) {
        await base44.entities.UserRole.create({
          membership_id: membership.id,
          role_id: data.role_id,
          granted_by: (await base44.auth.me()).email,
          granted_at: new Date().toISOString()
        });
      }
      
      return membership;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      setShowInviteModal(false);
    }
  });

  const updateMembershipMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Membership.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
    },
    onError: (error) => {
      alert(`Failed to update membership: ${error.message}`);
    }
  });

  const handleLockMember = async (membership) => {
    if (!confirm(`Lock ${membership.user_email}? They will lose access immediately.`)) return;
    
    const currentUser = await base44.auth.me();
    updateMembershipMutation.mutate({
      id: membership.id,
      data: {
        status: 'locked',
        locked_at: new Date().toISOString(),
        locked_by: currentUser.email,
        lock_reason: 'Manual lock by admin'
      }
    });
  };

  const handleOffboardMember = async (membership) => {
    if (!confirm(`Offboard ${membership.user_email}? This action cannot be undone.`)) return;
    
    const currentUser = await base44.auth.me();
    updateMembershipMutation.mutate({
      id: membership.id,
      data: {
        status: 'offboarded',
        offboarded_at: new Date().toISOString(),
        offboarded_by: currentUser.email,
        is_active: false
      }
    });
  };

  const InviteModal = () => {
    const [formData, setFormData] = useState({
      email: '',
      org_id: selectedOrg?.id || '',
      title: '',
      role_id: ''
    });

    return (
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User to Organization</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate(formData);
          }} className="space-y-4">
            
            <FormField label="Email Address" required>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </FormField>

            <FormField label="Organization" required>
              <Select value={formData.org_id} onValueChange={(val) => setFormData({...formData, org_id: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.filter(o => o.is_active).map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Job Title">
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Dispatcher, Sales Manager" />
            </FormField>

            <FormField label="Initial Role">
              <Select value={formData.role_id} onValueChange={(val) => setFormData({...formData, role_id: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(r => r.is_active).map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600">
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };



  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Members"
        subtitle="Invite users and manage access across organizations"
        icon={Users}
        primaryAction={{
          label: 'Invite User',
          icon: UserPlus,
          onClick: () => setShowInviteModal(true),
          disabled: !selectedOrg
        }}
        secondaryActions={[
          { label: 'Export Members', icon: Download, onClick: () => alert('Export coming soon') }
        ]}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Org Selector */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm">Organizations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {organizations.filter(o => o.is_active).map(org => (
                <Button
                  key={org.id}
                  variant={selectedOrg?.id === org.id ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedOrg(org)}
                >
                  <Building className="w-4 h-4 mr-2" />
                  {org.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Members List */}
          <div className="lg:col-span-3">
            {selectedOrg ? (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedOrg.name} - Members</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{memberships.length} member(s)</p>
                    </div>
                    <Badge className={getOrgTypeColor(selectedOrg.org_type)}>
                      {selectedOrg.org_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input 
                        placeholder="Search members..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="invited">Invited</SelectItem>
                        <SelectItem value="locked">Locked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {bulkSelected.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <span className="text-sm font-semibold text-indigo-900">{bulkSelected.length} selected</span>
                      <Button size="sm" variant="outline" onClick={() => setBulkSelected([])}>Clear</Button>
                      <Button size="sm" className="bg-red-600 text-white" onClick={() => {
                        if (confirm(`Offboard ${bulkSelected.length} members?`)) {
                          bulkSelected.forEach(id => {
                            const member = memberships.find(m => m.id === id);
                            if (member) handleOffboardMember(member);
                          });
                          setBulkSelected([]);
                        }
                      }}>
                        <Trash2 className="w-3 h-3 mr-1" />
                        Bulk Offboard
                      </Button>
                    </div>
                  )}
                  
                  {memberships.filter(m => 
                    (statusFilter === 'all' || m.status === statusFilter) &&
                    (searchTerm === '' || m.user_email.toLowerCase().includes(searchTerm.toLowerCase()) || m.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map(member => (
                    <Card key={member.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox"
                            checked={bulkSelected.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelected([...bulkSelected, member.id]);
                              } else {
                                setBulkSelected(bulkSelected.filter(id => id !== member.id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex items-start justify-between flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-indigo-600" />
                              <span className="font-semibold text-slate-900">{member.user_email}</span>
                              <Badge className={getMembershipStatusColor(member.status)}>
                                {member.status}
                              </Badge>
                              {member.is_primary && <Badge variant="outline">Primary</Badge>}
                            </div>
                            {member.title && <p className="text-sm text-slate-600 mb-2">{member.title}</p>}
                            <p className="text-xs text-slate-500">
                              Joined: {member.created_date ? new Date(member.created_date).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            {member.status === 'active' && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleLockMember(member)}>
                                  <Lock className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleOffboardMember(member)}>
                                  <LogOut className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            {member.status === 'locked' && (
                              <Button size="sm" variant="outline" className="text-emerald-600" onClick={() => {
                                updateMembershipMutation.mutate({
                                  id: member.id,
                                  data: { status: 'active' }
                                });
                              }}>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Unlock
                              </Button>
                            )}
                          </div>
                        </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {memberships.length === 0 && (
                    <div className="py-4">
                      <EmptyState
                        icon={Users}
                        title="No members"
                        description="Invite users to get started"
                        action={{
                          label: 'Invite User',
                          icon: UserPlus,
                          onClick: () => setShowInviteModal(true)
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <EmptyState
                icon={Building}
                title="Select organization"
                description="Choose an organization from the list to manage members"
              />
            )}
          </div>
        </div>

        {showInviteModal && <InviteModal />}
      </div>
    </div>
  );
}