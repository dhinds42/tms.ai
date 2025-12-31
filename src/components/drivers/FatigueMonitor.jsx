import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Moon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function FatigueMonitor({ drivers }) {
  const atRiskDrivers = drivers.filter(d => {
    const hosRemaining = d.hos_remaining || 11;
    const consecutiveDays = d.consecutive_driving_days || 0;
    return hosRemaining < 2 || consecutiveDays > 6;
  });
  
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Moon className="w-4 h-4 text-amber-600" />
          Driver Fatigue Monitor
          {atRiskDrivers.length > 0 && (
            <Badge className="ml-auto bg-red-500 text-xs">{atRiskDrivers.length} At Risk</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {atRiskDrivers.length > 0 ? (
          atRiskDrivers.slice(0, 5).map(driver => (
            <div key={driver.id} className="p-3 bg-white rounded-lg border border-amber-200">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-sm">{driver.first_name} {driver.last_name}</p>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">HOS Remaining</span>
                  <span className="font-semibold">{driver.hos_remaining || 0}h</span>
                </div>
                <Progress value={(driver.hos_remaining / 11) * 100} className="h-1" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-slate-600 text-sm">
            All drivers well-rested
          </div>
        )}
      </CardContent>
    </Card>
  );
}