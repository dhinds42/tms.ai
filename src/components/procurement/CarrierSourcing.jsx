import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Zap } from "lucide-react";

export default function CarrierSourcing() {
  const [searching, setSearching] = useState(false);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    equipment: 'dry_van'
  });
  const [results, setResults] = useState(null);

  const findCarriers = async () => {
    setSearching(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Find available carriers for lane:
Origin: ${searchParams.origin}
Destination: ${searchParams.destination}
Equipment: ${searchParams.equipment}

Provide carrier recommendations with:
- Authority check
- Equipment availability
- Rate estimate
- Service history`,
        response_json_schema: {
          type: "object",
          properties: {
            carriers_found: { type: "number" },
            recommended_carriers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  rate_estimate: { type: "number" },
                  available_trucks: { type: "number" }
                }
              }
            }
          }
        }
      });

      setResults(result);
    } catch (error) {
      alert('Search failed: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-600" />
          AI Carrier Sourcing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-3">
          <Input
            placeholder="Origin city, state"
            value={searchParams.origin}
            onChange={(e) => setSearchParams({...searchParams, origin: e.target.value})}
          />
          <Input
            placeholder="Destination city, state"
            value={searchParams.destination}
            onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
          />
          <Button 
            onClick={findCarriers}
            disabled={searching || !searchParams.origin || !searchParams.destination}
            className="w-full bg-purple-600 py-6"
          >
            <Zap className={`w-5 h-5 mr-2 ${searching ? 'animate-spin' : ''}`} />
            {searching ? 'Searching...' : 'Find Carriers'}
          </Button>
        </div>

        {results && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Found {results.carriers_found} carriers</p>
            {results.recommended_carriers?.map((carrier, idx) => (
              <div key={idx} className="p-3 bg-purple-50 rounded border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{carrier.name}</p>
                    <p className="text-xs text-slate-600">{carrier.available_trucks} trucks available</p>
                  </div>
                  <Badge className="bg-purple-600">${carrier.rate_estimate}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
}