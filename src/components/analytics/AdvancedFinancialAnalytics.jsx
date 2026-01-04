import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, PieChart } from "lucide-react";

export default function AdvancedFinancialAnalytics({ loads }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const analyzeFinancials = async () => {
      if (!loads || loads.length === 0) return;

      // P0 FRONTEND FIX F-7: Validate org consistency before LLM call
      const orgIds = [...new Set(loads.map(l => l.org_id).filter(Boolean))];
      if (orgIds.length > 1) {
        console.error('SECURITY: Mixed org_id in loads array - aborting LLM call', orgIds);
        setAnalytics({
          error: 'Security validation failed: mixed org data detected'
        });
        return;
      }

      setLoading(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze financial performance and forecast:

LOAD DATA:
${JSON.stringify(loads.slice(0, 50).map(l => ({
  revenue: l.total_revenue || l.customer_rate,
  cost: l.carrier_pay,
  margin: l.margin,
  status: l.status,
  equipment: l.equipment_type,
  created: l.created_date
})), null, 2)}

Provide detailed financial analytics:
1. Current month revenue & cost trends
2. Profit margin analysis by equipment type
3. Revenue forecast for next 30/60/90 days
4. Cost optimization opportunities
5. Risk factors affecting profitability
6. Top 3 recommendations for improvement`,
          response_json_schema: {
            type: "object",
            properties: {
              current_metrics: {
                type: "object",
                properties: {
                  total_revenue: { type: "number" },
                  total_cost: { type: "number" },
                  net_profit: { type: "number" },
                  avg_margin_percent: { type: "number" },
                  loads_count: { type: "number" }
                }
              },
              forecast: {
                type: "object",
                properties: {
                  next_30_days_revenue: { type: "number" },
                  next_60_days_revenue: { type: "number" },
                  next_90_days_revenue: { type: "number" },
                  confidence: { type: "number" }
                }
              },
              margin_by_equipment: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    equipment: { type: "string" },
                    avg_margin: { type: "number" },
                    load_count: { type: "number" }
                  }
                }
              },
              opportunities: { type: "array", items: { type: "string" } },
              risks: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } }
            }
          }
        });

        setAnalytics(result);
      } catch (error) {
        console.error('Financial analytics error:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeFinancials();
  }, [loads]);

  if (!analytics) return null;

  return (
    <div className="space-y-4">
      {/* Current Metrics */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Financial Performance
            <Badge className="ml-auto bg-emerald-600">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-500">Revenue</p>
              <p className="text-lg font-bold text-emerald-600">
                ${analytics.current_metrics?.total_revenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-500">Profit</p>
              <p className="text-lg font-bold text-emerald-600">
                ${analytics.current_metrics?.net_profit?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-500">Margin</p>
              <p className="text-lg font-bold text-slate-900">
                {analytics.current_metrics?.avg_margin_percent?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-500">Loads</p>
              <p className="text-lg font-bold text-slate-900">
                {analytics.current_metrics?.loads_count || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Revenue Forecast
            <Badge variant="outline" className="ml-auto">
              {analytics.forecast?.confidence}% confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">30 Days:</span>
            <span className="font-semibold text-slate-900">
              ${analytics.forecast?.next_30_days_revenue?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">60 Days:</span>
            <span className="font-semibold text-slate-900">
              ${analytics.forecast?.next_60_days_revenue?.toLocaleString() || 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">90 Days:</span>
            <span className="font-semibold text-slate-900">
              ${analytics.forecast?.next_90_days_revenue?.toLocaleString() || 0}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {analytics.recommendations?.length > 0 && (
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="w-5 h-5 text-indigo-600" />
              Top Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-indigo-50 rounded">
                <span className="text-indigo-600 font-bold">{i + 1}.</span>
                <p className="text-xs text-indigo-900">{rec}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {analytics.risks?.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <p className="text-xs text-red-900">{risk}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}