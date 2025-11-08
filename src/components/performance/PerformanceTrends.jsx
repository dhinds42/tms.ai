import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

export default function PerformanceTrends({ drivers, loads }) {
  // Simulate monthly performance data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const trendData = months.map((month, idx) => {
    const baseOnTime = 92 + Math.random() * 5;
    const baseLoads = 45 + Math.random() * 10;
    
    return {
      month,
      onTimePercentage: baseOnTime + (idx * 0.5),
      completedLoads: Math.floor(baseLoads + (idx * 2))
    };
  });

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Performance Trends
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Fleet performance over the last 6 months
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="onTimePercentage" 
              stroke="#10b981" 
              strokeWidth={3}
              name="On-Time %"
              dot={{ fill: '#10b981', r: 5 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="completedLoads" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Completed Loads"
              dot={{ fill: '#3b82f6', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}