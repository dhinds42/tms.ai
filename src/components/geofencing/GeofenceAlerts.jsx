import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, CheckCircle } from "lucide-react";

export default function GeofenceAlerts() {
  const alerts = [
    { id: 1, type: 'entry', location: 'Dallas Distribution Center', vehicle: 'Truck #1234', time: '10:23 AM' },
    { id: 2, type: 'exit', location: 'Houston Terminal', vehicle: 'Truck #5678', time: '10:15 AM' },
    { id: 3, type: 'deviation', location: 'Route 45 North', vehicle: 'Truck #9012', time: '10:05 AM' }
  ];

  const getAlertIcon = (type) => {
    switch(type) {
      case 'entry': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'exit': return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'deviation': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <MapPin className="w-4 h-4 text-slate-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'entry': return 'bg-emerald-50 border-emerald-200';
      case 'exit': return 'bg-blue-50 border-blue-200';
      case 'deviation': return 'bg-red-50 border-red-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          Geofence Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {getAlertIcon(alert.type)}
                <span className="font-semibold text-sm">{alert.location}</span>
              </div>
              <Badge variant="outline" className="text-xs">{alert.time}</Badge>
            </div>
            <p className="text-xs text-slate-600">{alert.vehicle}</p>
          </div>
        ))}

      </CardContent>
    </Card>
  );
}