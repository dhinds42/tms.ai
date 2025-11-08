import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, MapPin, TrendingUp } from "lucide-react";

export default function DriverAvailability({ drivers }) {
  if (!drivers || drivers.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Available Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 text-center py-4">
            No drivers currently available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Available Drivers ({drivers.length})
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Drivers ready for assignment with sufficient HOS
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div key={driver.id} className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900">{driver.full_name}</h4>
                  <p className="text-xs text-slate-600">{driver.equipment_assigned || 'No truck assigned'}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">
                  Available
                </Badge>
              </div>

              <div className="space-y-2 mb-3">
                {driver.current_location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-700">
                      {driver.current_location.city}, {driver.current_location.state}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-slate-700">
                    {driver.hos_remaining || 0}h HOS remaining
                  </span>
                </div>

                {driver.on_time_percentage && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="text-slate-700">
                      {driver.on_time_percentage}% on-time
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {driver.rating && (
                  <Badge variant="outline" className="text-xs">
                    ⭐ {driver.rating}/5
                  </Badge>
                )}
                {driver.total_loads && (
                  <Badge variant="outline" className="text-xs">
                    {driver.total_loads} loads
                  </Badge>
                )}
              </div>

              {driver.home_terminal && (
                <div className="mt-3 p-2 bg-white rounded border border-slate-200">
                  <p className="text-xs text-slate-600">Home Terminal</p>
                  <p className="text-xs font-semibold text-slate-900">
                    {driver.home_terminal.city}, {driver.home_terminal.state}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}