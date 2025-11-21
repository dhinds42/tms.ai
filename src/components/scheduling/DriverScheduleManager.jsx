import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function DriverScheduleManager() {
  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    initialData: [],
  });

  const getHOSStatus = (driver) => {
    // Simulated HOS calculation
    const hoursRemaining = Math.floor(Math.random() * 11);
    if (hoursRemaining > 7) return { status: 'available', hours: hoursRemaining, color: 'bg-emerald-600' };
    if (hoursRemaining > 3) return { status: 'limited', hours: hoursRemaining, color: 'bg-amber-600' };
    return { status: 'unavailable', hours: hoursRemaining, color: 'bg-red-600' };
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Driver Scheduling & HOS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {drivers.slice(0, 8).map(driver => {
          const hos = getHOSStatus(driver);
          return (
            <div key={driver.id} className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${hos.color}`}></div>
                  <div>
                    <p className="font-bold text-slate-900">
                      {driver.first_name} {driver.last_name}
                    </p>
                    <p className="text-xs text-slate-600">{driver.home_terminal || 'No terminal'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-slate-900">{hos.hours}h</span>
                  </div>
                  <Badge className={hos.color}>{hos.status}</Badge>
                </div>
              </div>
            </div>
          );
        })}

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 bg-emerald-50 rounded">
            <CheckCircle className="w-5 h-5 text-emerald-600 mb-1" />
            <p className="text-xs text-emerald-900">Available</p>
            <p className="text-2xl font-bold text-emerald-600">
              {drivers.filter(d => getHOSStatus(d).status === 'available').length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded">
            <AlertTriangle className="w-5 h-5 text-amber-600 mb-1" />
            <p className="text-xs text-amber-900">Limited HOS</p>
            <p className="text-2xl font-bold text-amber-600">
              {drivers.filter(d => getHOSStatus(d).status === 'limited').length}
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}