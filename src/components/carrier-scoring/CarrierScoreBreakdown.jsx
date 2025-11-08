import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function CarrierScoreBreakdown({ carrier, scoreData, loads }) {
  if (!scoreData) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-indigo-600 bg-indigo-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            {carrier.company_name} - Detailed Score Breakdown
          </CardTitle>
          <Badge className={`text-2xl px-4 py-2 ${getScoreColor(scoreData.overall_score)}`}>
            {scoreData.overall_score}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {/* Performance Tier */}
        <div className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-300 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-yellow-900 text-lg">Performance Tier</h4>
              <p className="text-sm text-yellow-700 mt-1">{scoreData.detailed_explanation}</p>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white text-xl px-6 py-3">
              {scoreData.performance_tier}
            </Badge>
          </div>
        </div>

        {/* Category Scores */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          {[
            { name: 'Reliability', score: scoreData.reliability_score, weight: '30%', icon: CheckCircle, color: 'blue' },
            { name: 'Safety', score: scoreData.safety_score, weight: '25%', icon: AlertTriangle, color: 'emerald' },
            { name: 'Financial', score: scoreData.financial_score, weight: '20%', icon: TrendingUp, color: 'indigo' },
            { name: 'Service', score: scoreData.service_quality_score, weight: '15%', icon: Award, color: 'purple' },
            { name: 'Compliance', score: scoreData.compliance_score, weight: '10%', icon: CheckCircle, color: 'amber' }
          ].map((category, idx) => (
            <div key={idx} className={`p-4 bg-${category.color}-50 rounded-xl border border-${category.color}-200 text-center`}>
              <category.icon className={`w-6 h-6 text-${category.color}-600 mx-auto mb-2`} />
              <p className="text-xs text-slate-600 mb-1">{category.name}</p>
              <p className={`text-3xl font-bold text-${category.color}-600`}>{category.score}</p>
              <Badge variant="outline" className="mt-2 text-xs">{category.weight} weight</Badge>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-5 bg-emerald-50 rounded-xl border-2 border-emerald-200">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-emerald-900">Key Strengths</h4>
            </div>
            <ul className="space-y-2">
              {scoreData.strengths?.map((strength, idx) => (
                <li key={idx} className="text-sm text-emerald-800 flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-amber-50 rounded-xl border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-amber-900">Areas for Improvement</h4>
            </div>
            <ul className="space-y-2">
              {scoreData.areas_for_improvement?.map((area, idx) => (
                <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                  <span className="text-amber-600 font-bold">⚠</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk & Recommendation */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className={`p-5 rounded-xl border-2 ${
            scoreData.risk_level === 'LOW' ? 'bg-emerald-50 border-emerald-200' :
            scoreData.risk_level === 'MEDIUM' ? 'bg-amber-50 border-amber-200' :
            'bg-red-50 border-red-200'
          }`}>
            <h4 className="font-bold mb-2">Risk Level</h4>
            <Badge className={
              scoreData.risk_level === 'LOW' ? 'bg-emerald-600 text-white text-lg px-4 py-2' :
              scoreData.risk_level === 'MEDIUM' ? 'bg-amber-600 text-white text-lg px-4 py-2' :
              'bg-red-600 text-white text-lg px-4 py-2'
            }>
              {scoreData.risk_level}
            </Badge>
          </div>

          <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-900 mb-2">Recommendation</h4>
            <p className="text-sm text-blue-800 font-semibold">{scoreData.recommendation}</p>
          </div>
        </div>

        {/* Industry Benchmark */}
        {scoreData.industry_benchmark_comparison && (
          <div className="mt-6 p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
            <h4 className="font-bold text-slate-900 mb-3">Industry Benchmark Comparison</h4>
            <p className="text-sm text-slate-700">{scoreData.industry_benchmark_comparison}</p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}