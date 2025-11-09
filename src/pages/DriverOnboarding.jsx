import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  FileText,
  TrendingUp,
  Shield
} from "lucide-react";

import CreateDriverModal from "../components/drivers/CreateDriverModal";

export default function DriverOnboarding() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const queryClient = useQueryClient();

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: complianceItems } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date', 100),
    initialData: [],
  });

  const createDriverMutation = useMutation({
    mutationFn: (data) => base44.entities.Driver.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setShowWizard(false);
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Driver.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
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
              <p className="text-red-700">Driver Onboarding is only available in Carrier Mode.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const pendingDrivers = drivers.filter(d => d.status === 'pending_approval' || !d.status);
  const activeDrivers = drivers.filter(d => d.status === 'available' || d.status === 'assigned');
  const avgApprovalTime = '2.5 days'; // Mock data

  const handleApprove = async (driver) => {
    if (confirm(`Approve ${driver.full_name} as a driver?`)) {
      await updateDriverMutation.mutateAsync({
        id: driver.id,
        data: { ...driver, status: 'available' }
      });
      alert(`✅ ${driver.full_name} has been approved and is now available for assignments!`);
    }
  };

  const handleReject = async (driver) => {
    const reason = prompt(`Reason for rejecting ${driver.full_name}:`);
    if (reason) {
      await updateDriverMutation.mutateAsync({
        id: driver.id,
        data: { ...driver, status: 'suspended', notes: `Rejected: ${reason}` }
      });
      alert(`${driver.full_name} has been rejected.`);
    }
  };

  const handleSaveDriver = (driverData) => {
    if (selectedDriver) {
      updateDriverMutation.mutate({ id: selectedDriver.id, data: driverData });
    } else {
      createDriverMutation.mutate({ ...driverData, status: 'pending_approval' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Driver Onboarding
            </h1>
            <p className="text-slate-600 mt-2">
              Streamlined driver onboarding and approval workflow
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedDriver(null);
              setShowWizard(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Driver
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Reviews</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingDrivers.length}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Drivers</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{activeDrivers.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Avg Approval Time</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{avgApprovalTime}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onboarding Queue */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Drivers Pending Approval ({pendingDrivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDrivers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
                <p className="text-slate-600">No drivers pending approval at this time</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDrivers.map(driver => {
                  const driverCompliance = complianceItems.filter(
                    c => c.entity_type === 'driver' && c.entity_id === driver.id
                  );
                  const hasExpiredDocs = driverCompliance.some(c => c.status === 'expired');

                  return (
                    <div key={driver.id} className="p-6 border-2 border-amber-200 bg-amber-50 rounded-xl hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{driver.full_name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-amber-100 text-amber-800">Pending Approval</Badge>
                            {hasExpiredDocs && (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Expired Docs
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                            <div>
                              <p className="text-slate-500">Phone</p>
                              <p className="font-semibold">{driver.phone}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">CDL</p>
                              <p className="font-semibold">{driver.cdl_number}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">CDL Exp</p>
                              <p className="font-semibold">
                                {driver.cdl_expiration ? new Date(driver.cdl_expiration).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500">Medical Card</p>
                              <p className="font-semibold">
                                {driver.medical_card_expiration ? new Date(driver.medical_card_expiration).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(driver)}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Driver
                        </Button>
                        <Button
                          onClick={() => handleReject(driver)}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedDriver(driver);
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

        {/* Active Drivers Summary */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Active Drivers ({activeDrivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDrivers.slice(0, 6).map(driver => (
                <div key={driver.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-slate-900">{driver.full_name}</p>
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                      {driver.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">CDL: {driver.cdl_number}</p>
                  <p className="text-sm text-slate-600">
                    Loads: {driver.total_loads || 0} | On-Time: {driver.on_time_percentage || 0}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Driver Modal */}
        {showWizard && (
          <CreateDriverModal
            driver={selectedDriver}
            onSave={handleSaveDriver}
            onClose={() => {
              setShowWizard(false);
              setSelectedDriver(null);
            }}
            isLoading={createDriverMutation.isPending || updateDriverMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}