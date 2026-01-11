import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Search, Users, TrendingUp, Shield } from "lucide-react";

import CarrierSourcing from "../components/procurement/CarrierSourcing";
import NetworkHealthMonitor from "../components/carrier-network/NetworkHealthMonitor";

export default function CarrierProcurement() {
  const [isLoading, setIsLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [criteria, setCriteria] = useState({ lane: '', equipment: 'dry_van', min_safety_score: 75 });

  const searchCarriers = async () => {
    setSearching(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Find and vet carriers for:
Lane: ${criteria.lane}
Equipment: ${criteria.equipment}
Min Safety Score: ${criteria.min_safety_score}

Provide 5 qualified carrier recommendations with vetting details.`,
        response_json_schema: {
          type: "object",
          properties: {
            carriers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  dot_number: { type: "string" },
                  safety_score: { type: "number" },
                  fleet_size: { type: "number" },
                  specialty: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            }
          }
        }
      });
      setResults(result.carriers || []);
    } catch (error) {
      alert('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
            Carrier Procurement Engine
          </h1>
          <p className="text-slate-600 mt-2">AI-powered carrier sourcing and vetting at scale</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Search Criteria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Lane (e.g., Chicago, IL → Dallas, TX)"
                value={criteria.lane}
                onChange={(e) => setCriteria({...criteria, lane: e.target.value})}
              />
            </div>
            <Button onClick={searchCarriers} disabled={searching} className="w-full bg-purple-600 py-6">
              <Search className="w-5 h-5 mr-2" />
              Search & Vet Carriers
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((carrier, idx) => (
              <Card key={idx} className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{carrier.name}</h3>
                      <p className="text-sm text-slate-600">DOT: {carrier.dot_number}</p>
                    </div>
                    <Badge className="bg-emerald-600">Score: {carrier.safety_score}</Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{carrier.recommendation}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{carrier.fleet_size} trucks</Badge>
                    <Badge variant="outline">{carrier.specialty}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CarrierSourcing />

        {/* Network Health Monitor */}
        <NetworkHealthMonitor />

      </div>
    </div>
  );
}