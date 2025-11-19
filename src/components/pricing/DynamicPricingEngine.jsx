import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Zap } from "lucide-react";

export default function DynamicPricingEngine() {
  const [calculating, setCalculating] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [lane, setLane] = useState({ origin: 'Chicago, IL', destination: 'Dallas, TX', miles: 950 });

  const calculateDynamicPrice = async () => {
    setCalculating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Calculate dynamic pricing for lane: ${lane.origin} to ${lane.destination} (${lane.miles} miles)

Consider these factors:
- Base rate: $2.20/mile
- Current market conditions: tight capacity
- Seasonal demand: Q4 peak season
- Historical lane performance
- Competitive pricing
- Fuel surcharge

Provide optimized pricing strategy with min/max range.`,
        response_json_schema: {
          type: "object",
          properties: {
            base_rate: { type: "number" },
            dynamic_rate: { type: "number" },
            market_adjustment: { type: "number" },
            recommended_min: { type: "number" },
            recommended_max: { type: "number" },
            confidence_score: { type: "number" }
          }
        }
      });

      setPricing(result);
    } catch (error) {
      alert('Pricing calculation failed: ' + error.message);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          AI Dynamic Pricing Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <Input 
            placeholder="Origin"
            value={lane.origin}
            onChange={(e) => setLane({...lane, origin: e.target.value})}
          />
          <Input 
            placeholder="Destination"
            value={lane.destination}
            onChange={(e) => setLane({...lane, destination: e.target.value})}
          />
          <Input 
            type="number"
            placeholder="Miles"
            value={lane.miles}
            onChange={(e) => setLane({...lane, miles: parseInt(e.target.value)})}
          />
        </div>

        <Button 
          onClick={calculateDynamicPrice}
          disabled={calculating}
          className="w-full bg-yellow-600 py-6"
        >
          <Zap className={`w-5 h-5 mr-2 ${calculating ? 'animate-spin' : ''}`} />
          {calculating ? 'Calculating...' : 'Calculate Dynamic Price'}
        </Button>

        {pricing && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-900">Base Rate</p>
                <p className="text-xl font-bold text-blue-600">${pricing.base_rate}/mi</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs text-yellow-900">Dynamic Rate</p>
                <p className="text-xl font-bold text-yellow-600">${pricing.dynamic_rate}/mi</p>
              </div>
            </div>
            
            <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-500">
              <p className="text-sm text-emerald-900 font-semibold mb-2">Recommended Range</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${pricing.recommended_min?.toLocaleString()} - ${pricing.recommended_max?.toLocaleString()}
              </p>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}