import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2, TrendingUp, DollarSign, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import ShipperCard from "../components/shippers/ShipperCard";
import CreateShipperModal from "../components/shippers/CreateShipperModal";
import ShipperPerformance from "../components/shippers/ShipperPerformance";
import ShipperCRM from "../components/shippers/ShipperCRM";
import CreditCheckModule from "../components/shippers/CreditCheckModule";
import ContractManagement from "../components/shippers/ContractManagement";

export default function Shippers() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();

  const { data: shippers, isLoading } = useQuery({
    queryKey: ['shippers'],
    queryFn: () => base44.entities.Shipper.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const createShipperMutation = useMutation({
    mutationFn: (shipperData) => base44.entities.Shipper.create(shipperData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippers'] });
      setShowCreateModal(false);
    },
  });

  const updateShipperMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Shipper.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippers'] });
      setSelectedShipper(null);
    },
  });

  const handleCreateShipper = (shipperData) => {
    createShipperMutation.mutate(shipperData);
  };

  const handleUpdateShipper = (shipperData) => {
    if (selectedShipper) {
      updateShipperMutation.mutate({ id: selectedShipper.id, data: shipperData });
    }
  };

  const filteredShippers = shippers.filter(shipper => {
    const searchMatch = searchTerm === '' || 
      shipper.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const activeShippers = shippers.filter(s => s.status === 'active');
  const totalRevenue = shippers.reduce((sum, s) => sum + (s.total_revenue || 0), 0);
  const avgRating = shippers.length > 0
    ? (shippers.reduce((sum, s) => sum + (s.rating || 0), 0) / shippers.length).toFixed(1)
    : 0;

  const pendingShippers = shippers.filter(s => s.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Shipper Management & CRM
            </h1>
            <p className="text-slate-600 mt-2">
              Complete shipper lifecycle - setup, credit check, contracts & relationship management
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedShipper(null);
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Shipper
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Shippers</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{activeShippers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Rating</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{avgRating}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Approval</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingShippers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="all">All Shippers</TabsTrigger>
            <TabsTrigger value="crm">CRM & Details</TabsTrigger>
            <TabsTrigger value="credit">Credit Checks</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* All Shippers Tab */}
          <TabsContent value="all" className="space-y-6">
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search shippers by name, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Shipper Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-slate-600">Loading shippers...</p>
              </div>
            ) : filteredShippers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No shippers found</h3>
                <p className="text-slate-600 mb-6">Add your first shipper to start tracking customer relationships</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shipper
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredShippers.map((shipper) => (
                  <ShipperCard
                    key={shipper.id}
                    shipper={shipper}
                    onEdit={(shipper) => {
                      setSelectedShipper(shipper);
                      setShowCreateModal(true);
                    }}
                    operatingMode={operatingMode}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* CRM Tab */}
          <TabsContent value="crm">
            <ShipperCRM shippers={shippers} loads={loads} isLoading={isLoading} operatingMode={operatingMode} />
          </TabsContent>

          {/* Credit Checks Tab */}
          <TabsContent value="credit">
            <CreditCheckModule shippers={shippers} isLoading={isLoading} operatingMode={operatingMode} />
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <ContractManagement shippers={shippers} isLoading={isLoading} operatingMode={operatingMode} />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <ShipperPerformance shippers={shippers} loads={loads} isLoading={isLoading || loadsLoading} />
          </TabsContent>
        </Tabs>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateShipperModal
            shipper={selectedShipper}
            onSave={selectedShipper ? handleUpdateShipper : handleCreateShipper}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedShipper(null);
            }}
            isLoading={createShipperMutation.isPending || updateShipperMutation.isPending}
            operatingMode={operatingMode}
          />
        )}

      </div>
    </div>
  );
}