import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, CheckCircle, Brain } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import CapacityPlanner from "../components/capacity/CapacityPlanner";

export default function CapacityPlanning() {
  const [forecasting, setForecasting] = useState(false);
  const [forecast, setForecast] = useState(null);

  const { data: loads } = useScopedEntity('Load', { limit: 100 });
  const { data: carriers } = useScopedEntity('Carrier', { limit: 999 });

  const runCapacityForecast = async () => {
    setForecasting(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze capacity planning for freight operations.
Current loads: ${loads.length}
Active carriers: ${carriers.length}

Forecast next 4 weeks of capacity needs by lane and identify shortages.`,
        response_json_schema: {
          type: "object",
          properties: {
            weekly_forecast: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  week: { type: "string" },
                  demand: { type: "number" },
                  available_capacity: { type: "number" },
                  shortage: { type: "number" }
                }
              }
            },
            critical_lanes: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      setForecast(result);
    } catch (error) {
      alert('Forecast failed');
    } finally {
      setForecasting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Capacity Planning & Forecasting
          </h1>
          <p className="text-slate-600 mt-2">Predict capacity needs and prevent shortages</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Current Utilization</p>
                  <p className="text-3xl font-bold text-indigo-600">78%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Capacity Surplus</p>
                  <p className="text-3xl font-bold text-emerald-600">+15%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">At-Risk Lanes</p>
                  <p className="text-3xl font-bold text-amber-600">3</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>4-Week Capacity Forecast</CardTitle>
              <Button onClick={runCapacityForecast} disabled={forecasting} className="bg-indigo-600">
                <Brain className="w-4 h-4 mr-2" />
                Run AI Forecast
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {forecast && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecast.weekly_forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="demand" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="available_capacity" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Capacity Planner */}
        <CapacityPlanner />

      </div>
    </div>
  );
}