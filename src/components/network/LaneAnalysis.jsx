import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, MapPin, DollarSign } from "lucide-react";

export default function LaneAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
  });

  const analyzeLanes = async () => {
    setAnalyzing(true);
    try {
      // Group loads by lane
      const laneMap = {};
      loads.forEach(load => {
        const lane = `${load.origin_city}, ${load.origin_state} → ${load.destination_city}, ${load.destination_state}`;
        if (!laneMap[lane]) {
          laneMap[lane] = { count: 0, totalRevenue: 0, totalMiles: 0 };
        }
        laneMap[lane].count++;
        laneMap[lane].totalRevenue += load.customer_rate || 0;
        laneMap[lane].totalMiles += load.miles || 0;
      });

      const topLanes = Object.entries(laneMap)
        .map(([lane, data]) => ({
          lane,
          volume: data.count,
          revenue: data.totalRevenue,
          avgRate: data.totalRevenue / data.count,
          avgMiles: data.totalMiles / data.count
        }))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 10);

      setInsights({
        topLanes,
        totalLanes: Object.keys(laneMap).length,
        totalVolume: loads.length
      });

    } catch (error) {
      alert('Lane analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          Lane Volume Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Button 
          onClick={analyzeLanes}
          disabled={analyzing || loads.length === 0}
          className="w-full bg-indigo-600 py-6"
        >
          <TrendingUp className={`w-5 h-5 mr-2 ${analyzing ? 'animate-pulse' : ''}`} />
          {analyzing ? 'Analyzing Lanes...' : 'Analyze Lane Performance'}
        </Button>

        {insights && (
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded border border-indigo-200">
                <p className="text-sm text-indigo-900 font-semibold">Total Lanes</p>
                <p className="text-3xl font-bold text-indigo-600">{insights.totalLanes}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
                <p className="text-sm text-emerald-900 font-semibold">Total Volume</p>
                <p className="text-3xl font-bold text-emerald-600">{insights.totalVolume}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Top 10 Lanes by Volume</h4>
              {insights.topLanes.map((lane, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{lane.lane}</p>
                    <Badge className="bg-indigo-600">{lane.volume} loads</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                    <p>Revenue: ${lane.revenue.toLocaleString()}</p>
                    <p>Avg Rate: ${lane.avgRate.toFixed(0)}</p>
                    <p>Avg Miles: {lane.avgMiles.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </CardContent>
    </Card>
  );
}