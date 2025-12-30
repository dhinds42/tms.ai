import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export default function DynamicInsightsEngine({ loads, carriers, drivers }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateInsights = async () => {
      if (!loads || loads.length < 5) return;

      setLoading(true);
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze logistics data and provide 5 unique, actionable insights:

OPERATIONAL DATA:
- Total loads: ${loads.length}
- Active loads: ${loads.filter(l => ['dispatched', 'in_transit'].includes(l.status)).length}
- Avg revenue per load: $${(loads.reduce((sum, l) => sum + (l.customer_rate || 0), 0) / loads.length).toFixed(0)}
- Carriers: ${carriers?.length || 0}
- Drivers: ${drivers?.length || 0}

Provide insights on:
1. Underutilized assets or capacity
2. Cost reduction opportunities
3. Revenue optimization strategies
4. Operational efficiency improvements
5. Risk mitigation priorities

Make each insight:
- Specific with numbers/percentages
- Immediately actionable
- Not generic/obvious
- Based on actual data patterns`,
          response_json_schema: {
            type: "object",
            properties: {
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string", enum: ["cost", "revenue", "efficiency", "risk", "growth"] },
                    priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
                    estimated_impact: { type: "string" }
                  }
                }
              }
            }
          }
        });

        setInsights(result.insights || []);
      } catch (error) {
        console.error('Insights generation error:', error);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
    const interval = setInterval(generateInsights, 60 * 60 * 1000); // Hourly
    return () => clearInterval(interval);
  }, [loads, carriers, drivers]);

  if (loading) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-slate-600">Generating fresh insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) return null;

  const categoryColors = {
    cost: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900", icon: "💰" },
    revenue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900", icon: "📈" },
    efficiency: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-900", icon: "⚡" },
    risk: { bg: "bg-red-50", border: "border-red-200", text: "text-red-900", icon: "⚠️" },
    growth: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-900", icon: "🚀" }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="w-5 h-5 text-indigo-600" />
          AI-Generated Insights
          <Badge className="ml-auto bg-indigo-600 text-xs">Live Analysis</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, i) => {
          const colors = categoryColors[insight.category] || categoryColors.efficiency;
          return (
            <div key={i} className={`p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span>{colors.icon}</span>
                  <p className={`text-xs font-semibold ${colors.text}`}>{insight.title}</p>
                </div>
                <Badge className={
                  insight.priority === 'critical' ? 'bg-red-600' :
                  insight.priority === 'high' ? 'bg-orange-600' :
                  insight.priority === 'medium' ? 'bg-amber-600' : 'bg-slate-600'
                }>
                  {insight.priority}
                </Badge>
              </div>
              <p className="text-xs text-slate-700 mb-2">{insight.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 italic">Impact: {insight.estimated_impact}</span>
                <span className="text-xs font-medium text-indigo-600 capitalize">{insight.category}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}