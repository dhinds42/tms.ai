import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, UserPlus, Mail, Phone, Calendar, MapPin } from "lucide-react";
import AddCandidateModal from "./AddCandidateModal";

export default function RecruitingTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RecruitingCandidate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitingCandidates'] });
      setShowAddModal(false);
    },
  });

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['recruitingCandidates'],
    queryFn: () => base44.entities.RecruitingCandidate.list('-created_date', 100),
    initialData: [],
  });

  const filteredCandidates = candidates.filter(c => {
    const statusMatch = statusFilter === 'all' || c.status === statusFilter;
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
      c.first_name?.toLowerCase().includes(searchLower) ||
      c.last_name?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.candidate_type?.toLowerCase().includes(searchLower);
    return statusMatch && searchMatch;
  });

  const statusCounts = {
    all: candidates.length,
    new: candidates.filter(c => c.status === 'new').length,
    screening: candidates.filter(c => c.status === 'screening').length,
    interview_scheduled: candidates.filter(c => c.status === 'interview_scheduled').length,
    offer_extended: candidates.filter(c => c.status === 'offer_extended').length,
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      screening: 'bg-amber-100 text-amber-800',
      interview_scheduled: 'bg-purple-100 text-purple-800',
      interviewed: 'bg-cyan-100 text-cyan-800',
      offer_extended: 'bg-green-100 text-green-800',
      offer_accepted: 'bg-emerald-100 text-emerald-800',
      hired: 'bg-indigo-100 text-indigo-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Recruiting Pipeline</h2>
              <p className="text-slate-600 mt-1">Manage candidates and hiring process</p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300"
            />
          </div>

          {/* Status Filter */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mt-4">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
              <TabsTrigger value="new">New ({statusCounts.new})</TabsTrigger>
              <TabsTrigger value="screening">Screening ({statusCounts.screening})</TabsTrigger>
              <TabsTrigger value="interview_scheduled">Interview ({statusCounts.interview_scheduled})</TabsTrigger>
              <TabsTrigger value="offer_extended">Offer ({statusCounts.offer_extended})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-12 text-center">
            <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No candidates found</h3>
            <p className="text-slate-600">Add candidates to start building your talent pipeline</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {candidate.first_name} {candidate.last_name}
                      </h3>
                      <Badge className="mt-1">
                        {candidate.candidate_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge className={getStatusColor(candidate.status)}>
                    {candidate.status?.replace('_', ' ').toUpperCase()}
                  </Badge>

                  {candidate.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                  )}

                  {candidate.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}

                  {candidate.source && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Source: {candidate.source}</span>
                    </div>
                  )}

                  {candidate.years_experience && (
                    <div className="text-sm text-slate-600">
                      <strong>Experience:</strong> {candidate.years_experience} years
                    </div>
                  )}

                  {candidate.interview_date && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Interview: {new Date(candidate.interview_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddCandidateModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}