import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin,
  Search,
  RefreshCw,
  Lightbulb,
  Zap,
  BarChart3,
  Target,
  ArrowRight,
  Activity,
  CalendarDays,
  Timer,
  Route,
  Bell
} from "lucide-react";
import { format, startOfDay, endOfDay, addDays, isWithinInterval, formatDistanceToNow } from "date-fns";

export default function ActivityPlanning() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('today'); // today, week, month

  const { data: loads, isLoading } = useScopedEntity('Load', { limit: 200, sort: '-pickup_date' });
  const { data: drivers } = useScopedEntity('Driver', { limit: 100 });
  const { data: auditLogs } = useScopedEntity('AuditLog', { limit: 100, sort: '-timestamp' });

  // Date range based on view mode
  const getDateRange = () => {
    const start = startOfDay(selectedDate);
    if (viewMode === 'today') {
      return { start, end: endOfDay(selectedDate) };
    } else if (viewMode === 'week') {
      return { start, end: endOfDay(addDays(selectedDate, 6)) };
    } else {
      return { start, end: endOfDay(addDays(selectedDate, 29)) };
    }
  };

  const dateRange = getDateRange();

  // Filter loads by date range
  const upcomingLoads = loads.filter(l => {
    const pickupDate = l.pickup_date ? new Date(l.pickup_date) : null;
    const deliveryDate = l.delivery_date ? new Date(l.delivery_date) : null;
    return (pickupDate && isWithinInterval(pickupDate, dateRange)) ||
           (deliveryDate && isWithinInterval(deliveryDate, dateRange));
  });

  // Categorize loads
  const todayPickups = upcomingLoads.filter(l => 
    l.pickup_date && 
    isWithinInterval(new Date(l.pickup_date), { start: startOfDay(new Date()), end: endOfDay(new Date()) })
  );

  const todayDeliveries = upcomingLoads.filter(l => 
    l.delivery_date && 
    isWithinInterval(new Date(l.delivery_date), { start: startOfDay(new Date()), end: endOfDay(new Date()) })
  );

  const activeLoads = loads.filter(l => ['dispatched', 'picked_up', 'in_transit'].includes(l.status));
  const availableDrivers = drivers.filter(d => d.driver_status === 'available');
  const overdueLoads = loads.filter(l => 
    l.delivery_date && 
    new Date(l.delivery_date) < new Date() && 
    !['delivered', 'invoiced', 'closed'].includes(l.status)
  );

  // Driver utilization
  const driversOnLoad = drivers.filter(d => ['on_duty', 'driving'].includes(d.driver_status)).length;
  const utilizationRate = drivers.length > 0 ? Math.round((driversOnLoad / drivers.length) * 100) : 0;

  // Workload by day (next 7 days)
  const workloadByDay = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    const dayLoads = loads.filter(l => {
      const pickup = l.pickup_date ? new Date(l.pickup_date) : null;
      const delivery = l.delivery_date ? new Date(l.delivery_date) : null;
      return (pickup && isWithinInterval(pickup, { start: startOfDay(date), end: endOfDay(date) })) ||
             (delivery && isWithinInterval(delivery, { start: startOfDay(date), end: endOfDay(date) }));
    });
    return {
      date,
      count: dayLoads.length,
      pickups: dayLoads.filter(l => l.pickup_date && isWithinInterval(new Date(l.pickup_date), { start: startOfDay(date), end: endOfDay(date) })).length,
      deliveries: dayLoads.filter(l => l.delivery_date && isWithinInterval(new Date(l.delivery_date), { start: startOfDay(date), end: endOfDay(date) })).length
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Activity Planning</h1>
                  <p className="text-indigo-200 text-base mt-1">Schedule overview, resource allocation & workload balancing</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-emerald-500/90 text-white border-0 px-3 py-1 text-sm font-medium flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {activeLoads.length} Active
                </Badge>
                <Badge className="bg-blue-500/90 text-white border-0 px-3 py-1 text-sm font-medium">
                  {todayPickups.length + todayDeliveries.length} Today
                </Badge>
              </div>
            </div>

            {/* View Mode & Search */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setViewMode('today')}
                  className={viewMode === 'today' ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-white/20 text-white hover:bg-white/30'}
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className={viewMode === 'week' ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-white/20 text-white hover:bg-white/30'}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className={viewMode === 'month' ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-white/20 text-white hover:bg-white/30'}
                >
                  Month
                </Button>
              </div>
              <div className="flex-1 relative md:max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search loads, drivers..."
                  className="pl-10 h-9 text-sm border-0 shadow-lg rounded-lg"
                />
              </div>
              <Button className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 font-medium rounded-lg shadow-lg">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{todayPickups.length}</p>
                <p className="text-xs text-slate-500">Pickups</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{todayDeliveries.length}</p>
                <p className="text-xs text-slate-500">Deliveries</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{activeLoads.length}</p>
                <p className="text-xs text-slate-500">In Transit</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-indigo-600">{utilizationRate}%</p>
                <p className="text-xs text-slate-500">Utilization</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">{overdueLoads.length}</p>
                <p className="text-xs text-slate-500">Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4">

        {/* Critical Alerts */}
        {overdueLoads.length > 0 && (
          <Card className="border-2 border-red-400 shadow-lg bg-gradient-to-r from-red-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900">⚠️ {overdueLoads.length} Overdue Load(s)</h3>
                  <p className="text-sm text-red-800">Immediate attention required.</p>
                </div>
                <Button size="sm" className="bg-red-600 text-white">Review</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics - Now inside main column */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 shadow-md bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pickups</p>
                <p className="text-xl font-bold text-blue-600">{todayPickups.length}</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Deliveries</p>
                <p className="text-xl font-bold text-emerald-600">{todayDeliveries.length}</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Active</p>
                <p className="text-xl font-bold text-purple-600">{activeLoads.length}</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Utilization</p>
                <p className="text-xl font-bold text-indigo-600">{utilizationRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 7-Day Workload Forecast */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              7-Day Workload Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {workloadByDay.map((day, idx) => {
                const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-center ${
                      isToday 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : isWeekend 
                        ? 'border-slate-200 bg-slate-50' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className={`text-xs font-medium ${isToday ? 'text-indigo-900' : 'text-slate-500'}`}>
                      {format(day.date, 'EEE')}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>
                      {format(day.date, 'd')}
                    </p>
                    <div className="mt-2 space-y-1">
                      <Badge className="bg-blue-100 text-blue-800 text-xs w-full justify-center">{day.pickups}P</Badge>
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs w-full justify-center">{day.deliveries}D</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <div className="grid md:grid-cols-2 gap-4">
          
          {/* Pickups Today */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Today's Pickups ({todayPickups.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayPickups.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No pickups scheduled</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayPickups.slice(0, 4).map((load) => (
                    <div key={load.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {load.load_number || `Load ${load.id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-slate-600">
                            {load.pickup_location?.city}, {load.pickup_location?.state}
                          </p>
                        </div>
                        <Badge className="text-xs bg-blue-600 text-white">{load.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {todayPickups.length > 4 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs">+ {todayPickups.length - 4} more</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliveries Today */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Today's Deliveries ({todayDeliveries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayDeliveries.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No deliveries scheduled</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayDeliveries.slice(0, 4).map((load) => (
                    <div key={load.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {load.load_number || `Load ${load.id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-slate-600">
                            {load.dropoff_location?.city}, {load.dropoff_location?.state}
                          </p>
                        </div>
                        <Badge className="text-xs bg-emerald-600 text-white">{load.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {todayDeliveries.length > 4 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs">+ {todayDeliveries.length - 4} more</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Resource Allocation */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Resource Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
                <p className="text-lg font-bold text-purple-600">{drivers.length}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <p className="text-lg font-bold text-emerald-600">{availableDrivers.length}</p>
                <p className="text-xs text-slate-500">Available</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-lg font-bold text-blue-600">{driversOnLoad}</p>
                <p className="text-xs text-slate-500">On Load</p>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                <p className="text-lg font-bold text-indigo-600">{utilizationRate}%</p>
                <p className="text-xs text-slate-500">Util.</p>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <p className="text-xs font-medium text-indigo-900 mb-2">Driver Status:</p>
              <div className="grid grid-cols-4 gap-2">
                {['available', 'on_duty', 'driving', 'off_duty'].map(status => {
                  const count = drivers.filter(d => d.driver_status === status).length;
                  return (
                    <div key={status} className="flex items-center justify-between p-2 bg-white rounded text-xs">
                      <span className="capitalize text-slate-600">{status.replace('_', ' ')}</span>
                      <Badge className="bg-indigo-600 text-white text-xs">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Loads */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Upcoming Loads ({upcomingLoads.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingLoads.slice(0, 5).map((load) => (
                <div key={load.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {load.load_number || `Load ${load.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-slate-600">
                        {load.pickup_location?.city} → {load.dropoff_location?.city}
                      </p>
                    </div>
                    <Badge className="text-xs bg-slate-600 text-white">{load.status}</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>P: {load.pickup_date ? format(new Date(load.pickup_date), 'MMM d') : 'TBD'}</span>
                    <span>D: {load.delivery_date ? format(new Date(load.delivery_date), 'MMM d') : 'TBD'}</span>
                  </div>
                </div>
              ))}
              {upcomingLoads.length > 5 && (
                <Button variant="ghost" size="sm" className="w-full text-xs">View All {upcomingLoads.length} Loads</Button>
              )}
            </div>
          </CardContent>
        </Card>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            
            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-indigo-800">
                  <Lightbulb className="w-4 h-4" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdueLoads.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-red-200">
                    <p className="text-xs font-semibold text-red-900 mb-1">⚠️ Overdue Alert</p>
                    <p className="text-xs text-red-700">{overdueLoads.length} load(s) past delivery date. Prioritize immediately.</p>
                  </div>
                )}
                {availableDrivers.length > 3 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">🚛 Underutilized Drivers</p>
                    <p className="text-xs text-amber-700">{availableDrivers.length} drivers available. Consider assigning more loads.</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-900 mb-1">📅 Schedule Balancing</p>
                  <p className="text-xs text-indigo-700">Distribute loads evenly across the week to avoid bottlenecks.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-900 mb-1">🛣️ Route Optimization</p>
                  <p className="text-xs text-indigo-700">Group nearby pickups to reduce deadhead miles.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">✅ On-Time Performance</p>
                  <p className="text-xs text-emerald-700">Current on-time rate: 92%. Keep up the good work!</p>
                </div>
              </CardContent>
            </Card>

            {/* Utilization Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Utilization Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Driver Utilization</span>
                    <span className="font-medium">{utilizationRate}%</span>
                  </div>
                  <Progress value={utilizationRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Load Capacity Used</span>
                    <span className="font-medium">{Math.min(85, activeLoads.length * 10)}%</span>
                  </div>
                  <Progress value={Math.min(85, activeLoads.length * 10)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">On-Time Delivery</span>
                    <span className="font-medium text-emerald-600">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Route className="w-4 h-4 mr-2 text-blue-600" /> Optimize Routes
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Users className="w-4 h-4 mr-2 text-purple-600" /> Assign Drivers
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Bell className="w-4 h-4 mr-2 text-amber-600" /> Send Reminders
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" /> View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" /> Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>• Review schedule daily for conflicts</p>
                <p>• Assign drivers 24hrs before pickup</p>
                <p>• Monitor ETA updates in real-time</p>
                <p>• Balance workload across drivers</p>
                <p>• Track detention time proactively</p>
                <p>• Communicate delays immediately</p>
              </CardContent>
            </Card>

            {/* Today's Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <TrendingUp className="w-4 h-4" /> Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Pickups Completed</span>
                  <span className="font-bold text-emerald-700">{todayPickups.filter(l => l.status === 'picked_up').length}/{todayPickups.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Deliveries Completed</span>
                  <span className="font-bold text-emerald-700">{todayDeliveries.filter(l => l.status === 'delivered').length}/{todayDeliveries.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Active Drivers</span>
                  <span className="font-bold text-emerald-700">{driversOnLoad}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}