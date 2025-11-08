import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, MapPin, Send } from "lucide-react";
import { differenceInHours } from "date-fns";

export default function DelayAlerts({ loads, drivers }) {
  if (loads.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-l-emerald-500">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900">All Loads On Track</h3>
              <p className="text-sm text-emerald-700 mt-1">
                No delay risks detected at this time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
      <CardHeader className="border-b border-red-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <CardTitle className="text-xl font-bold text-red-900">
                Delay Alerts ({loads.length})
              </CardTitle>
              <p className="text-sm text-red-700 mt-1">
                Loads at risk of missing delivery window
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {loads.map(load => {
            const driver = drivers?.find(d => d.id === load.driver_id);
            const hoursLate = load.eta && load.delivery_date 
              ? differenceInHours(new Date(load.eta), new Date(load.delivery_date))
              : 0;

            return (
              <div key={load.id} className="p-4 bg-white rounded-xl border-2 border-red-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {load.load_number || `#${load.id.slice(0, 8)}`}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      {load.pickup_location?.city} → {load.dropoff_location?.city}
                    </p>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border border-red-300">
                    ~{hoursLate}h late
                  </Badge>
                </div>

                {driver && (
                  <div className="mb-3 p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">Driver: {driver.full_name}</p>
                    <p className="text-xs text-slate-600">HOS Remaining: {driver.hos_remaining || 0}h</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-blue-300 text-blue-700">
                    <Send className="w-3 h-3 mr-1" />
                    Notify Customer
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-amber-300 text-amber-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    Re-route
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}