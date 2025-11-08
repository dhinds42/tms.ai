import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Truck, MapPin, Sparkles, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import LoadCard from "../components/loadboard/LoadCard";
import CreateLoadModal from "../components/loadboard/CreateLoadModal";
import LoadFilters from "../components/loadboard/LoadFilters";
import RouteOptimizer from "../components/loadboard/RouteOptimizer";
import RateEngine from "../components/loadboard/RateEngine";
import LoadAnalytics from "../components/loadboard/LoadAnalytics";
import BulkLoadActions from "../components/loadboard/BulkLoadActions";
import LoadMap from "../components/loadboard/LoadMap";

export default function LoadBoard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [loadToOptimize, setLoadToOptimize] = useState(null);
  const [loadForRating, setLoadForRating] = useState(null);
  const [selectedLoads, setSelectedLoads] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const queryClient = useQueryClient();

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
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

  const handleRouteOptimized = (routeData) => {
    if (routeData.load_id && routeData.recommended_driver_id) {
      updateLoadMutation.mutate({
        id: routeData.load_id,
        data: {
          driver_id: routeData.recommended_driver_id,
          eta: routeData.estimated_arrival,
          status: 'assigned'
        }
      });
    }
    setLoadToOptimize(null);
  };

  const handleRateAccepted = (loadId, rateData) => {
    updateLoadMutation.mutate({
      id: loadId,
      data: {
        customer_rate: rateData.recommended_customer_rate,
        carrier_pay: rateData.recommended_carrier_pay,
        margin: rateData.projected_margin
      }
    });
    setLoadForRating(null);
  };

  const handleSelectLoad = (loadId) => {
    setSelectedLoads(prev => 
      prev.includes(loadId) 
        ? prev.filter(id => id !== loadId)
        : [...prev, loadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLoads.length === filteredLoads.length) {
      setSelectedLoads([]);
    } else {
      setSelectedLoads(filteredLoads.map(l => l.id));
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
              {operatingMode === 'broker' ? 'Enhanced Load Board' : 'Available Loads'}
            </h1>
            <p className="text-slate-600 mt-2">
              {operatingMode === 'broker' 
                ? 'Advanced load management with AI-powered insights'
                : 'Browse and book loads for your fleet'}
            </p>
          </div>
          <div className="flex gap-2">
            {operatingMode === 'broker' && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Load
              </Button>
            )}
          </div>
        </div>

        {/* Analytics Dashboard */}
        <LoadAnalytics loads={loads} operatingMode={operatingMode} />

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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-indigo-50 border-indigo-300' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className="border-slate-300"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {viewMode === 'list' ? 'Map View' : 'List View'}
              </Button>
              {operatingMode === 'broker' && (
                <Button
                  variant="outline"
                  onClick={() => {/* Analytics modal */}}
                  className="border-slate-300"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              )}
            </div>
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

        {/* Bulk Actions */}
        {operatingMode === 'broker' && selectedLoads.length > 0 && (
          <BulkLoadActions
            selectedLoads={selectedLoads}
            loads={filteredLoads}
            onClearSelection={() => setSelectedLoads([])}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['loads'] })}
          />
        )}

        {/* Route Optimizer */}
        {loadToOptimize && (
          <RouteOptimizer
            load={loadToOptimize}
            drivers={drivers}
            onRouteOptimized={handleRouteOptimized}
          />
        )}

        {/* Rate Engine */}
        {loadForRating && (
          <RateEngine
            load={loadForRating}
            onRateAccepted={(rateData) => handleRateAccepted(loadForRating.id, rateData)}
            onClose={() => setLoadForRating(null)}
          />
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <LoadMap loads={filteredLoads} />
        )}

        {/* Load Cards */}
        {viewMode === 'list' && (
          <>
            {isLoading || driversLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-slate-600">Loading loads...</p>
              </div>
            ) : filteredLoads.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
                <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No loads found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || equipmentFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : operatingMode === 'broker' 
                    ? 'Create your first load to get started'
                    : 'No loads available at this time'}
                </p>
                {operatingMode === 'broker' && !searchTerm && (
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Load
                  </Button>
                )}
              </div>
            ) : (
              <>
                {operatingMode === 'broker' && (
                  <div className="flex items-center gap-2 px-4">
                    <input
                      type="checkbox"
                      checked={selectedLoads.length === filteredLoads.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-600">
                      {selectedLoads.length > 0 
                        ? `${selectedLoads.length} loads selected`
                        : 'Select all'}
                    </span>
                  </div>
                )}
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
                      onOptimizeRoute={(load) => setLoadToOptimize(load)}
                      onAnalyzeRate={(load) => setLoadForRating(load)}
                      mode={operatingMode}
                      isSelected={selectedLoads.includes(load.id)}
                      onSelect={() => handleSelectLoad(load.id)}
                      carriers={carriers}
                    />
                  ))}
                </div>
              </>
            )}
          </>
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