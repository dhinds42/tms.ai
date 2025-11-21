import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Ship, Anchor } from "lucide-react";

export default function ContainerTrackerMap() {
  const { data: containers } = useQuery({
    queryKey: ['containers'],
    queryFn: () => base44.entities.Container.list('-created_date', 50),
    initialData: [],
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'at_port': return 'bg-blue-600';
      case 'in_transit': return 'bg-amber-600';
      case 'delivered': return 'bg-emerald-600';
      case 'customs': return 'bg-purple-600';
      default: return 'bg-slate-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'at_port': return <Anchor className="w-4 h-4" />;
      case 'in_transit': return <Ship className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-blue-600" />
          Container Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {containers.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No containers to track</p>
          </div>
        ) : (
          containers.slice(0, 10).map((container) => (
            <div key={container.id} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(container.status)}
                  <span className="font-bold text-slate-900">{container.container_number}</span>
                </div>
                <Badge className={getStatusColor(container.status)}>
                  {container.status || 'unknown'}
                </Badge>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <div className="flex items-center gap-1">
                  <Ship className="w-3 h-3" />
                  <span>Vessel: {container.vessel_name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Last Location: {container.current_location || 'Unknown'}</span>
                </div>
              </div>
            </div>
          ))
        )}

      </CardContent>
    </Card>
  );
}