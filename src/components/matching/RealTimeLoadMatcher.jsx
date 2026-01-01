import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Loader2, TrendingUp, Award, MapPin, DollarSign } from "lucide-react";

export default function RealTimeLoadMatcher({ refreshInterval = 30000 }) {
  const [matches, setMatches] = useState([]);
  const [matching, setMatching] = useState(false);

  const { data: loads } = useQuery({
    queryKey: ['availableLoads'],
    queryFn: () => base44.entities.Load.filter({ status: 'available' }),
    initialData: [],
    refetchInterval: refreshInterval
  });

  const { data: drivers } = useQuery({
    queryKey: ['availableDrivers'],
    queryFn: () => base44.entities.Driver.filter({ 
      status: { $in: ['available', 'active'] }
    }),
    initialData: [],
    refetchInterval: refreshInterval
  });

  const runAIMatching = async () => {
    setMatching(true);
    try {
      const matchPromises = loads.slice(0, 10).map(async (load) => {
        const loadInfo = {
          id: load.id,
          pickup: `${load.pickup_city}, ${load.pickup_state}`,
          delivery: `${load.delivery_city}, ${load.delivery_state}`,
          miles: load.estimated_miles || 500,
          rate: load.carrier_rate_cents ? load.carrier_rate_cents / 100 : 1000
        };

        const driverInfo = drivers.map(d => ({
          id: d.id,
          name: `${d.first_name} ${d.last_name}`,
          location: d.current_location ? `${d.current_location.city}, ${d.current_location.state}` : 'Unknown',
          hos_remaining: d.hos_remaining || 11,
          score: d.performance_score || 75,
          equipment: d.equipment_type || 'dry_van'
        }));

        const aiMatch = await base44.integrations.Core.InvokeLLM({
          prompt: `Match this load to the best available driver using multi-factor optimization:

Load: ${JSON.stringify(loadInfo)}

Available Drivers: ${JSON.stringify(driverInfo.slice(0, 5))}

Consider:
1. Distance from pickup (minimize deadhead)
2. HOS availability (need enough hours)
3. Performance score (prefer high performers)
4. Equipment match
5. Route efficiency

Return top 3 driver matches with scores.`,
          response_json_schema: {
            type: "object",
            properties: {
              top_matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    driver_id: { type: "string" },
                    match_score: { type: "number" },
                    deadhead_miles: { type: "number" },
                    reasons: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          }
        });

        return {
          load,
          matches: aiMatch.top_matches || []
        };
      });

      const results = await Promise.all(matchPromises);
      setMatches(results.filter(r => r.matches.length > 0));
    } catch (error) {
      console.error('Matching error:', error);
    } finally {
      setMatching(false);
    }
  };

  useEffect(() => {
    if (loads.length > 0 && drivers.length > 0) {
      runAIMatching();
    }
  }, [loads.length, drivers.length]);

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-600" />
          Real-Time AI Matching
          <Badge className="ml-auto bg-green-600">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <div>
            <p className="text-sm text-slate-600">Active Matches</p>
            <p className="text-2xl font-bold text-green-600">{matches.length}</p>
          </div>
          <Button
            size="sm"
            onClick={runAIMatching}
            disabled={matching}
            className="bg-green-600"
          >
            {matching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Matching...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Re-Match
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {matches.map((match, idx) => (
            <Card key={idx} className="border border-slate-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Load #{match.load.load_number || match.load.id.slice(0, 8)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <MapPin className="w-3 h-3" />
                      {match.load.pickup_city} → {match.load.delivery_city}
                    </div>
                  </div>
                  <Badge className="bg-blue-600">
                    {match.matches.length} matches
                  </Badge>
                </div>

                <div className="space-y-2">
                  {match.matches.slice(0, 2).map((m, i) => {
                    const driver = drivers.find(d => d.id === m.driver_id);
                    if (!driver) return null;
                    
                    return (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-slate-900">
                            {driver.first_name} {driver.last_name}
                          </p>
                          <Badge className="bg-green-500">
                            {Math.round(m.match_score)}% match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span>DH: {m.deadhead_miles}mi</span>
                          <span>Score: {driver.performance_score}</span>
                          <span>HOS: {driver.hos_remaining}h</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {m.reasons?.slice(0, 2).map((reason, ri) => (
                            <Badge key={ri} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {matches.length === 0 && !matching && (
            <div className="text-center py-8 text-slate-400">
              <Zap className="w-12 h-12 mx-auto mb-2" />
              <p>No matches available. Run matching to see results.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}