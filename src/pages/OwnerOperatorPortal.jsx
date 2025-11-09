import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  Truck,
  DollarSign,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin
} from "lucide-react";

export default function OwnerOperatorPortal() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null,
  });

  // Fetch owner operator profile
  const { data: ownerOpProfile } = useQuery({
    queryKey: ['ownerOpProfile'],
    queryFn: async () => {
      const ownerOps = await base44.entities.OwnerOperator.list();
      return ownerOps.find(o => o.email === currentUser?.email) || null;
    },
    enabled: !!currentUser,
    initialData: null,
  });

  // Fetch loads
  const { data: myLoads } = useQuery({
    queryKey: ['myLoads'],
    queryFn: async () => {
      const loads = await base44.entities.Load.list('-created_date', 50);
      return loads.filter(l => l.driver_id === ownerOpProfile?.id);
    },
    enabled: !!ownerOpProfile,
    initialData: [],
  });

  if (operatingMode !== 'carrier') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Carrier Mode Required</h2>
              <p className="text-red-700">Owner Operator Portal is only available in Carrier Mode.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completedLoads = myLoads.filter(l => l.status === 'delivered');
  const activeLoads = myLoads.filter(l => ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Owner Operator Portal
            </h1>
            <p className="text-slate-600 mt-1">
              Welcome, {ownerOpProfile?.full_name || currentUser?.full_name || 'Owner Operator'}
            </p>
          </div>
          <Badge className={ownerOpProfile?.status === 'active' ? 'bg-emerald-600 text-lg px-6 py-2' : 'bg-amber-600 text-lg px-6 py-2'}>
            {ownerOpProfile?.status?.toUpperCase() || 'PENDING'}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Active Loads</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{activeLoads.length}</p>
                </div>
                <Truck className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Completed</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{completedLoads.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    ${(ownerOpProfile?.total_revenue || 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">On-Time %</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {ownerOpProfile?.on_time_percentage || 0}%
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="loads">My Loads</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Current Load */}
              {activeLoads.length > 0 && (
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Current Load
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-600 text-white">{activeLoads[0].status}</Badge>
                        <span className="font-semibold text-slate-900">
                          {activeLoads[0].load_number || activeLoads[0].id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>{activeLoads[0].pickup_location?.city}, {activeLoads[0].pickup_location?.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{activeLoads[0].dropoff_location?.city}, {activeLoads[0].dropoff_location?.state}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Equipment Info */}
              {ownerOpProfile?.equipment_owned && (
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      My Equipment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Truck</p>
                          <p className="font-semibold">{ownerOpProfile.equipment_owned.truck_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Make/Model</p>
                          <p className="font-semibold">{ownerOpProfile.equipment_owned.make_model || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase">Year</p>
                          <p className="font-semibold">{ownerOpProfile.equipment_owned.year || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </TabsContent>

          {/* Other tabs similar to DriverPortal */}
          <TabsContent value="loads">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>My Loads</CardTitle>
              </CardHeader>
              <CardContent>
                {myLoads.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No loads assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myLoads.map(load => (
                      <div key={load.id} className="p-4 border border-slate-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold">{load.load_number || load.id.slice(0, 8)}</span>
                              <Badge className="bg-blue-100 text-blue-800">{load.status}</Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {load.pickup_location?.city} → {load.dropoff_location?.city}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Equipment Details</CardTitle>
              </CardHeader>
              <CardContent>
                {ownerOpProfile?.equipment_owned ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 uppercase">Truck Number</p>
                      <p className="font-semibold text-slate-900">{ownerOpProfile.equipment_owned.truck_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 uppercase">Make/Model</p>
                      <p className="font-semibold text-slate-900">{ownerOpProfile.equipment_owned.make_model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 uppercase">Year</p>
                      <p className="font-semibold text-slate-900">{ownerOpProfile.equipment_owned.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 uppercase">VIN</p>
                      <p className="font-semibold text-slate-900">{ownerOpProfile.equipment_owned.vin || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No equipment information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                {ownerOpProfile ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                      <p className="text-sm text-slate-500 uppercase mb-2">Payment Structure</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        {ownerOpProfile.payment_structure === 'percentage' 
                          ? `${ownerOpProfile.payment_rate}%`
                          : ownerOpProfile.payment_structure === 'per_mile'
                          ? `$${ownerOpProfile.payment_rate}/mile`
                          : `$${ownerOpProfile.payment_rate}/load`
                        }
                      </p>
                      <p className="text-sm text-slate-600 mt-1 capitalize">
                        {ownerOpProfile.payment_structure?.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 uppercase">Total Revenue</p>
                        <p className="font-semibold text-slate-900">${(ownerOpProfile.total_revenue || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase">Total Paid</p>
                        <p className="font-semibold text-slate-900">${(ownerOpProfile.total_paid || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No payment information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Owner Operator Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {ownerOpProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 uppercase">Full Name</p>
                        <p className="font-semibold">{ownerOpProfile.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase">Company</p>
                        <p className="font-semibold">{ownerOpProfile.company_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase">CDL Number</p>
                        <p className="font-semibold">{ownerOpProfile.cdl_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase">Status</p>
                        <Badge className={ownerOpProfile.status === 'active' ? 'bg-emerald-600' : 'bg-amber-600'}>
                          {ownerOpProfile.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">Profile not found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}