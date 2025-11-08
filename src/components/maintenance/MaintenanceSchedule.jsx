import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Wrench } from "lucide-react";

export default function MaintenanceSchedule({ vehicles }) {
  const upcomingServices = vehicles
    .map(v => ({
      vehicle: v.vehicle_number,
      service: 'Scheduled Maintenance',
      mileage: v.mileage,
      dueAt: v.last_service_miles + 15000,
      remaining: (v.last_service_miles + 15000) - v.mileage
    }))
    .filter(s => s.remaining <= 5000 && s.remaining > 0)
    .sort((a, b) => a.remaining - b.remaining)
    .slice(0, 6);

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Upcoming Maintenance Schedule
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Services needed within next 5,000 miles
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {upcomingServices.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No services scheduled in the near term</p>
            </div>
          ) : (
            upcomingServices.map((service, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-slate-900">{service.vehicle}</h4>
                      <p className="text-sm text-slate-600">{service.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      service.remaining < 1000 ? 'bg-red-100 text-red-700' :
                      service.remaining < 3000 ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {service.remaining.toLocaleString()} mi
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      Due at {service.dueAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}