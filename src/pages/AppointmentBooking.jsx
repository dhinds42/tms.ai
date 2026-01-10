import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Truck,
  Package,
  Search,
  Lightbulb,
  Zap,
  BarChart3,
  Target,
  Bell,
  CalendarDays,
  Timer,
  ArrowRight,
  Filter
} from "lucide-react";

// Import the appointment scheduler component
import AppointmentScheduler from "../components/opendock/AppointmentScheduler";

export default function AppointmentBooking() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [activeTab, setActiveTab] = useState("opendock");
  
  const queryClient = useQueryClient();

  // Fetch loads needing appointments (all sources)
  const { data: loads, refetch } = useQuery({
    queryKey: ['loadsForAppointments'],
    queryFn: async () => {
      const allLoads = await base44.entities.Load.list('-created_date', 100);
      return allLoads.filter(l => 
        ['assigned', 'dispatched', 'picked_up'].includes(l.status) &&
        (!l.pickup_appointment?.confirmed || !l.delivery_appointment?.confirmed)
      );
    },
    initialData: []
  });

  // Statistics
  const opendockLoads = loads.filter(l => l.opendock_load_id);
  const internalLoads = loads.filter(l => !l.opendock_load_id);
  const needsPickup = loads.filter(l => !l.pickup_appointment?.scheduled || !l.pickup_appointment?.confirmed);
  const needsDelivery = loads.filter(l => !l.delivery_appointment?.scheduled || !l.delivery_appointment?.confirmed);
  const confirmedCount = loads.filter(l => l.pickup_appointment?.confirmed && l.delivery_appointment?.confirmed).length;
  const confirmationRate = loads.length > 0 ? Math.round((confirmedCount / loads.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-cyan-800 to-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Appointment Booking</h1>
                  <p className="text-cyan-200 text-base mt-1">Schedule pickup & delivery appointments from one unified interface</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-cyan-500/90 text-white border-0 px-3 py-1 text-sm font-medium">
                  {operatingMode.toUpperCase()} MODE
                </Badge>
                <Badge className="bg-emerald-500/90 text-white border-0 px-3 py-1 text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {confirmedCount} Confirmed
                </Badge>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search loads by number, origin, or destination..."
                  className="pl-12 h-12 text-base border-0 shadow-lg rounded-xl"
                />
              </div>
              <Button onClick={() => refetch()} className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl shadow-lg">
                <RefreshCw className="w-5 h-5 mr-2" /> Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">{loads.length}</p>
                <p className="text-xs text-slate-500">Total Loads</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{opendockLoads.length}</p>
                <p className="text-xs text-slate-500">Opendock</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{needsPickup.length}</p>
                <p className="text-xs text-slate-500">Needs Pickup</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{needsDelivery.length}</p>
                <p className="text-xs text-slate-500">Needs Delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{confirmationRate}%</p>
                <p className="text-xs text-slate-500">Confirmed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4">

        {/* Info Banner */}
        {(needsPickup.length > 0 || needsDelivery.length > 0) && (
          <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">⚠️ {needsPickup.length + needsDelivery.length} Appointments Needed</p>
                  <p className="text-xs text-amber-700">{needsPickup.length} pickups and {needsDelivery.length} deliveries pending scheduling</p>
                </div>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">Schedule Now</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 h-10">
            <TabsTrigger value="opendock" className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              Opendock ({opendockLoads.length})
            </TabsTrigger>
            <TabsTrigger value="internal" className="text-xs">
              <Truck className="w-3 h-3 mr-1" />
              Internal ({internalLoads.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              All ({loads.length})
            </TabsTrigger>
          </TabsList>

          {/* Opendock Appointments Tab */}
          <TabsContent value="opendock">
            {opendockLoads.length === 0 ? (
              <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Opendock Loads</h3>
                  <p className="text-sm text-slate-600">Accept loads from the Opendock Load Board</p>
                </CardContent>
              </Card>
            ) : (
              <AppointmentScheduler />
            )}
          </TabsContent>

          {/* Internal Appointments Tab */}
          <TabsContent value="internal">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Internal Load Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {internalLoads.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">All internal loads have appointments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {internalLoads.slice(0, 5).map(load => (
                      <div key={load.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{load.load_number || load.id.slice(0, 8)}</p>
                            <p className="text-xs text-slate-600">
                              {load.pickup_location?.city} → {load.dropoff_location?.city}
                            </p>
                          </div>
                          <Badge className="text-xs bg-blue-100 text-blue-800">{load.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`p-2 rounded text-center text-xs ${load.pickup_appointment?.confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {load.pickup_appointment?.confirmed ? '✓ Pickup' : '⏰ Pickup'}
                          </div>
                          <div className={`p-2 rounded text-center text-xs ${load.delivery_appointment?.confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {load.delivery_appointment?.confirmed ? '✓ Delivery' : '⏰ Delivery'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Appointments Tab */}
          <TabsContent value="all">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> All Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loads.slice(0, 6).map(load => (
                    <div key={load.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-slate-900 text-sm">{load.load_number || load.id.slice(0, 8)}</p>
                            {load.opendock_load_id && <Badge className="text-xs bg-purple-100 text-purple-800">Opendock</Badge>}
                          </div>
                          <p className="text-xs text-slate-600">
                            {load.pickup_location?.city} → {load.dropoff_location?.city}
                          </p>
                        </div>
                        <Badge className="text-xs bg-slate-200 text-slate-700">{load.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2 rounded text-center text-xs ${load.pickup_appointment?.confirmed ? 'bg-emerald-100 text-emerald-800' : load.pickup_appointment?.scheduled ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                          {load.pickup_appointment?.confirmed ? '✓ Pickup' : load.pickup_appointment?.scheduled ? '⏰ Pickup' : '⚠ Pickup'}
                        </div>
                        <div className={`p-2 rounded text-center text-xs ${load.delivery_appointment?.confirmed ? 'bg-emerald-100 text-emerald-800' : load.delivery_appointment?.scheduled ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                          {load.delivery_appointment?.confirmed ? '✓ Delivery' : load.delivery_appointment?.scheduled ? '⏰ Delivery' : '⚠ Delivery'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {loads.length > 6 && (
                    <Button variant="ghost" size="sm" className="w-full text-xs">View All {loads.length} Loads</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            
            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-cyan-800">
                  <Lightbulb className="w-4 h-4" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {needsPickup.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">📅 Pickup Scheduling</p>
                    <p className="text-xs text-amber-700">{needsPickup.length} loads need pickup appointments. Schedule to avoid delays.</p>
                  </div>
                )}
                {needsDelivery.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">🚛 Delivery Scheduling</p>
                    <p className="text-xs text-blue-700">{needsDelivery.length} loads need delivery appointments.</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-cyan-100">
                  <p className="text-xs font-semibold text-cyan-900 mb-1">⏰ Time Windows</p>
                  <p className="text-xs text-cyan-700">Book during off-peak hours (6-8am) for faster dock access.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-cyan-100">
                  <p className="text-xs font-semibold text-cyan-900 mb-1">📞 Confirm Early</p>
                  <p className="text-xs text-cyan-700">Call facilities 24hrs before to confirm appointments.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">✅ Best Practice</p>
                  <p className="text-xs text-emerald-700">Schedule deliveries with 2-hour buffer for delays.</p>
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
                    <span className="text-slate-600">Pickups Scheduled</span>
                    <span className="font-medium">{loads.length > 0 ? Math.round(((loads.length - needsPickup.length) / loads.length) * 100) : 0}%</span>
                  </div>
                  <Progress value={loads.length > 0 ? ((loads.length - needsPickup.length) / loads.length) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Deliveries Scheduled</span>
                    <span className="font-medium">{loads.length > 0 ? Math.round(((loads.length - needsDelivery.length) / loads.length) * 100) : 0}%</span>
                  </div>
                  <Progress value={loads.length > 0 ? ((loads.length - needsDelivery.length) / loads.length) * 100 : 0} className="h-2" />
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
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" /> Schedule All Pickups
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" /> Confirm Pending
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Bell className="w-4 h-4 mr-2 text-amber-600" /> Send Reminders
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Filter className="w-4 h-4 mr-2 text-purple-600" /> Filter Unscheduled
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
                <p>• Book 48hrs ahead for guaranteed slots</p>
                <p>• Avoid Monday/Friday peak times</p>
                <p>• Request PO/reference numbers</p>
                <p>• Document confirmation numbers</p>
                <p>• Set up auto-reminders for drivers</p>
                <p>• Track detention time at each stop</p>
              </CardContent>
            </Card>

            {/* Today's Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="w-4 h-4" /> Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Confirmed</span>
                  <span className="font-bold text-emerald-700">{confirmedCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Pending</span>
                  <span className="font-bold text-amber-700">{needsPickup.length + needsDelivery.length}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Opendock Synced</span>
                  <span className="font-bold text-purple-700">{opendockLoads.length}</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}