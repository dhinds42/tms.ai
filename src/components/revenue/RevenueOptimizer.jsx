import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Zap } from "lucide-react";

export default function RevenueOptimizer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);

  const runRevenueAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze revenue optimization opportunities:

Current Metrics:
- Average margin: 18%
- Revenue per load: $2,450
- Top performing lanes: 12
- Underperforming lanes: 8

Provide revenue optimization strategies:
1. High-margin opportunities
2. Pricing adjustments
3. Lane optimization
4. Cost reduction areas`,
        response_json_schema: {
          type: "object",
          properties: {
            high_margin_lanes: { type: "array", items: { type: "string" } },
            pricing_recommendations: { type: "array", items: { type: "string" } },
            cost_savings: { type: "array", items: { type: "string" } },
            estimated_revenue_increase: { type: "number" }
          }
        }
      });

      setInsights(result);
    } catch (error) {
      alert('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          AI Revenue Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Button 
          onClick={runRevenueAnalysis}
          disabled={analyzing}
          className="w-full bg-emerald-600 py-6"
        >
          <Zap className={`w-5 h-5 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing Revenue...' : 'Run Revenue Analysis'}
        </Button>

        {insights && (
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-500">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-emerald-900">Estimated Revenue Increase</h4>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                +{insights.estimated_revenue_increase}%
              </p>
            </div>

            {insights.pricing_recommendations?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Pricing Recommendations</h4>
                <ul className="space-y-1">
                  {insights.pricing_recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-blue-800">• {rec}</li>
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