import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Zap } from "lucide-react";

export default function CapacityPlanner() {
  const [analyzing, setAnalyzing] = useState(false);
  const [forecast, setForecast] = useState(null);

  const runCapacityForecast = async () => {
    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze capacity planning for next 30 days:

Current Data:
- Available trucks: 47
- Available drivers: 52
- Current utilization: 78%
- Pending loads: 127
- Historical demand: 150 loads/week

Provide capacity forecast and recommendations:
1. Projected capacity needs
2. Driver shortage/surplus
3. Equipment gaps
4. Recommended actions`,
        response_json_schema: {
          type: "object",
          properties: {
            projected_loads: { type: "number" },
            capacity_gap: { type: "number" },
            driver_needs: { type: "number" },
            equipment_needs: { type: "number" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setForecast(result);
    } catch (error) {
      alert('Capacity forecast failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          AI Capacity Planning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Button 
          onClick={runCapacityForecast}
          disabled={analyzing}
          className="w-full bg-indigo-600 py-6"
        >
          <Zap className={`w-5 h-5 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing Capacity...' : 'Run 30-Day Forecast'}
        </Button>

        {forecast && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-indigo-50 rounded border border-indigo-200">
                <p className="text-xs text-indigo-900">Projected Loads</p>
                <p className="text-2xl font-bold text-indigo-600">{forecast.projected_loads}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs text-amber-900">Capacity Gap</p>
                <p className="text-2xl font-bold text-amber-600">{forecast.capacity_gap}%</p>
              </div>
            </div>

            {forecast.recommendations?.length > 0 && (
              <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-500">
                <h4 className="font-semibold text-emerald-900 mb-2">📊 Recommendations</h4>
                <ul className="space-y-1">
                  {forecast.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-emerald-800">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}