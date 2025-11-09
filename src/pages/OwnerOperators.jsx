import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Truck, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import OwnerOperatorCard from "../components/owner-operators/OwnerOperatorCard";
import CreateOwnerOperatorModal from "../components/owner-operators/CreateOwnerOperatorModal";

export default function OwnerOperators() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOwnerOp, setSelectedOwnerOp] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  const { data: ownerOperators, isLoading } = useQuery({
    queryKey: ['ownerOperators'],
    queryFn: () => base44.entities.OwnerOperator.list('-created_date', 100),
    initialData: [],
  });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Owner Operators
            </h1>
            <p className="text-slate-600 mt-2">
              Manage leased owner operators, equipment, and compensation
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedOwnerOp(null);
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Owner Operator
          </Button>
        </div>

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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Loading owner operators...</p>
          </div>
        ) : filteredOwnerOps.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No owner operators found</h3>
            <p className="text-slate-600 mb-6">Add your first owner operator to start managing leased equipment</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Owner Operator
            </Button>
          </div>
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