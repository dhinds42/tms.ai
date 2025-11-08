import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Package, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  available: "bg-blue-100 text-blue-700",
  tendered: "bg-purple-100 text-purple-700",
  assigned: "bg-indigo-100 text-indigo-700",
  in_transit: "bg-amber-100 text-amber-700",
  delivered: "bg-emerald-100 text-emerald-700"
};

export default function ShipperLoadsList({ loads, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl">Your Shipments</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {loads.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No loads posted yet</h3>
            <p className="text-slate-600">Click "Post New Load" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loads.map((load) => (
              <div key={load.id} className="p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-2">
                      {load.load_number || `#${load.id.slice(0, 8)}`}
                    </h4>
                    <Badge className={statusColors[load.status]}>
                      {load.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      ${load.customer_rate?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-600">Your Rate</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-600">Pickup</p>
                      <p className="font-semibold text-slate-900">
                        {load.pickup_location?.city}, {load.pickup_location?.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-xs text-slate-600">Delivery</p>
                      <p className="font-semibold text-slate-900">
                        {load.dropoff_location?.city}, {load.dropoff_location?.state}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(load.pickup_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    <span>{load.commodity || 'General Freight'}</span>
                  </div>
                  {load.weight && (
                    <span>{load.weight.toLocaleString()} lbs</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}