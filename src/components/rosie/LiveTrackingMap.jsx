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
                Real-time location of all active loads
              </p>
            </div>
          </div>
          <Badge className="bg-cyan-600 text-white">
            {loads.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Placeholder Map - In production, integrate with Google Maps/Mapbox */}
        <div className="relative h-96 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-2">Live Map View</p>
              <p className="text-sm text-slate-500">
                Integrate with Google Maps API for real-time tracking
              </p>
            </div>
          </div>

          {/* Simulated Pins */}
          <div className="absolute top-10 left-20">
            <div className="relative animate-pulse">
              <div className="w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="absolute top-32 left-48">
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
          <div className="absolute top-52 right-32">
            <div className="w-6 h-6 bg-amber-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          </div>
        </div>

        {/* Load List */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {loads.slice(0, 6).map((load, index) => {
            const driver = drivers.find(d => d.id === load.driver_id);
            return (
              <div key={load.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-600" />
                    <span className="font-semibold text-slate-900 text-sm">
                      {load.load_number || `#${load.id.slice(0, 8)}`}
                    </span>
                  </div>
                  <Badge className={`text-xs ${
                    index % 3 === 0 ? 'bg-emerald-100 text-emerald-700' :
                    index % 3 === 1 ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {load.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-1">
                  {load.pickup_location?.city} → {load.dropoff_location?.city}
                </p>
                {driver && (
                  <p className="text-xs text-slate-500">
                    Driver: {driver.full_name}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}