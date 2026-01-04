import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Navigation, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  RefreshCw,
  Zap
} from "lucide-react";

// TODO: SECURITY - Move all credential storage and API calls to backend functions
// CRITICAL: Credentials should NEVER be stored in localStorage (even with weak XOR encryption)
// This entire implementation needs to be replaced with secure backend API proxy

// Placeholder - this should be replaced with backend function calls
const getAuthHeader = async () => {
  // TODO: Call backend function to get secure credentials and make API call server-side
  throw new Error('Opendock integration requires backend functions - credentials cannot be stored in browser');
};

// TODO: Replace with backend function calls
const sendLocationUpdate = async (loadId, locationData) => {
  throw new Error('This operation requires backend functions to be enabled');
};

const sendETAUpdate = async (loadId, etaData) => {
  throw new Error('This operation requires backend functions to be enabled');
};

const updateLoadStatus = async (loadId, statusData) => {
  throw new Error('This operation requires backend functions to be enabled');
};

export default function TrackingSyncDashboard() {
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(
    localStorage.getItem('opendock_auto_sync') === 'true'
  );
  const [syncInterval, setSyncInterval] = useState(null);
  
  const queryClient = useQueryClient();

  // Fetch active loads with Opendock IDs
  const { data: activeLoads } = useQuery({
    queryKey: ['activeOpendockLoads'],
    queryFn: async () => {
      const loads = await base44.entities.Load.list('-created_date', 100);
      return loads.filter(l => 
        l.opendock_load_id && 
        ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status)
      );
    },
    initialData: []
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: async (load) => {
      const updates = [];
      
      // Send location update if available
      if (load.current_location) {
        await sendLocationUpdate(load.opendock_load_id, {
          latitude: load.current_location.lat,
          longitude: load.current_location.lng,
          timestamp: new Date().toISOString(),
          speed: load.current_location.speed || 0
        });
        updates.push('location');
      }
      
      // Send ETA update
      if (load.eta) {
        await sendETAUpdate(load.opendock_load_id, {
          estimated_arrival: load.eta,
          confidence: 'high'
        });
        updates.push('eta');
      }
      
      // Send status update
      await updateLoadStatus(load.opendock_load_id, {
        status: load.status,
        updated_at: new Date().toISOString(),
        notes: `Auto-synced from TMS`
      });
      updates.push('status');
      
      return updates;
    },
    onSuccess: (updates, load) => {
      console.log(`✅ Synced ${updates.join(', ')} for load ${load.load_number}`);
    },
    onError: (error, load) => {
      console.error(`❌ Sync failed for load ${load.load_number}:`, error.message);
    }
  });

  // Bulk sync all active loads
  const bulkSyncMutation = useMutation({
    mutationFn: async () => {
      const results = await Promise.allSettled(
        activeLoads.map(load => syncMutation.mutateAsync(load))
      );
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      alert(`✅ Bulk sync complete!\n\nSuccess: ${successful}\nFailed: ${failed}`);
    }
  });

  // Auto-sync effect
  useEffect(() => {
    if (autoSyncEnabled && activeLoads.length > 0) {
      const interval = setInterval(() => {
        activeLoads.forEach(load => {
          syncMutation.mutate(load);
        });
      }, 5 * 60 * 1000); // Every 5 minutes
      
      setSyncInterval(interval);
      return () => clearInterval(interval);
    }
  }, [autoSyncEnabled, activeLoads]);

  const toggleAutoSync = () => {
    const newState = !autoSyncEnabled;
    setAutoSyncEnabled(newState);
    localStorage.setItem('opendock_auto_sync', newState.toString());
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Opendock Tracking Sync
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge className={autoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-400'}>
              {autoSyncEnabled ? '🟢 Auto-Sync ON' : '⚫ Auto-Sync OFF'}
            </Badge>
            <Button
              onClick={toggleAutoSync}
              variant="outline"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Toggle Auto-Sync
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Active Syncs</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{activeLoads.length}</p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Last Sync</p>
            <p className="text-sm font-semibold text-emerald-600 mt-1">
              {autoSyncEnabled ? 'Active' : 'Manual'}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Sync Interval</p>
            <p className="text-sm font-semibold text-purple-600 mt-1">
              {autoSyncEnabled ? '5 minutes' : 'Disabled'}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <p className="text-sm font-semibold text-slate-500 uppercase">Status</p>
            <p className="text-sm font-semibold text-amber-600 mt-1 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Operational
            </p>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => bulkSyncMutation.mutate()}
            disabled={activeLoads.length === 0 || bulkSyncMutation.isPending}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${bulkSyncMutation.isPending ? 'animate-spin' : ''}`} />
            {bulkSyncMutation.isPending ? 'Syncing All...' : `Sync All (${activeLoads.length})`}
          </Button>
        </div>

        {/* Active Loads List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Active Load Syncs:</h4>
          
          {activeLoads.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No active Opendock loads to sync</p>
            </div>
          ) : (
            activeLoads.map(load => (
              <div
                key={load.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">
                      {load.load_number || load.external_load_number}
                    </span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {load.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {load.pickup_location?.city} → {load.dropoff_location?.city}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {autoSyncEnabled ? (
                    <Badge className="bg-emerald-100 text-emerald-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Auto-syncing
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => syncMutation.mutate(load)}
                      disabled={syncMutation.isPending}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sync Now
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Auto-Sync Information</h4>
              <p className="text-sm text-blue-800">
                When enabled, tracking updates (location, ETA, status) are automatically pushed to Opendock every 5 minutes for all active loads.
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}