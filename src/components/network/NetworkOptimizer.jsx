import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Network, TrendingUp } from "lucide-react";

export default function NetworkOptimizer() {
  const [optimizing, setOptimizing] = useState(false);
  const [results, setResults] = useState(null);

  const runOptimization = async () => {
    setOptimizing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze transportation network and provide optimization recommendations:
        
1. Identify underutilized lanes
2. Suggest new service points
3. Recommend carrier partnerships
4. Identify consolidation opportunities
5. Calculate potential cost savings

Provide actionable recommendations with estimated impact.`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  action: { type: "string" },
                  impact: { type: "string" },
                  savings_estimate: { type: "number" }
                }
              }
            },
            total_savings: { type: "number" }
          }
        }
      });
      setResults(result);
    } catch (error) {
      alert('Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-600" />
          AI Network Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Button 
          onClick={runOptimization} 
          disabled={optimizing}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-6"
        >
          <Zap className={`w-5 h-5 mr-2 ${optimizing ? 'animate-spin' : ''}`} />
          {optimizing ? 'Analyzing Network...' : 'Run AI Optimization'}
        </Button>

        {results && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-300">
              <p className="text-sm text-emerald-900 font-semibold mb-1">Potential Annual Savings</p>
              <p className="text-3xl font-bold text-emerald-600">
                ${results.total_savings?.toLocaleString() || '0'}
              </p>
            </div>

            {results.recommendations?.map((rec, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-indigo-600">{rec.category}</Badge>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                    ${rec.savings_estimate?.toLocaleString()}
                  </Badge>
                </div>
                <p className="font-semibold text-sm text-slate-900 mb-1">{rec.action}</p>
                <p className="text-xs text-slate-600">{rec.impact}</p>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}