import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign } from "lucide-react";

export default function BackhaulOpportunities({ availableLoads }) {
  const topOpportunities = availableLoads.slice(0, 6);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl">Available Backhaul Loads</CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Loads currently available on the market
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {topOpportunities.map((load) => (
            <div key={load.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {load.load_number || `#${load.id.slice(0, 8)}`}
                  </h4>
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                    <MapPin className="w-3 h-3" />
                    <span>{load.pickup_location?.city}, {load.pickup_location?.state}</span>
                    <span>→</span>
                    <span>{load.dropoff_location?.city}, {load.dropoff_location?.state}</span>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-700 capitalize">
                  {load.equipment_type?.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-white rounded">
                  <p className="text-xs text-slate-600">Distance</p>
                  <p className="font-semibold text-slate-900">{load.distance_miles || '-'} mi</p>
                </div>
                <div className="p-2 bg-white rounded">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-600">Rate</p>
                      <p className="font-semibold text-emerald-600">
                        ${load.customer_rate?.toLocaleString() || 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}