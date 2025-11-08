import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, CheckCircle, Target } from "lucide-react";

const healthScoreColors = (score) => {
  if (score >= 80) return "text-emerald-600 bg-emerald-100";
  if (score >= 60) return "text-blue-600 bg-blue-100";
  if (score >= 40) return "text-amber-600 bg-amber-100";
  return "text-red-600 bg-red-100";
};

const assessmentColors = {
  EXCELLENT: "bg-emerald-100 text-emerald-700 border-emerald-300",
  GOOD: "bg-blue-100 text-blue-700 border-blue-300",
  FAIR: "bg-amber-100 text-amber-700 border-amber-300",
  POOR: "bg-red-100 text-red-700 border-red-300"
};

export default function FinancialInsights({ analysis }) {
  return (
    <div className="space-y-6">
      
      {/* Health Score Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Financial Health Score</h2>
              <p className="text-slate-600">Overall business performance assessment</p>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${healthScoreColors(analysis.financial_health_score).split(' ')[0]} mb-1`}>
                {analysis.financial_health_score}
              </div>
              <p className="text-sm text-slate-600">out of 100</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Profitability</span>
                <Badge variant="outline" className={assessmentColors[analysis.profitability_assessment]}>
                  {analysis.profitability_assessment}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Cash Flow</span>
                <Badge variant="outline" className={assessmentColors[analysis.cash_flow_status] || assessmentColors.FAIR}>
                  {analysis.cash_flow_status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Concerns */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Financial Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {analysis.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
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
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {analysis.concerns?.map((concern, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </div>

      {/* Recommended Actions */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-indigo-600" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {analysis.recommended_actions?.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white rounded-full text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-indigo-900 font-medium">{action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}