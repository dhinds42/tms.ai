import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Truck, Calendar, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ProactiveCapacityPlanner({ loads, carriers, drivers }) {
  const nextWeekLoads = loads.filter(l => {
    const pickupDate = new Date(l.pickup_date);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return pickupDate <= nextWeek && pickupDate >= new Date() && l.status === 'available';
  });
  
  const availableCapacity = carriers.filter(c => c.status === 'active').length + 
                            drivers.filter(d => d.driver_status === 'available').length;
  
  const utilizationPercent = availableCapacity > 0 
    ? ((nextWeekLoads.length / availableCapacity) * 100).toFixed(0)
    : 0;
  
  const capacityCrunch = utilizationPercent > 85;
  
  return (
    <Card className={capacityCrunch ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Next 7 Days Capacity
          {capacityCrunch && <Badge className="ml-auto bg-red-600 text-xs">ALERT</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-slate-600">Loads Booked</p>
            <p className="text-2xl font-bold text-blue-600">{nextWeekLoads.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-slate-600">Capacity Available</p>
            <p className="text-2xl font-bold text-emerald-600">{availableCapacity}</p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">Utilization</span>
            <span className="font-semibold">{utilizationPercent}%</span>
          </div>
          <Progress value={Number(utilizationPercent)} className="h-2" />
        </div>
        
        {capacityCrunch && (
          <div className="p-3 bg-white rounded-lg border border-red-200">
            <p className="text-xs font-semibold text-red-900 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Capacity Shortage Predicted
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Recruit 3-5 carriers now to avoid rate inflation
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}