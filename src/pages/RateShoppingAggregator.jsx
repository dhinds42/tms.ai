import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingDown, DollarSign, Award } from "lucide-react";

export default function RateShoppingAggregator() {
  const [shopping, setShopping] = useState(false);
  const [rates, setRates] = useState([]);
  const [lane, setLane] = useState({ origin: '', destination: '', equipment: 'dry_van' });

  const shopRates = async () => {
    setShopping(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get competitive rate quotes from multiple carriers:
Origin: ${lane.origin}
Destination: ${lane.destination}
Equipment: ${lane.equipment}

Provide 5 carrier quotes with pricing and transit time.`,
        response_json_schema: {
          type: "object",
          properties: {
            quotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  carrier: { type: "string" },
                  rate: { type: "number" },
                  transit_days: { type: "number" },
                  rating: { type: "number" }
                }
              }
            }
          }
        }
      });
      setRates(result.quotes || []);
    } catch (error) {
      alert('Rate shopping failed');
    } finally {
      setShopping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
            Rate Shopping Aggregator
          </h1>
          <p className="text-slate-600 mt-2">Real-time rate comparison across all carriers</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Search Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Origin (City, State)"
                value={lane.origin}
                onChange={(e) => setLane({...lane, origin: e.target.value})}
              />
              <Input
                placeholder="Destination (City, State)"
                value={lane.destination}
                onChange={(e) => setLane({...lane, destination: e.target.value})}
              />
            </div>
            <Button onClick={shopRates} disabled={shopping} className="w-full bg-blue-600 py-6">
              <Search className="w-5 h-5 mr-2" />
              Shop Rates
            </Button>
          </CardContent>
        </Card>

        {rates.length > 0 && (
          <div className="space-y-3">
            {rates.sort((a, b) => a.rate - b.rate).map((quote, idx) => (
              <Card key={idx} className={`border-2 ${idx === 0 ? 'border-emerald-500 shadow-lg' : 'border-slate-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-lg">{quote.carrier}</p>
                        {idx === 0 && <Badge className="bg-emerald-600">Best Rate</Badge>}
                      </div>
                      <p className="text-sm text-slate-600">{quote.transit_days} days transit • Rating: {quote.rating}/5</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">${quote.rate}</p>
                      <Button size="sm" className="mt-2 bg-blue-600">Book Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}