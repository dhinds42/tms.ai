import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Navigation, CheckCircle, Clock } from "lucide-react";

export default function BackhaulMatches({ matches }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">AI-Optimized Backhaul Matches</h2>
      
      {matches.map((match, index) => (
        <Card key={index} className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  Driver completed delivery at: {match.completed_load.dropoff_location?.city}, {match.completed_load.dropoff_location?.state}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {match.backhaul_matches.length} backhaul opportunities found
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {match.backhaul_matches.map((backhaul, bIndex) => {
                if (!backhaul.load) return null;
                
                return (
                  <div key={bIndex} className={`p-5 rounded-xl border-2 ${
                    bIndex === 0 ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {bIndex === 0 && <span className="text-2xl">🏆</span>}
                          <h4 className="font-bold text-slate-900">
                            {backhaul.load.load_number || `Load #${backhaul.load.id.slice(0, 8)}`}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span>{backhaul.load.pickup_location?.city}, {backhaul.load.pickup_location?.state}</span>
                          <span>→</span>
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span>{backhaul.load.dropoff_location?.city}, {backhaul.load.dropoff_location?.state}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${bIndex === 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {backhaul.match_score}
                        </div>
                        <p className="text-xs text-slate-600">Match Score</p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <Navigation className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Deadhead</p>
                        <p className="text-lg font-bold text-amber-600">{backhaul.deadhead_miles} mi</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <MapPin className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Loaded</p>
                        <p className="text-lg font-bold text-blue-600">{backhaul.loaded_miles} mi</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <DollarSign className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Est. Profit</p>
                        <p className="text-lg font-bold text-emerald-600">${backhaul.estimated_profit}</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <Clock className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                        <p className="text-xs text-slate-600">Time to PU</p>
                        <p className="text-lg font-bold text-indigo-600">{backhaul.time_to_pickup_hours}h</p>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Why This Backhaul
                      </h5>
                      <ul className="space-y-1">
                        {backhaul.match_reasons?.map((reason, rIdx) => (
                          <li key={rIdx} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-emerald-600">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Load Details */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 mb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-600">Rate:</span>
                          <span className="ml-2 font-semibold text-emerald-600">
                            ${backhaul.load.customer_rate?.toLocaleString() || 'TBD'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Equipment:</span>
                          <span className="ml-2 font-medium text-slate-900 capitalize">
                            {backhaul.load.equipment_type?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className={`w-full ${
                        bIndex === 0 
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600'
                      } text-white`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Book This Backhaul
                    </Button>

                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}