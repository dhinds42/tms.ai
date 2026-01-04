import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgQueryKey } from "@/components/hooks/useOrgQueryKey";
import { scopedList } from "@/components/api/scopedEntities";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutomatedDriverScoring from "../components/drivers/AutomatedDriverScoring";
import { Plus, Search, Navigation, Clock, TrendingUp, Users, Download, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, EmptyState, SkeletonCard } from "@/components/design-system";

import DriverCard from "../components/drivers/DriverCard";
import CreateDriverModal from "../components/drivers/CreateDriverModal";
import DriverHOSDashboard from "../components/drivers/DriverHOSDashboard";
import DriverCommunicationHub from "../components/communication/DriverCommunicationHub";
import PredictiveMaintenanceAlerts from "../components/maintenance/PredictiveMaintenanceAlerts";
import DriverPerformanceLeaderboard from "../components/drivers/DriverPerformanceLeaderboard";

export default function Drivers() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  const driversKey = useOrgQueryKey('drivers');
  const loadsKey = useOrgQueryKey('loads');
  const complianceKey = useOrgQueryKey('compliance');

  const { data: drivers, isLoading } = useQuery({
    queryKey: driversKey,
    queryFn: () => scopedList(base44.entities.Driver, orgId, { sort: '-created_date', limit: 100 }),
    initialData: [],
  });

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: loadsKey,
    queryFn: () => scopedList(base44.entities.Load, orgId, { sort: '-created_date', limit: 500 }),
    initialData: [],
  });

  const { data: complianceItems } = useQuery({
    queryKey: complianceKey,
    queryFn: () => scopedList(base44.entities.ComplianceItem, orgId, { sort: '-created_date', limit: 200 }),
    initialData: [],
  });

  const createDriverMutation = useMutation({
    mutationFn: (driverData) => base44.entities.Driver.create(driverData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setShowCreateModal(false);
    },
  });

  const updateDriverMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Driver.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setSelectedDriver(null);
    },
  });

  const handleCreateDriver = (driverData) => {
    createDriverMutation.mutate(driverData);
  };

  const handleUpdateDriver = (driverData) => {
    if (selectedDriver) {
      updateDriverMutation.mutate({ id: selectedDriver.id, data: driverData });
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const searchMatch = searchTerm === '' || 
      driver.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.cdl_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const activeDrivers = drivers.filter(d => ['available', 'on_load'].includes(d.status));
  const avgHOS = drivers.length > 0 
    ? (drivers.reduce((sum, d) => sum + (d.hos_remaining || 0), 0) / drivers.length).toFixed(1)
    : 0;
  const avgOnTime = drivers.length > 0
    ? (drivers.reduce((sum, d) => sum + (d.on_time_percentage || 0), 0) / drivers.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background Automated Driver Scoring */}
      <AutomatedDriverScoring 
        drivers={drivers} 
        loads={loads}
        complianceItems={complianceItems}
        enabled={true}
      />
      
      <PageHeader
        title="Drivers"
        subtitle="Monitor availability, HOS compliance, and performance"
        icon={Users}
        primaryAction={{
          label: 'Create Driver',
          icon: Plus,
          onClick: () => {
            setSelectedDriver(null);
            setShowCreateModal(true);
          }
        }}
        secondaryActions={[
          { label: 'Export Drivers', icon: Download, onClick: () => alert('Export coming soon') },
          { label: 'Import Drivers', icon: Upload, onClick: () => alert('Import coming soon') }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Drivers</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{activeDrivers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg HOS Remaining</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{avgHOS}h</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg On-Time %</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{avgOnTime}%</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Leaderboard */}
        <DriverPerformanceLeaderboard drivers={drivers} isLoading={isLoading} />

        {/* HOS Dashboard */}
        <DriverHOSDashboard drivers={drivers} loads={loads} isLoading={isLoading || loadsLoading} />

        {/* Driver Communication Hub */}
        <DriverCommunicationHub drivers={drivers} loads={loads} />

        {/* Predictive Maintenance Alerts */}
        <PredictiveMaintenanceAlerts drivers={drivers} loads={loads} />

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search drivers by name, phone, or CDL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Driver Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredDrivers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No drivers found"
            description={searchTerm ? 'Try adjusting your search' : 'Create your first driver to start managing your fleet'}
            action={{
              label: 'Create Driver',
              icon: Plus,
              onClick: () => setShowCreateModal(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDrivers.map((driver) => (
              <DriverCard
                key={driver.id}
                driver={driver}
                onEdit={(driver) => {
                  setSelectedDriver(driver);
                  setShowCreateModal(true);
                }}
                onUpdateHOS={(hosRemaining) => {
                  updateDriverMutation.mutate({
                    id: driver.id,
                    data: { hos_remaining: hosRemaining }
                  });
                }}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateDriverModal
            driver={selectedDriver}
            onSave={selectedDriver ? handleUpdateDriver : handleCreateDriver}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedDriver(null);
            }}
            isLoading={createDriverMutation.isPending || updateDriverMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}