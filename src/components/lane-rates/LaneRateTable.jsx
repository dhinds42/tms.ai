import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Lock, Eye, EyeOff } from "lucide-react";

export default function LaneRateTable({ laneRates, isBroker }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      active: 'bg-emerald-100 text-emerald-800',
      declined: 'bg-red-100 text-red-800',
      expired: 'bg-slate-100 text-slate-800',
      flagged: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-3">
      {laneRates.map(lane => (
        <div key={lane.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-900">
                  {lane.origin_city}, {lane.origin_state} → {lane.destination_city}, {lane.destination_state}
                </span>
              </div>
              <p className="text-sm text-slate-600">{lane.lane_miles} miles</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(lane.status)}>{lane.status}</Badge>
              {lane.locked_until && new Date(lane.locked_until) > new Date() && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
              {lane.flagged && (
                <Badge className="bg-orange-100 text-orange-800">Flagged</Badge>
              )}
            </div>
          </div>

          {isBroker ? (
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-1">Customer Rate</p>
                <p className="font-bold text-emerald-600">${lane.customer_rate?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Carrier Rate</p>
                <p className="font-bold text-blue-600">${lane.carrier_rate?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Owner Op Rate</p>
                <p className="font-bold text-purple-600">${lane.owner_operator_rate?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Margin</p>
                <p className="font-bold text-indigo-600">{lane.margin_percentage?.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Margin</p>
                <p className="font-bold text-slate-900">${lane.total_margin?.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-xl font-bold text-emerald-600">
                ${lane.driver_rate?.toLocaleString()}
              </span>
              <Badge variant="outline" className="ml-2">
                <EyeOff className="w-3 h-3 mr-1" />
                Limited View
              </Badge>
            </div>
          )}

          {lane.driver_accepted && (
            <div className="mt-2 text-xs text-emerald-600">
              ✓ Accepted by driver on {new Date(lane.driver_accepted_at).toLocaleDateString()}
            </div>
          )}
        </div>
      ))}

      {laneRates.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No lane rates yet</p>
        </div>
      )}
    </div>
  );
}