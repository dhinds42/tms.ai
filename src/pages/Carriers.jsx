import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgQueryKey } from "@/components/hooks/useOrgQueryKey";
import { scopedList } from "@/components/api/scopedEntities";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Award, TrendingUp, Brain, Truck, Download, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, EmptyState, SkeletonCard } from "@/components/design-system";

import CarrierCard from "../components/carriers/CarrierCard";
import CreateCarrierModal from "../components/carriers/CreateCarrierModal";
import CarrierPerformanceLeaderboard from "../components/carriers/CarrierPerformanceLeaderboard";
import AICarrierVetting from "../components/carriers/AICarrierVetting";
import AutomatedPerformanceEngine from "../components/carriers/AutomatedPerformanceEngine";
import EnhancedVettingModal from "../components/carriers/EnhancedVettingModal";
import AutomatedCarrierOnboarding from "../components/carriers/AutomatedCarrierOnboarding";

export default function Carriers() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [vettingCarrier, setVettingCarrier] = useState(null);

  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  const carriersKey = useOrgQueryKey('carriers');
  const loadsKey = useOrgQueryKey('loads');
  const complianceKey = useOrgQueryKey('compliance');

  const { data: carriers, isLoading } = useQuery({
    queryKey: carriersKey,
    queryFn: () => scopedList(base44.entities.Carrier, orgId, { sort: '-created_date', limit: 100 }),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: loadsKey,
    queryFn: () => scopedList(base44.entities.Load, orgId, { sort: '-created_date', limit: 500 }),
    initialData: [],
  });

  const { data: complianceItems } = useQuery({
    queryKey: complianceKey,
    queryFn: () => scopedList(base44.entities.ComplianceItem, orgId, { sort: '-created_date', limit: 200 }),
    initialData: [],
  });

  const createCarrierMutation = useMutation({
    mutationFn: (carrierData) => base44.entities.Carrier.create(carrierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      setShowCreateModal(false);
    },
  });

  const updateCarrierMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Carrier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      setSelectedCarrier(null);
    },
  });

  const handleCreateCarrier = (carrierData) => {
    createCarrierMutation.mutate(carrierData);
  };

  const handleUpdateCarrier = (carrierData) => {
    if (selectedCarrier) {
      updateCarrierMutation.mutate({ id: selectedCarrier.id, data: carrierData });
    }
  };

  const filteredCarriers = carriers.filter(carrier => {
    const searchMatch = searchTerm === '' || 
      carrier.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.mc_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const activeCarriers = carriers.filter(c => c.status === 'active');
  const avgOnTime = carriers.length > 0 
    ? (carriers.reduce((sum, c) => sum + (c.on_time_percentage || 0), 0) / carriers.length).toFixed(1)
    : 0;
  const avgCompliance = carriers.length > 0
    ? (carriers.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / carriers.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background Automated Scoring Engine */}
      <AutomatedPerformanceEngine 
        carriers={carriers} 
        loads={loads}
        complianceItems={complianceItems}
        enabled={true}
      />
      
      <PageHeader
        title="Carriers"
        subtitle="Manage carrier relationships, compliance, and performance"
        icon={Truck}
        primaryAction={{
          label: 'Create Carrier',
          icon: Plus,
          onClick: () => {
            setSelectedCarrier(null);
            setShowCreateModal(true);
          }
        }}
        secondaryActions={[
          { label: 'Export Carriers', icon: Download, onClick: () => alert('Export feature coming soon') },
          { label: 'Import Carriers', icon: Upload, onClick: () => alert('Import feature coming soon') }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Carriers</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{activeCarriers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg On-Time %</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{avgOnTime}%</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Compliance</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{avgCompliance}%</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Carrier Vetting */}
        {vettingCarrier && (
          <EnhancedVettingModal
            carrier={vettingCarrier}
            loads={loads}
            complianceItems={complianceItems}
            onClose={() => setVettingCarrier(null)}
            onApprove={(vettingData) => {
              updateCarrierMutation.mutate({ 
                id: vettingCarrier.id, 
                data: { 
                  status: 'active',
                  vetting_score: vettingData.vetting_score,
                  vetting_status: vettingData.approval_status,
                  vetted_at: new Date().toISOString()
                } 
              });
              setVettingCarrier(null);
            }}
            onReject={(vettingData) => {
              updateCarrierMutation.mutate({ 
                id: vettingCarrier.id, 
                data: { 
                  status: 'suspended',
                  vetting_status: 'rejected'
                } 
              });
              setVettingCarrier(null);
            }}
          />
        )}

        {/* Automated Onboarding */}
        <AutomatedCarrierOnboarding carriers={carriers} />

        {/* Performance Leaderboard */}
        <CarrierPerformanceLeaderboard carriers={carriers} isLoading={isLoading} />

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search carriers by name, MC number, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Carrier Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredCarriers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No carriers found"
            description={searchTerm ? "Try adjusting your search" : "Create your first carrier to start building your network"}
            action={{
              label: 'Create Carrier',
              icon: Plus,
              onClick: () => setShowCreateModal(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCarriers.map((carrier) => (
              <div key={carrier.id} className="relative">
                <CarrierCard
                  carrier={carrier}
                  onEdit={(carrier) => {
                    setSelectedCarrier(carrier);
                    setShowCreateModal(true);
                  }}
                />
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => setVettingCarrier(carrier)}
                    size="sm"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    AI Vet
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateCarrierModal
            carrier={selectedCarrier}
            onSave={selectedCarrier ? handleUpdateCarrier : handleCreateCarrier}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedCarrier(null);
            }}
            isLoading={createCarrierMutation.isPending || updateCarrierMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}