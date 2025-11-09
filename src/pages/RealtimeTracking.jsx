import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  MapPin,
  Navigation,
  Gauge,
  Fuel,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Radio,
  RefreshCw,
  Bell,
  Truck,
  Activity
} from "lucide-react";

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

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 200),
    initialData: [],
    enabled: operatingMode === 'carrier',
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 200),
    initialData: [],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Active loads (in transit, dispatched, picked up)
  const activeLoads = loads.filter(l => 
    ['dispatched', 'picked_up', 'in_transit'].includes(l.status)
  );

  // Generate mock ELD data
  const generateELDData = (load) => {
    return {
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
    };
  };

  const eldData = activeLoads.map(load => generateELDData(load));

  // Stats
  const stats = {
    activeLoads: activeLoads.length,
    onTimeTrips: activeLoads.filter(l => {
      if (!l.eta || !l.delivery_date) return true;
      return new Date(l.eta) <= new Date(l.delivery_date);
    }).length,
    activeAlerts: 3, // Mock - count geofencing + status alerts
    avgHOS: Math.floor(eldData.reduce((acc, d) => acc + d.hos_remaining, 0) / (eldData.length || 1))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
              Real-Time Tracking & ELD Integration
            </h1>
            <p className="text-slate-600 mt-2">
              Live fleet tracking, ELD data, geofencing alerts, and trip progress monitoring
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-emerald-600 animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
              <Badge className="bg-blue-600">
                {autoRefresh ? 'Auto-Refresh ON' : 'Manual Mode'}
              </Badge>
              <span className="text-xs text-slate-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              className={autoRefresh ? 'bg-emerald-600 text-white' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh
            </Button>
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Alerts ({stats.activeAlerts})
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Loads</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.activeLoads}</p>
                  <p className="text-xs text-slate-600 mt-1">In transit right now</p>
                </div>
                <Truck className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">On-Time Trips</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.onTimeTrips}</p>
                  <p className="text-xs text-slate-600 mt-1">Meeting ETA targets</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Alerts</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{stats.activeAlerts}</p>
                  <p className="text-xs text-slate-600 mt-1">Require attention</p>
                </div>
                <Bell className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Avg HOS</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{stats.avgHOS}h</p>
                  <p className="text-xs text-slate-600 mt-1">Fleet average</p>
                </div>
                <Clock className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Fleet Location
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trip Progress
            </TabsTrigger>
            <TabsTrigger value="stops" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed Stops
            </TabsTrigger>
            <TabsTrigger value="geofencing" className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Geofencing
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Status Alerts
            </TabsTrigger>
            <TabsTrigger value="eld" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              ELD Data
            </TabsTrigger>
          </TabsList>

          {/* Fleet Location Tab */}
          <TabsContent value="map">
            <FleetLocationMap
              loads={activeLoads}
              drivers={drivers}
              eldData={eldData}
              operatingMode={operatingMode}
              lastUpdate={lastUpdate}
            />
          </TabsContent>

          {/* Trip Progress Tab */}
          <TabsContent value="progress">
            <TripProgressTracker
              loads={activeLoads}
              eldData={eldData}
              drivers={drivers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Completed Stops Tab */}
          <TabsContent value="stops">
            <CompletedStops
              loads={loads}
              drivers={drivers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Geofencing Tab */}
          <TabsContent value="geofencing">
            <GeofencingAlerts
              loads={activeLoads}
              eldData={eldData}
              drivers={drivers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Status Alerts Tab */}
          <TabsContent value="alerts">
            <StatusAlertsDashboard
              loads={loads}
              drivers={drivers}
              carriers={carriers}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* ELD Data Tab */}
          <TabsContent value="eld">
            <ELDDataPanel
              loads={activeLoads}
              eldData={eldData}
              drivers={drivers}
              operatingMode={operatingMode}
            />
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}