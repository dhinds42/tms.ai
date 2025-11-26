import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart2, TrendingUp, Award, Target } from "lucide-react";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IndustryBenchmarking() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const yourMetrics = {
    onTimeRate: 92,
    avgMargin: 18,
    utilizationRate: 78,
    claimsRate: 2.1
  };

  const industryAvg = {
    onTimeRate: 85,
    avgMargin: 15,
    utilizationRate: 72,
    claimsRate: 3.5
  };

  const comparisonData = [
    { metric: 'On-Time %', yours: 92, industry: 85 },
    { metric: 'Margin %', yours: 18, industry: 15 },
    { metric: 'Utilization', yours: 78, industry: 72 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <BarChart2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Industry Benchmarking
          </h1>
          <p className="text-slate-600 mt-2">Compare your KPIs vs industry standards</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'On-Time Rate', yours: yourMetrics.onTimeRate, avg: industryAvg.onTimeRate, icon: Target },
            { label: 'Avg Margin', yours: yourMetrics.avgMargin, avg: industryAvg.avgMargin, icon: TrendingUp },
            { label: 'Utilization', yours: yourMetrics.utilizationRate, avg: industryAvg.utilizationRate, icon: Award },
            { label: 'Claims Rate', yours: yourMetrics.claimsRate, avg: industryAvg.claimsRate, icon: BarChart2, inverse: true }
          ].map((metric, idx) => {
            const Icon = metric.icon;
            const better = metric.inverse ? metric.yours < metric.avg : metric.yours > metric.avg;
            return (
              <Card key={idx} className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-8 h-8 ${better ? 'text-emerald-600' : 'text-amber-600'} opacity-40`} />
                    {better && <Badge className="bg-emerald-600">Above Avg</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-indigo-600">{metric.yours}%</p>
                    <p className="text-sm text-slate-500">vs {metric.avg}%</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Performance vs Industry Average</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBar data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="yours" fill="#6366f1" name="Your Company" />
                <Bar dataKey="industry" fill="#94a3b8" name="Industry Avg" />
              </RechartsBar>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}