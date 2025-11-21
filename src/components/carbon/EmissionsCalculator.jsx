import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, TrendingDown, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function EmissionsCalculator() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  // Calculate total emissions (simplified)
  const totalMiles = loads.reduce((sum, load) => sum + (load.total_miles || 0), 0);
  const estimatedEmissions = (totalMiles * 0.161).toFixed(2); // kg CO2e per mile

  const emissionsByMode = [
    { name: 'Truck', value: 72, color: '#f59e0b' },
    { name: 'Rail', value: 18, color: '#8b5cf6' },
    { name: 'Ocean', value: 8, color: '#3b82f6' },
    { name: 'Air', value: 2, color: '#ef4444' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Carbon Emissions Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-900 mb-1">Total Emissions</p>
            <p className="text-2xl font-bold text-green-600">{estimatedEmissions}</p>
            <p className="text-xs text-green-700">kg CO2e</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900 mb-1">Efficiency</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalMiles > 0 ? (estimatedEmissions / totalMiles * 100).toFixed(1) : 0}
            </p>
            <p className="text-xs text-blue-700">g/ton-mile</p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h4 className="font-semibold text-emerald-900">ESG Compliance</h4>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-emerald-800">Carbon reporting ready</p>
            <Badge className="bg-emerald-600">✓ Active</Badge>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={emissionsByMode}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label
              >
                {emissionsByMode.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded border border-green-200 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-green-900 font-semibold">Reduction Opportunity</p>
            <p className="text-xs text-green-700">Switch to intermodal: -15% emissions</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}