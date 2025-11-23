import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TrendingUp, Users, Truck, AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
import { format, startOfDay, endOfDay, addDays, isWithinInterval } from "date-fns";

export default function ActivityPlanning() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('today'); // today, week, month

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-pickup_date', 200),
    initialData: [],
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: auditLogs } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => base44.entities.AuditLog.list('-timestamp', 100),
    initialData: [],
  });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Activity Planning
            </h1>
            <p className="text-slate-600 mt-2">
              Schedule overview, resource allocation, and workload balancing
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === 'today' ? 'default' : 'outline'}
              onClick={() => setViewMode('today')}
              className={viewMode === 'today' ? 'bg-indigo-600' : ''}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'week' ? 'default' : 'outline'}
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'bg-indigo-600' : ''}
            >
              Week
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'default' : 'outline'}
              onClick={() => setViewMode('month')}
              className={viewMode === 'month' ? 'bg-indigo-600' : ''}
            >
              Month
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Today's Pickups</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{todayPickups.length}</p>
                </div>
                <MapPin className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Today's Deliveries</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{todayDeliveries.length}</p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Loads</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{activeLoads.length}</p>
                </div>
                <Truck className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Driver Utilization</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{utilizationRate}%</p>
                </div>
                <Users className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {overdueLoads.length > 0 && (
          <Card className="border-2 border-red-400 shadow-xl bg-gradient-to-r from-red-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900">⚠️ {overdueLoads.length} Overdue Load(s)</h3>
                  <p className="text-sm text-red-800">Loads have passed delivery date without completion. Immediate attention required.</p>
                </div>
                <Button className="bg-red-600 text-white">
                  Review Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7-Day Workload Forecast */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              7-Day Workload Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-3">
              {workloadByDay.map((day, idx) => {
                const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 text-center ${
                      isToday 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : isWeekend 
                        ? 'border-slate-200 bg-slate-50' 
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wider ${
                      isToday ? 'text-indigo-900' : 'text-slate-600'
                    }`}>
                      {format(day.date, 'EEE')}
                    </p>
                    <p className={`text-lg font-bold mt-1 ${
                      isToday ? 'text-indigo-600' : 'text-slate-900'
                    }`}>
                      {format(day.date, 'd')}
                    </p>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Pickups:</span>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">{day.pickups}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Deliveries:</span>
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs">{day.deliveries}</Badge>
                      </div>
                    </div>
                    <Badge className={`mt-2 text-xs ${
                      day.count > 15 ? 'bg-red-100 text-red-800' :
                      day.count > 10 ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {day.count} total
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Pickups Today */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Today's Pickups ({todayPickups.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayPickups.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-2" />
                  <p className="text-slate-600">No pickups scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayPickups.slice(0, 5).map((load) => (
                    <div key={load.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {load.load_number || `Load ${load.id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-slate-600">
                            {load.pickup_location?.city}, {load.pickup_location?.state}
                          </p>
                        </div>
                        <Badge className={
                          load.status === 'picked_up' ? 'bg-emerald-600 text-white' :
                          load.status === 'dispatched' ? 'bg-blue-600 text-white' :
                          'bg-slate-600 text-white'
                        }>
                          {load.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {load.pickup_date ? format(new Date(load.pickup_date), 'h:mm a') : 'Time TBD'}
                      </div>
                    </div>
                  ))}
                  {todayPickups.length > 5 && (
                    <p className="text-sm text-slate-600 text-center">+ {todayPickups.length - 5} more</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliveries Today */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Today's Deliveries ({todayDeliveries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayDeliveries.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600">No deliveries scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayDeliveries.slice(0, 5).map((load) => (
                    <div key={load.id} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {load.load_number || `Load ${load.id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-slate-600">
                            {load.dropoff_location?.city}, {load.dropoff_location?.state}
                          </p>
                        </div>
                        <Badge className={
                          load.status === 'delivered' ? 'bg-emerald-600 text-white' :
                          load.status === 'in_transit' ? 'bg-blue-600 text-white' :
                          'bg-slate-600 text-white'
                        }>
                          {load.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {load.delivery_date ? format(new Date(load.delivery_date), 'h:mm a') : 'Time TBD'}
                      </div>
                    </div>
                  ))}
                  {todayDeliveries.length > 5 && (
                    <p className="text-sm text-slate-600 text-center">+ {todayDeliveries.length - 5} more</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Resource Allocation */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Resource Allocation & Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Total Drivers</p>
                <p className="text-2xl font-bold text-purple-600">{drivers.length}</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Available</p>
                <p className="text-2xl font-bold text-emerald-600">{availableDrivers.length}</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">On Load</p>
                <p className="text-2xl font-bold text-blue-600">{driversOnLoad}</p>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Utilization</p>
                <p className="text-2xl font-bold text-indigo-600">{utilizationRate}%</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-3">Driver Status Breakdown:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['available', 'on_duty', 'driving', 'off_duty'].map(status => {
                  const count = drivers.filter(d => d.driver_status === status).length;
                  return (
                    <div key={status} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                      <span className="text-sm capitalize text-slate-700">{status.replace('_', ' ')}</span>
                      <Badge className="bg-indigo-600 text-white text-xs">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Loads Timeline */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Upcoming Loads ({upcomingLoads.length} in next {viewMode === 'today' ? '24 hours' : viewMode === 'week' ? '7 days' : '30 days'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingLoads.slice(0, 10).map((load) => (
                <div key={load.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {load.load_number || `Load ${load.id.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-slate-600">
                        {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                      </p>
                    </div>
                    <Badge className={
                      load.status === 'available' ? 'bg-blue-600 text-white' :
                      load.status === 'assigned' ? 'bg-purple-600 text-white' :
                      load.status === 'dispatched' ? 'bg-indigo-600 text-white' :
                      'bg-slate-600 text-white'
                    }>
                      {load.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Pickup:</p>
                      <p className="font-semibold text-slate-900">
                        {load.pickup_date ? format(new Date(load.pickup_date), 'MMM d, h:mm a') : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Delivery:</p>
                      <p className="font-semibold text-slate-900">
                        {load.delivery_date ? format(new Date(load.delivery_date), 'MMM d, h:mm a') : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingLoads.length > 10 && (
                <div className="text-center py-3">
                  <Button variant="outline" size="sm">
                    View All {upcomingLoads.length} Loads
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Log */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{log.action}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                      <span>👤 {log.user_id}</span>
                      <span>•</span>
                      <span>
                        {log.timestamp ? formatDistanceToNow(new Date(log.timestamp), { addSuffix: true }) : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-600">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}