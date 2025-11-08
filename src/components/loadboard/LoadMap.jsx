import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";

export default function LoadMap({ loads }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-xl font-bold text-slate-900">
              Load Map View
            </CardTitle>
          </div>
          <Badge className="bg-indigo-600 text-white">
            {loads.length} loads
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Map Placeholder */}
        <div className="relative h-[600px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-2">Interactive Map View</p>
              <p className="text-sm text-slate-500 max-w-md">
                Integrate with Google Maps or Mapbox API to show load origins, destinations, and routes
              </p>
            </div>
          </div>

          {/* Simulated Map Markers */}
          <div className="absolute top-20 left-20">
            <div className="relative">
              <div className="w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-8 left-10 bg-white px-3 py-1 rounded-lg shadow-md text-xs font-semibold whitespace-nowrap">
                {loads[0]?.pickup_location?.city || 'Load Pickup'}
              </div>
            </div>
          </div>
          
          <div className="absolute top-40 right-32">
            <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="absolute bottom-32 left-48">
            <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Load List Sidebar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {loads.slice(0, 6).map((load, index) => (
            <div key={load.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    index % 3 === 0 ? 'bg-emerald-500' :
                    index % 3 === 1 ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="font-semibold text-slate-900 text-sm">
                    {load.load_number || `#${load.id.slice(0, 8)}`}
                  </span>
                </div>
                <Badge className="text-xs bg-slate-200 text-slate-700 capitalize">
                  {load.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">
                {load.pickup_location?.city} → {load.dropoff_location?.city}
              </p>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}