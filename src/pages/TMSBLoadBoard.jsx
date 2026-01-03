import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { normalizeLoad } from "@/lib/loadFieldMapper";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Truck, MapPin, Calendar, DollarSign, Phone, Navigation } from "lucide-react";

export default function TMSBLoadBoard() {
  const [searchTerm, setSearchTerm] = useState('');
  
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
    queryKey: ['assignedLoads', driver?.id],
    queryFn: async () => {
      if (!driver?.id) return [];
      return (await base44.entities.Load.filter({ 
        driver_id: driver.id,
        synced_to_tms_b: true,
        status: { $in: ['assigned', 'dispatched', 'picked_up', 'in_transit'] }
      }, '-created_date', 50)).map(normalizeLoad);
    },
    enabled: !!driver?.id,
    initialData: [],
  });

  const filteredLoads = loads.filter(load =>
    load.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    load.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    load.dropoff_location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-600',
      dispatched: 'bg-purple-600',
      picked_up: 'bg-amber-600',
      in_transit: 'bg-emerald-600',
    };
    return colors[status] || 'bg-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My Loads</h1>
              <p className="text-blue-100 mt-2">Driver Operations Portal</p>
              {driver && <p className="text-sm mt-1">Welcome, {driver.first_name} {driver.last_name}</p>}
            </div>
            <Truck className="w-16 h-16 opacity-30" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Loads</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{loads.length}</p>
                </div>
                <Truck className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Transit</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {loads.filter(l => l.status === 'in_transit').length}
                  </p>
                </div>
                <Navigation className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Today's Deliveries</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {loads.filter(l => {
                      const today = new Date().toDateString();
                      return l.planned_delivery_datetime && new Date(l.planned_delivery_datetime).toDateString() === today;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Est. Earnings</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    ${loads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assigned Loads</CardTitle>
              <Input
                placeholder="Search loads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLoads.map(load => (
                <Card key={load.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{load.load_number}</h3>
                          <Badge className={getStatusColor(load.status)}>{load.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{load.commodity || 'General Freight'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">
                          ${(load.carrier_pay || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">{load.distance_miles_planned || 0} miles</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-4">
                      <div>
                        <div className="flex items-start gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-emerald-600 mt-1" />
                          <div>
                            <p className="text-xs text-slate-500">PICKUP</p>
                            <p className="font-semibold text-slate-900">
                              {load.pickup_location?.city}, {load.pickup_location?.state}
                            </p>
                            <p className="text-xs text-slate-600">
                              {load.planned_pickup_datetime && new Date(load.planned_pickup_datetime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-red-600 mt-1" />
                          <div>
                            <p className="text-xs text-slate-500">DELIVERY</p>
                            <p className="font-semibold text-slate-900">
                              {load.dropoff_location?.city}, {load.dropoff_location?.state}
                            </p>
                            <p className="text-xs text-slate-600">
                              {load.planned_delivery_datetime && new Date(load.planned_delivery_datetime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {load.special_instructions && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <p className="text-xs font-semibold text-amber-900 mb-1">Special Instructions:</p>
                        <p className="text-sm text-amber-800">{load.special_instructions}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button className="flex-1 bg-blue-600">
                        <Navigation className="w-4 h-4 mr-2" />
                        Navigate
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Dispatch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredLoads.length === 0 && (
                <div className="text-center py-12">
                  <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No loads assigned</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}