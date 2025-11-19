import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, Zap, TrendingUp } from "lucide-react";

export default function NetworkOptimizer() {
  const [optimizing, setOptimizing] = useState(false);
  const [results, setResults] = useState(null);

  const optimizeNetwork = async () => {
    setOptimizing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze transportation network and provide optimization recommendations:

Current Network Status:
- 247 active lanes
- 87.4% network efficiency
- 142 service points
- Average utilization: 78%

Analyze and recommend:
1. Lane consolidation opportunities
2. Service point optimization (add/remove locations)
3. Backhaul matching improvements
4. Asset utilization strategies
5. Cost reduction opportunities

Provide specific, actionable recommendations with estimated impact.`,
        response_json_schema: {
          type: "object",
          properties: {
            consolidation_opportunities: { type: "array", items: { type: "string" } },
            service_point_changes: { type: "array", items: { type: "string" } },
            backhaul_improvements: { type: "array", items: { type: "string" } },
            cost_savings_estimate: { type: "number" },
            efficiency_gain_estimate: { type: "number" },
            implementation_priority: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResults(result);

    } catch (error) {
      alert('Network optimization failed: ' + error.message);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-600" />
          AI Network Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-900">
            <strong>AI-powered optimization:</strong><br/>
            Analyze your entire network to identify consolidation opportunities, optimize routes, and maximize asset utilization
          </p>
        </div>

        <Button 
          onClick={optimizeNetwork}
          disabled={optimizing}
          className="w-full bg-purple-600 py-6"
        >
          <Zap className={`w-5 h-5 mr-2 ${optimizing ? 'animate-spin' : ''}`} />
          {optimizing ? 'Optimizing Network...' : 'Run Network Optimization'}
        </Button>

        {results && (
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
                <p className="text-sm text-emerald-900 font-semibold">Est. Cost Savings</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ${results.cost_savings_estimate?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-900 font-semibold">Efficiency Gain</p>
                <p className="text-3xl font-bold text-blue-600">
                  +{results.efficiency_gain_estimate || 0}%
                </p>
              </div>
            </div>

            {results.consolidation_opportunities?.length > 0 && (
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-900 mb-2">🔗 Consolidation Opportunities</h4>
                <ul className="space-y-1">
                  {results.consolidation_opportunities.map((opp, idx) => (
                    <li key={idx} className="text-sm text-indigo-800">• {opp}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.backhaul_improvements?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2">🔄 Backhaul Improvements</h4>
                <ul className="space-y-1">
                  {results.backhaul_improvements.map((imp, idx) => (
                    <li key={idx} className="text-sm text-amber-800">• {imp}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.implementation_priority?.length > 0 && (
              <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-500">
                <h4 className="font-semibold text-emerald-900 mb-2">✅ Implementation Priority</h4>
                <ol className="space-y-1">
                  {results.implementation_priority.map((item, idx) => (
                    <li key={idx} className="text-sm text-emerald-800 font-semibold">
                      {idx + 1}. {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}

          </div>
        )}

      </CardContent>
    </Card>
  );
}