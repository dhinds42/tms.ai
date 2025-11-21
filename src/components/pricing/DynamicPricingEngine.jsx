import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Zap } from "lucide-react";

export default function DynamicPricingEngine() {
  const [calculating, setCalculating] = useState(false);
  const [priceResult, setPriceResult] = useState(null);

  const calculateDynamicPrice = () => {
    setCalculating(true);
    setTimeout(() => {
      // Simulate AI calculation
      const baseRate = 1200 + Math.random() * 400;
      const demandMultiplier = 0.9 + Math.random() * 0.3;
      const finalPrice = baseRate * demandMultiplier;
      
      setPriceResult({
        baseRate: baseRate.toFixed(2),
        demandFactor: demandMultiplier.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        recommendation: demandMultiplier > 1.1 ? 'High demand - premium pricing' : 
                       demandMultiplier < 0.95 ? 'Low demand - competitive pricing' :
                       'Normal market conditions'
      });
      setCalculating(false);
    }, 1500);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-600" />
          Dynamic Pricing Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-yellow-900">AI-Powered Pricing</h4>
          </div>
          <p className="text-sm text-yellow-800">
            Real-time rate optimization based on market demand, capacity, and historical data
          </p>
        </div>

        <Button 
          onClick={calculateDynamicPrice}
          disabled={calculating}
          className="w-full bg-yellow-600"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          {calculating ? 'Calculating...' : 'Calculate Optimal Price'}
        </Button>

        {priceResult && (
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-300">
            <h4 className="font-bold text-emerald-900 mb-3">Pricing Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Base Rate:</span>
                <span className="font-bold text-slate-900">${priceResult.baseRate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Demand Factor:</span>
                <Badge className={
                  priceResult.demandFactor > 1.1 ? 'bg-red-600' :
                  priceResult.demandFactor < 0.95 ? 'bg-blue-600' :
                  'bg-emerald-600'
                }>
                  {priceResult.demandFactor}x
                </Badge>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex justify-between">
                <span className="font-bold text-emerald-900">Recommended Price:</span>
                <span className="text-2xl font-bold text-emerald-600">${priceResult.finalPrice}</span>
              </div>
            </div>
            <div className="mt-3 p-2 bg-emerald-100 rounded text-xs text-emerald-900">
              💡 {priceResult.recommendation}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}