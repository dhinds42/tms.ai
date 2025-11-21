import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Clock, Package } from "lucide-react";

export default function TMSBDispatch() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myLoads } = useQuery({
    queryKey: ['myAssignedLoads'],
    queryFn: async () => {
      const loads = await base44.entities.Load.list('-created_date', 50);
      return loads.filter(l => l.driver_id === user?.id);
    },
    initialData: [],
    enabled: !!user,
  });

  const activeLoads = myLoads.filter(l => ['assigned', 'dispatched', 'picked_up', 'in_transit'].includes(l.status));
  const completedToday = myLoads.filter(l => {
    const deliveryDate = new Date(l.actual_delivery_datetime);
    const today = new Date();
    return l.status === 'delivered' && deliveryDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            My Dispatch Board
          </h1>
          <p className="text-slate-600 mt-2">TMS-B: Driver-Facing Load Management</p>
          <Badge className="mt-2 bg-blue-600">Driver Portal</Badge>
        </div>

        <div className="grid grid-cols-3 gap-6">
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
                  <p className="text-sm font-semibold text-slate-500 uppercase">Completed Today</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{completedToday.length}</p>
                </div>
                <Package className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total This Week</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{myLoads.length}</p>
                </div>
                <Clock className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>My Active Loads</CardTitle>
          </CardHeader>
          <CardContent>
            {activeLoads.length > 0 ? (
              <div className="space-y-4">
                {activeLoads.map(load => (
                  <Card key={load.id} className="border border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-lg text-slate-900">{load.load_number}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-slate-600" />
                            <span className="text-sm text-slate-700">
                              {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-blue-600">{load.status}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Pickup</p>
                          <p className="font-semibold">{load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Delivery</p>
                          <p className="font-semibold">{load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : 'TBD'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Miles</p>
                          <p className="font-semibold">{load.distance_miles || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Weight</p>
                          <p className="font-semibold">{load.weight?.toLocaleString() || 0} lbs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active loads assigned</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}