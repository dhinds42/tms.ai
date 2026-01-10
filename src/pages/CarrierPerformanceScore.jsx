import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, Shield, Clock, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function CarrierPerformanceScore() {
  const { data: carriers, isLoading } = useScopedEntity('Carrier', { limit: 100 });
  const { data: loads } = useScopedEntity('Load', { limit: 100 });

  const calculatePerformanceScore = (carrier) => {
    const weights = {
      on_time: 30,
      safety: 25,
      compliance: 20,
      communication: 15,
      reliability: 10
    };

    const scores = {
      on_time: carrier.on_time_percentage || 0,
      safety: carrier.fmcsa_safety_rating === 'satisfactory' ? 100 :
               carrier.fmcsa_safety_rating === 'conditional' ? 60 : 30,
      compliance: carrier.compliance_score || 0,
      communication: carrier.rating ? (carrier.rating / 5) * 100 : 80,
      reliability: 100 - ((carrier.total_loads || 0) > 0 ? 0 : 20)
    };

    const totalScore = Object.keys(weights).reduce((sum, key) => {
      return sum + (scores[key] * weights[key] / 100);
    }, 0);

    return {
      total: Math.round(totalScore),
      breakdown: scores
    };
  };

  const carrierScores = carriers.map(carrier => {
    const carrierLoads = loads.filter(l => l.carrier_id === carrier.id);
    const score = calculatePerformanceScore(carrier);
    
    return {
      ...carrier,
      performance_score: score.total,
      score_breakdown: score.breakdown,
      total_revenue: carrierLoads.reduce((sum, l) => sum + (l.carrier_pay || 0), 0)
    };
  }).sort((a, b) => b.performance_score - a.performance_score);

  const topPerformers = carrierScores.slice(0, 10);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 90) return 'bg-emerald-600';
    if (score >= 80) return 'bg-blue-600';
    if (score >= 70) return 'bg-amber-600';
    return 'bg-red-600';
  };

  const getTierBadge = (score) => {
    if (score >= 90) return { tier: 'Elite', color: 'bg-yellow-500 text-white' };
    if (score >= 80) return { tier: 'Preferred', color: 'bg-blue-600 text-white' };
    if (score >= 70) return { tier: 'Standard', color: 'bg-slate-600 text-white' };
    return { tier: 'Probation', color: 'bg-red-600 text-white' };
  };

  const avgScore = carrierScores.length > 0
    ? carrierScores.reduce((sum, c) => sum + c.performance_score, 0) / carrierScores.length
    : 0;

  const chartData = topPerformers.map(c => ({
    name: c.company_name.slice(0, 20),
    score: c.performance_score
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-yellow-500/30">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-yellow-900 to-amber-900 bg-clip-text text-transparent mb-2">
            Carrier Performance Scoring
          </h1>
          <p className="text-slate-600 text-lg">
            Comprehensive carrier evaluation across safety, compliance, and reliability
          </p>
          <Badge className="mt-3 bg-yellow-600">Multi-Factor Scoring</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Carriers</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{carriers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Score</p>
                  <p className={`text-3xl font-bold mt-2 ${getScoreColor(avgScore)}`}>
                    {avgScore.toFixed(0)}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Elite Tier</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {carrierScores.filter(c => c.performance_score >= 90).length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Need Review</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {carrierScores.filter(c => c.performance_score < 70).length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle>Top 10 Carriers by Performance Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="score" fill="url(#scoreGradient)" radius={[0, 8, 8, 0]} />
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#eab308" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Carrier Scorecards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {topPerformers.map((carrier, idx) => {
            const tierInfo = getTierBadge(carrier.performance_score);
            const radarData = [
              { category: 'On-Time', score: carrier.score_breakdown.on_time, fullMark: 100 },
              { category: 'Safety', score: carrier.score_breakdown.safety, fullMark: 100 },
              { category: 'Compliance', score: carrier.score_breakdown.compliance, fullMark: 100 },
              { category: 'Communication', score: carrier.score_breakdown.communication, fullMark: 100 },
              { category: 'Reliability', score: carrier.score_breakdown.reliability, fullMark: 100 }
            ];

            return (
              <Card key={carrier.id} className="border-0 shadow-xl bg-white hover:shadow-2xl transition-shadow">
                <CardHeader className="border-b border-slate-100 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg text-white font-bold">
                          #{idx + 1}
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">{carrier.company_name}</h3>
                      </div>
                      <Badge className={tierInfo.color}>
                        {tierInfo.tier}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(carrier.performance_score)}`}>
                        {carrier.performance_score}
                      </div>
                      <p className="text-xs text-slate-600">Overall Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Radar name="Performance" dataKey="score" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs text-slate-600">On-Time %</p>
                      </div>
                      <p className="text-xl font-bold text-emerald-600">
                        {carrier.on_time_percentage || 0}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-slate-600">Compliance</p>
                      </div>
                      <p className="text-xl font-bold text-blue-600">
                        {carrier.compliance_score || 0}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Total Loads</p>
                      <p className="text-xl font-bold text-slate-900">
                        {carrier.total_loads || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Revenue</p>
                      <p className="text-xl font-bold text-slate-900">
                        ${(carrier.total_revenue / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Scoring Methodology */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="border-b border-blue-200 pb-6">
            <CardTitle className="text-blue-900">Performance Scoring Methodology</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="p-4 bg-white rounded-xl">
                <h5 className="font-semibold text-slate-900 mb-2">On-Time (30%)</h5>
                <p className="text-sm text-slate-600">Delivery punctuality and schedule adherence</p>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <h5 className="font-semibold text-slate-900 mb-2">Safety (25%)</h5>
                <p className="text-sm text-slate-600">FMCSA rating and safety record</p>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <h5 className="font-semibold text-slate-900 mb-2">Compliance (20%)</h5>
                <p className="text-sm text-slate-600">Insurance, docs, and regulatory adherence</p>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <h5 className="font-semibold text-slate-900 mb-2">Communication (15%)</h5>
                <p className="text-sm text-slate-600">Responsiveness and updates</p>
              </div>
              <div className="p-4 bg-white rounded-xl">
                <h5 className="font-semibold text-slate-900 mb-2">Reliability (10%)</h5>
                <p className="text-sm text-slate-600">Consistency and no-show rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}