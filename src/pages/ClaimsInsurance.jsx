import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

import ClaimsList from "../components/claims/ClaimsList";
import CreateClaimModal from "../components/claims/CreateClaimModal";
import InsuranceWarnings from "../components/claims/InsuranceWarnings";
import SupplementalInsurance from "../components/claims/SupplementalInsurance";
import ClaimsInstructions from "../components/claims/ClaimsInstructions";
import FreightClaimsIntegration from "../components/claims/FreightClaimsIntegration";

export default function ClaimsInsurance() {
  const [activeTab, setActiveTab] = useState("claims");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 200),
    initialData: [],
  });

  const { data: shippers } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 200),
    initialData: [],
  });

  // Mock claims data (in production, would be separate entity)
  const [claims, setClaims] = useState([
    {
      id: '1',
      claim_number: 'CLM-2024-001',
      load_id: loads[0]?.id,
      load_number: loads[0]?.load_number,
      claim_type: 'cargo_damage',
      status: 'submitted',
      claim_amount: 5000,
      approved_amount: 0,
      filed_date: new Date().toISOString(),
      description: 'Damage to cargo during transit',
      shipper_id: loads[0]?.shipper_id,
      carrier_id: loads[0]?.carrier_id
    }
  ]);

  const isLoading = loadsLoading || carriersLoading;

  // Calculate stats
  const openClaims = claims.filter(c => ['submitted', 'under_review'].includes(c.status));
  const approvedClaims = claims.filter(c => c.status === 'approved');
  const deniedClaims = claims.filter(c => c.status === 'denied');
  const totalClaimAmount = claims.reduce((sum, c) => sum + c.claim_amount, 0);
  const totalApprovedAmount = approvedClaims.reduce((sum, c) => sum + (c.approved_amount || 0), 0);

  // Insurance warnings
  const carrierWarnings = carriers.filter(c => {
    const insuranceExpiration = c.insurance_expiration ? new Date(c.insurance_expiration) : null;
    const daysUntilExpiration = insuranceExpiration ? 
      Math.floor((insuranceExpiration - new Date()) / (1000 * 60 * 60 * 24)) : 
      null;
    return !c.insurance_amount || c.insurance_amount < 100000 || (daysUntilExpiration && daysUntilExpiration < 30);
  });

  const handleCreateClaim = (claimData) => {
    const newClaim = {
      id: `${claims.length + 1}`,
      claim_number: `CLM-2024-${String(claims.length + 1).padStart(3, '0')}`,
      ...claimData,
      filed_date: new Date().toISOString(),
      status: 'submitted'
    };
    setClaims([...claims, newClaim]);
    setShowCreateModal(false);
    alert('Claim submitted successfully');
  };

  const handleUpdateClaim = (claimId, updates) => {
    setClaims(claims.map(c => c.id === claimId ? { ...c, ...updates } : c));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
              Claims & Insurance Management
            </h1>
            <p className="text-slate-600 mt-2">
              Comprehensive claims processing, cargo insurance tracking, and coverage alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            {carrierWarnings.length > 0 && (
              <Badge className="bg-red-600 animate-pulse">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {carrierWarnings.length} Insurance Warnings
              </Badge>
            )}
            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2">
              {operatingMode === 'carrier' ? 'Carrier Mode' : 'Broker Mode'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Open Claims</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{openClaims.length}</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Approved Claims</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{approvedClaims.length}</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Claims $</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">${(totalClaimAmount / 1000).toFixed(1)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Insurance Warnings</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{carrierWarnings.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Claims Management
            </TabsTrigger>
            <TabsTrigger value="warnings" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Insurance Warnings
            </TabsTrigger>
            <TabsTrigger value="supplemental" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Supplemental Insurance
            </TabsTrigger>
            <TabsTrigger value="instructions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Claims Instructions
            </TabsTrigger>
            <TabsTrigger value="freightclaims" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              FreightClaims.com
            </TabsTrigger>
          </TabsList>

          {/* Claims Management Tab */}
          <TabsContent value="claims">
            <div className="space-y-6">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active Claims</CardTitle>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-blue-600 text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      File New Claim
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <ClaimsList 
                claims={claims}
                loads={loads}
                carriers={carriers}
                shippers={shippers}
                onUpdateClaim={handleUpdateClaim}
                operatingMode={operatingMode}
              />
            </div>
          </TabsContent>

          {/* Insurance Warnings Tab */}
          <TabsContent value="warnings">
            <InsuranceWarnings 
              carriers={carriers}
              loads={loads}
              warnings={carrierWarnings}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Supplemental Insurance Tab */}
          <TabsContent value="supplemental">
            <SupplementalInsurance 
              loads={loads}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Claims Instructions Tab */}
          <TabsContent value="instructions">
            <ClaimsInstructions operatingMode={operatingMode} />
          </TabsContent>

          {/* FreightClaims.com Integration Tab */}
          <TabsContent value="freightclaims">
            <FreightClaimsIntegration 
              claims={claims}
              operatingMode={operatingMode}
            />
          </TabsContent>
        </Tabs>

        {/* Create Claim Modal */}
        {showCreateModal && (
          <CreateClaimModal
            loads={loads}
            onSave={handleCreateClaim}
            onClose={() => setShowCreateModal(false)}
            operatingMode={operatingMode}
          />
        )}

      </div>
    </div>
  );
}