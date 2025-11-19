import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp } from "lucide-react";

export default function ServicePointMap() {
  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  // Extract unique cities
  const cities = {};
  loads.forEach(load => {
    const origin = `${load.origin_city}, ${load.origin_state}`;
    const dest = `${load.destination_city}, ${load.destination_state}`;
    cities[origin] = (cities[origin] || 0) + 1;
    cities[dest] = (cities[dest] || 0) + 1;
  });

  const topCities = Object.entries(cities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Service Point Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-900 font-semibold">Active Service Points</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{Object.keys(cities).length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900">Top 20 Cities by Activity</h4>
          <div className="grid grid-cols-2 gap-2">
            {topCities.map(([city, count], idx) => (
              <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{city}</p>
                  <Badge className="bg-blue-600 text-xs">{count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}