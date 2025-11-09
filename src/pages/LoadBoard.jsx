
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search, Truck, MapPin, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import LoadShortcutsMenu from "../components/loadboard/LoadShortcutsMenu";

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
            {/* FIXED: Create Load button now available for BOTH broker and carrier */}
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Load
            </Button>
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
              {/* FIXED: Analytics button now available for BOTH modes */}
              <Button
                variant="outline"
                onClick={() => {/* Analytics modal */}}
                className="border-slate-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
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

        {/* FIXED: Bulk Actions now available for BOTH broker and carrier */}
        {selectedLoads.length > 0 && (
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
                    : 'Create your first load to get started'}
                </p>
                {/* FIXED: Create Load button in empty state for BOTH modes */}
                {!searchTerm && (
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
                {/* FIXED: Select all checkbox now available for BOTH modes */}
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

                {/* Enhanced Load Cards with Shortcuts Menu */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredLoads.map((load) => (
                    <div key={load.id} className="relative group">
                      {/* Shortcuts Menu */}
                      <div className="absolute top-4 right-4 z-10">
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

                      {/* Load Card */}
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
