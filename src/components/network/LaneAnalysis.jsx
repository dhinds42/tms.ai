import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, DollarSign, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LaneAnalysis() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 200),
    initialData: [],
  });

  // Aggregate lane data
  const laneStats = {};
  loads.forEach(load => {
    if (load.origin_city && load.destination_city) {
      const laneKey = `${load.origin_city}, ${load.origin_state} → ${load.destination_city}, ${load.destination_state}`;
      if (!laneStats[laneKey]) {
        laneStats[laneKey] = { lane: laneKey, volume: 0, revenue: 0, avgRate: 0 };
      }
      laneStats[laneKey].volume++;
      laneStats[laneKey].revenue += load.customer_rate || 0;
    }
  });

  const topLanes = Object.values(laneStats)
    .map(lane => ({
      ...lane,
      avgRate: lane.revenue / lane.volume
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 10);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          Top Performing Lanes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topLanes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lane" angle={-45} textAnchor="end" height={100} fontSize={10} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="volume" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>

        <div className="space-y-2">
          {topLanes.map((lane, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-slate-900">{lane.lane}</p>
                <Badge className="bg-indigo-600">{lane.volume} loads</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-600" />
                  <span className="text-slate-600">Avg Rate: ${lane.avgRate.toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3 text-blue-600" />
                  <span className="text-slate-600">Revenue: ${lane.revenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}