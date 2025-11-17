import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bell, CheckCircle, AlertTriangle } from "lucide-react";

export default function GeofencingAlerts() {
  const { data: geofenceEvents = [] } = useQuery({
    queryKey: ['geofenceEvents'],
    queryFn: () => base44.entities.GeofenceEvent.list('-created_date', 200),
    initialData: [],
  });

  const { data: geofenceZones = [] } = useQuery({
    queryKey: ['geofenceZones'],
    queryFn: () => base44.entities.GeofenceZone.list('-created_date', 100),
    initialData: [],
  });

  const recentEvents = geofenceEvents.slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
            Geofencing & Smart Alerts
          </h1>
          <p className="text-slate-600 mt-2">Location-based tracking and automated notifications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Zones</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{geofenceZones.length}</p>
                </div>
                <MapPin className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Events</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{geofenceEvents.length}</p>
                </div>
                <Bell className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Arrivals</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {geofenceEvents.filter(e => e.event_type === 'entered').length}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Violations</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {geofenceEvents.filter(e => e.event_type === 'violation').length}
                  </p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Geofence Events</h3>
            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No geofence events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="p-4 border border-slate-200 rounded-lg hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {event.event_type === 'entered' ? '🟢 Entered' : 
                           event.event_type === 'exited' ? '🔴 Exited' : 
                           '⚠️ Violation'}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {new Date(event.event_timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={
                        event.event_type === 'entered' ? 'bg-emerald-600' :
                        event.event_type === 'exited' ? 'bg-blue-600' :
                        'bg-red-600'
                      }>
                        {event.event_type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}