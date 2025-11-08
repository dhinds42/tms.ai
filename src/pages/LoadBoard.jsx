import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Truck, MapPin, Sparkles, BarChart3, Copy, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [loadToOptimize, setLoadToOptimize] = useState(null);
  const [loadForRating, setLoadForRating] = useState(null);
  const [selectedLoads, setSelectedLoads] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [copiedField, setCopiedField] = useState(null);

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

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null,
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

  const handleCopyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleQuickAction = (action, load) => {
    switch(action) {
      case 'edit':
        setSelectedLoad(load);
        setShowCreateModal(true);
        break;
      case 'assign':
        // Open assignment dialog
        break;
      case 'dispatch':
        updateLoadMutation.mutate({ id: load.id, data: { status: 'dispatched' } });
        break;
      case 'complete':
        updateLoadMutation.mutate({ id: load.id, data: { status: 'delivered' } });
        break;
      case 'cancel':
        updateLoadMutation.mutate({ id: load.id, data: { status: 'cancelled' } });
        break;
      case 'duplicate':
        const { id, created_date, updated_date, ...loadData } = load;
        createLoadMutation.mutate(loadData);
        break;
      case 'optimize':
        setLoadToOptimize(load);
        break;
      case 'rate':
        setLoadForRating(load);
        break;
      default:
        break;
    }
  };

  // Tab-based load filtering
  const getLoadsByTab = (tab) => {
    switch(tab) {
      case 'active':
        // Dispatched, In Transit, Driver Assigned
        return loads.filter(l => ['dispatched', 'picked_up', 'in_transit', 'assigned'].includes(l.status));
      
      case 'planning':
        // Pending, Booked, Awaiting Confirmation, Needing Driver
        return loads.filter(l => ['available', 'tendered', 'booked'].includes(l.status));
      
      case 'accounting':
        // Delivered, Paid, To Be Billed, Complete
        return loads.filter(l => ['delivered', 'invoiced'].includes(l.status) || l.invoice_status === 'paid');
      
      case 'misc':
        // Cancelled, Claim-Related, custom statuses
        return loads.filter(l => l.status === 'cancelled');
      
      case 'ltl':
        // LTL-specific loads (you can add ltl flag to load entity)
        return loads.filter(l => l.equipment_type === 'cargo_van' || l.equipment_type === 'sprinter');
      
      case 'my':
        // User's assigned loads
        return loads.filter(l => l.created_by === currentUser?.email);
      
      case 'external':
        // Externally posted loads (you can add external_post flag)
        return loads.filter(l => l.external_posted === true);
      
      case 'all':
      default:
        return loads;
    }
  };

  // Apply additional filters
  const filteredLoads = getLoadsByTab(activeTab).filter(load => {
    const equipmentMatch = equipmentFilter === 'all' || load.equipment_type === equipmentFilter;
    const searchMatch = searchTerm === '' ||
      load.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.dropoff_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.commodity?.toLowerCase().includes(searchTerm.toLowerCase());

    return equipmentMatch && searchMatch;
  });

  const tabCounts = {
    active: getLoadsByTab('active').length,
    planning: getLoadsByTab('planning').length,
    accounting: getLoadsByTab('accounting').length,
    misc: getLoadsByTab('misc').length,
    ltl: getLoadsByTab('ltl').length,
    my: getLoadsByTab('my').length,
    external: getLoadsByTab('external').length,
    all: loads.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Load Management
            </h1>
            <p className="text-slate-600 mt-2">
              Command center for tracking and managing loads by status
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

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-slate-100 grid grid-cols-4 md:grid-cols-8 gap-1">
              <TabsTrigger value="active" className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold">Active</span>
                <Badge variant="secondary" className="text-xs">{tabCounts.active}</Badge>
              </TabsTrigger>
              <TabsTrigger value="planning" className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold">Planning</span>
                <Badge variant="secondary" className="text-xs">{tabCounts.planning}</Badge>
              </TabsTrigger>
              <TabsTrigger value="accounting" className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold">Accounting</span>
                <Badge variant="secondary" className="text-xs">{tabCounts.accounting}</Badge>
              </TabsTrigger>
              <TabsTrigger value="misc" className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold">Misc</span>
                <Badge variant="secondary" className="text-xs">{tabCounts.misc}</Badge>
              </TabsTrigger>
              <TabsTrigger value="ltl" className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold">LTL</span>
                <Badge variant="secondary" className="text-xs">{tabCounts.ltl}</Badge>
              </TabsTrigger>
              <TabsTrigger value="my" className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold">My Loads</span>
                <Badge variant="secondary" className="text-xs">{tabCounts.my}</Badge>
              </TabsTrigger>
              <TabsTrigger value="external" className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold">External</span>
                <Badge variant="secondary" className="text-xs">{tabCounts.external}</Badge>
              </TabsTrigger>
              <TabsTrigger value="all" className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold">All</span>
                <Badge variant="secondary" className="text-xs">{tabCounts.all}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content Descriptions */}
            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              {activeTab === 'active' && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">🚛 Active Loads</h3>
                  <p className="text-sm text-slate-600">All loads currently in motion—Dispatched, In Transit, or Driver Assigned. Your real-time view of what's happening now.</p>
                </div>
              )}
              {activeTab === 'planning' && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">📋 Planning Loads</h3>
                  <p className="text-sm text-slate-600">Loads that are in the works—Pending, Booked, Awaiting Confirmation, or Needing a Driver. Perfect for managing what's coming up next.</p>
                </div>
              )}
              {activeTab === 'accounting' && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">💼 Ready for Accounting</h3>
                  <p className="text-sm text-slate-600">Loads marked as Delivered, Paid, To Be Billed, or Complete. Quickly identify which loads are ready for invoicing or payment processing.</p>
                </div>
              )}
              {activeTab === 'misc' && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">📦 Misc. Loads</h3>
                  <p className="text-sm text-slate-600">Loads outside typical workflow—Cancelled, Claim-Related, or custom statuses. Perfect for tracking disputes or special follow-ups.</p>
                </div>
              )}
              {activeTab === 'ltl' && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">🚐 LTL Loads</h3>
                  <p className="text-sm text-slate-600">Build and manage LTL orders fast and simple. Create orders, build loads, and quote direct wholesale rates—all in one place.</p>
                </div>
              )}
              {activeTab === 'my' && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">👤 My Loads</h3>
                  <p className="text-sm text-slate-600">Your personal workspace—only loads you're directly assigned to or responsible for. Stay organized and manage your tasks with clarity.</p>
                </div>
              )}
              {activeTab === 'external' && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">🌐 Externally Posted Loads</h3>
                  <p className="text-sm text-slate-600">All loads posted to third-party load boards like DAT, 123Loadboard, Truckstop.com. Track carrier interest and manage postings from one place.</p>
                </div>
              )}
              {activeTab === 'all' && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">📊 All Loads</h3>
                  <p className="text-sm text-slate-600">Complete view of every load in your system—regardless of status. Full visibility across Active, Planning, Delivered, Cancelled, and everything in between.</p>
                </div>
              )}
            </div>
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

        {/* Load Cards/List View */}
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
                  {searchTerm || equipmentFilter !== 'all'
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

                {/* Enhanced Load Cards with Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredLoads.map((load) => (
                    <div key={load.id} className="relative group">
                      {/* Quick Actions Menu */}
                      <div className="absolute top-4 right-4 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleQuickAction('edit', load)}>
                              Edit Load
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction('duplicate', load)}>
                              Duplicate Load
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleQuickAction('assign', load)}>
                              Assign {operatingMode === 'broker' ? 'Carrier' : 'Driver'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction('dispatch', load)}>
                              Mark as Dispatched
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction('complete', load)}>
                              Mark as Delivered
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleQuickAction('optimize', load)}>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Optimize Route
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleQuickAction('rate', load)}>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Analyze Rate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleQuickAction('cancel', load)}
                              className="text-red-600"
                            >
                              Cancel Load
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Enhanced Load Card with Click-to-See Data */}
                      <Card className="bg-white hover:shadow-2xl transition-shadow duration-300">
                        <CardContent className="p-6">
                          {/* Load Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
                              </h3>
                              <Badge className={
                                load.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                load.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                load.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }>
                                {load.status}
                              </Badge>
                            </div>
                            {operatingMode === 'broker' && (
                              <input
                                type="checkbox"
                                checked={selectedLoads.includes(load.id)}
                                onChange={() => handleSelectLoad(load.id)}
                                className="w-4 h-4 rounded border-slate-300"
                              />
                            )}
                          </div>

                          {/* Click-to-See Data: Locations */}
                          <div className="space-y-3 mb-4">
                            <div 
                              className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200 cursor-pointer hover:shadow-md transition-shadow group"
                              onClick={() => {/* Show location details modal */}}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-semibold text-emerald-700 uppercase">Pickup</p>
                                  <p className="text-sm font-bold text-slate-900 underline decoration-slate-400 decoration-dotted">
                                    {load.pickup_location?.city}, {load.pickup_location?.state}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const text = `${load.pickup_location?.address}, ${load.pickup_location?.city}, ${load.pickup_location?.state} ${load.pickup_location?.zip}`;
                                    handleCopyToClipboard(text, `pickup-${load.id}`);
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              {copiedField === `pickup-${load.id}` && (
                                <span className="text-xs text-emerald-600">Copied!</span>
                              )}
                            </div>

                            <div 
                              className="p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 cursor-pointer hover:shadow-md transition-shadow group"
                              onClick={() => {/* Show location details modal */}}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-semibold text-red-700 uppercase">Dropoff</p>
                                  <p className="text-sm font-bold text-slate-900 underline decoration-slate-400 decoration-dotted">
                                    {load.dropoff_location?.city}, {load.dropoff_location?.state}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const text = `${load.dropoff_location?.address}, ${load.dropoff_location?.city}, ${load.dropoff_location?.state} ${load.dropoff_location?.zip}`;
                                    handleCopyToClipboard(text, `dropoff-${load.id}`);
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              {copiedField === `dropoff-${load.id}` && (
                                <span className="text-xs text-emerald-600">Copied!</span>
                              )}
                            </div>
                          </div>

                          {/* Load Details */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-slate-500">Equipment</p>
                              <p className="font-semibold text-slate-900">{load.equipment_type}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Distance</p>
                              <p className="font-semibold text-slate-900">{load.distance_miles || 'TBD'} mi</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Rate</p>
                              <p className="font-semibold text-emerald-700">${load.customer_rate || 'TBD'}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Margin</p>
                              <p className="font-semibold text-blue-700">${load.margin || 'TBD'}</p>
                            </div>
                          </div>

                          {/* Quick Reference Info - Click to Copy */}
                          {load.reference_number && (
                            <div 
                              className="mt-3 p-2 bg-slate-50 rounded border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                              onClick={() => handleCopyToClipboard(load.reference_number, `ref-${load.id}`)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-600">
                                  Ref: <span className="font-mono underline decoration-slate-400 decoration-dotted">{load.reference_number}</span>
                                </span>
                                <Copy className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {copiedField === `ref-${load.id}` && (
                                <span className="text-xs text-emerald-600">Copied!</span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
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