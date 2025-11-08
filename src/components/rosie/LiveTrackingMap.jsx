
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiveTrackingMap({ loads, drivers, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  const onTimeLoads = loads.filter(l => {
    if (!l.eta || !l.delivery_date) return true; // Consider loads without ETA/delivery_date as on-time for simplicity
    return new Date(l.eta) <= new Date(l.delivery_date);
  }).length;

  const atRiskLoads = loads.length - onTimeLoads;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-cyan-600" />
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Live Tracking Map
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Real-time location of all active loads with ETA monitoring
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-600 text-white">
              {onTimeLoads} On-Time
            </Badge>
            {atRiskLoads > 0 && (
              <Badge className="bg-amber-600 text-white">
                {atRiskLoads} At Risk
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Enhanced Map Placeholder */}
        <div className="relative h-96 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-2">Live GPS Tracking</p>
              <p className="text-sm text-slate-500 max-w-md">
                Real-time driver locations, ETAs, and route deviations
              </p>
              <div className="flex gap-4 justify-center mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">On-Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">In Transit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">At Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Truck Icons */}
          <div className="absolute top-10 left-20 animate-pulse">
            <div className="relative">
              <div className="w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="absolute top-32 left-48 animate-pulse" style={{ animationDelay: '0.3s' }}>
            <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute top-52 right-32 animate-pulse" style={{ animationDelay: '0.6s' }}>
            <div className="w-8 h-8 bg-amber-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="absolute bottom-20 right-64 animate-pulse" style={{ animationDelay: '0.9s' }}>
            <div className="w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Enhanced Load List with Real-time Updates */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {loads.slice(0, 6).map((load, index) => {
            const driver = drivers.find(d => d.id === load.driver_id);
            const isOnTime = !load.eta || !load.delivery_date || new Date(load.eta) <= new Date(load.delivery_date);
            
            return (
              <div key={load.id} className={`p-4 rounded-xl border-2 ${
                isOnTime ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      index % 3 === 0 ? 'bg-emerald-500' :
                      index % 3 === 1 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}></div>
                    <Truck className="w-4 h-4 text-cyan-600" />
                    <span className="font-semibold text-slate-900 text-sm">
                      {load.load_number || `#${load.id.slice(0, 8)}`}
                    </span>
                  </div>
                  <Badge className={`text-xs ${
                    isOnTime ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {isOnTime ? 'On-Time' : 'At Risk'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  {load.pickup_location?.city} → {load.dropoff_location?.city}
                </p>
                {driver && (
                  <div className="p-2 bg-white rounded text-xs">
                    <p className="text-slate-600">Driver: {driver.full_name}</p>
                    {driver.current_location && (
                      <p className="text-cyan-600 font-medium">
                        📍 {driver.current_location.city}, {driver.current_location.state}
                      </p>
                    )}
                  </div>
                )}
                {load.eta && (
                  <div className="mt-2 text-xs text-slate-600">
                    ETA: {new Date(load.eta).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}
