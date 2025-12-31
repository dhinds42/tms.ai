import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdvancedProfitabilityInsights({ loads, carriers }) {
  const laneAnalysis = {};
  
  loads.forEach(load => {
    const lane = `${load.pickup_location?.city || '?'}-${load.dropoff_location?.city || '?'}`;
    if (!laneAnalysis[lane]) {
      laneAnalysis[lane] = { 
        lane, 
        revenue: 0, 
        cost: 0, 
        margin: 0, 
        count: 0 
      };
    }
    laneAnalysis[lane].revenue += load.customer_rate || 0;
    laneAnalysis[lane].cost += load.carrier_pay || 0;
    laneAnalysis[lane].margin += (load.customer_rate || 0) - (load.carrier_pay || 0);
    laneAnalysis[lane].count += 1;
  });
  
  const topLanes = Object.values(laneAnalysis)
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10)
    .map(lane => ({
      name: lane.lane,
      margin: lane.margin,
      margin_percent: lane.revenue > 0 ? ((lane.margin / lane.revenue) * 100).toFixed(1) : 0
    }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Lane Profitability Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topLanes}>
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Bar dataKey="margin" name="Margin">
              {topLanes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.margin > 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-slate-900">Top Recommendations</p>
          {topLanes.slice(0, 3).map((lane, idx) => (
            <div key={idx} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-900">{lane.name}</p>
              <p className="text-xs text-slate-600">
                ${lane.margin.toLocaleString()} margin ({lane.margin_percent}%) - Prioritize capacity here
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}