import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Enhanced Load Management Components
import BreadcrumbNavigation from "../components/load-management/BreadcrumbNavigation";
import StatusIndicatorBar from "../components/load-management/StatusIndicatorBar";
import QuickActionsBar from "../components/load-management/QuickActionsBar";
import AccountingSummaryPanel from "../components/load-management/AccountingSummaryPanel";
import ActivityPlanningWidget from "../components/load-management/ActivityPlanningWidget";
import ResourceAllocationWidget from "../components/load-management/ResourceAllocationWidget";
import DragDropKanban from "../components/load-management/DragDropKanban";
import CollapsibleLoadPanel from "../components/load-management/CollapsibleLoadPanel";
import EnhancedNotificationHub from "../components/load-management/EnhancedNotificationHub";
import LoadMap from "../components/loadboard/LoadMap";
import CreateLoadModal from "../components/loadboard/CreateLoadModal";

export default function DispatchConsole() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, map, detail
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const queryClient = useQueryClient();

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-updated_date', 200),
    initialData: [],
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-updated_date', 100),
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
    },
  });

  const handleCreateLoad = (loadData) => {
    createLoadMutation.mutate({
      ...loadData,
      mode: operatingMode,
      status: 'available'
    });
  };

  const handleLoadStatusChange = (load, newStatus) => {
    updateLoadMutation.mutate({
      id: load.id,
      data: { ...load, status: newStatus }
    });
  };

  // Filter loads based on search
  const filteredLoads = loads.filter(load => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      load.load_number?.toLowerCase().includes(search) ||
      load.pickup_location?.city?.toLowerCase().includes(search) ||
      load.dropoff_location?.city?.toLowerCase().includes(search) ||
      load.commodity?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation currentPage="Dispatch Console" parentPage="Operations" />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Dispatch Console
            </h1>
            <p className="text-slate-600 mt-2">
              Real-time load management, assignment, and tracking command center
            </p>
          </div>
        </div>

        {/* Status Indicator Bar */}
        <StatusIndicatorBar loads={loads} />

        {/* Quick Actions Bar */}
        <QuickActionsBar
          onCreateLoad={() => setShowCreateModal(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['loads'] })}
          showFilters={showFilters}
        />

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ActivityPlanningWidget loads={loads} />
          <AccountingSummaryPanel loads={loads} />
          <ResourceAllocationWidget drivers={drivers} loads={loads} />
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="detail">Detail View</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-6">
            <DragDropKanban 
              loads={filteredLoads} 
              onLoadStatusChange={handleLoadStatusChange}
            />
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            <LoadMap loads={filteredLoads} />
          </TabsContent>

          <TabsContent value="detail" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLoads.slice(0, 12).map((load) => (
                <CollapsibleLoadPanel 
                  key={load.id}
                  load={load}
                  drivers={drivers}
                  carriers={carriers}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <EnhancedNotificationHub 
              loads={loads}
              drivers={drivers}
              invoices={invoices}
            />
          </TabsContent>
        </Tabs>

        {/* Create Load Modal */}
        {showCreateModal && (
          <CreateLoadModal
            load={selectedLoad}
            onSave={handleCreateLoad}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedLoad(null);
            }}
            isLoading={createLoadMutation.isPending}
            mode={operatingMode}
          />
        )}

      </div>
    </div>
  );
}