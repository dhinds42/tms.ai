import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";

export default function LoadPriority({ prioritizedLoads, loads }) {
  if (!prioritizedLoads || prioritizedLoads.length === 0) return null;

  const getPriorityColor = (rank) => {
    if (rank <= 3) return 'bg-red-600 text-white';
    if (rank <= 7) return 'bg-amber-600 text-white';
    return 'bg-blue-600 text-white';
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Load Priority Ranking
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Loads ranked by urgency, customer importance, and time criticality
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {prioritizedLoads.slice(0, 10).map((priorityLoad) => {
            const load = loads.find(l => l.id === priorityLoad.load_id || l.load_number === priorityLoad.load_id);
            
            return (
              <div key={priorityLoad.load_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Badge className={getPriorityColor(priorityLoad.priority_rank)}>
                      #{priorityLoad.priority_rank}
                    </Badge>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {load?.load_number || `Load #${priorityLoad.load_id?.slice(0, 8)}`}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {load?.pickup_location?.city} → {load?.dropoff_location?.city}
                      </p>
                    </div>
                  </div>
                  {load?.priority && (
                    <Badge className={
                      load.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      load.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {load.priority}
                    </Badge>
                  )}
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Urgency Reason: </span>
                      {priorityLoad.urgency_reason}
                    </p>
                  </div>
                </div>

                {load && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-slate-600">Rate</p>
                      <p className="font-semibold text-slate-900 text-sm">
                        ${load.customer_rate?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-slate-600">Distance</p>
                      <p className="font-semibold text-slate-900 text-sm">
                        {load.distance_miles || '?'} mi
                      </p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-xs text-slate-600">Pickup</p>
                      <p className="font-semibold text-slate-900 text-sm">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>
                )}

                {priorityLoad.recommended_assignment && (
                  <div className="mt-3 p-2 bg-emerald-50 rounded border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-900">
                      Recommended: {priorityLoad.recommended_assignment}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}