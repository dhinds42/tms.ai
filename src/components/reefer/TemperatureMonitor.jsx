import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer, AlertTriangle } from "lucide-react";

export default function TemperatureMonitor() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const reeferLoads = loads.filter(l => l.equipment_type === 'reefer');
  const activeReefer = reeferLoads.filter(l => l.status === 'in_transit' || l.status === 'dispatched');

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-600" />
          Temperature-Controlled Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900 font-semibold">Active Reefer</p>
            <p className="text-3xl font-bold text-blue-600">{activeReefer.length}</p>
          </div>
          <div className="p-4 bg-cyan-50 rounded border border-cyan-200">
            <p className="text-sm text-cyan-900 font-semibold">Total Reefer</p>
            <p className="text-3xl font-bold text-cyan-600">{reeferLoads.length}</p>
          </div>
        </div>

        <div className="space-y-2">
          {activeReefer.slice(0, 5).map((load) => (
            <div key={load.id} className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Load #{load.load_number}</p>
                  <p className="text-xs text-slate-600">{load.commodity}</p>
                </div>
                <Badge className="bg-blue-600">
                  <Thermometer className="w-3 h-3 mr-1" />
                  Temp Control
                </Badge>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}