import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Truck, Clock, Gauge, RefreshCw } from "lucide-react";

export default function FleetLocationMap({ loads, drivers, eldData, operatingMode, lastUpdate }) {
  const [selectedLoad, setSelectedLoad] = useState(null);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Real-Time Fleet Location
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-800">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Live Tracking
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              {loads.length} Active Trucks
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Map Placeholder - In production, use Google Maps or Mapbox */}
        <div className="relative w-full h-[500px] bg-slate-100 rounded-lg border-2 border-slate-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Interactive Fleet Map</h3>
              <p className="text-slate-600 max-w-md">
                In production, integrate with Google Maps API or Mapbox to display real-time truck locations,
                routes, and geofencing zones.
              </p>
            </div>
          </div>

          {/* Mock truck markers */}
          <div className="absolute top-20 left-32 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="absolute top-40 right-40 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="absolute bottom-32 left-48 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Truck className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Active Trucks List */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Active Trucks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loads.map((load, idx) => {
              const eld = eldData[idx];
              const driver = drivers?.find(d => d.id === load.driver_id);

              return (
                <div
                  key={load.id}
                  onClick={() => setSelectedLoad(load)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedLoad?.id === load.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
                      </h4>
                      {driver && (
                        <p className="text-sm text-slate-600">{driver.full_name}</p>
                      )}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {load.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">
                        {load.dropoff_location?.city}, {load.dropoff_location?.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{eld?.speed || 0} mph</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">HOS: {eld?.hos_remaining || 0}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700">{eld?.next_stop_distance || 0} mi to next stop</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Last Update</span>
                      <span className="font-semibold text-slate-700">
                        {new Date(eld?.gps_position?.last_update || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {loads.length === 0 && (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No active trucks to track</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-3">Map Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>In Transit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
              <span>On Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
              <span>At Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Delayed</span>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}