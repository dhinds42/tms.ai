import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Award } from "lucide-react";

export default function DriverStats({ drivers }) {
  const activeDrivers = drivers.filter(d => d.status === 'active').length;
  
  const avgOnTime = drivers.length > 0
    ? (drivers.reduce((sum, d) => sum + (d.on_time_percentage || 0), 0) / drivers.length).toFixed(1)
    : 0;
    
  const avgSafety = drivers.length > 0
    ? (drivers.reduce((sum, d) => sum + (d.safety_score || 0), 0) / drivers.length).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Carriers</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{activeCount}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}