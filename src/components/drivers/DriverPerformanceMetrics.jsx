import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, TrendingUp, Clock, Shield, AlertTriangle } from "lucide-react";
import DriverPerformanceBadge from "./DriverPerformanceBadge";

export default function DriverPerformanceMetrics({ drivers, loads, complianceItems }) {
  const activeDrivers = drivers?.filter(d => ['active', 'available', 'on_load'].includes(d.status)) || [];
  
  const avgScore = drivers?.length > 0
    ? drivers.reduce((sum, d) => sum + (d.performance_score || 0), 0) / drivers.length
    : 0;

  const tierCounts = {
    Elite: drivers?.filter(d => d.performance_tier === 'Elite').length || 0,
    Professional: drivers?.filter(d => d.performance_tier === 'Professional').length || 0,
    Standard: drivers?.filter(d => d.performance_tier === 'Standard').length || 0,
    Training: drivers?.filter(d => d.performance_tier === 'Training').length || 0,
  };

  const topDrivers = drivers
    ?.filter(d => d.performance_score)
    .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
    .slice(0, 5) || [];

  const lowHOSDrivers = drivers?.filter(d => (d.hos_remaining || 0) < 4).length || 0;
  const expiringDocs = complianceItems?.filter(c => 
    c.entity_type === 'driver' && c.status === 'expiring_soon'
  ).length || 0;

  return (
    <div className="space-y-4">
      
      {/* Performance Overview */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="w-5 h-5 text-amber-600" />
            Driver Performance
            <Badge className="ml-auto bg-amber-600 text-white">{activeDrivers.length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Average Score */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Average Performance</span>
              <span className="font-bold text-amber-600">{avgScore.toFixed(0)}/100</span>
            </div>
            <Progress value={avgScore} className="h-2" />
          </div>

          {/* Tier Distribution */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-white rounded-lg text-center">
              <p className="text-lg font-bold text-amber-600">{tierCounts.Elite}</p>
              <p className="text-xs text-amber-700">Elite</p>
            </div>
            <div className="p-2 bg-white rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{tierCounts.Professional}</p>
              <p className="text-xs text-emerald-700">Professional</p>
            </div>
            <div className="p-2 bg-white rounded-lg text-center">
              <p className="text-lg font-bold text-blue-600">{tierCounts.Standard}</p>
              <p className="text-xs text-blue-700">Standard</p>
            </div>
            <div className="p-2 bg-white rounded-lg text-center">
              <p className="text-lg font-bold text-slate-600">{tierCounts.Training}</p>
              <p className="text-xs text-slate-700">Training</p>
            </div>
          </div>

          {/* Top Performers */}
          {topDrivers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Top Performers</p>
              <div className="space-y-1">
                {topDrivers.map((driver, i) => (
                  <div key={driver.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="text-xs font-medium text-slate-900">
                        {driver.first_name} {driver.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{driver.performance_score}</span>
                      {driver.performance_tier && (
                        <DriverPerformanceBadge tier={driver.performance_tier} size="sm" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {(lowHOSDrivers > 0 || expiringDocs > 0) && (
            <div className="space-y-2">
              {lowHOSDrivers > 0 && (
                <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-orange-900">{lowHOSDrivers} driver{lowHOSDrivers > 1 ? 's' : ''} low on HOS</span>
                </div>
              )}
              {expiringDocs > 0 && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-900">{expiringDocs} document{expiringDocs > 1 ? 's' : ''} expiring soon</span>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

    </div>
  );
}