import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, RefreshCw } from "lucide-react";

export default function AutomatedMarketRateEngine({ origin, destination, equipmentType, distance }) {
  const [rateData, setRateData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      
      try {
        // Call LLM with market rate context
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Current freight market rate for ${equipmentType} from ${origin} to ${destination}, ${distance} miles. Provide spot rate and contract rate.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              spot_rpm: { type: 'number' },
              contract_rpm: { type: 'number' },
              market_trend: { type: 'string' },
              confidence: { type: 'string' }
            }
          }
        });
        
        setRateData(result);
      } catch (error) {
        console.error('Rate fetch failed:', error);
      }
      
      setLoading(false);
    };
    
    if (origin && destination && distance) {
      fetchRate();
    }
  }, [origin, destination, equipmentType, distance]);
  
  if (loading) {
    return (
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-6 text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 mx-auto mb-2 animate-spin" />
          <p className="text-sm text-slate-600">Analyzing market rates...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!rateData) return null;
  
  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          AI Market Rate
          <Badge className="ml-auto bg-indigo-600 text-xs">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-slate-600">Spot Rate</p>
            <p className="text-xl font-bold text-indigo-600">${rateData.spot_rpm?.toFixed(2)}/mi</p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-xs text-slate-600">Contract Rate</p>
            <p className="text-xl font-bold text-purple-600">${rateData.contract_rpm?.toFixed(2)}/mi</p>
          </div>
        </div>
        
        <div className="p-3 bg-white rounded-lg border border-indigo-200">
          <p className="text-xs font-semibold text-indigo-900 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Market Trend: {rateData.market_trend}
          </p>
          <p className="text-xs text-slate-600 mt-1">Confidence: {rateData.confidence}</p>
        </div>
      </CardContent>
    </Card>
  );
}