import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Container, MapPin, Clock, TrendingUp } from "lucide-react";

export default function DrayageOperations() {
  const { data: loads = [] } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 200),
    initialData: [],
  });

  const drayageLoads = loads.filter(l => l.mode === 'drayage');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent">
            Drayage Operations
          </h1>
          <p className="text-slate-600 mt-2">Port drayage and container movement management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Drayage</p>
                  <p className="text-3xl font-bold text-teal-600 mt-2">{drayageLoads.length}</p>
                </div>
                <Container className="w-12 h-12 text-teal-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Port Pickups</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {drayageLoads.filter(l => l.pickup_location?.type === 'port').length}
                  </p>
                </div>
                <MapPin className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Transit</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {drayageLoads.filter(l => l.status === 'in_transit').length}
                  </p>
                </div>
                <Truck className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Turn Time</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">3.2h</p>
                </div>
                <Clock className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Active Drayage Moves</h3>
            {drayageLoads.length === 0 ? (
              <div className="text-center py-12">
                <Container className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No active drayage operations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {drayageLoads.map((load) => (
                  <div key={load.id} className="p-4 border border-slate-200 rounded-lg hover:bg-teal-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{load.load_number}</h4>
                        <p className="text-sm text-slate-600">
                          {load.origin_city} → {load.destination_city}
                        </p>
                      </div>
                      <Badge className="bg-teal-600">{load.status}</Badge>
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