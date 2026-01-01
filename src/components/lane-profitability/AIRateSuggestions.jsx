import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, RefreshCw } from "lucide-react";

export default function AIRateSuggestions({ lanePreference, onApplySuggestion }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this freight lane and provide rate suggestions:
        
Lane: ${lanePreference.origin_city}, ${lanePreference.origin_state} → ${lanePreference.destination_city}, ${lanePreference.destination_state}
Equipment: ${lanePreference.equipment_type}
Max Deadhead: ${lanePreference.max_deadhead_miles} miles

Provide:
1. Suggested spot rate per mile (RPM) in cents
2. Suggested contract rate per mile in cents
3. Market trend (tight/balanced/loose)
4. Demand factors affecting pricing
5. Recommended minimum to ensure profitability

Return structured JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            suggested_spot_rpm_cents: { type: 'number' },
            suggested_contract_rpm_cents: { type: 'number' },
            market_trend: { type: 'string' },
            demand_factors: { type: 'array', items: { type: 'string' } },
            min_profitable_rpm_cents: { type: 'number' },
            confidence_level: { type: 'string' },
            reasoning: { type: 'string' }
          }
        }
      });
      
      setSuggestions(result);
    } catch (error) {
      console.error('Rate suggestion failed:', error);
    }
    
    setLoading(false);
  };
  
  useEffect(() => {
    if (lanePreference) {
      generateSuggestions();
    }
  }, [lanePreference?.id]);
  
  if (loading) {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6 text-center">
          <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-slate-600">AI analyzing market rates...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!suggestions) return null;
  
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            AI Rate Suggestions
            <Badge className="bg-purple-600 text-xs">LIVE</Badge>
          </CardTitle>
          <Button onClick={generateSuggestions} size="sm" variant="ghost">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-xs text-slate-600 mb-1">Spot Rate</p>
            <p className="text-xl font-bold text-purple-600">
              ${(suggestions.suggested_spot_rpm_cents / 100).toFixed(2)}/mi
            </p>
            <Button 
              onClick={() => onApplySuggestion('spot', suggestions.suggested_spot_rpm_cents)}
              size="sm" 
              className="w-full mt-2 bg-purple-600"
            >
              Apply
            </Button>
          </div>
          
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-xs text-slate-600 mb-1">Contract Rate</p>
            <p className="text-xl font-bold text-indigo-600">
              ${(suggestions.suggested_contract_rpm_cents / 100).toFixed(2)}/mi
            </p>
            <Button 
              onClick={() => onApplySuggestion('contract', suggestions.suggested_contract_rpm_cents)}
              size="sm" 
              className="w-full mt-2 bg-indigo-600"
            >
              Apply
            </Button>
          </div>
        </div>
        
        <div className="p-3 bg-white rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-900">Market Trend</p>
            <Badge className={
              suggestions.market_trend === 'tight' ? 'bg-red-500' :
              suggestions.market_trend === 'loose' ? 'bg-green-500' : 'bg-slate-500'
            }>
              {suggestions.market_trend}
            </Badge>
          </div>
          <p className="text-xs text-slate-600">{suggestions.reasoning}</p>
        </div>
        
        {suggestions.demand_factors && (
          <div className="p-3 bg-white rounded-lg border border-purple-200">
            <p className="text-xs font-semibold text-slate-900 mb-2">Demand Factors</p>
            <ul className="space-y-1">
              {suggestions.demand_factors.slice(0, 3).map((factor, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                  <TrendingUp className="w-3 h-3 mt-0.5 text-purple-600" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="p-2 bg-amber-50 rounded border border-amber-200">
          <p className="text-xs text-amber-900">
            <strong>Min Profitable:</strong> ${(suggestions.min_profitable_rpm_cents / 100).toFixed(2)}/mi
          </p>
        </div>
      </CardContent>
    </Card>
  );
}