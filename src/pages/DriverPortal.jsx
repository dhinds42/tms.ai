import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  Truck,
  DollarSign,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp
} from "lucide-react";
import { PageHeader, StandardTabs } from "@/components/design-system";
import EnhancedDriverPortalDashboard from "../components/driver-portal/EnhancedDriverPortalDashboard";

export default function DriverPortal() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [activeTab, setActiveTab] = useState("dashboard");

  const queryClient = useQueryClient();

  // Fetch current user (driver)
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null,
  });

  // Fetch driver profile
  const { data: driverProfile } = useQuery({
    queryKey: ['driverProfile'],
    queryFn: async () => {
      const drivers = await base44.entities.Driver.list();
      return drivers.find(d => d.email === currentUser?.email) || null;
    },
    enabled: !!currentUser,
    initialData: null,
  });

  // Fetch driver's loads
  const { data: myLoads } = useQuery({
    queryKey: ['myLoads'],
    queryFn: async () => {
      const loads = await base44.entities.Load.list('-created_date', 50);
      return loads.filter(l => l.driver_id === driverProfile?.id);
    },
    enabled: !!driverProfile,
    initialData: [],
  });

  // Fetch driver's documents
  const { data: myDocuments } = useQuery({
    queryKey: ['myDocuments'],
    queryFn: async () => {
      const docs = await base44.entities.Document.list('-created_date', 50);
      return docs.filter(d => d.uploaded_by === currentUser?.email);
    },
    enabled: !!currentUser,
    initialData: [],
  });

  // Show error if not in carrier mode
  if (operatingMode !== 'carrier') {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader title="Driver Portal" icon={User} />
        <div className="max-w-4xl mx-auto p-6">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Carrier Mode Required</h2>
              <p className="text-red-700">Driver Portal is only available in Carrier Mode.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeLoads = myLoads.filter(l => ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status));
  const completedLoads = myLoads.filter(l => l.status === 'delivered');
  const totalEarnings = myLoads.reduce((sum, l) => {
    if (!driverProfile?.payment_structure) return sum;
    if (driverProfile.payment_structure === 'percentage') {
      return sum + ((l.carrier_pay || 0) * (driverProfile.payment_rate / 100));
    }
    return sum + (driverProfile.payment_rate || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Driver Portal"
        subtitle={`Welcome, ${driverProfile?.full_name || currentUser?.full_name || 'Driver'}`}
        icon={User}
        badge={
          <Badge className={driverProfile?.status === 'available' ? 'bg-emerald-600' : 'bg-amber-600'}>
            {driverProfile?.status?.toUpperCase() || 'INACTIVE'}
          </Badge>
        }
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

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
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Earnings</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">${totalEarnings.toLocaleString()}</p>
                </div>
                <DollarSign className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">HOS Remaining</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{driverProfile?.hos_remaining || 0}h</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Driver Portal */}
        {driverProfile && (
          <EnhancedDriverPortalDashboard driverId={driverProfile.id} />
        )}

        {/* Legacy Tabs (Fallback) */}
        <StandardTabs
          tabs={[
            { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { key: 'loads', label: 'My Loads', icon: Truck },
            { key: 'documents', label: 'Documents', icon: FileText },
            { key: 'profile', label: 'Profile', icon: User }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="hidden">
          <TabsList className="hidden"></TabsList>

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
                        {activeLoads[0].delivery_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-600" />
                            <span>Due: {new Date(activeLoads[0].delivery_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Documents */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myDocuments.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">No documents uploaded yet</p>
                  ) : (
                    <div className="space-y-2">
                      {myDocuments.slice(0, 5).map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-semibold">{doc.document_type?.toUpperCase()}</span>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                            {doc.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* My Loads Tab */}
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
                      <div key={load.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-900">
                                {load.load_number || load.id.slice(0, 8)}
                              </span>
                              <Badge className={
                                load.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                ['in_transit', 'picked_up'].includes(load.status) ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }>
                                {load.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="w-3 h-3" />
                              {load.pickup_location?.city} → {load.dropoff_location?.city}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>My Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myDocuments.map(doc => (
                    <div key={doc.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-600" />
                          <div>
                            <p className="font-semibold text-slate-900">{doc.document_type?.toUpperCase()}</p>
                            <p className="text-sm text-slate-600">{doc.file_name}</p>
                          </div>
                        </div>
                        <Badge className={doc.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                          {doc.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Driver Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {driverProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 uppercase">Full Name</p>
                        <p className="font-semibold text-slate-900">{driverProfile.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase">Phone</p>
                        <p className="font-semibold text-slate-900">{driverProfile.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase">CDL Number</p>
                        <p className="font-semibold text-slate-900">{driverProfile.cdl_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase">CDL Expiration</p>
                        <p className="font-semibold text-slate-900">
                          {driverProfile.cdl_expiration ? new Date(driverProfile.cdl_expiration).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase">Equipment</p>
                        <p className="font-semibold text-slate-900">{driverProfile.equipment_assigned || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 uppercase">Status</p>
                        <Badge className={driverProfile.status === 'available' ? 'bg-emerald-600' : 'bg-amber-600'}>
                          {driverProfile.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">Driver profile not found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}