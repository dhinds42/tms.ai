import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CarrierPerformanceLeaderboard({ carriers, isLoading }) {
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

  // Sort carriers by composite score
  const rankedCarriers = [...carriers]
    .filter(c => c.status === 'active')
    .sort((a, b) => {
      const scoreA = (a.on_time_percentage || 0) * 0.4 + (a.compliance_score || 0) * 0.4 + (a.rating || 0) * 20;
      const scoreB = (b.on_time_percentage || 0) * 0.4 + (b.compliance_score || 0) * 0.4 + (b.rating || 0) * 20;
      return scoreB - scoreA;
    })
    .slice(0, 10);

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-amber-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-slate-500">#{index + 1}</span>;
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="border-b border-amber-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Performance Leaderboard
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Top carriers ranked by on-time delivery, compliance, and ratings
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-amber-100 border-b border-amber-200">
                <TableHead className="font-semibold text-amber-900">Rank</TableHead>
                <TableHead className="font-semibold text-amber-900">Carrier</TableHead>
                <TableHead className="font-semibold text-amber-900">On-Time %</TableHead>
                <TableHead className="font-semibold text-amber-900">Compliance</TableHead>
                <TableHead className="font-semibold text-amber-900">Rating</TableHead>
                <TableHead className="font-semibold text-amber-900">Total Loads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedCarriers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No active carriers yet
                  </TableCell>
                </TableRow>
              ) : (
                rankedCarriers.map((carrier, index) => (
                  <TableRow 
                    key={carrier.id}
                    className={`hover:bg-amber-50 transition-colors border-b border-amber-100 ${
                      index === 0 ? 'bg-gradient-to-r from-amber-50 to-orange-50' : ''
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{carrier.company_name}</div>
                      <div className="text-xs text-slate-500">{carrier.mc_number}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-green-600"
                            style={{ width: `${carrier.on_time_percentage || 0}%` }}
                          />
                        </div>
                        <span className="font-semibold text-emerald-600">
                          {carrier.on_time_percentage || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                            style={{ width: `${carrier.compliance_score || 0}%` }}
                          />
                        </div>
                        <span className="font-semibold text-indigo-600">
                          {carrier.compliance_score || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < Math.floor(carrier.rating || 0)
                                ? 'bg-amber-500'
                                : 'bg-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-sm font-semibold text-slate-700 ml-1">
                          {carrier.rating ? carrier.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900">{carrier.total_loads || 0}</span>
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