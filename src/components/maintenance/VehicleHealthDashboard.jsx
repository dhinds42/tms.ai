import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Gauge, AlertTriangle } from "lucide-react";

export default function VehicleHealthDashboard({ vehicles }) {
  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-xl font-bold text-slate-900">
          Fleet Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-4">
          {vehicles.slice(0, 9).map((vehicle) => {
            const milesSinceService = vehicle.mileage - vehicle.last_service_miles;
            const serviceStatus = milesSinceService > 15000 ? 'critical' :
                                 milesSinceService > 10000 ? 'warning' : 'healthy';
            
            return (
              <div key={vehicle.id} className={`p-4 rounded-xl border-2 ${
                serviceStatus === 'critical' ? 'bg-red-50 border-red-300' :
                serviceStatus === 'warning' ? 'bg-amber-50 border-amber-300' :
                'bg-emerald-50 border-emerald-300'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-600" />
                      <h4 className="font-bold text-slate-900">{vehicle.vehicle_number}</h4>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{vehicle.driver_name}</p>
                  </div>
                  <Badge className={
                    serviceStatus === 'critical' ? 'bg-red-600 text-white' :
                    serviceStatus === 'warning' ? 'bg-amber-600 text-white' :
                    'bg-emerald-600 text-white'
                  }>
                    {serviceStatus}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Mileage:</span>
                    <span className="font-semibold text-slate-900">
                      {vehicle.mileage.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Since Service:</span>
                    <span className="font-semibold text-slate-900">
                      {milesSinceService.toLocaleString()} mi
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Engine Hours:</span>
                    <span className="font-semibold text-slate-900">
                      {vehicle.engine_hours.toLocaleString()}h
                    </span>
                  </div>
                </div>

                {milesSinceService > 10000 && (
                  <div className="mt-3 p-2 bg-white rounded flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-xs text-slate-700">
                      Service {milesSinceService > 15000 ? 'overdue' : 'due soon'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}