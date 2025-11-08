import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Clock, AlertTriangle, Star, DollarSign } from "lucide-react";

import PerformanceLeaderboard from "../components/performance/PerformanceLeaderboard";
import DriverScorecard from "../components/performance/DriverScorecard";
import PerformanceTrends from "../components/performance/PerformanceTrends";
import SafetyMetrics from "../components/performance/SafetyMetrics";

export default function DriverPerformance() {
  const [selectedDriver, setSelectedDriver] = useState(null);

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: ownerOperators, isLoading: ooLoading } = useQuery({
    queryKey: ['owner-operators'],
    queryFn: () => base44.entities.OwnerOperator.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const allDrivers = [...drivers, ...ownerOperators];
  const activeDrivers = allDrivers.filter(d => d.status === 'active');
  
  const avgOnTime = activeDrivers.length > 0
    ? (activeDrivers.reduce((sum, d) => sum + (d.on_time_percentage || 0), 0) / activeDrivers.length).toFixed(1)
    : 0;

  const avgRating = activeDrivers.length > 0
    ? (activeDrivers.reduce((sum, d) => sum + (d.rating || 0), 0) / activeDrivers.length).toFixed(2)
    : 0;

  const totalRevenue = allDrivers.reduce((sum, d) => sum + (d.total_revenue || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Driver Performance Analytics
            </h1>
            <p className="text-slate-600 mt-2">
              Track driver and owner operator performance metrics
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Drivers</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{activeDrivers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg On-Time</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{avgOnTime}%</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Rating</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{avgRating}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">${(totalRevenue / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Leaderboard */}
        <PerformanceLeaderboard drivers={allDrivers} loads={loads} isLoading={driversLoading || ooLoading} />

        {/* Driver Scorecards */}
        {selectedDriver && (
          <DriverScorecard driver={selectedDriver} loads={loads} onClose={() => setSelectedDriver(null)} />
        )}

        {/* Performance Trends */}
        <PerformanceTrends drivers={allDrivers} loads={loads} />

        {/* Safety Metrics */}
        <SafetyMetrics drivers={allDrivers} />

      </div>
    </div>
  );
}