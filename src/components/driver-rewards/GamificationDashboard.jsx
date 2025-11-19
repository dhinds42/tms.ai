import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, TrendingUp } from "lucide-react";

export default function GamificationDashboard() {
  const mockLeaderboard = [
    { name: 'John Smith', points: 2450, rank: 1 },
    { name: 'Sarah Johnson', points: 2320, rank: 2 },
    { name: 'Mike Davis', points: 2180, rank: 3 }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" />
          Driver Rewards & Gamification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-900 font-semibold">Points Earned</p>
            <p className="text-2xl font-bold text-amber-600">2,450</p>
          </div>
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <p className="text-xs text-purple-900 font-semibold">Badges</p>
            <p className="text-2xl font-bold text-purple-600">12</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold">Level</p>
            <p className="text-2xl font-bold text-emerald-600">7</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Leaderboard</h4>
          {mockLeaderboard.map((driver, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  idx === 0 ? 'bg-amber-600 text-white' :
                  idx === 1 ? 'bg-slate-400 text-white' :
                  'bg-orange-600 text-white'
                }`}>
                  {driver.rank}
                </div>
                <p className="font-semibold text-sm">{driver.name}</p>
              </div>
              <p className="font-bold text-amber-600">{driver.points} pts</p>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}