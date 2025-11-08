import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, CheckCircle, Clock, AlertTriangle, Sparkles, FileText } from "lucide-react";

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

  const { data: carriers, isLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const { data: complianceItems, isLoading: complianceLoading } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date', 100),
    initialData: [],
  });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            AI Carrier Onboarding
          </h1>
          <p className="text-slate-600 text-lg">
            Automated carrier vetting, document verification, and approval workflow
          </p>
          <Badge className="mt-3 bg-purple-600">AI-Powered</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingCarriers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Carriers</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeCarriers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg. Approval Time</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">2.5h</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">This Month</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">12</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowWizard(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Start New Onboarding
                </Button>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoOnboardingEnabled}
                    onChange={handleToggleAutoOnboarding}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Auto-Onboarding Enabled
                  </span>
                  {autoOnboardingEnabled && (
                    <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                  )}
                </div>
              </div>
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