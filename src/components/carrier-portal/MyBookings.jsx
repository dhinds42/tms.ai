import React from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Calendar, Clock } from "lucide-react";

const statusColors = {
  assigned: "bg-blue-100 text-blue-700 border-blue-300",
  dispatched: "bg-indigo-100 text-indigo-700 border-indigo-300",
  picked_up: "bg-purple-100 text-purple-700 border-purple-300",
  in_transit: "bg-amber-100 text-amber-700 border-amber-300",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-300"
};

export default function MyBookings({ loads }) {
  if (loads.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Bookings</h3>
        <p className="text-slate-600">Book your first load to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {loads.map((load) => (
        <div key={load.id} className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {load.load_number || `Load #${load.id.slice(0, 8)}`}
              </h3>
              <Badge variant="outline" className={`${statusColors[load.status]} border mt-2 capitalize`}>
                {load.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">
                ${load.carrier_pay?.toLocaleString() || 'TBD'}
              </p>
              <p className="text-xs text-slate-600">Your Payment</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-600">Pickup</p>
                <p className="font-medium text-slate-900">
                  {load.pickup_location?.city}, {load.pickup_location?.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-slate-600">Dropoff</p>
                <p className="font-medium text-slate-900">
                  {load.dropoff_location?.city}, {load.dropoff_location?.state}
                </p>
              </div>
            </div>
          </div>

          {load.eta && (
            <div className="p-3 bg-white rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Estimated Arrival</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="font-semibold text-indigo-600">
                  {new Date(load.eta).toLocaleString()}
                </span>
              </div>
            </div>
          )}

        </div>
      ))}
    </div>
  );
}