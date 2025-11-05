import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle, CheckCircle, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DriverHOSDashboard({ drivers, loads, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  const activeDrivers = drivers.filter(d => ['available', 'on_load'].includes(d.status));
  
  // Categorize by HOS
  const criticalHOS = activeDrivers.filter(d => (d.hos_remaining || 0) < 2);
  const lowHOS = activeDrivers.filter(d => (d.hos_remaining || 0) >= 2 && (d.hos_remaining || 0) < 5);
  const goodHOS = activeDrivers.filter(d => (d.hos_remaining || 0) >= 5);

  // Get drivers on load
  const driversOnLoad = drivers.filter(d => d.status === 'on_load');

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50">
      <CardHeader className="border-b border-cyan-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Hours of Service Monitor
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Real-time HOS tracking for route optimization
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* HOS Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl border border-cyan-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">Total Active</span>
              <Navigation className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{activeDrivers.length}</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">Good HOS</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{goodHOS.length}</p>
            <p className="text-xs text-slate-500 mt-1">≥5 hours</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">Low HOS</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{lowHOS.length}</p>
            <p className="text-xs text-slate-500 mt-1">2-5 hours</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-600">Critical</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{criticalHOS.length}</p>
            <p className="text-xs text-slate-500 mt-1">&lt;2 hours</p>
          </div>
        </div>

        {/* Drivers On Load */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
            Drivers Currently On Load
          </h4>
          {driversOnLoad.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
              <p className="text-slate-500">No drivers currently on active loads</p>
            </div>
          ) : (
            <div className="space-y-3">
              {driversOnLoad.map(driver => {
                const hosPercentage = ((driver.hos_remaining || 0) / 11) * 100;
                const hosStatus = hosPercentage > 50 ? 'good' : hosPercentage > 25 ? 'warning' : 'critical';
                const statusColors = {
                  good: { bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-600' },
                  warning: { bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-600' },
                  critical: { bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-600' }
                };
                const colors = statusColors[hosStatus];

                return (
                  <div 
                    key={driver.id}
                    className={`p-4 ${colors.bg} rounded-xl border ${colors.border}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-semibold text-slate-900">{driver.full_name}</h5>
                        <p className="text-sm text-slate-600">
                          {driver.current_location?.city}, {driver.current_location?.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{driver.hos_remaining || 0}h</p>
                        <p className="text-xs text-slate-500">HOS Remaining</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors.bar} transition-all duration-500`}
                        style={{ width: `${Math.min(hosPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}