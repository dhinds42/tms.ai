import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CheckCircle, Clock, AlertTriangle, Sparkles, FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/design-system";

import OnboardingWizard from "../components/onboarding/OnboardingWizard";
import OnboardingQueue from "../components/onboarding/OnboardingQueue";
import DocumentVerification from "../components/onboarding/DocumentVerification";
import AutoOnboardingAgent from "../components/onboarding/AutoOnboardingAgent";

export default function CarrierOnboarding() {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [autoOnboardingEnabled, setAutoOnboardingEnabled] = useState(
    localStorage.getItem('auto_onboarding_enabled') === 'true'
  );

  const queryClient = useQueryClient();

  const { data: carriers, isLoading } = useScopedEntity('Carrier', { limit: 100 });
  const { data: complianceItems, isLoading: complianceLoading } = useScopedEntity('ComplianceItem', { limit: 100 });

  const createCarrierMutation = useMutation({
    mutationFn: (carrierData) => base44.entities.Carrier.create(carrierData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      setShowWizard(false);
    },
  });

  const updateCarrierMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Carrier.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
    },
  });

  const pendingCarriers = carriers.filter(c => c.status === 'pending_approval');
  const activeCarriers = carriers.filter(c => c.status === 'active');
  const rejectedCarriers = carriers.filter(c => c.status === 'suspended');

  const handleToggleAutoOnboarding = () => {
    const newValue = !autoOnboardingEnabled;
    setAutoOnboardingEnabled(newValue);
    localStorage.setItem('auto_onboarding_enabled', newValue.toString());
  };

  const handleApproveCarrier = (carrierId) => {
    updateCarrierMutation.mutate({
      id: carrierId,
      data: { status: 'active' }
    });
  };

  const handleRejectCarrier = (carrierId) => {
    updateCarrierMutation.mutate({
      id: carrierId,
      data: { status: 'suspended' }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Carrier Onboarding"
        subtitle="Automated vetting, verification, and approval"
        icon={UserPlus}
        primaryAction={{
          label: 'Start Onboarding',
          icon: UserPlus,
          onClick: () => setShowWizard(true)
        }}
        secondaryActions={[
          { label: 'Export', icon: Download, onClick: () => alert('Export coming soon') }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingCarriers.length}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {pendingCarriers.length > 0 ? 'Action required' : 'All clear'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Carriers</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeCarriers.length}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {((activeCarriers.length / Math.max(carriers.length, 1)) * 100).toFixed(0)}% approval rate
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg. Approval Time</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">2.5h</p>
                  <p className="text-xs text-emerald-500 mt-1">
                    ↓ 30% faster this month
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">This Month</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {carriers.filter(c => {
                      const created = new Date(c.created_date);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    New onboardings
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={autoOnboardingEnabled}
                onChange={handleToggleAutoOnboarding}
                className="w-4 h-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">
                Auto-Onboarding
              </span>
              {autoOnboardingEnabled && (
                <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Auto Onboarding Agent */}
        {autoOnboardingEnabled && (
          <AutoOnboardingAgent />
        )}

        {/* Onboarding Queue */}
        <OnboardingQueue
          carriers={pendingCarriers}
          isLoading={isLoading}
          onApprove={handleApproveCarrier}
          onReject={handleRejectCarrier}
          onViewDetails={setSelectedCarrier}
        />

        {/* Document Verification */}
        {selectedCarrier && (
          <DocumentVerification
            carrier={selectedCarrier}
            complianceItems={complianceItems.filter(c => c.entity_id === selectedCarrier.id)}
            onClose={() => setSelectedCarrier(null)}
            onApprove={() => handleApproveCarrier(selectedCarrier.id)}
            onReject={() => handleRejectCarrier(selectedCarrier.id)}
          />
        )}

        {/* Onboarding Wizard */}
        {showWizard && (
          <OnboardingWizard
            onSave={(carrierData) => createCarrierMutation.mutate(carrierData)}
            onClose={() => setShowWizard(false)}
            isLoading={createCarrierMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}