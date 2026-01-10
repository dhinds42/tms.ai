import React from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, TrendingUp } from "lucide-react";

import GamificationDashboard from "../components/driver-rewards/GamificationDashboard";

export default function DriverRewards() {
  const { data: drivers = [] } = useScopedEntity('Driver', { limit: 100 });

  const leaderboard = drivers
    .map(d => ({
      ...d,
      points: Math.floor(Math.random() * 5000) + 1000
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
            Driver Rewards & Gamification
          </h1>
          <p className="text-slate-600 mt-2">Points, leaderboards, incentives for performance</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Points</p>
                  <p className="text-3xl font-bold text-amber-600">127K</p>
                </div>
                <Star className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Top Performer</p>
                  <p className="text-xl font-bold text-indigo-600">{leaderboard[0]?.first_name}</p>
                </div>
                <Trophy className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rewards Claimed</p>
                  <p className="text-3xl font-bold text-emerald-600">45</p>
                </div>
                <Award className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Engagement</p>
                  <p className="text-3xl font-bold text-blue-600">89%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>🏆 Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((driver, idx) => (
                <div key={driver.id} className={`flex items-center justify-between p-4 rounded-lg ${
                  idx === 0 ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300' :
                  idx === 1 ? 'bg-slate-100 border border-slate-300' :
                  idx === 2 ? 'bg-orange-100 border border-orange-300' :
                  'bg-slate-50 border border-slate-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-8 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div>
                      <p className="font-bold">{driver.first_name} {driver.last_name}</p>
                      <p className="text-sm text-slate-600">Level {Math.floor(driver.points / 1000)}</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-600 text-lg px-4 py-2">
                    {driver.points.toLocaleString()} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gamification Dashboard */}
        <GamificationDashboard />

      </div>
    </div>
  );
}