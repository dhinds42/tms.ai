import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, TrendingUp, Sparkles, Loader2 } from "lucide-react";

export default function ScoringLeaderboard({ carriers, scoreResults, onCalculateScore, calculating, selectedCarrier }) {
  const sortedCarriers = [...carriers]
    .filter(c => c.status === 'active')
    .sort((a, b) => (b.compliance_score || 0) - (a.compliance_score || 0));

  const getTierBadge = (score) => {
    if (score >= 90) return <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white">Platinum</Badge>;
    if (score >= 80) return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">Gold</Badge>;
    if (score >= 70) return <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">Silver</Badge>;
    if (score >= 60) return <Badge className="bg-gradient-to-r from-amber-700 to-amber-800 text-white">Bronze</Badge>;
    return <Badge className="bg-slate-600 text-white">Needs Improvement</Badge>;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-yellow-600';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Carrier Performance Leaderboard
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Ranked by overall performance score
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {sortedCarriers.slice(0, 20).map((carrier, idx) => {
            const score = carrier.compliance_score || 0;
            const scoreData = scoreResults[carrier.id];

            return (
              <div key={carrier.id} className={`p-4 rounded-xl border-2 transition-all ${
                idx < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-4">
                  
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                    idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                    idx === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Carrier Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-slate-900">{carrier.company_name}</h4>
                      {getTierBadge(score)}
                      {scoreData && (
                        <Badge variant="outline" className="text-xs">
                          {scoreData.score_trend}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>MC: {carrier.mc_number}</span>
                      <span>•</span>
                      <span>{carrier.total_loads || 0} loads</span>
                      <span>•</span>
                      <span>{carrier.on_time_percentage || 0}% on-time</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Overall Score</p>
                  </div>

                  {/* Action */}
                  <Button
                    onClick={() => onCalculateScore(carrier)}
                    disabled={calculating && selectedCarrier === carrier.id}
                    size="sm"
                    variant="outline"
                    className="border-yellow-300 text-yellow-700"
                  >
                    {calculating && selectedCarrier === carrier.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Rescore
                      </>
                    )}
                  </Button>
                </div>

                {/* Detailed Scores (if available) */}
                {scoreData && (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    <div className="p-2 bg-white rounded text-center">
                      <p className="text-xs text-slate-600">Reliability</p>
                      <p className="font-bold text-blue-600">{scoreData.reliability_score}</p>
                    </div>
                    <div className="p-2 bg-white rounded text-center">
                      <p className="text-xs text-slate-600">Safety</p>
                      <p className="font-bold text-emerald-600">{scoreData.safety_score}</p>
                    </div>
                    <div className="p-2 bg-white rounded text-center">
                      <p className="text-xs text-slate-600">Financial</p>
                      <p className="font-bold text-indigo-600">{scoreData.financial_score}</p>
                    </div>
                    <div className="p-2 bg-white rounded text-center">
                      <p className="text-xs text-slate-600">Service</p>
                      <p className="font-bold text-purple-600">{scoreData.service_quality_score}</p>
                    </div>
                    <div className="p-2 bg-white rounded text-center">
                      <p className="text-xs text-slate-600">Compliance</p>
                      <p className="font-bold text-amber-600">{scoreData.compliance_score}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}