import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, DollarSign, Clock, Shield, Award, Target } from "lucide-react";

export default function SmartCarrierMatcher({ load, carriers, onSelectCarriers }) {
  const [matchResults, setMatchResults] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeCarriers = () => {
    setAnalyzing(true);
    
    // Calculate match scores for each carrier
    const scored = carriers.map(carrier => {
      // Location match (0-30 points)
      const locationScore = calculateLocationScore(carrier, load);
      
      // Performance score (0-25 points)
      const performanceScore = (carrier.on_time_percentage || 0) * 0.25;
      
      // Safety score (0-20 points)
      const safetyScore = getSafetyScore(carrier.fmcsa_safety_rating) * 20;
      
      // Rate competitiveness (0-15 points)
      const rateScore = 15; // Simplified
      
      // Relationship score (0-10 points)
      const relationshipScore = Math.min((carrier.total_loads || 0) / 10, 1) * 10;
      
      const totalScore = locationScore + performanceScore + safetyScore + rateScore + relationshipScore;
      
      return {
        carrier,
        totalScore,
        breakdown: {
          location: locationScore,
          performance: performanceScore,
          safety: safetyScore,
          rate: rateScore,
          relationship: relationshipScore
        },
        recommendation: totalScore >= 80 ? 'highly_recommended' : totalScore >= 60 ? 'recommended' : 'consider'
      };
    });

    // Sort by score
    scored.sort((a, b) => b.totalScore - a.totalScore);
    
    setMatchResults(scored.slice(0, 10));
    setAnalyzing(false);
  };

  const calculateLocationScore = (carrier, load) => {
    // Simplified location scoring
    if (!carrier.service_areas || !load.pickup_location) return 15;
    
    const pickupState = load.pickup_location.state;
    const deliveryState = load.dropoff_location?.state;
    
    if (carrier.service_areas.includes(pickupState) && carrier.service_areas.includes(deliveryState)) {
      return 30;
    } else if (carrier.service_areas.includes(pickupState) || carrier.service_areas.includes(deliveryState)) {
      return 20;
    }
    return 10;
  };

  const getSafetyScore = (rating) => {
    if (!rating) return 0.5;
    const scores = {
      'satisfactory': 1,
      'conditional': 0.6,
      'unsatisfactory': 0.2
    };
    return scores[rating.toLowerCase()] || 0.5;
  };

  const getRecommendationConfig = (rec) => {
    const configs = {
      'highly_recommended': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Highly Recommended' },
      'recommended': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Recommended' },
      'consider': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Consider' }
    };
    return configs[rec] || configs.consider;
  };

  return (
    <Card className="border-2 border-purple-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Smart Carrier Matching
        </CardTitle>
        <p className="text-sm text-slate-600">AI-powered carrier selection based on performance, location, and rates</p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        
        {matchResults.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">Analyze carriers to find the best matches for this load</p>
            <Button 
              onClick={analyzeCarriers}
              disabled={analyzing || !load}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {analyzing ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Best Carriers
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-slate-700">
                Top {matchResults.length} Matches
              </p>
              <Button 
                onClick={() => onSelectCarriers(matchResults.slice(0, 5).map(r => r.carrier.id))}
                size="sm"
                className="bg-purple-600"
              >
                Tender to Top 5
              </Button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {matchResults.map((result, idx) => {
                const config = getRecommendationConfig(result.recommendation);
                return (
                  <Card key={result.carrier.id} className="border border-slate-200 hover:border-purple-300 transition-all">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-slate-700 text-white px-2 py-1">#{idx + 1}</Badge>
                          <div>
                            <p className="font-semibold text-slate-900">{result.carrier.company_name}</p>
                            <p className="text-xs text-slate-500">MC {result.carrier.mc_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">{result.totalScore.toFixed(0)}</p>
                          <p className="text-xs text-slate-500">Match Score</p>
                        </div>
                      </div>

                      <Badge className={`${config.bg} ${config.text} mb-3`}>
                        {config.label}
                      </Badge>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Target className="w-3 h-3" />
                            Location Match
                          </span>
                          <span className="font-semibold">{result.breakdown.location.toFixed(0)}/30</span>
                        </div>
                        <Progress value={(result.breakdown.location / 30) * 100} className="h-1" />

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-600">
                            <TrendingUp className="w-3 h-3" />
                            Performance
                          </span>
                          <span className="font-semibold">{result.breakdown.performance.toFixed(0)}/25</span>
                        </div>
                        <Progress value={(result.breakdown.performance / 25) * 100} className="h-1" />

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Shield className="w-3 h-3" />
                            Safety
                          </span>
                          <span className="font-semibold">{result.breakdown.safety.toFixed(0)}/20</span>
                        </div>
                        <Progress value={(result.breakdown.safety / 20) * 100} className="h-1" />

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Award className="w-3 h-3" />
                            Relationship
                          </span>
                          <span className="font-semibold">{result.breakdown.relationship.toFixed(0)}/10</span>
                        </div>
                        <Progress value={(result.breakdown.relationship / 10) * 100} className="h-1" />
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {result.carrier.on_time_percentage || 0}% OT
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {result.carrier.total_loads || 0} loads
                          </span>
                        </div>
                        <Button 
                          onClick={() => onSelectCarriers([result.carrier.id])}
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs"
                        >
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}