import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle,
  Filter,
  Search,
  Package,
  Truck,
  RefreshCw
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Appointments Book
            </h1>
            <p className="text-slate-600 mt-2">
              Calendar view of all scheduled pickup and delivery appointments
            </p>
          </div>
          <Button onClick={() => refetch()} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{totalAppointments}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Confirmed</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{confirmedAppointments}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingAppointments}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Loads</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{filteredLoads.length}</p>
                </div>
                <Truck className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search loads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="next_week">Next Week</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
              </select>

              {/* Source Filter */}
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="all">All Sources</option>
                <option value="opendock">Opendock</option>
                <option value="internal">Internal</option>
              </select>

            </div>
          </CardContent>
        </Card>

        {/* Appointments Calendar View */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Scheduled Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLoads.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Appointments Found</h3>
                <p className="text-slate-600">
                  Try adjusting your filters or schedule new appointments
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLoads.map(load => (
                  <div
                    key={load.id}
                    className="p-6 bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-lg transition-all"
                  >
                    {/* Load Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">
                            {load.load_number || load.external_load_number || load.id.slice(0, 8)}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">{load.status}</Badge>
                          {load.opendock_load_id && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Package className="w-3 h-3 mr-1" />
                              Opendock
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {load.pickup_location?.city}, {load.pickup_location?.state}
                          </span>
                          <span>→</span>
                          <span>
                            {load.dropoff_location?.city}, {load.dropoff_location?.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Pickup Appointment */}
                      {load.pickup_appointment?.scheduled && (
                        <div className={`p-4 rounded-lg border-2 ${
                          load.pickup_appointment?.confirmed
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-blue-50 border-blue-300'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-slate-900">Pickup Appointment</h4>
                            {load.pickup_appointment?.confirmed ? (
                              <Badge className="bg-emerald-600 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Confirmed
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-600 text-white">
                                <Clock className="w-3 h-3 mr-1" />
                                Scheduled
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-600" />
                              <span className="font-semibold">
                                {load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : 'Not set'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-600" />
                              <span>
                                {load.pickup_appointment.time_window_start} - {load.pickup_appointment.time_window_end}
                              </span>
                            </div>
                            {load.pickup_appointment.confirmation_number && (
                              <div className="text-xs text-slate-600 mt-2">
                                Confirmation: {load.pickup_appointment.confirmation_number}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Delivery Appointment */}
                      {load.delivery_appointment?.scheduled && (
                        <div className={`p-4 rounded-lg border-2 ${
                          load.delivery_appointment?.confirmed
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-blue-50 border-blue-300'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-slate-900">Delivery Appointment</h4>
                            {load.delivery_appointment?.confirmed ? (
                              <Badge className="bg-emerald-600 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Confirmed
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-600 text-white">
                                <Clock className="w-3 h-3 mr-1" />
                                Scheduled
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-600" />
                              <span className="font-semibold">
                                {load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : 'Not set'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-600" />
                              <span>
                                {load.delivery_appointment.time_window_start} - {load.delivery_appointment.time_window_end}
                              </span>
                            </div>
                            {load.delivery_appointment.confirmation_number && (
                              <div className="text-xs text-slate-600 mt-2">
                                Confirmation: {load.delivery_appointment.confirmation_number}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}