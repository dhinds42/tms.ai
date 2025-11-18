import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Brain, Loader2, Target, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function ForecastingEngine({ loads }) {
  const [forecasting, setForecasting] = useState(false);
  const [forecastType, setForecastType] = useState('revenue');
  const [forecastPeriod, setForecastPeriod] = useState('30');
  const [forecast, setForecast] = useState(null);

  const generateForecast = async () => {
    setForecasting(true);
    
    try {
      // Prepare historical data
      const historicalData = {};
      const now = new Date();
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        historicalData[dateKey] = { revenue: 0, loads: 0, margin: 0 };
      }

      loads.forEach(load => {
        if (load.created_date) {
          const dateKey = load.created_date.split('T')[0];
          if (historicalData[dateKey]) {
            historicalData[dateKey].revenue += (load.customer_rate || 0);
            historicalData[dateKey].loads += 1;
            historicalData[dateKey].margin += ((load.customer_rate || 0) - (load.carrier_pay || 0));
          }
        }
      });

      const historicalArray = Object.keys(historicalData).map(date => ({
        date,
        ...historicalData[date]
      }));

      // Use AI to generate forecast
      const forecastPrompt = `
        Based on this historical transportation data, generate a ${forecastPeriod}-day forecast.
        
        Historical Data (last 30 days):
        ${JSON.stringify(historicalArray, null, 2)}
        
        Forecast Type: ${forecastType}
        
        Consider:
        - Seasonal trends and patterns
        - Growth trajectory
        - Day-of-week variations
        - Recent momentum
        
        Return a JSON array with ${forecastPeriod} forecasted data points, each with:
        - date (YYYY-MM-DD format)
        - predicted_value (forecasted ${forecastType})
        - confidence_lower (lower bound)
        - confidence_upper (upper bound)
        - confidence_percentage (0-100)
      `;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: forecastPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  predicted_value: { type: "number" },
                  confidence_lower: { type: "number" },
                  confidence_upper: { type: "number" },
                  confidence_percentage: { type: "number" }
                }
              }
            },
            insights: {
              type: "array",
              items: { type: "string" }
            },
            trend: { type: "string" }
          }
        }
      });

      // Combine historical and forecast data
      const combinedData = [
        ...historicalArray.slice(-15).map(d => ({
          date: d.date,
          actual: d[forecastType],
          type: 'historical'
        })),
        ...aiResponse.forecast.map(d => ({
          date: d.date,
          predicted: d.predicted_value,
          lower: d.confidence_lower,
          upper: d.confidence_upper,
          confidence: d.confidence_percentage,
          type: 'forecast'
        }))
      ];

      setForecast({
        data: combinedData,
        insights: aiResponse.insights || [],
        trend: aiResponse.trend || 'stable',
        avgConfidence: aiResponse.forecast.reduce((sum, f) => sum + f.confidence_percentage, 0) / aiResponse.forecast.length
      });

    } catch (error) {
      console.error('Forecasting error:', error);
      alert('Failed to generate forecast');
    } finally {
      setForecasting(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          AI-Powered Forecasting Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        
        {/* Configuration */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Forecast Type</label>
            <Select value={forecastType} onValueChange={setForecastType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="loads">Load Volume</SelectItem>
                <SelectItem value="margin">Profit Margin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">Forecast Period</label>
            <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={generateForecast}
              disabled={forecasting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              {forecasting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Forecast
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Forecast Results */}
        {forecast && (
          <div className="space-y-6">
            
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-xs font-semibold text-indigo-900 mb-1">Trend Direction</p>
                <p className="text-lg font-bold text-indigo-600 capitalize">{forecast.trend}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-900 mb-1">Avg Confidence</p>
                <p className="text-lg font-bold text-emerald-600">{forecast.avgConfidence.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-1">Forecast Days</p>
                <p className="text-lg font-bold text-purple-600">{forecastPeriod}</p>
              </div>
            </div>

            {/* Chart */}
            <div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={forecast.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fill: '#64748b' }} />
                  <Tooltip />
                  <ReferenceLine x={forecast.data.find(d => d.type === 'forecast')?.date} stroke="#ef4444" strokeDasharray="5 5" label="Forecast Start" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} name="Historical" dot={false} />
                  <Line type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={3} strokeDasharray="5 5" name="Forecast" dot={false} />
                  <Line type="monotone" dataKey="upper" stroke="#93c5fd" strokeWidth={1} name="Upper Bound" dot={false} />
                  <Line type="monotone" dataKey="lower" stroke="#93c5fd" strokeWidth={1} name="Lower Bound" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Insights */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                AI-Generated Insights
              </h4>
              <ul className="space-y-2">
                {forecast.insights.map((insight, idx) => (
                  <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Info */}
        {!forecast && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-sm text-slate-700">
              <strong>🤖 AI Forecasting:</strong> Uses historical patterns, seasonal trends, and machine learning to predict future performance with confidence intervals.
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}