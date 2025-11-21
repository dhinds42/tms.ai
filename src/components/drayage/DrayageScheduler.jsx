import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Anchor, Calendar, MapPin } from "lucide-react";

export default function DrayageScheduler() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const drayageLoads = loads.filter(l => l.service_type === 'drayage' || l.is_drayage);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Anchor className="w-5 h-5 text-cyan-600" />
          Drayage Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-cyan-50 rounded">
            <p className="text-xs text-cyan-900">Active Moves</p>
            <p className="text-2xl font-bold text-cyan-600">{drayageLoads.length}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-xs text-blue-900">Port Pickups</p>
            <p className="text-2xl font-bold text-blue-600">
              {drayageLoads.filter(l => l.pickup_location_type === 'port').length}
            </p>
          </div>
        </div>

        {drayageLoads.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No drayage operations scheduled</p>
          </div>
        ) : (
          drayageLoads.slice(0, 8).map((load) => (
            <div key={load.id} className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-600" />
                  <span className="font-bold text-slate-900">{load.load_number}</span>
                </div>
                <Badge className="bg-cyan-600">Drayage</Badge>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{load.origin_city} → {load.destination_city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Pickup: {load.pickup_date || 'TBD'}</span>
                </div>
              </div>
            </div>
          ))
        )}

      </CardContent>
    </Card>
  );
}