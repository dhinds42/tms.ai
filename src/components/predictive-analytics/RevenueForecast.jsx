import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RevenueForecast({ forecast }) {
  if (!forecast || forecast.length === 0) return null;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <CardTitle className="text-xl">Revenue Forecast (Next 6 Months)</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                AI-predicted revenue trends with confidence intervals
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white">
            Avg Growth: {(forecast.reduce((sum, f) => sum + (f.growth_rate || 0), 0) / forecast.length).toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={forecast}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Predicted Revenue']}
            />
            <Area type="monotone" dataKey="predicted_revenue" stroke="#10b981" fillOpacity={1} fill="url(#revenueGradient)" />
          </AreaChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
          {forecast.map((month, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg text-center">
              <p className="text-xs text-slate-600 mb-1">{month.month}</p>
              <p className="font-bold text-emerald-600">${(month.predicted_revenue / 1000).toFixed(0)}K</p>
              <Badge className="mt-1 text-xs bg-blue-100 text-blue-700">
                {month.confidence}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}