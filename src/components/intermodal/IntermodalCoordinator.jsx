import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Truck, Train, Ship } from "lucide-react";

export default function IntermodalCoordinator() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const intermodalLoads = loads.filter(l => l.mode === 'intermodal' || l.is_intermodal);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Intermodal Coordination
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-indigo-50 rounded border border-indigo-200">
            <p className="text-xs text-indigo-900 font-semibold">Total</p>
            <p className="text-2xl font-bold text-indigo-600">{intermodalLoads.length}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <p className="text-xl font-bold text-blue-600">12</p>
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4 text-purple-600" />
              <p className="text-xl font-bold text-purple-600">8</p>
            </div>
          </div>
          <div className="p-3 bg-cyan-50 rounded border border-cyan-200">
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-cyan-600" />
              <p className="text-xl font-bold text-cyan-600">4</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Active Intermodal Shipments</h4>
          {intermodalLoads.slice(0, 5).map((load) => (
            <div key={load.id} className="p-3 bg-indigo-50 rounded border border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Load #{load.load_number}</p>
                  <p className="text-xs text-slate-600">Multi-modal transport</p>
                </div>
                <Badge className="bg-indigo-600">Intermodal</Badge>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}