import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  FileText,
  TrendingUp,
  Shield
} from "lucide-react";

import CreateOwnerOperatorModal from "../components/owner-operators/CreateOwnerOperatorModal";

export default function OwnerOperatorOnboarding() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedOwnerOp, setSelectedOwnerOp] = useState(null);

  const queryClient = useQueryClient();

  const { data: ownerOperators, isLoading } = useQuery({
    queryKey: ['ownerOperators'],
    queryFn: () => base44.entities.OwnerOperator.list('-created_date', 100),
    initialData: [],
  });

  const { data: complianceItems } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date', 100),
    initialData: [],
  });

  const createOwnerOpMutation = useMutation({
    mutationFn: (data) => base44.entities.OwnerOperator.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerOperators'] });
      setShowWizard(false);
    },
  });

  const updateOwnerOpMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OwnerOperator.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerOperators'] });
    },
  });

  if (operatingMode !== 'carrier') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Carrier Mode Required</h2>
              <p className="text-red-700">Owner Operator Onboarding is only available in Carrier Mode.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const pendingOwnerOps = ownerOperators.filter(o => o.status === 'pending_approval' || !o.status);
  const activeOwnerOps = ownerOperators.filter(o => o.status === 'active');
  const avgApprovalTime = '3.2 days'; // Mock data

  const handleApprove = async (ownerOp) => {
    if (confirm(`Approve ${ownerOp.full_name} as an owner operator?`)) {
      await updateOwnerOpMutation.mutateAsync({
        id: ownerOp.id,
        data: { ...ownerOp, status: 'active' }
      });
      alert(`✅ ${ownerOp.full_name} has been approved and is now active!`);
    }
  };

  const handleReject = async (ownerOp) => {
    const reason = prompt(`Reason for rejecting ${ownerOp.full_name}:`);
    if (reason) {
      await updateOwnerOpMutation.mutateAsync({
        id: ownerOp.id,
        data: { ...ownerOp, status: 'suspended', notes: `Rejected: ${reason}` }
      });
      alert(`${ownerOp.full_name} has been rejected.`);
    }
  };

  const handleSaveOwnerOp = (data) => {
    if (selectedOwnerOp) {
      updateOwnerOpMutation.mutate({ id: selectedOwnerOp.id, data });
    } else {
      createOwnerOpMutation.mutate({ ...data, status: 'pending_approval' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Owner Operator Onboarding
            </h1>
            <p className="text-slate-600 mt-2">
              Streamlined owner operator onboarding and lease agreement workflow
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedOwnerOp(null);
              setShowWizard(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Owner Operator
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Reviews</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingOwnerOps.length}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Owner Ops</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeOwnerOps.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Avg Approval Time</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{avgApprovalTime}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Queue */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Owner Operators Pending Approval ({pendingOwnerOps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOwnerOps.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
                <p className="text-slate-600">No owner operators pending approval at this time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOwnerOps.map(ownerOp => {
                  const ownerOpCompliance = complianceItems.filter(
                    c => c.entity_type === 'driver' && c.entity_id === ownerOp.id
                  );
                  const hasExpiredDocs = ownerOpCompliance.some(c => c.status === 'expired');

                  return (
                    <div key={ownerOp.id} className="p-6 border-2 border-amber-200 bg-amber-50 rounded-xl hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{ownerOp.full_name}</h3>
                          {ownerOp.company_name && (
                            <p className="text-slate-600 mb-2">{ownerOp.company_name}</p>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className="bg-amber-100 text-amber-800">Pending Approval</Badge>
                            {hasExpiredDocs && (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Expired Docs
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-slate-500">Phone</p>
                              <p className="font-semibold">{ownerOp.phone}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">CDL</p>
                              <p className="font-semibold">{ownerOp.cdl_number}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Equipment</p>
                              <p className="font-semibold">{ownerOp.equipment_owned?.truck_number || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Payment</p>
                              <p className="font-semibold">
                                {ownerOp.payment_structure === 'percentage' 
                                  ? `${ownerOp.payment_rate}%`
                                  : `$${ownerOp.payment_rate}`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(ownerOp)}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Owner Operator
                        </Button>
                        <Button
                          onClick={() => handleReject(ownerOp)}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedOwnerOp(ownerOp);
                            setShowWizard(true);
                          }}
                          variant="outline"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Owner Operators Summary */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Active Owner Operators ({activeOwnerOps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOwnerOps.slice(0, 6).map(ownerOp => (
                <div key={ownerOp.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-slate-900">{ownerOp.full_name}</p>
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                      {ownerOp.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">Equipment: {ownerOp.equipment_owned?.truck_number || 'N/A'}</p>
                  <p className="text-sm text-slate-600">
                    Loads: {ownerOp.total_loads || 0} | Revenue: ${(ownerOp.total_revenue || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Owner Operator Modal */}
        {showWizard && (
          <CreateOwnerOperatorModal
            ownerOperator={selectedOwnerOp}
            onSave={handleSaveOwnerOp}
            onClose={() => {
              setShowWizard(false);
              setSelectedOwnerOp(null);
            }}
            isLoading={createOwnerOpMutation.isPending || updateOwnerOpMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}