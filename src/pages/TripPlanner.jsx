import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Users,
  Filter,
  RefreshCw,
  MessageSquare,
  Activity,
  Eye
} from "lucide-react";

import DriverTimeline from "../components/trip-planner/DriverTimeline";
import ActivityAuditLog from "../components/trip-planner/ActivityAuditLog";
import TripFilters from "../components/trip-planner/TripFilters";
import TripStats from "../components/trip-planner/TripStats";

export default function TripPlanner() {
  const [activeTab, setActiveTab] = useState("timeline");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads', selectedDate],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 200),
    initialData: [],
    enabled: operatingMode === 'carrier'
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 200),
    initialData: [],
  });

  // Auto-refresh every 15 minutes for appointment color updates
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Filter loads for today
  const todayLoads = loads.filter(load => {
    const pickupDate = load.pickup_date ? new Date(load.pickup_date).toISOString().split('T')[0] : null;
    const deliveryDate = load.delivery_date ? new Date(load.delivery_date).toISOString().split('T')[0] : null;
    return pickupDate === selectedDate || deliveryDate === selectedDate;
  });

  // Get active drivers with trips
  const activeDrivers = operatingMode === 'carrier' 
    ? drivers.filter(driver => {
        const driverLoads = todayLoads.filter(load => load.driver_id === driver.id);
        return driverLoads.length > 0 || driver.status === 'on_load';
      })
    : [];

  // Stats
  const stats = {
    totalTrips: todayLoads.length,
    activeDrivers: activeDrivers.length,
    onTime: todayLoads.filter(l => l.status === 'delivered' || l.status === 'in_transit').length,
    delayed: todayLoads.filter(l => {
      if (!l.eta || !l.delivery_date) return false;
      return new Date(l.eta) > new Date(l.delivery_date);
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Trip Planner & Timeline
            </h1>
            <p className="text-slate-600 mt-2">
              Visual trip progress tracking with ELD/GPS integration and real-time updates
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-purple-600">Live Tracking</Badge>
              <Badge className="bg-blue-600">Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}</Badge>
              <span className="text-xs text-slate-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              className={autoRefresh ? 'bg-emerald-600 text-white' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <TripStats stats={stats} operatingMode={operatingMode} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Trip Timeline
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity & Audit Log
            </TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <div className="grid lg:grid-cols-4 gap-6">
              
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <TripFilters
                  drivers={activeDrivers}
                  selectedDriver={selectedDriver}
                  onDriverSelect={setSelectedDriver}
                  operatingMode={operatingMode}
                />
              </div>

              {/* Timeline View */}
              <div className="lg:col-span-3">
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Driver Timelines - {new Date(selectedDate).toLocaleDateString()}
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800">
                        {selectedDriver ? '1 Driver' : `${activeDrivers.length} Drivers`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    
                    {/* Color Legend */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-3">Status Color Legend:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                          <span>On Time</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-amber-500 rounded"></div>
                          <span>At Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-500 rounded"></div>
                          <span>Delayed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span>In Transit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-slate-300 rounded"></div>
                          <span>Pending</span>
                        </div>
                      </div>
                    </div>

                    {/* Driver Timelines */}
                    {loadsLoading || driversLoading ? (
                      <div className="text-center py-12">
                        <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4 animate-spin" />
                        <p className="text-slate-600">Loading trip timelines...</p>
                      </div>
                    ) : activeDrivers.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Trips</h3>
                        <p className="text-slate-600">
                          No drivers have scheduled trips for {new Date(selectedDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {(selectedDriver ? activeDrivers.filter(d => d.id === selectedDriver) : activeDrivers).map(driver => (
                          <DriverTimeline
                            key={driver.id}
                            driver={driver}
                            loads={todayLoads.filter(load => load.driver_id === driver.id)}
                            selectedDate={selectedDate}
                            lastUpdate={lastUpdate}
                          />
                        ))}
                      </div>
                    )}

                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* Activity & Audit Log Tab */}
          <TabsContent value="activity">
            <ActivityAuditLog
              drivers={drivers}
              loads={loads}
              carriers={carriers}
              operatingMode={operatingMode}
            />
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}