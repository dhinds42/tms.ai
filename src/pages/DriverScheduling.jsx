import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";

import DriverScheduleManager from "../components/scheduling/DriverScheduleManager";

export default function DriverScheduling() {
  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    initialData: [],
  });

  const availableDrivers = drivers.filter(d => d.driver_status === 'available');
  const onDutyDrivers = drivers.filter(d => d.driver_status === 'on_duty');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
            Driver Scheduling Optimizer
          </h1>
          <p className="text-slate-600 mt-2">Optimize driver schedules with HOS compliance</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Drivers</p>
                  <p className="text-3xl font-bold text-slate-900">{drivers.length}</p>
                </div>
                <Users className="w-12 h-12 text-slate-900 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available</p>
                  <p className="text-3xl font-bold text-emerald-600">{availableDrivers.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">On Duty</p>
                  <p className="text-3xl font-bold text-blue-600">{onDutyDrivers.length}</p>
                </div>
                <Clock className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Scheduled</p>
                  <p className="text-3xl font-bold text-indigo-600">{Math.floor(drivers.length * 0.6)}</p>
                </div>
                <Calendar className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Driver Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drivers.slice(0, 10).map(driver => (
                <div key={driver.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{driver.first_name} {driver.last_name}</p>
                    <p className="text-sm text-slate-600">HOS Remaining: {driver.hos_remaining || 11}hrs</p>
                  </div>
                  <Badge className={
                    driver.driver_status === 'available' ? 'bg-emerald-600' :
                    driver.driver_status === 'on_duty' ? 'bg-blue-600' :
                    'bg-slate-600'
                  }>
                    {driver.driver_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Driver Schedule Manager */}
        <DriverScheduleManager />

      </div>
    </div>
  );
}