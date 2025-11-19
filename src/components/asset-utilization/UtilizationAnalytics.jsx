import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UtilizationAnalytics() {
  const { data: equipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list('-created_date', 100),
    initialData: [],
  });

  const utilizationData = [
    { type: 'Dry Van', utilization: 87 },
    { type: 'Reefer', utilization: 72 },
    { type: 'Flatbed', utilization: 65 },
    { type: 'Tanker', utilization: 91 }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          Asset Utilization Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-cyan-50 rounded">
            <p className="text-xs text-cyan-900">Avg Utilization</p>
            <p className="text-2xl font-bold text-cyan-600">79%</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded">
            <p className="text-xs text-emerald-900">Active Assets</p>
            <p className="text-2xl font-bold text-emerald-600">{equipment.length}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded">
            <p className="text-xs text-amber-900">Idle Time</p>
            <p className="text-2xl font-bold text-amber-600">21%</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={utilizationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="utilization" fill="#06b6d4" />
          </BarChart>
        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
}