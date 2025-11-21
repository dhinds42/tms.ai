import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Clock, MapPin, Package } from "lucide-react";

export default function CrossDockScheduler() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const crossdockLoads = loads.filter(l => l.requires_cross_dock);

  const [dockSlots] = useState([
    { id: 1, dock: 'Dock 1', inbound: 'Load #1234', outbound: 'Load #5678', status: 'active', window: '10:00-12:00' },
    { id: 2, dock: 'Dock 2', inbound: 'Load #2345', outbound: 'Load #6789', status: 'scheduled', window: '12:00-14:00' },
    { id: 3, dock: 'Dock 3', inbound: null, outbound: null, status: 'available', window: '14:00-16:00' }
  ]);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-orange-600" />
          Cross-Dock Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-emerald-50 rounded">
            <p className="text-xs text-emerald-900">Active</p>
            <p className="text-2xl font-bold text-emerald-600">
              {dockSlots.filter(d => d.status === 'active').length}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-xs text-blue-900">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">
              {dockSlots.filter(d => d.status === 'scheduled').length}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-xs text-slate-900">Available</p>
            <p className="text-2xl font-bold text-slate-600">
              {dockSlots.filter(d => d.status === 'available').length}
            </p>
          </div>
        </div>

        {dockSlots.map((slot) => (
          <div key={slot.id} className={`p-4 rounded-lg border-2 ${
            slot.status === 'active' ? 'bg-emerald-50 border-emerald-300' :
            slot.status === 'scheduled' ? 'bg-blue-50 border-blue-300' :
            'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-bold">{slot.dock}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span className="text-sm">{slot.window}</span>
                <Badge className={
                  slot.status === 'active' ? 'bg-emerald-600' :
                  slot.status === 'scheduled' ? 'bg-blue-600' :
                  'bg-slate-600'
                }>
                  {slot.status}
                </Badge>
              </div>
            </div>
            {slot.inbound && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-white/60 rounded">
                  <p className="text-xs text-slate-600">Inbound</p>
                  <p className="font-semibold">{slot.inbound}</p>
                </div>
                <div className="p-2 bg-white/60 rounded">
                  <p className="text-xs text-slate-600">Outbound</p>
                  <p className="font-semibold">{slot.outbound}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        <Button className="w-full bg-orange-600">
          <Package className="w-4 h-4 mr-2" />
          Schedule Cross-Dock
        </Button>

      </CardContent>
    </Card>
  );
}