import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Ship, MapPin } from "lucide-react";

export default function ContainerTrackerMap() {
  const { data: containers } = useQuery({
    queryKey: ['containers'],
    queryFn: () => base44.entities.Container.list('-created_date', 50),
    initialData: [],
  });

  const activeContainers = containers.filter(c => c.status === 'in_transit' || c.status === 'at_port');

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-blue-600" />
          Container Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900 font-semibold">At Sea</p>
            <p className="text-2xl font-bold text-blue-600">
              {containers.filter(c => c.status === 'in_transit').length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-900 font-semibold">At Port</p>
            <p className="text-2xl font-bold text-amber-600">
              {containers.filter(c => c.status === 'at_port').length}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold">Delivered</p>
            <p className="text-2xl font-bold text-emerald-600">
              {containers.filter(c => c.status === 'delivered').length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Active Containers</h4>
          {activeContainers.slice(0, 5).map((container) => (
            <div key={container.id} className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{container.container_number}</p>
                  <p className="text-xs text-slate-600">
                    {container.vessel_name || 'Vessel TBA'}
                  </p>
                </div>
                <Badge className="bg-blue-600">{container.status}</Badge>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}