
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
      
      {/* Enhanced Health Score Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Financial Health Score</h2>
              <p className="text-slate-600">AI-powered comprehensive business analysis</p>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${healthScoreColors(analysis.financial_health_score).split(' ')[0]} mb-1`}>
                {analysis.financial_health_score}
              </div>
              <p className="text-sm text-slate-600">out of 100</p>
              <Badge className={`mt-2 ${
                analysis.financial_health_score >= 80 ? 'bg-emerald-600' :
                analysis.financial_health_score >= 60 ? 'bg-blue-600' :
                'bg-amber-600'
              } text-white`}>
                {analysis.financial_health_score >= 80 ? 'Excellent' :
                 analysis.financial_health_score >= 60 ? 'Good' : 'Needs Attention'}
              </Badge>
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
                  {analysis.cash_flow_status?.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Strengths and Concerns with Progress Indicators */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Financial Strengths ({analysis.strengths?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {analysis.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Concerns with Priority */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Priority Improvements ({analysis.concerns?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {analysis.concerns?.map((concern, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-center w-6 h-6 bg-amber-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm text-slate-700">{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </div>

      {/* Revenue & Cost Opportunities - Enhanced */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="border-b border-emerald-200 pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Revenue Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {analysis.revenue_opportunities?.map((opp, idx) => (
                <li key={idx} className="p-3 bg-white rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-900 font-medium">{opp}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="border-b border-blue-200 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Cost Reduction Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {analysis.cost_reduction_opportunities?.map((opp, idx) => (
                <li key={idx} className="p-3 bg-white rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 font-medium">{opp}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions - Enhanced with Priority */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-indigo-600" />
            Prioritized Action Plan
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Implement these actions in order for maximum financial impact
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {analysis.recommended_actions?.map((action, index) => {
              const priority = index < 2 ? 'high' : index < 5 ? 'medium' : 'low';
              const priorityColors = {
                high: 'bg-red-600 text-white',
                medium: 'bg-amber-600 text-white',
                low: 'bg-blue-600 text-white'
              };
              
              return (
                <div key={index} className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:shadow-md transition-shadow">
                  <span className={`flex items-center justify-center w-6 h-6 ${priorityColors[priority]} rounded-full text-sm font-bold flex-shrink-0`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-indigo-900 font-medium">{action}</span>
                      <Badge className={`${priorityColors[priority]} text-xs uppercase`}>
                        {priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
