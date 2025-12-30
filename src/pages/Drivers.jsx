import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutomatedDriverScoring from "../components/drivers/AutomatedDriverScoring";
import { Plus, Search, Navigation, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import DriverCard from "../components/drivers/DriverCard";
import CreateDriverModal from "../components/drivers/CreateDriverModal";
import DriverHOSDashboard from "../components/drivers/DriverHOSDashboard";

export default function Drivers() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
  });

  const { data: complianceItems } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.ComplianceItem.list('-created_date', 200),
    initialData: [],
  });

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      {/* Background Automated Driver Scoring */}
      <AutomatedDriverScoring 
        drivers={drivers} 
        loads={loads}
        complianceItems={complianceItems}
        enabled={true}
      />
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
              Driver Management
            </h1>
            <p className="text-slate-600 mt-2">
              Monitor driver availability, HOS compliance, and route optimization
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedDriver(null);
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>

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

        {/* HOS Dashboard */}
        <DriverHOSDashboard drivers={drivers} loads={loads} isLoading={isLoading || loadsLoading} />

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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            <p className="mt-4 text-slate-600">Loading drivers...</p>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <Navigation className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No drivers found</h3>
            <p className="text-slate-600 mb-6">Add your first driver to start managing your fleet</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </div>
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