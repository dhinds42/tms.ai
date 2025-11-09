import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Gauge, 
  Clock, 
  Navigation, 
  Fuel, 
  TrendingUp,
  Settings
} from "lucide-react";

export default function ELDDataPanel({ loads, eldData, drivers, operatingMode }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-cyan-600" />
          ELD Data & Telemetry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
          <p className="text-sm text-cyan-800">
            <strong>📊 Real-Time ELD Integration:</strong> Display critical information from popular ELD systems
            including HOS, GPS position, miles driven, speed, fuel usage, and engine hours.
          </p>
        </div>

        {/* ELD Data Cards */}
        <div className="space-y-4">
          {loads.map((load, idx) => {
            const eld = eldData[idx];
            const driver = drivers?.find(d => d.id === load.driver_id);

            return (
              <div key={load.id} className="p-6 rounded-lg border-2 border-slate-200 hover:shadow-lg transition-all">
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
                    </h4>
                    {driver && (
                      <p className="text-sm text-slate-600 mt-1">{driver.full_name}</p>
                    )}
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-800">
                    <Activity className="w-3 h-3 mr-1" />
                    Live ELD
                  </Badge>
                </div>

                {/* ELD Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  
                  {/* HOS Remaining */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-900 uppercase">HOS</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{eld?.hos_remaining || 0}h</p>
                    <p className="text-xs text-purple-700 mt-1">Remaining</p>
                  </div>

                  {/* Current Speed */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-900 uppercase">Speed</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{eld?.speed || 0}</p>
                    <p className="text-xs text-blue-700 mt-1">mph</p>
                  </div>

                  {/* Miles Driven Today */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-900 uppercase">Miles</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">{eld?.miles_driven_today || 0}</p>
                    <p className="text-xs text-emerald-700 mt-1">Today</p>
                  </div>

                  {/* Fuel Level */}
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Fuel className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-900 uppercase">Fuel</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{eld?.fuel_level || 0}%</p>
                    <p className="text-xs text-amber-700 mt-1">Level</p>
                  </div>

                  {/* Engine Hours */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-indigo-900 uppercase">Engine</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">{eld?.engine_hours?.toLocaleString() || 0}</p>
                    <p className="text-xs text-indigo-700 mt-1">Hours</p>
                  </div>

                  {/* Next Stop Distance */}
                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-cyan-600" />
                      <span className="text-xs font-semibold text-cyan-900 uppercase">Next Stop</span>
                    </div>
                    <p className="text-2xl font-bold text-cyan-600">{eld?.next_stop_distance || 0}</p>
                    <p className="text-xs text-cyan-700 mt-1">miles</p>
                  </div>

                </div>

                {/* GPS Position */}
                <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-1">GPS Position:</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Latitude:</span>
                      <span className="ml-2 font-mono text-slate-900">
                        {eld?.gps_position?.lat?.toFixed(6) || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Longitude:</span>
                      <span className="ml-2 font-mono text-slate-900">
                        {eld?.gps_position?.lng?.toFixed(6) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Last updated: {new Date(eld?.gps_position?.last_update || Date.now()).toLocaleString()}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {loads.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No active ELD data available</p>
          </div>
        )}

        {/* ELD Integration Info */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-3">Supported ELD Systems</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-700">
            <div>• KeepTruckin</div>
            <div>• Samsara</div>
            <div>• Omnitracs</div>
            <div>• Verizon Connect</div>
            <div>• PeopleNet</div>
            <div>• Geotab</div>
            <div>• Motive</div>
            <div>• Custom API</div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}