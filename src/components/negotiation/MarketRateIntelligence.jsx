import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function MarketRateIntelligence({ operatingMode }) {
  const lanes = [
    { lane: "OH → MI", rate: "$550-650", trend: "up", capacity: "tight" },
    { lane: "TX → CA", rate: "$2,200-2,500", trend: "stable", capacity: "balanced" },
    { lane: "FL → NY", rate: "$1,400-1,700", trend: "down", capacity: "loose" },
    { lane: "IL → GA", rate: "$900-1,100", trend: "up", capacity: "tight" }
  ];

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Live Market Rate Intelligence
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Real-time rate data for key lanes
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-4 gap-4">
          {lanes.map((lane, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">{lane.lane}</h4>
              <p className="text-lg font-bold text-blue-600 mb-2">{lane.rate}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {lane.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                  ) : lane.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  ) : (
                    <span className="w-3 h-3">−</span>
                  )}
                  <span className="text-xs text-slate-600 capitalize">{lane.trend}</span>
                </div>
                <Badge className={`text-xs ${
                  lane.capacity === 'tight' ? 'bg-red-100 text-red-700' :
                  lane.capacity === 'balanced' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {lane.capacity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}