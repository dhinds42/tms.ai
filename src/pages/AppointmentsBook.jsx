import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle,
  Filter,
  Search,
  Package,
  Truck,
  RefreshCw,
  CalendarDays,
  Lightbulb,
  Zap,
  BarChart3,
  Target,
  Bell,
  Timer,
  AlertTriangle
} from "lucide-react";

export default function AppointmentsBook() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, this_week, next_week
  const [statusFilter, setStatusFilter] = useState('all'); // all, scheduled, confirmed
  const [sourceFilter, setSourceFilter] = useState('all'); // all, opendock, internal

  // Fetch all loads with appointments
  const { data: loads, refetch } = useQuery({
    queryKey: ['appointmentsBook'],
    queryFn: async () => {
      const allLoads = await base44.entities.Load.list('-pickup_date', 200);
      return allLoads.filter(l => 
        l.pickup_appointment?.scheduled || l.delivery_appointment?.scheduled
      );
    },
    initialData: []
  });

  // Filter appointments
  const filteredLoads = loads.filter(load => {
    // Search filter
    const searchMatch = searchTerm === '' || 
      load.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.external_load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      load.dropoff_location?.city?.toLowerCase().includes(searchTerm.toLowerCase());

    // Source filter
    const sourceMatch = sourceFilter === 'all' ||
      (sourceFilter === 'opendock' && load.opendock_load_id) ||
      (sourceFilter === 'internal' && !load.opendock_load_id);

    // Status filter
    const statusMatch = statusFilter === 'all' ||
      (statusFilter === 'scheduled' && (
        (load.pickup_appointment?.scheduled && !load.pickup_appointment?.confirmed) ||
        (load.delivery_appointment?.scheduled && !load.delivery_appointment?.confirmed)
      )) ||
      (statusFilter === 'confirmed' && (
        load.pickup_appointment?.confirmed || load.delivery_appointment?.confirmed
      ));

    // Date filter (based on pickup date)
    let dateMatch = true;
    if (dateFilter !== 'all' && load.pickup_date) {
      const pickupDate = new Date(load.pickup_date);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const weekFromNow = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const twoWeeksFromNow = new Date(todayStart.getTime() + 14 * 24 * 60 * 60 * 1000);

      if (dateFilter === 'today') {
        dateMatch = pickupDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'this_week') {
        dateMatch = pickupDate >= todayStart && pickupDate < weekFromNow;
      } else if (dateFilter === 'next_week') {
        dateMatch = pickupDate >= weekFromNow && pickupDate < twoWeeksFromNow;
      }
    }

    return searchMatch && sourceMatch && statusMatch && dateMatch;
  });

  // Statistics
  const totalAppointments = filteredLoads.reduce((sum, load) => {
    let count = 0;
    if (load.pickup_appointment?.scheduled) count++;
    if (load.delivery_appointment?.scheduled) count++;
    return sum + count;
  }, 0);

  const confirmedAppointments = filteredLoads.reduce((sum, load) => {
    let count = 0;
    if (load.pickup_appointment?.confirmed) count++;
    if (load.delivery_appointment?.confirmed) count++;
    return sum + count;
  }, 0);

  const pendingAppointments = totalAppointments - confirmedAppointments;
  const confirmationRate = totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0;

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
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Appointments Book</h1>
                  <p className="text-indigo-200 text-base mt-1">Calendar view of all scheduled pickup & delivery appointments</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-emerald-500/90 text-white border-0 px-3 py-1 text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {confirmedAppointments} Confirmed
                </Badge>
                <Badge className="bg-amber-500/90 text-white border-0 px-3 py-1 text-sm font-medium">
                  {pendingAppointments} Pending
                </Badge>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by load number, city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-0 shadow-lg rounded-xl"
                />
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-12 px-4 bg-white border-0 shadow-lg rounded-xl text-sm"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="next_week">Next Week</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 px-4 bg-white border-0 shadow-lg rounded-xl text-sm"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
              </select>
              <Button onClick={() => refetch()} className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl shadow-lg">
                <RefreshCw className="w-5 h-5 mr-2" /> Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{totalAppointments}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{confirmedAppointments}</p>
                <p className="text-xs text-slate-500">Confirmed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">{pendingAppointments}</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{filteredLoads.length}</p>
                <p className="text-xs text-slate-500">Loads</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{confirmationRate}%</p>
                <p className="text-xs text-slate-500">Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert for pending */}
        {pendingAppointments > 0 && (
          <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">⏰ {pendingAppointments} Appointments Pending Confirmation</p>
                  <p className="text-xs text-amber-700">Follow up with facilities to confirm these appointments</p>
                </div>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">Confirm All</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Appointments List */}
          <div className="lg:col-span-2 space-y-4">

        {/* Appointments List */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Scheduled Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLoads.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Appointments Found</h3>
                <p className="text-sm text-slate-600">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLoads.slice(0, 6).map(load => (
                  <div key={load.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                    {/* Load Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900">
                            {load.load_number || load.id.slice(0, 8)}
                          </p>
                          <Badge className="text-xs bg-blue-100 text-blue-800">{load.status}</Badge>
                          {load.opendock_load_id && (
                            <Badge className="text-xs bg-purple-100 text-purple-800">Opendock</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          {load.pickup_location?.city} → {load.dropoff_location?.city}
                        </p>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-2 gap-2">
                      {load.pickup_appointment?.scheduled && (
                        <div className={`p-2 rounded-lg text-xs ${load.pickup_appointment?.confirmed ? 'bg-emerald-100 border border-emerald-300' : 'bg-blue-100 border border-blue-300'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">Pickup</span>
                            {load.pickup_appointment?.confirmed ? (
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-blue-600" />
                            )}
                          </div>
                          <p className="text-slate-600">{load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                      )}
                      {load.delivery_appointment?.scheduled && (
                        <div className={`p-2 rounded-lg text-xs ${load.delivery_appointment?.confirmed ? 'bg-emerald-100 border border-emerald-300' : 'bg-blue-100 border border-blue-300'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">Delivery</span>
                            {load.delivery_appointment?.confirmed ? (
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Clock className="w-3 h-3 text-blue-600" />
                            )}
                          </div>
                          <p className="text-slate-600">{load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredLoads.length > 6 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs">View All {filteredLoads.length} Appointments</Button>
                )}
              </div>
            )}
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
                {pendingAppointments > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">⏰ Pending Confirmations</p>
                    <p className="text-xs text-amber-700">{pendingAppointments} appointments need confirmation. Follow up with facilities.</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-900 mb-1">📅 Scheduling Tips</p>
                  <p className="text-xs text-indigo-700">Book 48-72 hours ahead for best slot availability.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-900 mb-1">🕐 Optimal Times</p>
                  <p className="text-xs text-indigo-700">Early morning (6-8am) slots have fastest dock turnaround.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-900 mb-1">📞 Confirmation Calls</p>
                  <p className="text-xs text-indigo-700">Call facilities 24hrs before to confirm and get dock numbers.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">✅ Best Practice</p>
                  <p className="text-xs text-emerald-700">Document all confirmation numbers for dispute resolution.</p>
                </div>
              </CardContent>
            </Card>

            {/* Booking Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Booking Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Confirmation Rate</span>
                    <span className="font-medium">{confirmationRate}%</span>
                  </div>
                  <Progress value={confirmationRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Same-Day Scheduled</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">On-Time Arrivals</span>
                    <span className="font-medium text-emerald-600">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
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
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" /> Confirm All Pending
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Bell className="w-4 h-4 mr-2 text-amber-600" /> Send Reminders
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" /> Export Calendar
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Filter className="w-4 h-4 mr-2 text-purple-600" /> Advanced Filters
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
                <p>• Confirm appointments 24hrs ahead</p>
                <p>• Avoid scheduling on peak hours</p>
                <p>• Keep buffer time between stops</p>
                <p>• Record confirmation numbers</p>
                <p>• Track detention time at facilities</p>
                <p>• Update drivers on time changes</p>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="w-4 h-4" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Confirmed</span>
                  <span className="font-bold text-emerald-700">{confirmedAppointments}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Pending</span>
                  <span className="font-bold text-amber-700">{pendingAppointments}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Total Loads</span>
                  <span className="font-bold text-indigo-700">{filteredLoads.length}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}