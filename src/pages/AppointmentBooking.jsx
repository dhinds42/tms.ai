import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Send,
  XCircle,
  Truck,
  Package
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

  // Show error if not in carrier mode
  if (operatingMode !== 'carrier') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                Carrier Mode Required
              </h2>
              <p className="text-red-700 mb-6">
                Appointment booking is only available in Carrier Mode.
              </p>
              <Badge className="bg-red-600 text-white text-lg px-6 py-2">
                Current Mode: BROKER
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
              Appointment Booking
            </h1>
            <p className="text-slate-600 mt-2">
              Schedule pickup and delivery appointments for your loads
            </p>
          </div>
          <Button onClick={() => refetch()} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Loads</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{loads.length}</p>
                </div>
                <Truck className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Opendock Loads</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{opendockLoads.length}</p>
                </div>
                <Package className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Needs Pickup</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{needsPickup.length}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Needs Delivery</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{needsDelivery.length}</p>
                </div>
                <Clock className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">📍 Multi-Source Appointment Management</h3>
              <p className="text-sm text-blue-800">
                Book appointments for Opendock loads and internal loads from one unified interface. 
                Opendock appointments sync automatically via API, while internal appointments are managed locally.
              </p>
            </div>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="opendock">
              <Package className="w-4 h-4 mr-2" />
              Opendock Loads ({opendockLoads.length})
            </TabsTrigger>
            <TabsTrigger value="internal">
              <Truck className="w-4 h-4 mr-2" />
              Internal Loads ({internalLoads.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              <Calendar className="w-4 h-4 mr-2" />
              All Loads ({loads.length})
            </TabsTrigger>
          </TabsList>

          {/* Opendock Appointments Tab */}
          <TabsContent value="opendock">
            {opendockLoads.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No Opendock Loads</h3>
                  <p className="text-slate-600">
                    Accept loads from the Opendock Load Board to schedule appointments
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AppointmentScheduler />
            )}
          </TabsContent>

          {/* Internal Appointments Tab */}
          <TabsContent value="internal">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Internal Load Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {internalLoads.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">All Set!</h3>
                    <p className="text-slate-600">
                      All internal loads have appointments scheduled
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {internalLoads.map(load => (
                      <div
                        key={load.id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-slate-900 mb-1">
                              {load.load_number || load.id.slice(0, 8)}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="w-3 h-3" />
                              {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">{load.status}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Pickup Appointment */}
                          <div className={`p-3 rounded-lg ${
                            load.pickup_appointment?.confirmed 
                              ? 'bg-emerald-50 border border-emerald-300' 
                              : 'bg-amber-50 border border-amber-300'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold">Pickup</span>
                              {load.pickup_appointment?.confirmed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-600" />
                              )}
                            </div>
                            {load.pickup_appointment?.scheduled ? (
                              <p className="text-xs text-slate-600">
                                {load.pickup_appointment.time_window_start} - {load.pickup_appointment.time_window_end}
                              </p>
                            ) : (
                              <Button size="sm" className="w-full text-xs bg-amber-600">
                                Schedule
                              </Button>
                            )}
                          </div>

                          {/* Delivery Appointment */}
                          <div className={`p-3 rounded-lg ${
                            load.delivery_appointment?.confirmed 
                              ? 'bg-emerald-50 border border-emerald-300' 
                              : 'bg-amber-50 border border-amber-300'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold">Delivery</span>
                              {load.delivery_appointment?.confirmed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-600" />
                              )}
                            </div>
                            {load.delivery_appointment?.scheduled ? (
                              <p className="text-xs text-slate-600">
                                {load.delivery_appointment.time_window_start} - {load.delivery_appointment.time_window_end}
                              </p>
                            ) : (
                              <Button size="sm" className="w-full text-xs bg-amber-600">
                                Schedule
                              </Button>
                            )}
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
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  All Appointments Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loads.map(load => (
                    <div
                      key={load.id}
                      className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900">
                              {load.load_number || load.external_load_number || load.id.slice(0, 8)}
                            </h4>
                            <Badge className="bg-blue-100 text-blue-800 text-xs">{load.status}</Badge>
                            {load.opendock_load_id && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">Opendock</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-3 h-3" />
                            {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Pickup Status */}
                        <div className={`p-2 rounded text-center ${
                          load.pickup_appointment?.confirmed 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : load.pickup_appointment?.scheduled
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          <p className="text-xs font-semibold">Pickup</p>
                          <p className="text-xs mt-1">
                            {load.pickup_appointment?.confirmed 
                              ? '✓ Confirmed' 
                              : load.pickup_appointment?.scheduled
                              ? '⏰ Scheduled'
                              : '⚠ Pending'}
                          </p>
                        </div>

                        {/* Delivery Status */}
                        <div className={`p-2 rounded text-center ${
                          load.delivery_appointment?.confirmed 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : load.delivery_appointment?.scheduled
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          <p className="text-xs font-semibold">Delivery</p>
                          <p className="text-xs mt-1">
                            {load.delivery_appointment?.confirmed 
                              ? '✓ Confirmed' 
                              : load.delivery_appointment?.scheduled
                              ? '⏰ Scheduled'
                              : '⚠ Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}