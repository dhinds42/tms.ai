import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Truck, Package } from "lucide-react";

export default function CrossDockScheduler() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const inboundLoads = loads.filter(l => l.status === 'at_crossdock' || l.load_type === 'crossdock_inbound').slice(0, 5);
  const outboundLoads = loads.filter(l => l.load_type === 'crossdock_outbound').slice(0, 5);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-orange-600" />
          Cross-Dock Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900 font-semibold">Inbound</p>
            <p className="text-2xl font-bold text-blue-600">{inboundLoads.length}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded border border-orange-200">
            <p className="text-xs text-orange-900 font-semibold">Processing</p>
            <p className="text-2xl font-bold text-orange-600">3</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold">Outbound</p>
            <p className="text-2xl font-bold text-emerald-600">{outboundLoads.length}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Active Cross-Dock Shipments</h4>
          {inboundLoads.map((load) => (
            <div key={load.id} className="p-3 bg-orange-50 rounded border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Load #{load.load_number}</p>
                  <p className="text-xs text-slate-600">
                    {load.origin_city} → {load.destination_city}
                  </p>
                </div>
                <Badge className="bg-orange-600">Cross-Dock</Badge>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}