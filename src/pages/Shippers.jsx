import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2, TrendingUp, DollarSign, Shield, Download, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader, EmptyState, SkeletonCard, StandardTabs } from "@/components/design-system";

import ShipperCard from "../components/shippers/ShipperCard.jsx";
import CreateShipperModal from "../components/shippers/CreateShipperModal.jsx";
import ShipperPerformance from "../components/shippers/ShipperPerformance.jsx";
import ShipperCRM from "../components/shippers/ShipperCRM.jsx";
import CreditCheckModule from "../components/shippers/CreditCheckModule.jsx";
import ContractManagement from "../components/shippers/ContractManagement.jsx";

export default function Shippers() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();

  const { data: shippers, isLoading } = useScopedEntity('Shipper', { limit: 100 });
  const { data: loads, isLoading: loadsLoading } = useScopedEntity('Load', { limit: 100 });

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

  const filteredShippers = (shippers ?? []).filter(shipper => {
    const searchMatch = searchTerm === '' || 
      shipper.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const activeShippers = (shippers ?? []).filter(s => s.status === 'active');
  const totalRevenue = (shippers ?? []).reduce((sum, s) => sum + (s.total_revenue || 0), 0);
  const avgRating = (shippers ?? []).length > 0
    ? ((shippers ?? []).reduce((sum, s) => sum + (s.rating || 0), 0) / shippers.length).toFixed(1)
    : 0;

  const pendingShippers = (shippers ?? []).filter(s => s.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Shippers"
        subtitle="Customer lifecycle, credit checks, and contracts"
        icon={Building2}
        primaryAction={{
          label: 'Create Shipper',
          icon: Plus,
          onClick: () => {
            setSelectedShipper(null);
            setShowCreateModal(true);
          }
        }}
        secondaryActions={[
          { label: 'Export', icon: Download, onClick: () => alert('Export coming soon') },
          { label: 'Import', icon: Upload, onClick: () => alert('Import coming soon') }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

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
        <StandardTabs
          tabs={[
            { key: 'all', label: 'All Shippers', icon: Building2 },
            { key: 'crm', label: 'CRM', icon: TrendingUp },
            { key: 'credit', label: 'Credit Checks', icon: Shield },
            { key: 'contracts', label: 'Contracts', icon: null },
            { key: 'performance', label: 'Performance', icon: null }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden">
          <TabsList className="hidden"></TabsList>

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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : filteredShippers.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No shippers found"
                description={searchTerm ? 'Try adjusting your search' : 'Create your first shipper to start tracking customer relationships'}
                action={{
                  label: 'Create Shipper',
                  icon: Plus,
                  onClick: () => setShowCreateModal(true)
                }}
              />
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
            <ShipperCRM shippers={shippers ?? []} loads={loads ?? []} isLoading={isLoading} operatingMode={operatingMode} />
          </TabsContent>

          {/* Credit Checks Tab */}
          <TabsContent value="credit">
            <CreditCheckModule shippers={shippers ?? []} isLoading={isLoading} operatingMode={operatingMode} />
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts">
            <ContractManagement shippers={shippers ?? []} isLoading={isLoading} operatingMode={operatingMode} />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <ShipperPerformance shippers={shippers ?? []} loads={loads ?? []} isLoading={isLoading || loadsLoading} />
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