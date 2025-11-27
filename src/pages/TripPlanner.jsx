import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  Users,
  RefreshCw,
  Activity,
  Truck,
  AlertTriangle,
  CheckCircle,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";

import DriverTimeline from "../components/trip-planner/DriverTimeline";
import ActivityAuditLog from "../components/trip-planner/ActivityAuditLog";

export default function TripPlanner() {
  const [activeTab, setActiveTab] = useState("timeline");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const queryClient = useQueryClient();

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

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        queryClient.invalidateQueries({ queryKey: ['loads'] });
      }, 60 * 1000); // 1 minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh, queryClient]);

  // Filter loads for selected date
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

  // Stats calculations
  const inTransitLoads = todayLoads.filter(l => ['in_transit', 'picked_up'].includes(l.status));
  const completedLoads = todayLoads.filter(l => l.status === 'delivered');
  const delayedLoads = todayLoads.filter(l => {
    if (!l.eta || !l.delivery_date) return false;
    return new Date(l.eta) > new Date(l.delivery_date);
  });
  const atRiskLoads = todayLoads.filter(l => {
    if (l.status === 'delivered') return false;
    const now = new Date();
    if (l.pickup_date) {
      const pickupTime = new Date(l.pickup_date);
      const hoursUntilPickup = (pickupTime - now) / (1000 * 60 * 60);
      return hoursUntilPickup < 1 && hoursUntilPickup > 0 && l.status === 'dispatched';
    }
    return false;
  });

  const onTimeRate = todayLoads.length > 0 
    ? Math.round(((todayLoads.length - delayedLoads.length) / todayLoads.length) * 100) 
    : 100;

  const changeDate = (direction) => {
    const current = new Date(selectedDate);
    const newDate = direction === 'next' ? addDays(current, 1) : subDays(current, 1);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Trip Planner</h1>
              <p className="text-xs text-slate-500">
                {todayLoads.length} trips • {activeDrivers.length} drivers active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg">
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => changeDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-1 text-sm border-0 bg-transparent w-32 text-center"
              />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => changeDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              variant="outline"
              size="sm"
              className="h-8"
            >
              Today
            </Button>
            <Button
              onClick={() => {
                setAutoRefresh(!autoRefresh);
                if (!autoRefresh) queryClient.invalidateQueries({ queryKey: ['loads'] });
              }}
              size="sm"
              className={`h-8 ${autoRefresh ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              variant={autoRefresh ? 'default' : 'outline'}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Live
            </Button>
          </div>
        </div>

        {/* Compact Stats Bar */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-xs font-medium text-slate-500">Trips</span>
                </div>
                <p className="text-lg font-bold text-slate-700">{todayLoads.length}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-slate-500">In Transit</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{inTransitLoads.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-500">Completed</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{completedLoads.length}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-amber-100" onClick={() => {}}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-slate-500">At Risk</span>
                </div>
                <p className="text-lg font-bold text-amber-600">{atRiskLoads.length}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-red-100" onClick={() => {}}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-medium text-slate-500">Delayed</span>
                </div>
                <p className="text-lg font-bold text-red-600">{delayedLoads.length}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-medium text-slate-500">On-Time</span>
                </div>
                <p className="text-lg font-bold text-indigo-600">{onTimeRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Row */}
        {(delayedLoads.length > 0 || atRiskLoads.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {delayedLoads.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900">{delayedLoads.length} trip{delayedLoads.length > 1 ? 's' : ''} running late</p>
                  <p className="text-xs text-red-700">Update ETAs and notify customers</p>
                </div>
                <Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-100">
                  Review
                </Button>
              </div>
            )}
            {atRiskLoads.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">{atRiskLoads.length} pickup{atRiskLoads.length > 1 ? 's' : ''} approaching</p>
                  <p className="text-xs text-amber-700">Drivers should be en route now</p>
                </div>
                <Button size="sm" variant="ghost" className="text-amber-700 hover:bg-amber-100">
                  Check
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar - Drivers & Legend */}
          <div className="lg:col-span-2 space-y-3">
            
            {/* Driver Quick Select */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Drivers
                  <Badge variant="secondary" className="ml-auto text-xs">{activeDrivers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 max-h-[300px] overflow-y-auto">
                <div className="space-y-0.5">
                  <button
                    onClick={() => setSelectedDriver(null)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      !selectedDriver 
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    All Drivers
                  </button>
                  {activeDrivers.map(driver => {
                    const driverLoads = todayLoads.filter(l => l.driver_id === driver.id);
                    const hasDelayed = driverLoads.some(l => delayedLoads.find(d => d.id === l.id));
                    return (
                      <button
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                          selectedDriver === driver.id
                            ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate flex items-center gap-1">
                            {hasDelayed && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                            {driver.first_name} {driver.last_name?.charAt(0)}.
                          </span>
                          <span className={`text-xs font-medium ${
                            driver.status === 'on_load' ? 'text-blue-600' :
                            driver.status === 'available' ? 'text-emerald-600' :
                            'text-slate-500'
                          }`}>
                            {driverLoads.length}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {activeDrivers.length === 0 && (
                    <div className="text-center py-3 text-slate-400 text-xs">
                      No active drivers
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Legend - Compact */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <p className="text-xs font-medium text-slate-600 mb-2">Status</p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-slate-600">On Time</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600">In Transit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-slate-600">At Risk</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-slate-600">Delayed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-600">Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Timeline Area */}
          <div className="lg:col-span-7 space-y-3">
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white border border-slate-200 h-8">
                <TabsTrigger value="timeline" className="text-xs flex items-center gap-1.5 h-6">
                  <Calendar className="w-3 h-3" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-xs flex items-center gap-1.5 h-6">
                  <Activity className="w-3 h-3" />
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-3">
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader className="py-2.5 px-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {format(new Date(selectedDate), 'EEE, MMM d')}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {autoRefresh && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Live
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    
                    {loadsLoading || driversLoading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-spin" />
                        <p className="text-xs text-slate-600">Loading...</p>
                      </div>
                    ) : activeDrivers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">No Active Trips</h3>
                        <p className="text-xs text-slate-600 mb-3">
                          No trips for {format(new Date(selectedDate), 'MMM d')}
                        </p>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
                          Go to Today
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
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
              </TabsContent>

              {/* Activity Log Tab */}
              <TabsContent value="activity" className="mt-3">
                <ActivityAuditLog
                  drivers={drivers}
                  loads={loads}
                  carriers={carriers}
                  operatingMode={operatingMode}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - AI Recommendations */}
          <div className="lg:col-span-3 space-y-3">
            
            {/* AI Recommendations Panel */}
            <Card className="border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="py-2.5 px-3 border-b border-purple-200 bg-purple-100/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 space-y-2">
                {/* Delayed Trips Alert */}
                {delayedLoads.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-red-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <p className="font-semibold text-red-900">Delay Alert</p>
                    </div>
                    <p className="text-red-700 mb-1.5">{delayedLoads.length} trip{delayedLoads.length > 1 ? 's' : ''} running behind schedule</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs w-full border-red-200 text-red-700 hover:bg-red-50">
                      Update ETAs
                    </Button>
                  </div>
                )}

                {/* At Risk Pickups */}
                {atRiskLoads.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-amber-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <p className="font-semibold text-amber-900">Upcoming Pickups</p>
                    </div>
                    <p className="text-amber-700 mb-1.5">{atRiskLoads.length} pickup{atRiskLoads.length > 1 ? 's' : ''} within the hour</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs w-full border-amber-200 text-amber-700 hover:bg-amber-50">
                      Send Reminders
                    </Button>
                  </div>
                )}

                {/* Upcoming Pickups */}
                {(() => {
                  const now = new Date();
                  const upcomingPickups = todayLoads.filter(l => {
                    if (!l.pickup_date || l.status === 'picked_up' || l.status === 'in_transit' || l.status === 'delivered') return false;
                    const pickupTime = new Date(l.pickup_date);
                    const hoursUntil = (pickupTime - now) / (1000 * 60 * 60);
                    return hoursUntil > 0 && hoursUntil <= 3;
                  });
                  return upcomingPickups.length > 0 && (
                    <div className="p-2 bg-white rounded-lg border border-cyan-200 text-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3 h-3 text-cyan-600" />
                        <p className="font-semibold text-cyan-900">Upcoming Pickups</p>
                      </div>
                      <p className="text-cyan-700 mb-1.5">{upcomingPickups.length} pickup{upcomingPickups.length > 1 ? 's' : ''} in next 3 hours</p>
                      <div className="space-y-1 mt-1.5">
                        {upcomingPickups.slice(0, 2).map(load => (
                          <div key={load.id} className="flex items-center justify-between text-cyan-800 bg-cyan-50 px-1.5 py-1 rounded">
                            <span className="truncate">{load.pickup_location?.city || 'Unknown'}</span>
                            <span className="font-medium">{load.pickup_date ? format(new Date(load.pickup_date), 'h:mm a') : '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* HOS Warnings */}
                {(() => {
                  const lowHOSDrivers = activeDrivers.filter(d => d.hos_remaining && d.hos_remaining < 4);
                  return lowHOSDrivers.length > 0 && (
                    <div className="p-2 bg-white rounded-lg border border-orange-200 text-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-3 h-3 text-orange-600" />
                        <p className="font-semibold text-orange-900">HOS Warning</p>
                      </div>
                      <p className="text-orange-700 mb-1.5">
                        {lowHOSDrivers.length} driver{lowHOSDrivers.length > 1 ? 's' : ''} running low on hours
                      </p>
                      <div className="space-y-1">
                        {lowHOSDrivers.slice(0, 2).map(driver => (
                          <div key={driver.id} className="flex items-center justify-between text-orange-800 bg-orange-50 px-1.5 py-1 rounded">
                            <span className="truncate">{driver.first_name} {driver.last_name?.charAt(0)}.</span>
                            <span className="font-medium">{driver.hos_remaining}h left</span>
                          </div>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-xs w-full mt-1.5 border-orange-200 text-orange-700 hover:bg-orange-50">
                        Plan Breaks
                      </Button>
                    </div>
                  );
                })()}

                {/* On Track Message */}
                {delayedLoads.length === 0 && atRiskLoads.length === 0 && (
                  <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <p className="font-semibold text-emerald-900">All On Track</p>
                    </div>
                    <p className="text-emerald-700">All trips running on schedule!</p>
                  </div>
                )}

                {/* Utilization Insight */}
                <div className="p-2 bg-white rounded-lg border border-blue-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3 h-3 text-blue-600" />
                    <p className="font-semibold text-blue-900">Utilization</p>
                  </div>
                  <p className="text-blue-700">
                    {activeDrivers.length} drivers • {todayLoads.length} trips • {(todayLoads.length / Math.max(activeDrivers.length, 1)).toFixed(1)} avg/driver
                  </p>
                </div>

                {/* Route Optimization Tips */}
                {(() => {
                  const multiStopLoads = todayLoads.filter(l => l.additional_stops && l.additional_stops.length > 0);
                  const longDistanceLoads = todayLoads.filter(l => l.distance_miles && l.distance_miles > 300);
                  const totalMiles = todayLoads.reduce((sum, l) => sum + (l.distance_miles || 0), 0);
                  
                  return (todayLoads.length > 3 || multiStopLoads.length > 0 || longDistanceLoads.length > 0) && (
                    <div className="p-2 bg-white rounded-lg border border-indigo-200 text-xs">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="w-3 h-3 text-indigo-600" />
                        <p className="font-semibold text-indigo-900">Route Insights</p>
                      </div>
                      <div className="space-y-1.5 text-indigo-700">
                        {totalMiles > 0 && (
                          <p>📍 Total distance: {totalMiles.toLocaleString()} miles</p>
                        )}
                        {longDistanceLoads.length > 0 && (
                          <p>🛣️ {longDistanceLoads.length} long-haul route{longDistanceLoads.length > 1 ? 's' : ''} (300+ mi)</p>
                        )}
                        {multiStopLoads.length > 0 && (
                          <p>📦 {multiStopLoads.length} multi-stop route{multiStopLoads.length > 1 ? 's' : ''}</p>
                        )}
                        {todayLoads.length > 5 && (
                          <p>💡 Consider consolidating nearby pickups</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-xs w-full mt-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        Optimize Routes
                      </Button>
                    </div>
                  );
                })()}

                {/* Weather/Traffic Alert */}
                {todayLoads.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Navigation className="w-3 h-3 text-slate-600" />
                      <p className="font-semibold text-slate-900">Route Conditions</p>
                    </div>
                    <p className="text-slate-600">Check real-time traffic and weather for active routes</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs w-full mt-1.5">
                      View Conditions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deliveries & Pickups */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Next Stops
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5">
                {(() => {
                  const now = new Date();
                  const upcomingStops = todayLoads
                    .filter(l => l.status !== 'delivered' && l.status !== 'cancelled')
                    .map(load => {
                      const isPickup = !['picked_up', 'in_transit'].includes(load.status);
                      const stopTime = isPickup ? load.pickup_date : load.delivery_date;
                      return {
                        ...load,
                        isPickup,
                        stopTime: stopTime ? new Date(stopTime) : null,
                        location: isPickup ? load.pickup_location : load.dropoff_location
                      };
                    })
                    .filter(s => s.stopTime && s.stopTime > now)
                    .sort((a, b) => a.stopTime - b.stopTime);

                  return upcomingStops.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-2">No upcoming stops</p>
                  ) : (
                    <div className="space-y-1.5">
                      {upcomingStops.slice(0, 5).map(stop => (
                        <div key={stop.id} className={`p-2 rounded-lg text-xs ${stop.isPickup ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${stop.isPickup ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                              <span className="font-medium text-slate-900">{stop.load_number || stop.id.slice(0, 8)}</span>
                              <Badge className={`text-xs px-1 py-0 h-4 ${stop.isPickup ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {stop.isPickup ? 'P/U' : 'DEL'}
                              </Badge>
                            </div>
                            <span className="text-slate-600 font-medium">
                              {format(stop.stopTime, 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{stop.location?.city || 'Unknown'}, {stop.location?.state || ''}</span>
                          </div>
                        </div>
                      ))}
                      {upcomingStops.length > 5 && (
                        <p className="text-xs text-slate-500 text-center pt-1">+{upcomingStops.length - 5} more stops</p>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <p className="text-xs font-medium text-slate-600 mb-2">Today's Summary</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-emerald-600">{onTimeRate}%</p>
                    <p className="text-xs text-emerald-700">On-Time</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-600">{completedLoads.length}/{todayLoads.length}</p>
                    <p className="text-xs text-blue-700">Completed</p>
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