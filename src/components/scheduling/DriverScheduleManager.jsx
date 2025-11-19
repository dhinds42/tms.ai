import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle } from "lucide-react";

export default function DriverScheduleManager() {
  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 20),
    initialData: [],
  });

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Driver Scheduling & HOS Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold">Available</p>
            <p className="text-2xl font-bold text-emerald-600">
              {drivers.filter(d => d.status === 'available').length}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900 font-semibold">On Duty</p>
            <p className="text-2xl font-bold text-blue-600">
              {drivers.filter(d => d.status === 'dispatched').length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-900 font-semibold">Off Duty</p>
            <p className="text-2xl font-bold text-amber-600">
              {drivers.filter(d => d.status === 'off_duty').length}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Driver Status</h4>
          {drivers.slice(0, 5).map((driver) => (
            <div key={driver.id} className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{driver.first_name} {driver.last_name}</p>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {driver.hos_available_hours || '8.0'} hours available
                  </p>
                </div>
                <Badge className={
                  driver.status === 'available' ? 'bg-emerald-600' :
                  driver.status === 'dispatched' ? 'bg-blue-600' :
                  'bg-slate-600'
                }>
                  {driver.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}