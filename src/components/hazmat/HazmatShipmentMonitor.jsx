import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield } from "lucide-react";

export default function HazmatShipmentMonitor() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const hazmatLoads = loads.filter(l => l.is_hazmat);
  const activeHazmat = hazmatLoads.filter(l => l.status === 'in_transit' || l.status === 'dispatched');

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Active Hazmat Shipments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-red-900 font-semibold">Active Hazmat</p>
            <p className="text-3xl font-bold text-red-600">{activeHazmat.length}</p>
          </div>
          <div className="p-4 bg-amber-50 rounded border border-amber-200">
            <p className="text-sm text-amber-900 font-semibold">Total Hazmat</p>
            <p className="text-3xl font-bold text-amber-600">{hazmatLoads.length}</p>
          </div>
        </div>

        <div className="space-y-2">
          {activeHazmat.slice(0, 5).map((load) => (
            <div key={load.id} className="p-3 bg-red-50 rounded border-2 border-red-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Load #{load.load_number}</p>
                  <p className="text-xs text-slate-600">
                    {load.origin_city}, {load.origin_state} → {load.destination_city}, {load.destination_state}
                  </p>
                </div>
                <Badge className="bg-red-600">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Hazmat
                </Badge>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}