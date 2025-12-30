import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, DollarSign, Truck, Calendar, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AIPredictiveAnalytics({ loads, carriers, drivers }) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generatePredictions = async () => {
      if (!loads || loads.length === 0) return;

      setLoading(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate predictive analytics for logistics operations:

HISTORICAL DATA:
Total Loads: ${loads.length}
Active Loads: ${loads.filter(l => ['dispatched', 'in_transit'].includes(l.status)).length}
Completed Loads: ${loads.filter(l => l.status === 'delivered').length}
Average Margin: ${loads.reduce((sum, l) => sum + (l.margin || 0), 0) / loads.length}
Total Revenue: ${loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0)}

CARRIER DATA:
Total Carriers: ${carriers?.length || 0}
Active Carriers: ${carriers?.filter(c => c.status === 'active').length || 0}

DRIVER DATA:
Total Drivers: ${drivers?.length || 0}
Available Drivers: ${drivers?.filter(d => d.status === 'available').length || 0}

Predict for next 30/60/90 days:
1. Load volume trends (increase/decrease %)
2. Revenue forecasts with confidence levels
3. Capacity constraints (driver/carrier shortage risks)
4. Margin compression risks
5. Peak demand periods
6. Cost optimization opportunities
7. Market rate predictions
8. Equipment demand shifts`,
          response_json_schema: {
            type: "object",
            properties: {
              load_volume: {
                type: "object",
                properties: {
                  next_30_days: { type: "number" },
                  next_60_days: { type: "number" },
                  next_90_days: { type: "number" },
                  trend: { type: "string", enum: ["increasing", "decreasing", "stable"] }
                }
              },
              revenue_forecast: {
                type: "object",
                properties: {
                  next_30_days: { type: "number" },
                  next_60_days: { type: "number" },
                  next_90_days: { type: "number" },
                  confidence: { type: "number" }
                }
              },
              capacity_risks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    risk: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                    timeframe: { type: "string" },
                    mitigation: { type: "string" }
                  }
                }
              },
              peak_periods: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    period: { type: "string" },
                    expected_volume_increase: { type: "number" },
                    preparation_steps: { type: "array", items: { type: "string" } }
                  }
                }
              },
              opportunities: { type: "array", items: { type: "string" } }
            }
          }
        });

        setPredictions(result);
      } catch (error) {
        console.error('Predictive analytics error:', error);
      } finally {
        setLoading(false);
      }
    };

    generatePredictions();
  }, [loads, carriers, drivers]);

  if (!predictions) return loading ? (
    <Card className="border-0 shadow-xl">
      <CardContent className="p-6 text-center">
        <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-3 animate-pulse" />
        <p className="text-sm text-slate-600">Analyzing historical data...</p>
      </CardContent>
    </Card>
  ) : null;

  const chartData = [
    { month: '30d', forecast: predictions.revenue_forecast?.next_30_days / 1000 },
    { month: '60d', forecast: predictions.revenue_forecast?.next_60_days / 1000 },
    { month: '90d', forecast: predictions.revenue_forecast?.next_90_days / 1000 }
  ];

  return (
    <div className="space-y-4">
      {/* Load Volume Predictions */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="w-5 h-5 text-indigo-600" />
            Load Volume Forecast
            <Badge className="ml-auto bg-indigo-600">AI Powered</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-500">30 Days</p>
              <p className="text-xl font-bold text-indigo-600">
                {predictions.load_volume?.next_30_days}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-500">60 Days</p>
              <p className="text-xl font-bold text-indigo-600">
                {predictions.load_volume?.next_60_days}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-500">90 Days</p>
              <p className="text-xl font-bold text-indigo-600">
                {predictions.load_volume?.next_90_days}
              </p>
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg flex items-center justify-between">
            <span className="text-sm text-slate-600">Trend Direction</span>
            <Badge className={
              predictions.load_volume?.trend === 'increasing' ? 'bg-emerald-600' :
              predictions.load_volume?.trend === 'decreasing' ? 'bg-red-600' : 'bg-slate-600'
            }>
              {predictions.load_volume?.trend?.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecast */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Revenue Forecast
            <Badge variant="outline" className="ml-auto">
              {predictions.revenue_forecast?.confidence}% confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: '$K', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip formatter={(value) => `$${value}K`} />
              <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Capacity Risks */}
      {predictions.capacity_risks?.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Capacity Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {predictions.capacity_risks.map((risk, i) => (
              <div key={i} className={`p-3 rounded-lg ${
                risk.severity === 'high' ? 'bg-red-50 border border-red-200' :
                risk.severity === 'medium' ? 'bg-amber-50 border border-amber-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-900">{risk.risk}</p>
                  <Badge className={
                    risk.severity === 'high' ? 'bg-red-600' :
                    risk.severity === 'medium' ? 'bg-amber-600' : 'bg-blue-600'
                  }>
                    {risk.severity}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mb-2">{risk.timeframe}</p>
                <p className="text-xs text-slate-700 font-medium">Mitigation: {risk.mitigation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Peak Periods */}
      {predictions.peak_periods?.length > 0 && (
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-purple-600" />
              Predicted Peak Periods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {predictions.peak_periods.map((peak, i) => (
              <div key={i} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-900">{peak.period}</span>
                  <Badge className="bg-purple-600">+{peak.expected_volume_increase}% volume</Badge>
                </div>
                <div className="space-y-1">
                  {peak.preparation_steps?.map((step, j) => (
                    <p key={j} className="text-xs text-purple-900">• {step}</p>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Opportunities */}
      {predictions.opportunities?.length > 0 && (
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {predictions.opportunities.map((opp, i) => (
              <div key={i} className="p-3 bg-emerald-50 rounded-lg flex items-start gap-2">
                <span className="text-emerald-600 font-bold">{i + 1}.</span>
                <p className="text-xs text-emerald-900">{opp}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}