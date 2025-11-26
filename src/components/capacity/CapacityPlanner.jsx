import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart2, TrendingUp, Truck } from "lucide-react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CapacityPlanner() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 200),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list(),
    initialData: [],
  });

  // Generate capacity forecast data
  const forecastData = [
    { week: 'Week 1', demand: 120, capacity: 150 },
    { week: 'Week 2', demand: 145, capacity: 150 },
    { week: 'Week 3', demand: 160, capacity: 150 },
    { week: 'Week 4', demand: 135, capacity: 150 }
  ];

  const utilizationRate = loads.length > 0 ? (loads.length / (carriers.length * 5) * 100).toFixed(1) : 0;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" />
          Capacity Planning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-indigo-50 rounded">
            <p className="text-xs text-indigo-900">Active Carriers</p>
            <p className="text-2xl font-bold text-indigo-600">{carriers.length}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <p className="text-xs text-blue-900">Utilization</p>
            <p className="text-2xl font-bold text-blue-600">{utilizationRate}%</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded">
            <p className="text-xs text-emerald-900">Forecasted</p>
            <p className="text-2xl font-bold text-emerald-600">+12%</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="demand" fill="#6366f1" name="Demand" />
              <Bar dataKey="capacity" fill="#10b981" name="Capacity" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-900">Capacity Alert</h4>
          </div>
          <p className="text-sm text-amber-800">
            Week 3 shows demand exceeding current capacity. Consider onboarding additional carriers.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}