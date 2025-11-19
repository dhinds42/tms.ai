import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bell, CheckCircle } from "lucide-react";

export default function GeofenceAlerts() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 50),
    initialData: [],
  });

  const activeLoads = loads.filter(l => l.status === 'in_transit' || l.status === 'dispatched');

  const mockAlerts = [
    { load: activeLoads[0], type: 'arrival', location: 'Destination', time: '5 min ago' },
    { load: activeLoads[1], type: 'departure', location: 'Origin', time: '15 min ago' },
    { load: activeLoads[2], type: 'deviation', location: 'Route', time: '1 hour ago' }
  ].filter(a => a.load);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Geofence Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900 font-semibold">Active Zones</p>
            <p className="text-2xl font-bold text-blue-600">{activeLoads.length * 2}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold">Arrivals</p>
            <p className="text-2xl font-bold text-emerald-600">
              {mockAlerts.filter(a => a.type === 'arrival').length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-900 font-semibold">Deviations</p>
            <p className="text-2xl font-bold text-amber-600">
              {mockAlerts.filter(a => a.type === 'deviation').length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Recent Alerts</h4>
          {mockAlerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded border ${
              alert.type === 'arrival' ? 'bg-emerald-50 border-emerald-200' :
              alert.type === 'departure' ? 'bg-blue-50 border-blue-200' :
              'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Load #{alert.load?.load_number}</p>
                  <p className="text-xs text-slate-600">{alert.type} at {alert.location}</p>
                </div>
                <Badge className={
                  alert.type === 'arrival' ? 'bg-emerald-600' :
                  alert.type === 'departure' ? 'bg-blue-600' : 'bg-amber-600'
                }>
                  {alert.time}
                </Badge>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}