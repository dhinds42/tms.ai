import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Target, TrendingUp } from "lucide-react";

export default function GamificationDashboard() {
  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list(),
    initialData: [],
  });

  const calculateScore = () => Math.floor(Math.random() * 500) + 500;

  const leaderboard = drivers.slice(0, 5).map(d => ({
    ...d,
    score: calculateScore(),
    badges: Math.floor(Math.random() * 8) + 2
  })).sort((a, b) => b.score - a.score);

  const achievements = [
    { name: 'Perfect Week', icon: Star, count: 12, color: 'bg-yellow-500' },
    { name: 'Safety Champion', icon: Trophy, count: 8, color: 'bg-blue-500' },
    { name: 'On-Time Pro', icon: Target, count: 15, color: 'bg-emerald-500' },
    { name: 'Fuel Master', icon: TrendingUp, count: 6, color: 'bg-purple-500' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Driver Rewards & Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-4 gap-2">
          {achievements.map((achievement, idx) => {
            const Icon = achievement.icon;
            return (
              <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                <Icon className={`w-6 h-6 mx-auto mb-1 text-white ${achievement.color} rounded-full p-1`} />
                <p className="text-xs text-slate-600 mb-1">{achievement.name}</p>
                <p className="text-xl font-bold text-slate-900">{achievement.count}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 mb-3">🏆 Top Performers</h4>
          {leaderboard.map((driver, idx) => (
            <div key={driver.id} className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={
                    idx === 0 ? 'bg-yellow-500' :
                    idx === 1 ? 'bg-slate-400' :
                    idx === 2 ? 'bg-amber-600' :
                    'bg-slate-300'
                  }>
                    #{idx + 1}
                  </Badge>
                  <div>
                    <p className="font-bold text-slate-900">
                      {driver.first_name} {driver.last_name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Award className="w-3 h-3 text-amber-600" />
                      <span className="text-xs text-slate-600">{driver.badges} badges</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">{driver.score}</p>
                  <p className="text-xs text-slate-600">points</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}