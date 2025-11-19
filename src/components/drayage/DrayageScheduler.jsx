import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Anchor, Clock } from "lucide-react";

export default function DrayageScheduler() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const drayageLoads = loads.filter(l => l.mode === 'drayage' || l.load_type === 'drayage');

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Anchor className="w-5 h-5 text-cyan-600" />
          Drayage Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-cyan-50 rounded border border-cyan-200">
            <p className="text-xs text-cyan-900 font-semibold">Pending Pickup</p>
            <p className="text-2xl font-bold text-cyan-600">
              {drayageLoads.filter(l => l.status === 'pending').length}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900 font-semibold">In Transit</p>
            <p className="text-2xl font-bold text-blue-600">
              {drayageLoads.filter(l => l.status === 'in_transit').length}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold">Delivered</p>
            <p className="text-2xl font-bold text-emerald-600">
              {drayageLoads.filter(l => l.status === 'delivered').length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Active Drayage Moves</h4>
          {drayageLoads.slice(0, 5).map((load) => (
            <div key={load.id} className="p-3 bg-cyan-50 rounded border border-cyan-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Load #{load.load_number}</p>
                  <p className="text-xs text-slate-600">
                    Port: {load.origin_city || 'TBA'}
                  </p>
                </div>
                <Badge className="bg-cyan-600">Drayage</Badge>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}