import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Truck, Download, Upload } from "lucide-react";
import { PageHeader } from "@/components/design-system";
import { useScopedEntity, useModal, useFilters } from "@/components/shared/hooks";

import CreateCarrierModal from "../components/carriers/CreateCarrierModal";
import CarrierPerformanceLeaderboard from "../components/carriers/CarrierPerformanceLeaderboard";
import AutomatedPerformanceEngine from "../components/carriers/AutomatedPerformanceEngine";
import EnhancedVettingModal from "../components/carriers/EnhancedVettingModal";
import AutomatedCarrierOnboarding from "../components/carriers/AutomatedCarrierOnboarding";
import CarrierStats from "../components/carriers/CarrierStats";
import CarrierSearchBar from "../components/carriers/CarrierSearchBar";
import CarrierGrid from "../components/carriers/CarrierGrid";

export default function Carriers() {
  const queryClient = useQueryClient();
  
  const createModal = useModal();
  const vettingModal = useModal();
  const { searchTerm, setSearchTerm, applyFilters } = useFilters();

  const { data: carriers, isLoading } = useScopedEntity('Carrier', { limit: 100 });
  const { data: loads } = useScopedEntity('Load', { limit: 500 });
  const { data: complianceItems } = useScopedEntity('ComplianceItem', { limit: 200 });

  const createCarrierMutation = useMutation({
    mutationFn: (carrierData) => base44.entities.Carrier.create(carrierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      createModal.close();
    },
  });

  const updateCarrierMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Carrier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      createModal.close();
    },
  });

  const handleSaveCarrier = (carrierData) => {
    if (createModal.data) {
      updateCarrierMutation.mutate({ id: createModal.data.id, data: carrierData });
    } else {
      createCarrierMutation.mutate(carrierData);
    }
  };

  const filteredCarriers = applyFilters(carriers, (carrier) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return carrier.company_name?.toLowerCase().includes(term) ||
           carrier.mc_number?.toLowerCase().includes(term) ||
           carrier.contact_name?.toLowerCase().includes(term);
  });

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
          onClick: () => createModal.open()
        }}
        secondaryActions={[
          { label: 'Export Carriers', icon: Download, onClick: () => alert('Export feature coming soon') },
          { label: 'Import Carriers', icon: Upload, onClick: () => alert('Import feature coming soon') }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <CarrierStats carriers={carriers} />

        {/* Enhanced Carrier Vetting */}
        {vettingModal.isOpen && (
          <EnhancedVettingModal
            carrier={vettingModal.data}
            loads={loads}
            complianceItems={complianceItems}
            onClose={vettingModal.close}
            onApprove={(vettingData) => {
              updateCarrierMutation.mutate({ 
                id: vettingModal.data.id, 
                data: { 
                  status: 'active',
                  vetting_score: vettingData.vetting_score,
                  vetting_status: vettingData.approval_status,
                  vetted_at: new Date().toISOString()
                } 
              });
              vettingModal.close();
            }}
            onReject={() => {
              updateCarrierMutation.mutate({ 
                id: vettingModal.data.id, 
                data: { 
                  status: 'suspended',
                  vetting_status: 'rejected'
                } 
              });
              vettingModal.close();
            }}
          />
        )}

        {/* Automated Onboarding */}
        <AutomatedCarrierOnboarding carriers={carriers} />

        {/* Performance Leaderboard */}
        <CarrierPerformanceLeaderboard carriers={carriers} isLoading={isLoading} />

        {/* Search */}
        <CarrierSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Carrier Grid */}
        <CarrierGrid
          carriers={filteredCarriers}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onEdit={(carrier) => createModal.open(carrier)}
          onVet={(carrier) => vettingModal.open(carrier)}
          onCreate={() => createModal.open()}
        />

        {/* Create/Edit Modal */}
        {createModal.isOpen && (
          <CreateCarrierModal
            carrier={createModal.data}
            onSave={handleSaveCarrier}
            onClose={createModal.close}
            isLoading={createCarrierMutation.isPending || updateCarrierMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}