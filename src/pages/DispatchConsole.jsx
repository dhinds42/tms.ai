import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Radio,
  Truck,
  MapPin,
  Clock,
  Users,
  Phone,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Zap,
  Activity
} from "lucide-react";

export default function DispatchConsole() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [selectedLoad, setSelectedLoad] = useState(null);
  const queryClient = useQueryClient();

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
    refetchInterval: 30000
  });

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      setSelectedLoad(null);
    },
  });

  // Active loads (in motion)
  const activeLoads = loads.filter(l => 
    ['dispatched', 'picked_up', 'in_transit'].includes(l.status)
  );

  // Available drivers
  const availableDrivers = drivers.filter(d => 
    ['available', 'off_duty'].includes(d.driver_status)
  );

  // Loads needing dispatch
  const pendingLoads = loads.filter(l => 
    ['available', 'tendered', 'booked'].includes(l.status)
  );

  // Loads with issues
  const problemLoads = loads.filter(l => 
    l.exceptions?.length > 0 || l.delay_minutes > 30
  );

  const handleQuickDispatch = (loadId, driverId) => {
    updateLoadMutation.mutate({
      id: loadId,
      data: {
        driver_id: driverId,
        status: 'dispatched',
        dispatched_at: new Date().toISOString()
      }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'dispatched': 'bg-blue-100 text-blue-800',
      'picked_up': 'bg-purple-100 text-purple-800',
      'in_transit': 'bg-indigo-100 text-indigo-800',
      'available': 'bg-slate-100 text-slate-800',
      'tendered': 'bg-yellow-100 text-yellow-800',
      'booked': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Dispatch Console
            </h1>
            <p className="text-slate-600 mt-2">Real-time dispatch command center with live updates</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-600 text-white px-4 py-2">
              <Activity className="w-4 h-4 mr-2 animate-pulse" />
              LIVE
            </Badge>
            <Badge className={operatingMode === 'carrier' ? 'bg-blue-600' : 'bg-indigo-600'}>
              {operatingMode.toUpperCase()} MODE
            </Badge>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Loads</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{activeLoads.length}</p>
                </div>
                <Truck className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Available Drivers</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{availableDrivers.length}</p>
                </div>
                <Users className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Dispatch</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingLoads.length}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Issues/Delays</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{problemLoads.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Loads Panel */}
          <Card className="border-0 shadow-xl lg:col-span-2">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-600" />
                Active Loads ({activeLoads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {activeLoads.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    No active loads in motion
                  </div>
                ) : (
                  activeLoads.map((load) => {
                    const driver = drivers.find(d => d.id === load.driver_id);
                    return (
                      <div key={load.id} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-slate-900">{load.load_number || load.id.slice(0, 8)}</h3>
                            <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                          </div>
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4 mr-2" />
                            Call Driver
                          </Button>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="text-slate-700">
                              {load.pickup_location?.city}, {load.pickup_location?.state}
                            </span>
                            <span className="text-slate-400">→</span>
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-700">
                              {load.dropoff_location?.city}, {load.dropoff_location?.state}
                            </span>
                          </div>

                          {driver && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-indigo-600" />
                              <span className="text-slate-700">{driver.first_name} {driver.last_name}</span>
                              <span className="text-slate-500">• {driver.phone}</span>
                            </div>
                          )}

                          {load.eta && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-purple-600" />
                              <span className="text-slate-700">ETA: {new Date(load.eta).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {load.delay_minutes > 0 && (
                          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-amber-800">Delayed {load.delay_minutes} minutes</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Drivers Panel */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Available Drivers ({availableDrivers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-[600px] overflow-y-auto">
              <div className="space-y-3">
                {availableDrivers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    No drivers available
                  </div>
                ) : (
                  availableDrivers.map((driver) => (
                    <div key={driver.id} className="p-3 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900">{driver.first_name} {driver.last_name}</h4>
                          <p className="text-xs text-slate-600">{driver.equipment_assigned || 'No equipment'}</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{driver.current_location?.city || 'Unknown'}, {driver.current_location?.state || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>HOS: {driver.hos_remaining || 0}h remaining</span>
                        </div>
                      </div>

                      {selectedLoad && (
                        <Button
                          onClick={() => handleQuickDispatch(selectedLoad.id, driver.id)}
                          size="sm"
                          className="w-full mt-3 bg-gradient-to-r from-emerald-600 to-green-600"
                        >
                          <Zap className="w-3 h-3 mr-2" />
                          Assign to {selectedLoad.load_number}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Dispatch Queue */}
        {pendingLoads.length > 0 && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Pending Dispatch Queue ({pendingLoads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingLoads.map((load) => (
                  <div
                    key={load.id}
                    onClick={() => setSelectedLoad(load)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedLoad?.id === load.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{load.load_number || load.id.slice(0, 8)}</h3>
                        <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="text-slate-700">{load.pickup_location?.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-700">{load.dropoff_location?.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-purple-600" />
                        <span className="text-slate-700">{load.miles_planned || 0} mi</span>
                      </div>
                    </div>

                    {selectedLoad?.id === load.id && (
                      <Badge className="w-full mt-3 bg-indigo-600 text-white justify-center">
                        Selected - Assign Driver Above
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}