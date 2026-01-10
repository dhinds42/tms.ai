import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Target, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PredictiveAnalyticsDashboard() {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { data: loads } = useScopedEntity('Load', { limit: 500 });
  const { data: carriers } = useScopedEntity('Carrier', { limit: 200 });
  
  useEffect(() => {
    const generatePredictions = async () => {
      setLoading(true);
      
      // Prepare historical data
      const historicalData = loads.map(l => ({
        date: new Date(l.created_date).toISOString(),
        revenue: l.customer_rate || 0,
        cost: l.carrier_pay || 0,
        margin: (l.customer_rate || 0) - (l.carrier_pay || 0),
        origin: l.pickup_location?.city,
        destination: l.dropoff_location?.city,
        equipment: l.equipment_type
      }));
      
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this transportation data and provide predictive insights for the next 30 days:
          
Historical Loads: ${JSON.stringify(historicalData.slice(0, 100))}
Active Carriers: ${carriers.length}

Provide predictions for:
1. Expected load volume (trend: up/down/stable, predicted_loads)
2. Rate trends (predicted_rpm, trend)
3. Capacity constraints (risk_level: low/medium/high, explanation)
4. Top 3 lanes to prioritize
5. Revenue forecast (next_30_days_revenue)

Return structured JSON.`,
          response_json_schema: {
            type: 'object',
            properties: {
              load_volume: {
                type: 'object',
                properties: {
                  trend: { type: 'string' },
                  predicted_loads: { type: 'number' },
                  confidence: { type: 'string' }
                }
              },
              rate_trends: {
                type: 'object',
                properties: {
                  predicted_rpm: { type: 'number' },
                  trend: { type: 'string' },
                  factors: { type: 'array', items: { type: 'string' } }
                }
              },
              capacity_risk: {
                type: 'object',
                properties: {
                  risk_level: { type: 'string' },
                  explanation: { type: 'string' },
                  mitigation: { type: 'string' }
                }
              },
              priority_lanes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    lane: { type: 'string' },
                    reason: { type: 'string' },
                    expected_margin: { type: 'number' }
                  }
                }
              },
              revenue_forecast: {
                type: 'object',
                properties: {
                  next_30_days: { type: 'number' },
                  growth_percent: { type: 'number' }
                }
              }
            }
          }
        });
        
        setPredictions(result);
      } catch (error) {
        console.error('Prediction generation failed:', error);
      }
      
      setLoading(false);
    };
    
    if (loads.length > 0) {
      generatePredictions();
    }
  }, [loads.length]);
  
  const revenueData = loads.slice(0, 30).map((l, i) => ({
    day: i + 1,
    revenue: l.customer_rate || 0,
    cost: l.carrier_pay || 0
  }));
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Predictive Analytics Dashboard</h1>
          <div className="text-center py-20">
            <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
            <p className="text-lg text-slate-600">AI analyzing your data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent">
              Predictive Analytics Dashboard
            </h1>
            <p className="text-slate-600 mt-2">AI-powered forecasts and strategic insights</p>
          </div>
          <Badge className="bg-purple-600 text-white">
            <Brain className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        
        {predictions && (
          <>
            {/* Key Predictions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Load Volume Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-600">
                        {predictions.load_volume?.predicted_loads || 0}
                      </span>
                      <span className="text-sm text-slate-600">loads</span>
                    </div>
                    <Badge className={
                      predictions.load_volume?.trend === 'up' ? 'bg-green-500' : 
                      predictions.load_volume?.trend === 'down' ? 'bg-red-500' : 'bg-slate-500'
                    }>
                      {predictions.load_volume?.trend === 'up' ? '↑' : predictions.load_volume?.trend === 'down' ? '↓' : '→'} 
                      {predictions.load_volume?.trend}
                    </Badge>
                    <p className="text-xs text-slate-600">
                      Confidence: {predictions.load_volume?.confidence}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Rate Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-emerald-600">
                        ${predictions.rate_trends?.predicted_rpm?.toFixed(2) || '0.00'}
                      </span>
                      <span className="text-sm text-slate-600">/mi</span>
                    </div>
                    <Badge className={
                      predictions.rate_trends?.trend === 'increasing' ? 'bg-green-500' : 
                      predictions.rate_trends?.trend === 'decreasing' ? 'bg-red-500' : 'bg-slate-500'
                    }>
                      {predictions.rate_trends?.trend}
                    </Badge>
                    {predictions.rate_trends?.factors && (
                      <p className="text-xs text-slate-600">
                        {predictions.rate_trends.factors[0]}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`bg-gradient-to-br border-2 ${
                predictions.capacity_risk?.risk_level === 'high' 
                  ? 'from-red-50 to-orange-50 border-red-300' 
                  : predictions.capacity_risk?.risk_level === 'medium'
                  ? 'from-amber-50 to-yellow-50 border-amber-300'
                  : 'from-emerald-50 to-green-50 border-emerald-200'
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      predictions.capacity_risk?.risk_level === 'high' ? 'text-red-600' :
                      predictions.capacity_risk?.risk_level === 'medium' ? 'text-amber-600' : 'text-emerald-600'
                    }`} />
                    Capacity Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className={
                      predictions.capacity_risk?.risk_level === 'high' ? 'bg-red-600' :
                      predictions.capacity_risk?.risk_level === 'medium' ? 'bg-amber-600' : 'bg-emerald-600'
                    }>
                      {predictions.capacity_risk?.risk_level?.toUpperCase() || 'LOW'}
                    </Badge>
                    <p className="text-xs text-slate-700 font-medium">
                      {predictions.capacity_risk?.explanation}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      <strong>Action:</strong> {predictions.capacity_risk?.mitigation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Revenue Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  30-Day Revenue Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-slate-600">Predicted Revenue</p>
                    <p className="text-3xl font-bold text-purple-600">
                      ${((predictions.revenue_forecast?.next_30_days || 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-slate-600">Growth vs Last Period</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {predictions.revenue_forecast?.growth_percent > 0 ? '+' : ''}
                      {predictions.revenue_forecast?.growth_percent?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={revenueData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" name="Revenue" strokeWidth={2} />
                    <Line type="monotone" dataKey="cost" stroke="#ef4444" name="Cost" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Priority Lanes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Strategic Lane Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.priority_lanes?.map((lane, idx) => (
                    <div key={idx} className="p-4 border-2 border-indigo-200 bg-indigo-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge className="bg-indigo-600 mb-2">Priority #{idx + 1}</Badge>
                          <p className="font-bold text-indigo-900">{lane.lane}</p>
                        </div>
                        <p className="text-xl font-bold text-emerald-600">
                          ${((lane.expected_margin || 0) / 100).toFixed(0)} margin
                        </p>
                      </div>
                      <p className="text-sm text-slate-700">{lane.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
        
      </div>
    </div>
  );
}