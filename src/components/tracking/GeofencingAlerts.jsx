import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigation, MapPin, Bell, AlertCircle, CheckCircle, Settings } from "lucide-react";

export default function GeofencingAlerts({ loads, eldData, drivers, operatingMode }) {
  const [geofenceRadius, setGeofenceRadius] = useState(25); // miles

  // Mock geofencing alerts
  const geofenceAlerts = loads.map((load, idx) => {
    const eld = eldData[idx];
    const driver = drivers?.find(d => d.id === load.driver_id);
    const distanceToStop = eld?.next_stop_distance || 0;
    const isNearStop = distanceToStop <= geofenceRadius;

    return {
      load_id: load.id,
      load_number: load.load_number || `LOAD-${load.id.slice(0, 8)}`,
      driver_name: driver?.full_name || 'Unknown Driver',
      stop_type: load.status === 'dispatched' ? 'pickup' : 'delivery',
      location: load.status === 'dispatched'
        ? `${load.pickup_location?.city}, ${load.pickup_location?.state}`
        : `${load.dropoff_location?.city}, ${load.dropoff_location?.state}`,
      distance_to_stop: distanceToStop,
      is_near: isNearStop,
      eta_minutes: Math.floor(distanceToStop / (eld?.speed || 60) * 60),
      triggered_at: isNearStop ? new Date().toISOString() : null,
      acknowledged: Math.random() > 0.5
    };
  }).filter(alert => alert.is_near);

  const handleAcknowledge = (alert) => {
    alert(`Alert acknowledged for ${alert.load_number}`);
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-6 h-6 text-purple-600" />
            Geofencing Alerts
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">
              <Bell className="w-3 h-3 mr-1" />
              {geofenceAlerts.filter(a => !a.acknowledged).length} Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-purple-800 mb-3">
            <strong>📍 Geofencing System:</strong> Automatically alerts you when drivers approach stop locations.
            Set custom radius and receive real-time notifications.
          </p>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-purple-900">Alert Radius:</label>
            <Input
              type="number"
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(parseInt(e.target.value) || 25)}
              className="w-24"
            />
            <span className="text-sm text-purple-800">miles</span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="space-y-3">
          {geofenceAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                alert.acknowledged
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-purple-300 bg-purple-50 animate-pulse'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    alert.acknowledged ? 'bg-slate-400' : 'bg-purple-600'
                  }`}>
                    {alert.acknowledged ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <Bell className="w-5 h-5 text-white animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{alert.load_number}</h4>
                    <p className="text-sm text-slate-600">{alert.driver_name}</p>
                  </div>
                </div>
                <Badge className={
                  alert.stop_type === 'pickup' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }>
                  {alert.stop_type}
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-slate-900">Approaching:</span>
                  <span className="text-slate-700">{alert.location}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{alert.distance_to_stop.toFixed(1)} mi away</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">ETA: {alert.eta_minutes} min</span>
                  </div>
                </div>
              </div>

              {alert.triggered_at && (
                <div className="text-xs text-slate-500 mb-3">
                  Alert triggered at {new Date(alert.triggered_at).toLocaleTimeString()}
                </div>
              )}

              <div className="flex gap-2">
                {!alert.acknowledged ? (
                  <>
                    <Button
                      onClick={() => handleAcknowledge(alert)}
                      size="sm"
                      className="bg-purple-600 text-white"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      Call Driver
                    </Button>
                  </>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Acknowledged
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {geofenceAlerts.length === 0 && (
          <div className="text-center py-12">
            <Navigation className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No geofencing alerts at this time</p>
            <p className="text-sm text-slate-500 mt-2">
              Alerts appear when drivers are within {geofenceRadius} miles of a stop
            </p>
          </div>
        )}

        {/* Settings */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Geofencing Settings
          </h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span>Email notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span>SMS notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span>Push notifications (LoadPanel App)</span>
            </label>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}