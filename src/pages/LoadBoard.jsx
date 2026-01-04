import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toLoadCreatePayload } from "@/components/utils/loadFieldMapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgQueryKey } from "@/components/hooks/useOrgQueryKey";
import { scopedList } from "@/components/api/scopedEntities";
import { useCurrentOrgId } from "@/components/hooks/useCurrentOrg";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Truck, MapPin, BarChart2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, EmptyState } from "@/components/design-system";

import LoadCard from "../components/loadboard/LoadCard";
import CreateLoadModal from "../components/loadboard/CreateLoadModal";
import LoadFilters from "../components/loadboard/LoadFilters";
import RateEngine from "../components/loadboard/RateEngine";
import AIRouteOptimization from "../components/route/AIRouteOptimization";
import LoadAnalytics from "../components/loadboard/LoadAnalytics";
import BulkLoadActions from "../components/loadboard/BulkLoadActions";
import LoadMap from "../components/loadboard/LoadMap";
import LoadShortcutsMenu from "../components/loadboard/LoadShortcutsMenu";
import AutomatedPerformanceEngine from "../components/carriers/AutomatedPerformanceEngine";
import AutomatedLoadMatching from "../components/matching/AutomatedLoadMatching";
import AIDispatchAutomation from "../components/dispatch/AIDispatchAutomation";
import LoadConsolidationEngine from "../components/consolidation/LoadConsolidationEngine";

// New Load Management Components
import StatusIndicatorBar from "../components/load-management/StatusIndicatorBar";
import QuickActionsBar from "../components/load-management/QuickActionsBar";
import AccountingSummaryPanel from "../components/load-management/AccountingSummaryPanel";
import ActivityPlanningWidget from "../components/load-management/ActivityPlanningWidget";
import ResourceAllocationWidget from "../components/load-management/ResourceAllocationWidget";
import AIRecommendationsPanel from "../components/load-management/AIRecommendationsPanel";

// Shortcut Modals
import RequestDocsModal from "../components/loadboard/modals/RequestDocsModal";
import SendTrackingModal from "../components/loadboard/modals/SendTrackingModal";
import LogCheckCallModal from "../components/loadboard/modals/LogCheckCallModal";
import PostToLoadBoardsModal from "../components/loadboard/modals/PostToLoadBoardsModal";
import ViewLoadLogModal from "../components/loadboard/modals/ViewLoadLogModal";
import AssignDriverModal from "../components/loadboard/modals/AssignDriverModal";
import AssignCarrierModal from "../components/loadboard/modals/AssignCarrierModal";

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

  // Shortcut Modals State
  const [requestDocsLoad, setRequestDocsLoad] = useState(null);
  const [sendTrackingLoad, setSendTrackingLoad] = useState(null);
  const [logCheckCallLoad, setLogCheckCallLoad] = useState(null);
  const [postToLoadBoardsLoad, setPostToLoadBoardsLoad] = useState(null);
  const [viewLogLoad, setViewLogLoad] = useState(null);
  const [assignDriverLoad, setAssignDriverLoad] = useState(null);
  const [assignCarrierLoad, setAssignCarrierLoad] = useState(null);

  const queryClient = useQueryClient();
  const orgId = useCurrentOrgId();
  const loadsKey = useOrgQueryKey('loads');
  const driversKey = useOrgQueryKey('drivers');
  const carriersKey = useOrgQueryKey('carriers');
  const complianceKey = useOrgQueryKey('compliance');

  const { data: loads, isLoading } = useQuery({
    queryKey: loadsKey,
    queryFn: () => scopedList(base44.entities.Load, orgId, { sort: '-created_date', limit: 100 }),
    initialData: [],
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: driversKey,
    queryFn: () => scopedList(base44.entities.Driver, orgId, { sort: '-created_date', limit: 100 }),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: carriersKey,
    queryFn: () => scopedList(base44.entities.Carrier, orgId, { sort: '-created_date', limit: 100 }),
    initialData: [],
  });

  const { data: complianceItems } = useQuery({
    queryKey: complianceKey,
    queryFn: () => scopedList(base44.entities.ComplianceItem, orgId, { sort: '-created_date', limit: 200 }),
    initialData: [],
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null,
  });

  const createLoadMutation = useMutation({
    mutationFn: (loadData) => base44.entities.Load.create(toLoadCreatePayload(loadData)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loadsKey });
      setShowCreateModal(false);
    },
  });

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loadsKey });
      setSelectedLoad(null);
    },
  });

  // Shortcut Handlers
  const handleEditLoad = (load) => {
    setSelectedLoad(load);
    setShowCreateModal(true);
  };

  const handleViewDocs = (load) => {
    alert(`View documents for Load ${load.load_number || load.id.slice(0, 8)}`);
    // In production, navigate to documents page or open document viewer
  };

  const handleRequestDocs = (load) => {
    setRequestDocsLoad(load);
  };

  const handleManageRoles = (load) => {
    alert(`Manage roles for Load ${load.load_number || load.id.slice(0, 8)}`);
    // In production, open role management modal
  };

  const handleSendTracking = (load) => {
    setSendTrackingLoad(load);
  };

  const handleEnableAutoTracking = (load) => {
    updateLoadMutation.mutate({
      id: load.id,
      data: { ...load, auto_tracking_enabled: true }
    });
    alert('Auto-tracking enabled for this load');
  };

  const handleSendTextMessage = (load) => {
    alert(`Send text message for Load ${load.load_number || load.id.slice(0, 8)}`);
    // In production, open SMS modal
  };

  const handleSendLoadDetails = (load) => {
    alert(`Send load details for Load ${load.load_number || load.id.slice(0, 8)}`);
    // In production, open email composer with load details
  };

  const handleLogCheckCall = (load) => {
    setLogCheckCallLoad(load);
  };

  const handleViewLog = (load) => {
    setViewLogLoad(load);
  };

  const handlePostLoad = (load) => {
    setPostToLoadBoardsLoad(load);
  };

  const handleSearchLoadBoards = (load) => {
    alert(`Search load boards for carriers for Load ${load.load_number || load.id.slice(0, 8)}`);
    // In production, navigate to load board search with pre-filled criteria
  };

  const handleSwitchBranch = (load) => {
    const newBranch = prompt('Enter new branch name:');
    if (newBranch) {
      updateLoadMutation.mutate({
        id: load.id,
        data: { ...load, branch: newBranch }
      });
    }
  };

  const handleCopyLoad = (load) => {
    const { id, created_date, updated_date, load_number, ...loadData } = load;
    createLoadMutation.mutate({
      ...loadData,
      load_number: null // Will generate new load number
    });
    alert('Load copied successfully');
  };

  const handleSendToAccounting = (load) => {
    updateLoadMutation.mutate({
      id: load.id,
      data: { ...load, status: 'invoiced', invoice_status: 'pending' }
    });
    alert('Load sent to accounting');
  };

  const handleArchiveLoad = (load) => {
    if (confirm('Archive this load?')) {
      updateLoadMutation.mutate({
        id: load.id,
        data: { ...load, archived: true, status: 'archived' }
      });
    }
  };

  const handleCancelLoad = (load) => {
    if (confirm('Cancel this load? This action cannot be undone.')) {
      updateLoadMutation.mutate({
        id: load.id,
        data: { ...load, status: 'cancelled' }
      });
    }
  };

  const handleAssignDriver = (load) => {
    setAssignDriverLoad(load);
  };

  const handleAssignCarrier = (load) => {
    setAssignCarrierLoad(load);
  };

  // Shortcut Action Handlers (for modals)
  const handleSendDocsRequest = (data) => {
    alert(`Document request sent to driver for ${data.documents_requested.join(', ')}`);
    // In production, send actual request via API
    setRequestDocsLoad(null);
  };

  const handleSendTrackingMessage = (data) => {
    alert(`Tracking message sent to ${data.recipients.join(', ')}`);
    // In production, send actual tracking message
    setSendTrackingLoad(null);
  };

  const handleSaveCheckCall = (data) => {
    alert(`Check call logged for Load ${data.load_id}`);
    // In production, save to database
    setLogCheckCallLoad(null);
  };

  const handlePostToBoards = (data) => {
    updateLoadMutation.mutate({
      id: data.load_id,
      data: { external_posted: true, posted_rate: data.posted_rate, posted_boards: data.boards }
    });
    alert(`Load posted to ${data.boards.length} load board(s)`);
    setPostToLoadBoardsLoad(null);
  };

  const handleDriverAssignment = (data) => {
    updateLoadMutation.mutate({
      id: data.load_id,
      data: { driver_id: data.driver_id, status: 'assigned' }
    });
    alert('Driver assigned successfully');
    setAssignDriverLoad(null);
  };

  const handleCarrierAssignment = (data) => {
    updateLoadMutation.mutate({
      id: data.load_id,
      data: { carrier_id: data.carrier_id, status: 'tendered' }
    });
    alert('Carrier assigned successfully');
    setAssignCarrierLoad(null);
  };

  const handleCreateLoad = (loadData) => {
    const pickupDate = loadData.pickup_date || new Date().toISOString().split('T')[0];
    const deliveryDate = loadData.delivery_date || new Date().toISOString().split('T')[0];
    
    createLoadMutation.mutate({
      ...loadData,
      pickup_date: pickupDate,
      delivery_date: deliveryDate,
      planned_pickup_datetime: pickupDate,
      planned_delivery_datetime: deliveryDate,
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

  // Tab-based load filtering
  const getLoadsByTab = (tab) => {
    switch(tab) {
      case 'active':
        return loads.filter(l => ['dispatched', 'picked_up', 'in_transit', 'assigned'].includes(l.status));
      case 'planning':
        return loads.filter(l => ['available', 'tendered', 'booked'].includes(l.status));
      case 'accounting':
        return loads.filter(l => ['delivered', 'invoiced'].includes(l.status) || l.invoice_status === 'paid');
      case 'misc':
        return loads.filter(l => l.status === 'cancelled');
      case 'ltl':
        return loads.filter(l => l.equipment_type === 'cargo_van' || l.equipment_type === 'sprinter');
      case 'my':
        return loads.filter(l => l.created_by === currentUser?.email);
      case 'external':
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

  // Computed values
  const unassignedCount = loads.filter(l => !l.driver_id && !l.carrier_id && ['available', 'tendered'].includes(l.status)).length;

  const handleAIAction = (action) => {
    switch(action) {
      case 'smart-match':
        // Navigate to smart matching or trigger modal
        alert('Opening Smart Load Matching...');
        break;
      case 'view-delayed':
        setActiveTab('active');
        setSearchTerm('');
        break;
      case 'view-urgent':
        setActiveTab('all');
        break;
      case 'invoice':
        setActiveTab('accounting');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Background Services */}
      <AutomatedPerformanceEngine 
        carriers={carriers} 
        loads={loads}
        complianceItems={complianceItems}
        enabled={true}
      />
      <AutomatedLoadMatching
        loads={loads}
        carriers={carriers}
        complianceItems={complianceItems}
        enabled={true}
        autoAssign={false}
      />
      
      <PageHeader
        title="Loads"
        subtitle={`${loads.length} total • ${unassignedCount} unassigned`}
        icon={Truck}
        primaryAction={{
          label: 'Create Load',
          icon: Plus,
          onClick: () => setShowCreateModal(true)
        }}
        secondaryActions={[
          { label: 'Export Loads', icon: Download, onClick: () => alert('Export coming soon') },
          { label: 'Smart Match', icon: BarChart2, onClick: () => handleAIAction('smart-match') }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-4">

        {/* Quick Actions Bar - Sticky */}
        <QuickActionsBar
          onCreateLoad={() => setShowCreateModal(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: loadsKey })}
          showFilters={showFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onSmartMatch={() => handleAIAction('smart-match')}
          unassignedCount={unassignedCount}
        />

        {/* Status Indicator Bar */}
        <StatusIndicatorBar 
          loads={loads} 
          onFilterByStatus={(status) => {
            if (status === 'active') setActiveTab('active');
            else if (status === 'pending') setActiveTab('planning');
            else if (status === 'completed' || status === 'invoiced') setActiveTab('accounting');
            else if (status === 'cancelled') setActiveTab('misc');
            else setActiveTab('all');
          }}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          
          {/* Left Column - Widgets */}
          <div className="xl:col-span-1 space-y-4">
            <LoadConsolidationEngine 
              loads={loads} 
              onConsolidate={(consolidatedLoads) => {
                alert(`Consolidating ${consolidatedLoads.length} loads...`);
              }}
            />
            <AIDispatchAutomation
              loads={loads}
              drivers={drivers}
              carriers={carriers}
              enabled={true}
            />
            <AIRecommendationsPanel 
              loads={loads} 
              drivers={drivers} 
              onAction={handleAIAction}
            />
            <ResourceAllocationWidget drivers={drivers} loads={loads} />
          </div>

          {/* Middle Column - Main Load List */}
          <div className="xl:col-span-2 space-y-4">
            {/* Analytics - Compact */}
            <LoadAnalytics loads={loads} operatingMode={operatingMode} />

            {/* Filters */}
            {showFilters && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-3">
                  <LoadFilters
                    equipmentFilter={equipmentFilter}
                    setEquipmentFilter={setEquipmentFilter}
                  />
                </CardContent>
              </Card>
            )}

            {/* Tab Navigation - Compact */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-slate-100 grid grid-cols-4 md:grid-cols-8 gap-0.5 h-auto p-1">
                    <TabsTrigger value="active" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
                      Active <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.active}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="planning" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
                      Plan <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.planning}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="accounting" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
                      Acct <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.accounting}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="misc" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
                      Misc <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.misc}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="ltl" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
                      LTL <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.ltl}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="my" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
                      Mine <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.my}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="external" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
                      Ext <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.external}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="all" className="text-xs py-1.5 px-2 data-[state=active]:bg-white">
                      All <Badge variant="secondary" className="ml-1 text-xs scale-90">{tabCounts.all}</Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedLoads.length > 0 && (
              <BulkLoadActions
                selectedLoads={selectedLoads}
                loads={filteredLoads}
                onClearSelection={() => setSelectedLoads([])}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: loadsKey })}
              />
            )}

            {/* AI Route Optimizer */}
            {loadToOptimize && (
              <AIRouteOptimization
                load={loadToOptimize}
                onOptimize={(routeData) => {
                  handleRouteOptimized({
                    load_id: loadToOptimize.id,
                    estimated_arrival: new Date(Date.now() + routeData.time_hours * 3600000).toISOString(),
                    distance_miles_actual: routeData.distance_miles,
                    fuel_cost_estimate: routeData.fuel_cost
                  });
                }}
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
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-0">
                  <LoadMap loads={filteredLoads} />
                </CardContent>
              </Card>
            )}

            {/* Load Cards/List View */}
            {(viewMode === 'list' || viewMode === 'grid') && (
              <>
                {isLoading || driversLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p className="mt-3 text-sm" style={{ color: 'var(--text-primary)' }}>Loading loads...</p>
                  </div>
                ) : filteredLoads.length === 0 ? (
                  <EmptyState
                    icon={Truck}
                    title="No loads found"
                    description={searchTerm || equipmentFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Create your first load to get started'}
                    action={!searchTerm && {
                      label: 'Create Load',
                      icon: Plus,
                      onClick: () => setShowCreateModal(true)
                    }}
                  />
                ) : (
                  <>
                    {/* Select All & Count */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedLoads.length === filteredLoads.length && filteredLoads.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                        <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                          {selectedLoads.length > 0 
                            ? `${selectedLoads.length} selected`
                            : `${filteredLoads.length} loads`}
                        </span>
                      </div>
                    </div>

                    {/* Load Cards Grid */}
                    <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-1' : 'grid-cols-1'}`}>
                      {filteredLoads.map((load) => (
                        <div key={load.id} className="relative group">
                          <div className="absolute top-3 right-3 z-10">
                            <LoadShortcutsMenu
                              load={load}
                              operatingMode={operatingMode}
                              onEditLoad={handleEditLoad}
                              onViewDocs={handleViewDocs}
                              onRequestDocs={handleRequestDocs}
                              onManageRoles={handleManageRoles}
                              onSendTracking={handleSendTracking}
                              onEnableAutoTracking={handleEnableAutoTracking}
                              onSendTextMessage={handleSendTextMessage}
                              onSendLoadDetails={handleSendLoadDetails}
                              onLogCheckCall={handleLogCheckCall}
                              onViewLog={handleViewLog}
                              onPostLoad={handlePostLoad}
                              onSearchLoadBoards={handleSearchLoadBoards}
                              onSwitchBranch={handleSwitchBranch}
                              onCopyLoad={handleCopyLoad}
                              onSendToAccounting={handleSendToAccounting}
                              onArchiveLoad={handleArchiveLoad}
                              onCancelLoad={handleCancelLoad}
                              onAssignDriver={handleAssignDriver}
                              onAssignCarrier={handleAssignCarrier}
                              onOptimizeRoute={() => setLoadToOptimize(load)}
                              onAnalyzeRate={() => setLoadForRating(load)}
                            />
                          </div>
                          <LoadCard
                            load={load}
                            onSelect={() => handleSelectLoad(load.id)}
                            isSelected={selectedLoads.includes(load.id)}
                            operatingMode={operatingMode}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Column - Planning & Financial */}
          <div className="xl:col-span-1 space-y-4">
            <ActivityPlanningWidget loads={loads} />
            <AccountingSummaryPanel loads={loads} />
          </div>
        </div>

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

      {/* Shortcut Modals */}
      {requestDocsLoad && (
          <RequestDocsModal
            load={requestDocsLoad}
            onClose={() => setRequestDocsLoad(null)}
            onSend={handleSendDocsRequest}
            driverName={drivers.find(d => d.id === requestDocsLoad.driver_id)?.full_name}
          />
        )}

      {sendTrackingLoad && (
          <SendTrackingModal
            load={sendTrackingLoad}
            onClose={() => setSendTrackingLoad(null)}
            onSend={handleSendTrackingMessage}
          />
        )}

      {logCheckCallLoad && (
          <LogCheckCallModal
            load={logCheckCallLoad}
            onClose={() => setLogCheckCallLoad(null)}
            onSave={handleSaveCheckCall}
          />
        )}

      {postToLoadBoardsLoad && (
          <PostToLoadBoardsModal
            load={postToLoadBoardsLoad}
            onClose={() => setPostToLoadBoardsLoad(null)}
            onPost={handlePostToBoards}
          />
        )}

      {viewLogLoad && (
          <ViewLoadLogModal
            load={viewLogLoad}
            onClose={() => setViewLogLoad(null)}
          />
        )}

      {assignDriverLoad && (
          <AssignDriverModal
            load={assignDriverLoad}
            drivers={drivers}
            onClose={() => setAssignDriverLoad(null)}
            onAssign={handleDriverAssignment}
          />
        )}

      {assignCarrierLoad && (
          <AssignCarrierModal
            load={assignCarrierLoad}
            carriers={carriers}
            onClose={() => setAssignCarrierLoad(null)}
            onAssign={handleCarrierAssignment}
          />
        )}

      </div>
    </div>
  );
}