import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Shield, TrendingUp, DollarSign, Target } from "lucide-react";

const riskColors = {
  LOW: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
};

const approvalColors = {
  APPROVE: { bg: 'bg-emerald-600', text: 'text-white', icon: CheckCircle },
  CONDITIONAL: { bg: 'bg-amber-600', text: 'text-white', icon: AlertTriangle },
  REJECT: { bg: 'bg-red-600', text: 'text-white', icon: XCircle }
};

export default function ScoutAnalysis({ analysis }) {
  const riskStyle = riskColors[analysis.risk_level] || riskColors.MEDIUM;
  const approvalStyle = approvalColors[analysis.approval_recommendation] || approvalColors.CONDITIONAL;
  const ApprovalIcon = approvalStyle.icon;

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100';
    if (score >= 70) return 'text-amber-600 bg-amber-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      
      {/* Header Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">{analysis.carrier_name}</h2>
              <p className="text-slate-600">Scout AI Analysis Complete</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-600 mb-1">
                {analysis.overall_score}
              </div>
              <p className="text-sm text-slate-600">Overall Score</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Risk Level</span>
                <Badge className={`${riskStyle.bg} ${riskStyle.text} border ${riskStyle.border}`}>
                  {analysis.risk_level}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Recommendation</span>
                <Badge className={`${approvalStyle.bg} ${approvalStyle.text} flex items-center gap-1`}>
                  <ApprovalIcon className="w-3 h-3" />
                  {analysis.approval_recommendation}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="text-xl font-bold text-slate-900">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mb-3">
                <Shield className="w-8 h-8 text-indigo-600 mx-auto" />
              </div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Safety Score</p>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreColor(analysis.safety_score)}`}>
                <span className="text-2xl font-bold">{analysis.safety_score}</span>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-3">
                <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto" />
              </div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Reliability Score</p>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreColor(analysis.reliability_score)}`}>
                <span className="text-2xl font-bold">{analysis.reliability_score}</span>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-3">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto" />
              </div>
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Financial Score</p>
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreColor(analysis.financial_score)}`}>
                <span className="text-2xl font-bold">{analysis.financial_score}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-2">
              {analysis.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Concerns */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Key Concerns
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-2">
              {analysis.concerns?.map((concern, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </div>

      {/* Additional Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Lane Suitability */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-indigo-600" />
              Lane Suitability
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-700">{analysis.lane_suitability}</p>
          </CardContent>
        </Card>

        {/* Monitoring Requirements */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-purple-600" />
              Monitoring Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-700">{analysis.monitoring_requirements}</p>
          </CardContent>
        </Card>

      </div>

      {/* Recommended Actions */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-blue-600" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-2">
            {analysis.recommended_actions?.map((action, index) => (
              <li key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-bold">{index + 1}.</span>
                <span className="text-sm text-blue-900">{action}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-indigo-50">
        <CardHeader className="border-b border-slate-200 pb-4">
          <CardTitle className="text-lg">Scout's Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-slate-700 leading-relaxed">{analysis.analysis_summary}</p>
        </CardContent>
      </Card>

    </div>
  );
}