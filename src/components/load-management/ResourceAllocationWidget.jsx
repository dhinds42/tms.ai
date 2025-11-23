import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Truck, Package, TrendingUp } from "lucide-react";

export default function ResourceAllocationWidget({ drivers = [], loads = [] }) {
  // Driver availability
  const availableDrivers = drivers.filter(d => d.driver_status === 'available').length;
  const onDutyDrivers = drivers.filter(d => d.driver_status === 'on_duty' || d.driver_status === 'driving').length;
  const totalDrivers = drivers.length;
  const driverUtilization = totalDrivers > 0 ? ((onDutyDrivers / totalDrivers) * 100).toFixed(0) : 0;

  // Load capacity
  const assignedLoads = loads.filter(l => l.driver_id || l.carrier_id).length;
  const unassignedLoads = loads.filter(l => !l.driver_id && !l.carrier_id && l.status !== 'delivered' && l.status !== 'cancelled').length;
  const totalActiveLoads = loads.filter(l => l.status !== 'delivered' && l.status !== 'cancelled').length;
  const loadCapacity = totalActiveLoads > 0 ? ((assignedLoads / totalActiveLoads) * 100).toFixed(0) : 0;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          Resource Allocation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Driver Availability */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-900">Driver Availability</span>
            </div>
            <Badge className="bg-blue-600 text-white">{driverUtilization}%</Badge>
          </div>
          <Progress value={driverUtilization} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-slate-600">
            <span>Available: {availableDrivers}</span>
            <span>On Duty: {onDutyDrivers}</span>
            <span>Total: {totalDrivers}</span>
          </div>
        </div>

        {/* Load Capacity */}
        <div className="p-3 bg-white rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-slate-900">Load Capacity</span>
            </div>
            <Badge className="bg-indigo-600 text-white">{loadCapacity}%</Badge>
          </div>
          <Progress value={loadCapacity} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-slate-600">
            <span>Assigned: {assignedLoads}</span>
            <span>Unassigned: {unassignedLoads}</span>
            <span>Active: {totalActiveLoads}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-center">
            <p className="text-xs text-emerald-700 mb-1">Ready to Assign</p>
            <p className="text-xl font-bold text-emerald-600">{unassignedLoads}</p>
          </div>
          <div className="p-2 bg-amber-50 rounded border border-amber-200 text-center">
            <p className="text-xs text-amber-700 mb-1">Drivers Available</p>
            <p className="text-xl font-bold text-amber-600">{availableDrivers}</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}