import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Loader2,
  Eye,
  UserPlus,
  Copy
} from "lucide-react";

import ProspectUploadModal from "../components/crm/ProspectUploadModal";
import ProspectCard from "../components/crm/ProspectCard";
import ProspectDetailsModal from "../components/crm/ProspectDetailsModal";

export default function ProspectIntake() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [statusFilter, setStatusFilter] = useState("intake");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();

  const { data: prospects, isLoading } = useQuery({
    queryKey: ['prospects'],
    queryFn: () => base44.entities.Prospect.list('-created_date', 200),
    initialData: [],
  });

  const updateProspectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Prospect.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
    },
  });

  const filteredProspects = prospects.filter(p => 
    statusFilter === 'all' || p.status === statusFilter
  );

  const statusCounts = {
    all: prospects.length,
    intake: prospects.filter(p => p.status === 'intake').length,
    qualified: prospects.filter(p => p.status === 'qualified').length,
    contacted: prospects.filter(p => p.status === 'contacted').length,
    meeting_scheduled: prospects.filter(p => p.status === 'meeting_scheduled').length,
    proposal_sent: prospects.filter(p => p.status === 'proposal_sent').length,
    negotiating: prospects.filter(p => p.status === 'negotiating').length,
    converted: prospects.filter(p => p.status === 'converted').length,
  };

  const needsReview = prospects.filter(p => p.requires_review).length;
  const avgConfidence = prospects.length > 0 
    ? (prospects.reduce((sum, p) => sum + (p.extraction_confidence || 0), 0) / prospects.length).toFixed(0)
    : 0;

  const handleStatusChange = (prospectId, newStatus) => {
    updateProspectMutation.mutate({
      id: prospectId,
      data: { status: newStatus }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Prospect Intake CRM
            </h1>
            <p className="text-slate-600 mt-2">
              AI-powered document processing for instant prospect capture
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`px-4 py-2 ${
              operatingMode === 'carrier' ? 'bg-blue-600' : 'bg-indigo-600'
            }`}>
              {operatingMode.toUpperCase()} MODE
            </Badge>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Prospect Document
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Total Prospects</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {prospects.length}
                  </p>
                </div>
                <Users className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Intake Queue</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {statusCounts.intake}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Needs Review</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {needsReview}
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Avg Confidence</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {avgConfidence}%
                  </p>
                </div>
                <Sparkles className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter Tabs */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-slate-100 flex-wrap h-auto">
                <TabsTrigger value="intake">Intake ({statusCounts.intake})</TabsTrigger>
                <TabsTrigger value="qualified">Qualified ({statusCounts.qualified})</TabsTrigger>
                <TabsTrigger value="contacted">Contacted ({statusCounts.contacted})</TabsTrigger>
                <TabsTrigger value="meeting_scheduled">Meeting ({statusCounts.meeting_scheduled})</TabsTrigger>
                <TabsTrigger value="proposal_sent">Proposal ({statusCounts.proposal_sent})</TabsTrigger>
                <TabsTrigger value="negotiating">Negotiating ({statusCounts.negotiating})</TabsTrigger>
                <TabsTrigger value="converted">Converted ({statusCounts.converted})</TabsTrigger>
                <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Prospects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-slate-600">Loading prospects...</p>
          </div>
        ) : filteredProspects.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-12 text-center">
              <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {statusFilter === 'intake' ? 'No prospects in intake' : 'No prospects found'}
              </h3>
              <p className="text-slate-600 mb-6">
                Upload a document to start capturing prospect data with AI
              </p>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload First Prospect
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProspects.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                onView={(p) => setSelectedProspect(p)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <ProspectUploadModal
            onClose={() => setShowUploadModal(false)}
          />
        )}

        {/* Details Modal */}
        {selectedProspect && (
          <ProspectDetailsModal
            prospect={selectedProspect}
            onClose={() => setSelectedProspect(null)}
            onStatusChange={handleStatusChange}
          />
        )}

      </div>
    </div>
  );
}