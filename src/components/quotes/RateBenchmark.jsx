import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RateBenchmark() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [benchmark, setBenchmark] = useState(null);

  const fetchBenchmark = async () => {
    if (!origin || !destination) return;
    
    setIsLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide current market rate benchmark for freight from ${origin} to ${destination}.
        
Return spot rate per mile, contract rate per mile, and market trend.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            spot_rate_per_mile: { type: "number" },
            contract_rate_per_mile: { type: "number" },
            market_trend: { type: "string" }
          }
        }
      });
      setBenchmark(result);
    } catch (error) {
      console.error('Benchmark fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Rate Benchmark
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Origin (e.g., Chicago, IL)"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <Input
            placeholder="Destination (e.g., Atlanta, GA)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <Button
            onClick={fetchBenchmark}
            disabled={isLoading || !origin || !destination}
            className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check'}
          </Button>
        </div>

        {benchmark && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Spot Rate</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${benchmark.spot_rate_per_mile?.toFixed(2)}/mi
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Contract Rate</p>
              <p className="text-2xl font-bold text-blue-600">
                ${benchmark.contract_rate_per_mile?.toFixed(2)}/mi
              </p>
            </div>
            <div className="col-span-2 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">{benchmark.market_trend}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}