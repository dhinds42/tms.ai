import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Truck, TrendingUp, DollarSign, Download, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, EmptyState, SkeletonCard } from "@/components/design-system";

import OwnerOperatorCard from "../components/owner-operators/OwnerOperatorCard";
import CreateOwnerOperatorModal from "../components/owner-operators/CreateOwnerOperatorModal";

export default function OwnerOperators() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOwnerOp, setSelectedOwnerOp] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: ownerOperators, isLoading } = useScopedEntity('OwnerOperator', { limit: 100 });

  const createOwnerOpMutation = useMutation({
    mutationFn: (data) => base44.entities.OwnerOperator.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerOperators'] });
      setShowCreateModal(false);
    },
  });

  const updateOwnerOpMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OwnerOperator.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerOperators'] });
      setSelectedOwnerOp(null);
    },
  });

  const handleCreate = (data) => {
    createOwnerOpMutation.mutate(data);
  };

  const handleUpdate = (data) => {
    if (selectedOwnerOp) {
      updateOwnerOpMutation.mutate({ id: selectedOwnerOp.id, data });
    }
  };

  const filteredOwnerOps = ownerOperators.filter(op => {
    const searchMatch = searchTerm === '' || 
      op.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const activeOwnerOps = ownerOperators.filter(o => o.status === 'active');
  const avgOnTime = ownerOperators.length > 0 
    ? (ownerOperators.reduce((sum, o) => sum + (o.on_time_percentage || 0), 0) / ownerOperators.length).toFixed(1)
    : 0;
  const totalRevenue = ownerOperators.reduce((sum, o) => sum + (o.total_revenue || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Owner Operators"
        subtitle="Manage leased operators, equipment, and compensation"
        icon={Truck}
        primaryAction={{
          label: 'Create Owner Op',
          icon: Plus,
          onClick: () => {
            setSelectedOwnerOp(null);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active OOs</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{activeOwnerOps.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
                  <Truck className="w-6 h-6 text-white" />
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by name, company, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Owner Operators Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : filteredOwnerOps.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No owner operators found"
            description={searchTerm ? 'Try adjusting your search' : 'Create your first owner operator to start managing leased equipment'}
            action={{
              label: 'Create Owner Op',
              icon: Plus,
              onClick: () => setShowCreateModal(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOwnerOps.map((ownerOp) => (
              <OwnerOperatorCard
                key={ownerOp.id}
                ownerOperator={ownerOp}
                onEdit={(ownerOp) => {
                  setSelectedOwnerOp(ownerOp);
                  setShowCreateModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateOwnerOperatorModal
            ownerOperator={selectedOwnerOp}
            onSave={selectedOwnerOp ? handleUpdate : handleCreate}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedOwnerOp(null);
            }}
            isLoading={createOwnerOpMutation.isPending || updateOwnerOpMutation.isPending}
          />
        )}

      </div>
    </div>
  );
}