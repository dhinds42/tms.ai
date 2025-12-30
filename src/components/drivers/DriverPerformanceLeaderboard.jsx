import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, TrendingUp, Star } from "lucide-react";

export default function DriverPerformanceLeaderboard({ drivers, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </CardContent>
      </Card>
    );
  }

  const rankedDrivers = [...drivers]
    .filter(d => d.performance_score)
    .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
    .slice(0, 10);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Elite': return 'from-yellow-500 to-amber-600';
      case 'Professional': return 'from-blue-500 to-indigo-600';
      case 'Standard': return 'from-emerald-500 to-green-600';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Driver Performance Leaderboard
          <Badge className="ml-auto bg-indigo-600">Top {rankedDrivers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rankedDrivers.map((driver, idx) => (
          <div
            key={driver.id}
            className={`p-4 bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
              idx === 0 ? 'border-amber-400' : idx === 1 ? 'border-slate-400' : idx === 2 ? 'border-orange-400' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Rank Badge */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${
                idx === 0 ? 'from-yellow-400 to-amber-500' : 
                idx === 1 ? 'from-slate-300 to-slate-400' : 
                idx === 2 ? 'from-orange-400 to-orange-500' : 
                'from-indigo-100 to-indigo-200'
              } flex items-center justify-center font-bold text-white shadow-md`}>
                {idx < 3 ? (
                  <Trophy className="w-5 h-5" />
                ) : (
                  <span className="text-slate-700">#{idx + 1}</span>
                )}
              </div>

              {/* Driver Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">
                    {driver.first_name} {driver.last_name}
                  </h3>
                  <Badge className={`bg-gradient-to-r ${getTierColor(driver.performance_tier)} text-white text-xs`}>
                    {driver.performance_tier || 'Unranked'}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span>📍 {driver.current_location?.city || 'N/A'}</span>
                  <span>🚚 {driver.total_loads || 0} loads</span>
                  <span>⭐ {driver.on_time_percentage || 0}% on-time</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">
                  {driver.performance_score?.toFixed(0) || 0}
                </div>
                <div className="text-xs text-slate-500">score</div>
              </div>
            </div>
          </div>
        ))}

        {rankedDrivers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No performance data available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}