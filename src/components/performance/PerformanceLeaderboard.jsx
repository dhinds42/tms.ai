import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp, Clock, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PerformanceLeaderboard({ drivers, loads, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate performance metrics for each driver
  const driverMetrics = drivers.map(driver => {
    const driverLoads = loads.filter(l => l.driver_id === driver.id);
    const completedLoads = driverLoads.filter(l => l.status === 'delivered');
    const onTimeLoads = completedLoads.filter(l => {
      if (!l.actual_delivery || !l.delivery_date) return true;
      return new Date(l.actual_delivery) <= new Date(l.delivery_date);
    });
    
    const onTimePercentage = completedLoads.length > 0 
      ? (onTimeLoads.length / completedLoads.length * 100) 
      : (driver.on_time_percentage || 0);

    const performanceScore = (
      (onTimePercentage * 0.4) +
      ((driver.rating || 0) * 20 * 0.3) +
      (Math.min(completedLoads.length / 10, 10) * 10 * 0.3)
    );

    return {
      ...driver,
      completed_loads: completedLoads.length,
      on_time_percentage: onTimePercentage,
      performance_score: performanceScore
    };
  }).sort((a, b) => b.performance_score - a.performance_score).slice(0, 10);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-slate-500">#{index + 1}</span>;
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="border-b border-blue-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Performance Leaderboard
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Top performers ranked by on-time delivery, ratings, and loads completed
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-100 border-b border-blue-200">
                <TableHead className="font-semibold text-blue-900">Rank</TableHead>
                <TableHead className="font-semibold text-blue-900">Driver</TableHead>
                <TableHead className="font-semibold text-blue-900">Type</TableHead>
                <TableHead className="font-semibold text-blue-900">Completed Loads</TableHead>
                <TableHead className="font-semibold text-blue-900">On-Time %</TableHead>
                <TableHead className="font-semibold text-blue-900">Rating</TableHead>
                <TableHead className="font-semibold text-blue-900">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driverMetrics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No driver data available yet
                  </TableCell>
                </TableRow>
              ) : (
                driverMetrics.map((driver, index) => (
                  <TableRow 
                    key={driver.id}
                    className={`hover:bg-blue-50 transition-colors border-b border-blue-100 ${
                      index === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50' : ''
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-slate-900">{driver.full_name}</p>
                        <p className="text-xs text-slate-500">{driver.equipment_assigned || driver.company_name || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={driver.company_name ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                        {driver.company_name ? 'Owner Op' : 'Company Driver'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900">{driver.completed_loads}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-green-600"
                            style={{ width: `${driver.on_time_percentage}%` }}
                          />
                        </div>
                        <span className="font-semibold text-emerald-600">
                          {driver.on_time_percentage.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-slate-900">
                          {driver.rating ? driver.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-indigo-600">
                          {driver.performance_score.toFixed(0)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}