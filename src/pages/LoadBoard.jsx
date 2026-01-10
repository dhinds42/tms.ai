import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toLoadCreatePayload } from "@/components/utils/loadFieldMapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePaginatedEntityList } from "@/components/api/usePaginatedEntityList";
import { useModal, useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent } from "@/components/ui/card";

import CreateLoadModal from "../components/loadboard/CreateLoadModal";
import LoadFilters from "../components/loadboard/LoadFilters";
import RateEngine from "../components/loadboard/RateEngine";
import AIRouteOptimization from "../components/route/AIRouteOptimization";
import LoadAnalytics from "../components/loadboard/LoadAnalytics";
import BulkLoadActions from "../components/loadboard/BulkLoadActions";
import LoadMap from "../components/loadboard/LoadMap";
import LoadBoardHeader from "../components/loadboard/LoadBoardHeader";
import LoadBoardTabs from "../components/loadboard/LoadBoardTabs";
import LoadBoardGrid from "../components/loadboard/LoadBoardGrid";
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
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [selectedLoads, setSelectedLoads] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  // Custom hooks for modals
  const createModal = useModal();
  const routeOptimizeModal = useModal();
  const rateModal = useModal();
  const requestDocsModal = useModal();
  const sendTrackingModal = useModal();
  const logCheckCallModal = useModal();
  const postLoadBoardsModal = useModal();
  const viewLogModal = useModal();
  const assignDriverModal = useModal();
  const assignCarrierModal = useModal();

  const queryClient = useQueryClient();

  const loadsQuery = usePaginatedEntityList({
    key: ["loads"],
    entityApi: base44.entities.Load,
    pageSize: 50,
  });
  const loads = loadsQuery.data?.pages.flatMap(p => p.items) ?? [];
  const isLoading = loadsQuery.isLoading;

  const { data: drivers, isLoading: driversLoading } = useScopedEntity('Driver');
  const { data: carriers, isLoading: carriersLoading } = useScopedEntity('Carrier');
  const { data: complianceItems } = useScopedEntity('ComplianceItem', { limit: 200 });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null,
  });

  const createLoadMutation = useMutation({
    mutationFn: (loadData) => base44.entities.Load.create(toLoadCreatePayload(loadData)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      createModal.close();
    },
  });

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      createModal.close();
    },
  });

  // Shortcut Handlers
  const handleEditLoad = (load) => {
    createModal.open(load);
  };

  const handleViewDocs = (load) => {
    alert(`View documents for Load ${load.load_number || load.id.slice(0, 8)}`);
    // In production, navigate to documents page or open document viewer
  };

  const handleRequestDocs = (load) => {
    requestDocsModal.open(load);
  };

  const handleManageRoles = (load) => {
    alert(`Manage roles for Load ${load.load_number || load.id.slice(0, 8)}`);
    // In production, open role management modal
  };

  const handleSendTracking = (load) => {
    sendTrackingModal.open(load);
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
    logCheckCallModal.open(load);
  };

  const handleViewLog = (load) => {
    viewLogModal.open(load);
  };

  const handlePostLoad = (load) => {
    postLoadBoardsModal.open(load);
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
    assignDriverModal.open(load);
  };

  const handleAssignCarrier = (load) => {
    assignCarrierModal.open(load);
  };

  // Shortcut Action Handlers (for modals)
  const handleSendDocsRequest = (data) => {
    alert(`Document request sent to driver for ${data.documents_requested.join(', ')}`);
    requestDocsModal.close();
  };

  const handleSendTrackingMessage = (data) => {
    alert(`Tracking message sent to ${data.recipients.join(', ')}`);
    sendTrackingModal.close();
  };

  const handleSaveCheckCall = (data) => {
    alert(`Check call logged for Load ${data.load_id}`);
    logCheckCallModal.close();
  };

  const handlePostToBoards = (data) => {
    updateLoadMutation.mutate({
      id: data.load_id,
      data: { external_posted: true, posted_rate: data.posted_rate, posted_boards: data.boards }
    });
    alert(`Load posted to ${data.boards.length} load board(s)`);
    postLoadBoardsModal.close();
  };

  const handleDriverAssignment = (data) => {
    updateLoadMutation.mutate({
      id: data.load_id,
      data: { driver_id: data.driver_id, status: 'assigned' }
    });
    alert('Driver assigned successfully');
    assignDriverModal.close();
  };

  const handleCarrierAssignment = (data) => {
    updateLoadMutation.mutate({
      id: data.load_id,
      data: { carrier_id: data.carrier_id, status: 'tendered' }
    });
    alert('Carrier assigned successfully');
    assignCarrierModal.close();
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
    if (createModal.data) {
      updateLoadMutation.mutate({ id: createModal.data.id, data: loadData });
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
    routeOptimizeModal.close();
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
    rateModal.close();
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

  const shortcuts = {
    onEditLoad: handleEditLoad,
    onViewDocs: handleViewDocs,
    onRequestDocs: handleRequestDocs,
    onManageRoles: handleManageRoles,
    onSendTracking: handleSendTracking,
    onEnableAutoTracking: handleEnableAutoTracking,
    onSendTextMessage: handleSendTextMessage,
    onSendLoadDetails: handleSendLoadDetails,
    onLogCheckCall: handleLogCheckCall,
    onViewLog: handleViewLog,
    onPostLoad: handlePostLoad,
    onSearchLoadBoards: handleSearchLoadBoards,
    onSwitchBranch: handleSwitchBranch,
    onCopyLoad: handleCopyLoad,
    onSendToAccounting: handleSendToAccounting,
    onArchiveLoad: handleArchiveLoad,
    onCancelLoad: handleCancelLoad,
    onAssignDriver: handleAssignDriver,
    onAssignCarrier: handleAssignCarrier,
    onOptimizeRoute: (load) => routeOptimizeModal.open(load),
    onAnalyzeRate: (load) => rateModal.open(load)
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
      
      <LoadBoardHeader
        totalLoads={loads.length}
        unassignedCount={unassignedCount}
        onCreateLoad={() => createModal.open()}
        onExport={() => alert('Export coming soon')}
        onSmartMatch={() => handleAIAction('smart-match')}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-4">

        {/* Quick Actions Bar - Sticky */}
        <QuickActionsBar
          onCreateLoad={() => setShowCreateModal(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['loads'] })}
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
            <LoadBoardTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              tabCounts={tabCounts} 
            />

            {/* Bulk Actions */}
            {selectedLoads.length > 0 && (
              <BulkLoadActions
                selectedLoads={selectedLoads}
                loads={filteredLoads}
                onClearSelection={() => setSelectedLoads([])}
                onUpdate={() => queryClient.invalidateQueries({ queryKey: ['loads'] })}
              />
            )}

            {/* AI Route Optimizer */}
            {routeOptimizeModal.isOpen && (
              <AIRouteOptimization
                load={routeOptimizeModal.data}
                onOptimize={(routeData) => {
                  handleRouteOptimized({
                    load_id: routeOptimizeModal.data.id,
                    estimated_arrival: new Date(Date.now() + routeData.time_hours * 3600000).toISOString(),
                    distance_miles_actual: routeData.distance_miles,
                    fuel_cost_estimate: routeData.fuel_cost
                  });
                }}
              />
            )}

            {/* Rate Engine */}
            {rateModal.isOpen && (
              <RateEngine
                load={rateModal.data}
                onRateAccepted={(rateData) => handleRateAccepted(rateModal.data.id, rateData)}
                onClose={rateModal.close}
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
              <LoadBoardGrid
                loads={filteredLoads}
                isLoading={isLoading || driversLoading}
                searchTerm={searchTerm}
                equipmentFilter={equipmentFilter}
                selectedLoads={selectedLoads}
                onSelectLoad={handleSelectLoad}
                onSelectAll={handleSelectAll}
                onCreateLoad={() => createModal.open()}
                operatingMode={operatingMode}
                shortcuts={shortcuts}
              />
            )}
          </div>

          {/* Right Column - Planning & Financial */}
          <div className="xl:col-span-1 space-y-4">
            <ActivityPlanningWidget loads={loads} />
            <AccountingSummaryPanel loads={loads} />
          </div>
        </div>

      {/* Create/Edit Modal */}
      {createModal.isOpen && (
          <CreateLoadModal
            load={createModal.data}
            onSave={createModal.data ? handleUpdateLoad : handleCreateLoad}
            onClose={createModal.close}
            isLoading={createLoadMutation.isPending || updateLoadMutation.isPending}
            mode={operatingMode}
          />
        )}

      {/* Shortcut Modals */}
      {requestDocsModal.isOpen && (
          <RequestDocsModal
            load={requestDocsModal.data}
            onClose={requestDocsModal.close}
            onSend={handleSendDocsRequest}
            driverName={drivers.find(d => d.id === requestDocsModal.data?.driver_id)?.full_name}
          />
        )}

      {sendTrackingModal.isOpen && (
          <SendTrackingModal
            load={sendTrackingModal.data}
            onClose={sendTrackingModal.close}
            onSend={handleSendTrackingMessage}
          />
        )}

      {logCheckCallModal.isOpen && (
          <LogCheckCallModal
            load={logCheckCallModal.data}
            onClose={logCheckCallModal.close}
            onSave={handleSaveCheckCall}
          />
        )}

      {postLoadBoardsModal.isOpen && (
          <PostToLoadBoardsModal
            load={postLoadBoardsModal.data}
            onClose={postLoadBoardsModal.close}
            onPost={handlePostToBoards}
          />
        )}

      {viewLogModal.isOpen && (
          <ViewLoadLogModal
            load={viewLogModal.data}
            onClose={viewLogModal.close}
          />
        )}

      {assignDriverModal.isOpen && (
          <AssignDriverModal
            load={assignDriverModal.data}
            drivers={drivers}
            onClose={assignDriverModal.close}
            onAssign={handleDriverAssignment}
          />
        )}

      {assignCarrierModal.isOpen && (
          <AssignCarrierModal
            load={assignCarrierModal.data}
            carriers={carriers}
            onClose={assignCarrierModal.close}
            onAssign={handleCarrierAssignment}
          />
        )}

      </div>
    </div>
  );
}