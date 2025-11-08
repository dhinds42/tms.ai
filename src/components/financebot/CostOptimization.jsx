import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Zap } from "lucide-react";

export default function CostOptimization({ analysis }) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="border-b border-purple-200 pb-6">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-purple-600" />
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Optimization Opportunities
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              AI-identified opportunities to improve profitability
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Revenue Opportunities */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-slate-900">Revenue Growth</h3>
            </div>
            <ul className="space-y-3">
              {analysis.revenue_opportunities?.map((opp, index) => (
                <li key={index} className="p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-sm text-slate-700">{opp}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Cost Reduction */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-slate-900">Cost Reduction</h3>
            </div>
            <ul className="space-y-3">
              {analysis.cost_reduction_opportunities?.map((opp, index) => (
                <li key={index} className="p-3 bg-white rounded-lg border border-purple-200">
                  <p className="text-sm text-slate-700">{opp}</p>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Margin Improvement Strategies */}
        <div className="mt-6">
          <h3 className="font-semibold text-slate-900 mb-4">Margin Improvement Strategies</h3>
          <div className="space-y-3">
            {analysis.margin_improvement_strategies?.map((strategy, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-700 flex-1">{strategy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}