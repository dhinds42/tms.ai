import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function VehicleStatusDashboard() {
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('-created_date', 200),
    initialData: [],
  });

  const statusCounts = {
    pending: vehicles.filter(v => v.status === 'pending').length,
    picked_up: vehicles.filter(v => v.status === 'picked_up').length,
    in_transit: vehicles.filter(v => v.status === 'in_transit').length,
    delivered: vehicles.filter(v => v.status === 'delivered').length,
  };

  const operableCount = vehicles.filter(v => v.operable).length;
  const nonOperableCount = vehicles.filter(v => !v.operable).length;

  const avgTransitTime = 5.2; // Mock - would calculate from actual data
  const onTimeDeliveryRate = 94.5; // Mock

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5 text-orange-600" />
          Vehicle Status Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-900 font-semibold">Pending Pickup</p>
            <p className="text-2xl font-bold text-amber-600">{statusCounts.pending}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900 font-semibold">Picked Up</p>
            <p className="text-2xl font-bold text-blue-600">{statusCounts.picked_up}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded border border-indigo-200">
            <p className="text-xs text-indigo-900 font-semibold">In Transit</p>
            <p className="text-2xl font-bold text-indigo-600">{statusCounts.in_transit}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold">Delivered</p>
            <p className="text-2xl font-bold text-emerald-600">{statusCounts.delivered}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Operable</p>
                <p className="text-3xl font-bold text-slate-900">{operableCount}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-emerald-600 opacity-20" />
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Non-Operable</p>
                <p className="text-3xl font-bold text-slate-900">{nonOperableCount}</p>
              </div>
              <Car className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-900 font-semibold">Avg Transit Time</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{avgTransitTime} days</p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-900 font-semibold">On-Time Delivery</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{onTimeDeliveryRate}%</p>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">🚗 Quick Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-purple-800">
            <p>Total Vehicles: <strong>{vehicles.length}</strong></p>
            <p>Active Shipments: <strong>{statusCounts.in_transit + statusCounts.picked_up}</strong></p>
            <p>Completed: <strong>{statusCounts.delivered}</strong></p>
            <p>Awaiting Pickup: <strong>{statusCounts.pending}</strong></p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}