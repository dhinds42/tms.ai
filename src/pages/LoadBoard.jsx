import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import LoadCard from "../components/loadboard/LoadCard";
import CreateLoadModal from "../components/loadboard/CreateLoadModal";
import LoadFilters from "../components/loadboard/LoadFilters";

export default function LoadBoard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const createLoadMutation = useMutation({
    mutationFn: (loadData) => base44.entities.Load.create(loadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      setShowCreateModal(false);
    },
  });

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      setSelectedLoad(null);
    },
  });

  const handleCreateLoad = (loadData) => {
    createLoadMutation.mutate({
      ...loadData,
      mode: operatingMode,
      status: 'available'
    });
  };

  const handleUpdateLoad = (loadData) => {
    if (selectedLoad) {
      updateLoadMutation.mutate({ id: selectedLoad.id, data: loadData });
    }
  };

  // Filter loads
  const filteredLoads = loads.filter(load => {
    const statusMatch = statusFilter === 'all' || load.status === statusFilter;
    const equipmentMatch = equipmentFilter === 'all' || load.equipment_type === equipmentFilter;
    const searchMatch = searchTerm === '' || 
      load.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.dropoff_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.commodity?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && equipmentMatch && searchMatch;
  });

  const statusCounts = {
    all: loads.length,
    available: loads.filter(l => l.status === 'available').length,
    assigned: loads.filter(l => ['assigned', 'dispatched'].includes(l.status)).length,
    in_transit: loads.filter(l => ['picked_up', 'in_transit'].includes(l.status)).length,
    delivered: loads.filter(l => l.status === 'delivered').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Load Board
            </h1>
            <p className="text-slate-600 mt-2">
              Manage and track all loads in your {operatingMode} operation
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedLoad(null);
              setShowCreateModal(true);
            }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Load
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by city, load #, or commodity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-indigo-500"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-indigo-50 border-indigo-300' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <LoadFilters
              equipmentFilter={equipmentFilter}
              setEquipmentFilter={setEquipmentFilter}
            />
          )}

          {/* Status Tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mt-4">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">
                All ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="available">
                Available ({statusCounts.available})
              </TabsTrigger>
              <TabsTrigger value="assigned">
                Assigned ({statusCounts.assigned})
              </TabsTrigger>
              <TabsTrigger value="in_transit">
                In Transit ({statusCounts.in_transit})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Delivered ({statusCounts.delivered})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Load Cards */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-600">Loading loads...</p>
          </div>
        ) : filteredLoads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No loads found</h3>
            <p className="text-slate-600 mb-6">Create your first load to get started</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Load
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLoads.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                onEdit={(load) => {
                  setSelectedLoad(load);
                  setShowCreateModal(true);
                }}
                onUpdateStatus={(status) => {
                  updateLoadMutation.mutate({ id: load.id, data: { status } });
                }}
                mode={operatingMode}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <CreateLoadModal
            load={selectedLoad}
            onSave={selectedLoad ? handleUpdateLoad : handleCreateLoad}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedLoad(null);
            }}
            isLoading={createLoadMutation.isPending || updateLoadMutation.isPending}
            mode={operatingMode}
          />
        )}

      </div>
    </div>
  );
}