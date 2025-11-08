import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Star, Package } from "lucide-react";

export default function PerformanceMetrics({ carrier, loads }) {
  const completedLoads = loads.filter(l => l.status === 'delivered');
  const onTimeLoads = completedLoads.filter(l => {
    if (!l.actual_delivery || !l.delivery_date) return true;
    return new Date(l.actual_delivery) <= new Date(l.delivery_date);
  });
  
  const onTimePercentage = completedLoads.length > 0 
    ? ((onTimeLoads.length / completedLoads.length) * 100).toFixed(1)
    : (carrier.on_time_percentage || 0);

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Your Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-xl">
            <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-slate-600 mb-1">Total Loads</p>
            <p className="text-2xl font-bold text-slate-900">{carrier.total_loads || 0}</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-xl">
            <Clock className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs text-slate-600 mb-1">On-Time Delivery</p>
            <p className="text-2xl font-bold text-emerald-600">{onTimePercentage}%</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-xl">
            <Star className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-xs text-slate-600 mb-1">Rating</p>
            <p className="text-2xl font-bold text-amber-600">{carrier.rating || 0}/5</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-xl">
            <TrendingUp className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-600 mb-1">Compliance Score</p>
            <p className="text-2xl font-bold text-indigo-600">{carrier.compliance_score || 0}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}