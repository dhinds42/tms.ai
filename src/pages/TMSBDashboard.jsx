import React from "react";
import { base44 } from "@/api/base44Client";
import { normalizeLoad } from "@/components/utils/loadFieldMapper";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, DollarSign, Clock, CheckCircle, Navigation } from "lucide-react";
import { PageHeader } from "@/components/design-system";

export default function TMSBDashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: driver } = useQuery({
    queryKey: ['currentDriver', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const drivers = await base44.entities.Driver.filter({ linked_user_id: user.id });
      return drivers[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: loads } = useQuery({
    queryKey: ['driverLoads', driver?.id],
    queryFn: async () => {
      if (!driver?.id) return [];
      return (await base44.entities.Load.filter({ 
        driver_id: driver.id,
        synced_to_tms_b: true
      }, '-created_date', 50)).map(normalizeLoad);
    },
    enabled: !!driver?.id,
    initialData: [],
  });

  const activeLoads = loads.filter(l => ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status));
  const todayDeliveries = loads.filter(l => {
    const today = new Date().toDateString();
    return l.planned_delivery_datetime && new Date(l.planned_delivery_datetime).toDateString() === today;
  });
  const weekEarnings = loads.filter(l => l.status === 'delivered').reduce((sum, l) => sum + (l.carrier_pay || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Driver Dashboard"
        subtitle={`Welcome back, ${driver?.first_name || 'Driver'}`}
        icon={Truck}
        badge={<Badge className="bg-emerald-600">ACTIVE</Badge>}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <Truck className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm text-slate-600">Active Loads</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{activeLoads.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 text-amber-600 mb-2" />
              <p className="text-sm text-slate-600">Today's Deliveries</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{todayDeliveries.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-sm text-slate-600">Week Earnings</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">${weekEarnings.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-sm text-slate-600">HOS Remaining</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{driver?.hos_remaining || 0}h</p>
            </CardContent>
          </Card>
        </div>

        {activeLoads.slice(0, 3).map(load => (
          <Card key={load.id} className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{load.load_number}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {load.pickup_location?.city}, {load.pickup_location?.state}
                    </div>
                    <Navigation className="w-4 h-4" />
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-red-600" />
                      {load.dropoff_location?.city}, {load.dropoff_location?.state}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">${(load.carrier_pay || 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-600">{load.distance_miles_planned} mi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}