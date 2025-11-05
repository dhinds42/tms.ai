import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CarrierCard from "../components/carriers/CarrierCard";
import CreateCarrierModal from "../components/carriers/CreateCarrierModal";
import CarrierPerformanceLeaderboard from "../components/carriers/CarrierPerformanceLeaderboard";

export default function Carriers() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: carriers, isLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Carrier Network
            </h1>
            <p className="text-slate-600 mt-2">
              Manage carrier relationships, compliance, and performance
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedCarrier(null);
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Carrier
          </Button>
        </div>

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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading carriers...</p>
          </div>
        ) : filteredCarriers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No carriers found</h3>
            <p className="text-slate-600 mb-6">Add your first carrier to start building your network</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Carrier
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCarriers.map((carrier) => (
              <CarrierCard
                key={carrier.id}
                carrier={carrier}
                onEdit={(carrier) => {
                  setSelectedCarrier(carrier);
                  setShowCreateModal(true);
                }}
              />
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