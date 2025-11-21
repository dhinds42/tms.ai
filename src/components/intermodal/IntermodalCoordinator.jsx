import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Truck, Ship, Train } from "lucide-react";

export default function IntermodalCoordinator() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const intermodalLoads = loads.filter(l => l.is_intermodal || l.service_type === 'intermodal');

  const getModeIcon = (mode) => {
    switch(mode) {
      case 'rail': return <Train className="w-4 h-4 text-purple-600" />;
      case 'ocean': return <Ship className="w-4 h-4 text-blue-600" />;
      case 'truck': return <Truck className="w-4 h-4 text-orange-600" />;
      default: return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Intermodal Coordination
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2 bg-purple-50 rounded text-center">
            <Train className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-purple-900">Rail</p>
            <p className="text-lg font-bold text-purple-600">
              {loads.filter(l => l.mode_primary === 'rail').length}
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded text-center">
            <Ship className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-blue-900">Ocean</p>
            <p className="text-lg font-bold text-blue-600">
              {loads.filter(l => l.mode_primary === 'ocean').length}
            </p>
          </div>
          <div className="p-2 bg-orange-50 rounded text-center">
            <Truck className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-xs text-orange-900">Truck</p>
            <p className="text-lg font-bold text-orange-600">
              {loads.filter(l => l.mode_primary === 'truck').length}
            </p>
          </div>
        </div>

        {intermodalLoads.length === 0 ? (
          <div className="text-center py-8">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No intermodal shipments</p>
          </div>
        ) : (
          intermodalLoads.slice(0, 6).map((load) => (
            <div key={load.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getModeIcon(load.mode_primary)}
                  <span className="font-bold text-slate-900">{load.load_number}</span>
                </div>
                <Badge className="bg-indigo-600">Multi-Modal</Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                {load.mode_primary && (
                  <Badge variant="outline" className="text-xs">
                    {load.mode_primary}
                  </Badge>
                )}
                {load.mode_secondary && (
                  <Badge variant="outline" className="text-xs">
                    → {load.mode_secondary}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}

      </CardContent>
    </Card>
  );
}