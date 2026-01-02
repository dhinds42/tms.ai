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
import { Users, Plus, UserPlus, Lock, LogOut, Shield, Mail, CheckCircle } from "lucide-react";

export default function MemberManagement() {
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const queryClient = useQueryClient();

  const { data: organizations } = useQuery({
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

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list('-created_date', 100),
    initialData: []
  });

  const { data: userRoles } = useQuery({
    queryKey: ['userRoles', selectedMember?.id],
    queryFn: () => base44.entities.UserRole.filter({ membership_id: selectedMember.id }),
    initialData: [],
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
            
            <div>
              <Label>Email Address *</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>

            <div>
              <Label>Organization *</Label>
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
            </div>

            <div>
              <Label>Job Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Dispatcher, Sales Manager" />
            </div>

            <div>
              <Label>Initial Role</Label>
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
            </div>

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

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'invited': return 'bg-blue-100 text-blue-800';
      case 'locked': return 'bg-red-100 text-red-800';
      case 'offboarded': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Member Management
            </h1>
            <p className="text-slate-600 mt-1">Invite users and manage access across organizations</p>
          </div>
          <Button onClick={() => setShowInviteModal(true)} className="bg-indigo-600" disabled={!selectedOrg}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>

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
                <CardContent className="space-y-3">
                  {memberships.map(member => (
                    <Card key={member.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-indigo-600" />
                              <span className="font-semibold text-slate-900">{member.user_email}</span>
                              <Badge className={getStatusColor(member.status)}>
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
                      </CardContent>
                    </Card>
                  ))}

                  {memberships.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <Users className="w-12 h-12 mx-auto mb-3" />
                      <p>No members yet. Invite users to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">Select an organization to manage members</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {showInviteModal && <InviteModal />}
      </div>
    </div>
  );
}