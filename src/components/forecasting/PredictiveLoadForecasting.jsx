import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Truck, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PredictiveLoadForecasting({ loads }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateForecast = async () => {
      if (!loads || loads.length < 10) return;

      setLoading(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Predict load volume and revenue for next 7 days:

HISTORICAL DATA (last 30 days):
${JSON.stringify(loads.slice(0, 100).map(l => ({
  date: l.created_date,
  revenue: l.customer_rate,
  equipment: l.equipment_type,
  status: l.status
})), null, 2)}

For each of next 7 days predict:
- Expected load count
- Expected revenue
- Top equipment demand
- Confidence level
- Key factors (seasonality, trends)`,
          response_json_schema: {
            type: "object",
            properties: {
              daily_forecast: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string" },
                    predicted_loads: { type: "number" },
                    predicted_revenue: { type: "number" },
                    top_equipment: { type: "string" },
                    confidence: { type: "number" }
                  }
                }
              },
              summary: {
                type: "object",
                properties: {
                  total_predicted_loads: { type: "number" },
                  total_predicted_revenue: { type: "number" },
                  trend: { type: "string" },
                  key_factors: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        });

        setForecast(result);
      } catch (error) {
        console.error('Forecasting error:', error);
      } finally {
        setLoading(false);
      }
    };

    generateForecast();
  }, [loads]);

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-indigo-600 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-slate-600">Analyzing patterns...</p>
        </CardContent>
      </Card>
    );
  }

  if (!forecast) return null;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            7-Day Load Forecast
            <Badge className="ml-auto bg-indigo-600">AI Predicted</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-slate-500">Expected Loads</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">
                {forecast.summary?.total_predicted_loads || 0}
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-slate-500">Expected Revenue</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                ${((forecast.summary?.total_predicted_revenue || 0) / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs font-semibold text-slate-700 mb-1">Trend: {forecast.summary?.trend}</p>
            {forecast.summary?.key_factors?.map((factor, i) => (
              <p key={i} className="text-xs text-slate-600">• {factor}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown Chart */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Daily Load Volume Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={forecast.daily_forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="predicted_loads" fill="#3b82f6" name="Predicted Loads" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Forecast */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={forecast.daily_forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="predicted_revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Details */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Daily Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {forecast.daily_forecast?.map((day, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{day.date}</p>
                <p className="text-xs text-slate-600">{day.top_equipment}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-indigo-600">{day.predicted_loads} loads</p>
                <p className="text-xs text-slate-500">{day.confidence}% confidence</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}