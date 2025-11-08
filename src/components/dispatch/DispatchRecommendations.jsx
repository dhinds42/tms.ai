import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, TrendingUp, MapPin } from "lucide-react";

export default function DispatchRecommendations({ matches, loads, resources, mode }) {
  if (!matches || matches.length === 0) return null;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Recommended {mode === 'carrier' ? 'Driver' : 'Carrier'} Assignments
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          AI-optimized matches based on proximity, performance, and efficiency
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {matches.slice(0, 10).map((match, idx) => {
            const load = loads.find(l => l.id === match.load_id || l.load_number === match.load_id);
            const resource = resources.find(r => r.id === match.resource_id || r.full_name === match.resource_name || r.company_name === match.resource_name);

            return (
              <div key={idx} className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge className="bg-emerald-600 text-white mb-2">Match #{idx + 1}</Badge>
                    <h4 className="font-bold text-slate-900 text-lg">
                      {load?.load_number || `Load #${match.load_id?.slice(0, 8)}`}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {load?.pickup_location?.city} → {load?.dropoff_location?.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">{match.match_score}</div>
                    <p className="text-xs text-slate-600">Match Score</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">
                      {mode === 'carrier' ? 'Driver' : 'Carrier'}: {match.resource_name}
                    </span>
                    {resource && (
                      <Badge className="bg-blue-100 text-blue-700">
                        Rating: {resource.rating || 0}/5
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>Deadhead: {match.deadhead_miles} mi</span>
                    </div>
                    {resource?.on_time_percentage && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span>On-Time: {resource.on_time_percentage}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Why this match: </span>
                    {match.reasoning}
                  </p>
                </div>

                <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Assign {match.resource_name}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}