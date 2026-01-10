import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin,
  Navigation,
  Fuel,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Radio,
  RefreshCw,
  Bell,
  Truck,
  Activity,
  Lightbulb,
  Zap,
  AlertTriangle,
  ArrowRight,
  ThermometerSun,
  Gauge,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader, StandardTabs } from "@/components/design-system";

import FleetLocationMap from "../components/tracking/FleetLocationMap";
import CompletedStops from "../components/tracking/CompletedStops";
import TripProgressTracker from "../components/tracking/TripProgressTracker";
import GeofencingAlerts from "../components/tracking/GeofencingAlerts";
import StatusAlertsDashboard from "../components/tracking/StatusAlertsDashboard";
import ELDDataPanel from "../components/tracking/ELDDataPanel";

export default function RealtimeTracking() {
  const [activeTab, setActiveTab] = useState("map");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [selectedLoad, setSelectedLoad] = useState(null);
  const queryClient = useQueryClient();

  const { data: loads, isLoading: loadsLoading } = useScopedEntity('Load', { 
    limit: 500, 
    refetchInterval: autoRefresh ? 30000 : false 
  });
  const { data: drivers, isLoading: driversLoading } = useScopedEntity('Driver', { 
    limit: 200,
    enabled: operatingMode === 'carrier',
    refetchInterval: autoRefresh ? 30000 : false 
  });
  const { data: carriers } = useScopedEntity('Carrier', { 
    limit: 200,
    refetchInterval: autoRefresh ? 30000 : false 
  });

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        queryClient.invalidateQueries({ queryKey: ['loads'] });
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, queryClient]);

  const activeLoads = loads.filter(l => 
    ['dispatched', 'picked_up', 'in_transit'].includes(l.status)
  );

  const generateELDData = (load) => ({
    load_id: load.id,
    driver_id: load.driver_id,
    gps_position: {
      lat: 34.0522 + (Math.random() - 0.5) * 10,
      lng: -118.2437 + (Math.random() - 0.5) * 10,
      last_update: new Date().toISOString()
    },
    hos_remaining: Math.floor(Math.random() * 11),
    miles_driven_today: Math.floor(Math.random() * 500),
    speed: Math.floor(Math.random() * 70),
    fuel_level: Math.floor(Math.random() * 100),
    engine_hours: Math.floor(Math.random() * 10000),
    eta: load.delivery_date,
    next_stop_distance: Math.floor(Math.random() * 200)
  });

  const eldData = activeLoads.map(load => generateELDData(load));

  // Calculations
  const delayedLoads = activeLoads.filter(l => {
    if (!l.eta || !l.delivery_date) return false;
    return new Date(l.eta) > new Date(l.delivery_date);
  });
  const onTimeLoads = activeLoads.filter(l => {
    if (!l.eta || !l.delivery_date) return true;
    return new Date(l.eta) <= new Date(l.delivery_date);
  });
  const lowHOSDrivers = eldData.filter(d => d.hos_remaining < 4);
  const lowFuelLoads = eldData.filter(d => d.fuel_level < 25);
  const speedingLoads = eldData.filter(d => d.speed > 65);

  const stats = {
    activeLoads: activeLoads.length,
    onTimeTrips: onTimeLoads.length,
    delayedTrips: delayedLoads.length,
    activeAlerts: lowHOSDrivers.length + lowFuelLoads.length + delayedLoads.length,
    avgHOS: Math.floor(eldData.reduce((acc, d) => acc + d.hos_remaining, 0) / (eldData.length || 1)),
    avgSpeed: Math.floor(eldData.reduce((acc, d) => acc + d.speed, 0) / (eldData.length || 1)),
    avgFuel: Math.floor(eldData.reduce((acc, d) => acc + d.fuel_level, 0) / (eldData.length || 1))
  };

  const onTimeRate = activeLoads.length > 0 
    ? Math.round((onTimeLoads.length / activeLoads.length) * 100) 
    : 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Real-Time Tracking"
        subtitle={`${activeLoads.length} active • ${stats.activeAlerts} alerts`}
        icon={Radio}
        primaryAction={{
          label: autoRefresh ? 'Live' : 'Paused',
          icon: RefreshCw,
          onClick: () => {
            setAutoRefresh(!autoRefresh);
            if (!autoRefresh) queryClient.invalidateQueries({ queryKey: ['loads'] });
          },
          className: autoRefresh ? 'bg-emerald-600' : ''
        }}
        secondaryActions={[
          { label: 'Export', icon: Download, onClick: () => alert('Export coming soon') }
        ]}
        badge={
          <div className="flex items-center gap-2">
            <Badge className={autoRefresh ? 'bg-emerald-500' : 'bg-slate-400'}>
              {lastUpdate.toLocaleTimeString()}
            </Badge>
            <Badge className="bg-amber-600">{stats.activeAlerts} Alerts</Badge>
          </div>
        }
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-4">

        {/* Compact Stats Bar */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-slate-500">Active</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{stats.activeLoads}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-500">On-Time</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{onTimeRate}%</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-red-100">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-medium text-slate-500">Delayed</span>
                </div>
                <p className="text-lg font-bold text-red-600">{stats.delayedTrips}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-medium text-slate-500">Avg HOS</span>
                </div>
                <p className="text-lg font-bold text-purple-600">{stats.avgHOS}h</p>
              </div>
              <div className="bg-cyan-50 rounded-lg p-2.5 text-center hidden md:block">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="text-xs font-medium text-slate-500">Avg Speed</span>
                </div>
                <p className="text-lg font-bold text-cyan-600">{stats.avgSpeed} mph</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5 text-center hidden md:block">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-slate-500">Avg Fuel</span>
                </div>
                <p className="text-lg font-bold text-amber-600">{stats.avgFuel}%</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-2.5 text-center hidden md:block">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Bell className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-medium text-slate-500">Alerts</span>
                </div>
                <p className="text-lg font-bold text-orange-600">{stats.activeAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar - Active Loads */}
          <div className="lg:col-span-2 space-y-3">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  Active Loads
                  <Badge variant="secondary" className="ml-auto text-xs">{activeLoads.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 max-h-[350px] overflow-y-auto">
                {activeLoads.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs">No active loads</div>
                ) : (
                  <div className="space-y-1">
                    {activeLoads.slice(0, 10).map(load => {
                      const eld = eldData.find(e => e.load_id === load.id);
                      const isDelayed = delayedLoads.find(d => d.id === load.id);
                      return (
                        <button
                          key={load.id}
                          onClick={() => setSelectedLoad(load.id === selectedLoad ? null : load.id)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            selectedLoad === load.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-900 flex items-center gap-1">
                              {isDelayed && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                              {load.load_number || load.id.slice(0, 6)}
                            </span>
                            <Badge className={`text-xs px-1 py-0 h-4 ${
                              load.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                              load.status === 'picked_up' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {load.status?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{load.dropoff_location?.city || 'Unknown'}</span>
                          </div>
                          {eld && (
                            <div className="flex items-center gap-2 mt-1 text-slate-400">
                              <span>{eld.speed} mph</span>
                              <span>•</span>
                              <span>{eld.fuel_level}% fuel</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <p className="text-xs font-medium text-slate-600 mb-2">Fleet Status</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">On-Time Rate</span>
                      <span className="font-medium text-emerald-600">{onTimeRate}%</span>
                    </div>
                    <Progress value={onTimeRate} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Avg Fuel Level</span>
                      <span className={`font-medium ${stats.avgFuel < 30 ? 'text-amber-600' : 'text-blue-600'}`}>{stats.avgFuel}%</span>
                    </div>
                    <Progress value={stats.avgFuel} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-7 space-y-3">
            <StandardTabs
              tabs={[
                { key: 'map', label: 'Map', icon: MapPin },
                { key: 'progress', label: 'Progress', icon: TrendingUp },
                { key: 'eld', label: 'ELD', icon: Activity },
                { key: 'alerts', label: 'Alerts', icon: AlertCircle },
                { key: 'geofencing', label: 'Geofence', icon: Navigation }
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="hidden"></TabsList>

              <TabsContent value="map" className="mt-3">
                <FleetLocationMap loads={activeLoads} drivers={drivers} eldData={eldData} operatingMode={operatingMode} lastUpdate={lastUpdate} />
              </TabsContent>

              <TabsContent value="progress" className="mt-3">
                <TripProgressTracker loads={activeLoads} eldData={eldData} drivers={drivers} operatingMode={operatingMode} />
              </TabsContent>

              <TabsContent value="eld" className="mt-3">
                <ELDDataPanel loads={activeLoads} eldData={eldData} drivers={drivers} operatingMode={operatingMode} />
              </TabsContent>

              <TabsContent value="alerts" className="mt-3">
                <StatusAlertsDashboard loads={loads} drivers={drivers} carriers={carriers} operatingMode={operatingMode} />
              </TabsContent>

              <TabsContent value="geofencing" className="mt-3">
                <GeofencingAlerts loads={activeLoads} eldData={eldData} drivers={drivers} operatingMode={operatingMode} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - AI Recommendations */}
          <div className="lg:col-span-3 space-y-3">
            
            {/* AI Recommendations */}
            <Card className="border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="py-2.5 px-3 border-b border-purple-200 bg-purple-100/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 space-y-2">
                
                {/* Delayed Loads Alert */}
                {delayedLoads.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-red-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <p className="font-semibold text-red-900">ETA Alert</p>
                    </div>
                    <p className="text-red-700 mb-1.5">{delayedLoads.length} load{delayedLoads.length > 1 ? 's' : ''} running behind schedule</p>
                    <div className="space-y-1">
                      {delayedLoads.slice(0, 2).map(load => (
                        <div key={load.id} className="flex items-center justify-between text-red-800 bg-red-50 px-1.5 py-1 rounded">
                          <span className="truncate">{load.load_number || load.id.slice(0, 6)}</span>
                          <span className="font-medium">{load.dropoff_location?.city}</span>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-xs w-full mt-1.5 border-red-200 text-red-700 hover:bg-red-50">
                      Update ETAs
                    </Button>
                  </div>
                )}

                {/* Low HOS Warning */}
                {lowHOSDrivers.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-orange-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-orange-600" />
                      <p className="font-semibold text-orange-900">HOS Warning</p>
                    </div>
                    <p className="text-orange-700 mb-1.5">{lowHOSDrivers.length} driver{lowHOSDrivers.length > 1 ? 's' : ''} below 4 hours remaining</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs w-full border-orange-200 text-orange-700 hover:bg-orange-50">
                      Plan Breaks
                    </Button>
                  </div>
                )}

                {/* Low Fuel Alert */}
                {lowFuelLoads.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-amber-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Fuel className="w-3 h-3 text-amber-600" />
                      <p className="font-semibold text-amber-900">Low Fuel</p>
                    </div>
                    <p className="text-amber-700 mb-1.5">{lowFuelLoads.length} vehicle{lowFuelLoads.length > 1 ? 's' : ''} below 25% fuel</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs w-full border-amber-200 text-amber-700 hover:bg-amber-50">
                      Find Fuel Stops
                    </Button>
                  </div>
                )}

                {/* Speeding Alert */}
                {speedingLoads.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-red-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Gauge className="w-3 h-3 text-red-600" />
                      <p className="font-semibold text-red-900">Speed Alert</p>
                    </div>
                    <p className="text-red-700">{speedingLoads.length} vehicle{speedingLoads.length > 1 ? 's' : ''} exceeding 65 mph</p>
                  </div>
                )}

                {/* All Clear */}
                {delayedLoads.length === 0 && lowHOSDrivers.length === 0 && lowFuelLoads.length === 0 && (
                  <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <p className="font-semibold text-emerald-900">All Clear</p>
                    </div>
                    <p className="text-emerald-700">Fleet operating normally with no critical alerts</p>
                  </div>
                )}

                {/* Route Optimization */}
                {activeLoads.length > 3 && (
                  <div className="p-2 bg-white rounded-lg border border-indigo-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3 h-3 text-indigo-600" />
                      <p className="font-semibold text-indigo-900">Optimization</p>
                    </div>
                    <p className="text-indigo-700 mb-1.5">Review routes for potential fuel savings</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                      Optimize Routes
                    </Button>
                  </div>
                )}

                {/* Weather Alert */}
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ThermometerSun className="w-3 h-3 text-slate-600" />
                    <p className="font-semibold text-slate-900">Weather Check</p>
                  </div>
                  <p className="text-slate-600">Check conditions along active routes</p>
                  <Button size="sm" variant="outline" className="h-6 text-xs w-full mt-1.5">
                    View Weather
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deliveries */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Next Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5">
                {activeLoads.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">No active deliveries</p>
                ) : (
                  <div className="space-y-1.5">
                    {activeLoads.slice(0, 4).map(load => {
                      const eld = eldData.find(e => e.load_id === load.id);
                      return (
                        <div key={load.id} className="p-2 bg-slate-50 rounded-lg text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-slate-900">{load.load_number || load.id.slice(0, 6)}</span>
                            <span className="text-slate-500">
                              {load.delivery_date ? format(new Date(load.delivery_date), 'h:mm a') : '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600">
                            <ArrowRight className="w-3 h-3" />
                            <span className="truncate">{load.dropoff_location?.city || 'Unknown'}</span>
                          </div>
                          {eld && (
                            <div className="mt-1.5">
                              <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                                <span>ETA Progress</span>
                                <span>{eld.next_stop_distance} mi</span>
                              </div>
                              <Progress value={Math.min(100, 100 - (eld.next_stop_distance / 2))} className="h-1" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ELD Summary */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <p className="text-xs font-medium text-slate-600 mb-2">ELD Fleet Summary</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-purple-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-purple-600">{stats.avgHOS}h</p>
                    <p className="text-xs text-purple-700">Avg HOS</p>
                  </div>
                  <div className="p-2 bg-cyan-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-cyan-600">{stats.avgSpeed}</p>
                    <p className="text-xs text-cyan-700">Avg MPH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}