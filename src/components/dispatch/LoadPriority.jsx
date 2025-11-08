import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";

export default function LoadPriority({ prioritizedLoads, loads }) {
  if (!prioritizedLoads || prioritizedLoads.length === 0) return null;

  const getPriorityColor = (rank) => {
    if (rank <= 3) return "bg-red-100 text-red-700 border-red-300";
    if (rank <= 6) return "bg-amber-100 text-amber-700 border-amber-300";
    return "bg-blue-100 text-blue-700 border-blue-300";
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Load Priority Ranking
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Loads ranked by urgency and business impact
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {prioritizedLoads.slice(0, 10).map((item, idx) => {
            const load = loads.find(l => l.id === item.load_id || l.load_number === item.load_id);
            
            return (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${getPriorityColor(item.priority_rank)}`}>
                      #{item.priority_rank}
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900">
                        {load?.load_number || `Load #${item.load_id?.slice(0, 8)}`}
                      </h5>
                      <p className="text-xs text-slate-600">
                        {load?.pickup_location?.city} → {load?.dropoff_location?.city}
                      </p>
                    </div>
                  </div>
                  {item.recommended_assignment && (
                    <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                      {item.recommended_assignment}
                    </Badge>
                  )}
                </div>
                <div className="p-2 bg-white rounded text-sm text-slate-700">
                  <Clock className="w-4 h-4 inline mr-1 text-amber-600" />
                  {item.urgency_reason}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}