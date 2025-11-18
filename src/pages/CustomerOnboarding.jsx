import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Users
} from "lucide-react";

export default function CustomerOnboarding() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const queryClient = useQueryClient();

  const { data: prospects, isLoading: prospectsLoading } = useQuery({
    queryKey: ['prospects'],
    queryFn: () => base44.entities.Prospect.list('-created_date', 100),
    initialData: [],
  });

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 100),
    initialData: [],
  });

  // Combine prospects and leads for onboarding pipeline
  const onboardingCandidates = [
    ...prospects.map(p => ({ ...p, type: 'prospect', source_type: 'prospect' })),
    ...leads.filter(l => l.lead_type === 'shipper' || l.lead_type === 'customer').map(l => ({ ...l, type: 'lead', source_type: 'lead' }))
  ];

  // Filter candidates
  const filteredCandidates = onboardingCandidates.filter(c => {
    const statusMatch = statusFilter === 'all' || c.status === statusFilter;
    const searchMatch = searchTerm === '' ||
      c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Calculate stats
  const newCount = onboardingCandidates.filter(c => c.status === 'intake' || c.status === 'new').length;
  const inProgressCount = onboardingCandidates.filter(c => 
    ['contacted', 'qualified', 'proposal_sent'].includes(c.status)
  ).length;
  const readyCount = onboardingCandidates.filter(c => 
    c.data_complete && !c.requires_review
  ).length;
  const convertedCount = onboardingCandidates.filter(c => 
    c.status === 'converted' || c.converted_party_id
  ).length;

  const getStatusColor = (status) => {
    const colors = {
      'intake': 'bg-blue-100 text-blue-800',
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-purple-100 text-purple-800',
      'qualified': 'bg-indigo-100 text-indigo-800',
      'proposal_sent': 'bg-amber-100 text-amber-800',
      'converted': 'bg-emerald-100 text-emerald-800',
      'lost': 'bg-red-100 text-red-800',
      'disqualified': 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Customer Onboarding
            </h1>
            <p className="text-slate-600 mt-2">
              {operatingMode === 'broker' ? 'Shipper' : 'Customer'} onboarding workflow and pipeline management
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">New Leads</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{newCount}</p>
                </div>
                <UserPlus className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">In Progress</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{inProgressCount}</p>
                </div>
                <Clock className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Ready to Convert</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{readyCount}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Converted</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{convertedCount}</p>
                </div>
                <Users className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by company, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'intake' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('intake')}
                  size="sm"
                >
                  New
                </Button>
                <Button
                  variant={statusFilter === 'contacted' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('contacted')}
                  size="sm"
                >
                  In Progress
                </Button>
                <Button
                  variant={statusFilter === 'converted' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('converted')}
                  size="sm"
                >
                  Converted
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="border-b border-slate-200">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{candidate.company_name || candidate.contact_name || 'Unnamed'}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{candidate.contact_name || candidate.email || ''}</p>
                  </div>
                  <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm">
                  {candidate.email && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email</span>
                      <span className="font-semibold text-slate-900">{candidate.email}</span>
                    </div>
                  )}
                  {candidate.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phone</span>
                      <span className="font-semibold text-slate-900">{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.industry && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Industry</span>
                      <span className="font-semibold text-slate-900">{candidate.industry}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Source</span>
                    <span className="font-semibold text-slate-900 capitalize">{candidate.source || candidate.source_type}</span>
                  </div>
                </div>

                {candidate.requires_review && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800">Requires Review</span>
                  </div>
                )}

                {candidate.data_complete && !candidate.requires_review && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-800">Ready to Convert</span>
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-3 h-3 mr-2" />
                    View
                  </Button>
                  {!candidate.converted_party_id && (
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      Convert
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No customers found</h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first customer to get started'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}