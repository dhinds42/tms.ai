import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Send, CheckCircle, XCircle, Clock, TrendingUp, Sparkles, Target } from "lucide-react";

import TenderMatchCard from "../components/tenderbot/TenderMatchCard";
import TenderHistory from "../components/tenderbot/TenderHistory";
import TenderRulesConfig from "../components/tenderbot/TenderRulesConfig";

export default function TenderBot() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matches, setMatches] = useState([]);
  const [autoTenderEnabled, setAutoTenderEnabled] = useState(
    localStorage.getItem('auto_tender_enabled') === 'true'
  );

  const queryClient = useQueryClient();

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
    },
  });

  const availableLoads = loads.filter(l => l.status === 'available');
  const activeCarriers = carriers.filter(c => c.status === 'active');

  const runTenderBot = async () => {
    if (availableLoads.length === 0) {
      alert('No available loads to tender');
      return;
    }

    setIsAnalyzing(true);
    setMatches([]);

    try {
      const matchPromises = availableLoads.slice(0, 5).map(async (load) => {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are TenderBot, an AI agent that matches loads with optimal carriers for a freight brokerage.

LOAD TO TENDER:
- Load ID: ${load.id}
- Route: ${load.pickup_location?.city}, ${load.pickup_location?.state} → ${load.dropoff_location?.city}, ${load.dropoff_location?.state}
- Equipment: ${load.equipment_type}
- Distance: ${load.distance_miles || 'Unknown'} miles
- Pickup Date: ${load.pickup_date || 'Not specified'}
- Customer Rate: $${load.customer_rate || 'Not set'}
- Priority: ${load.priority || 'medium'}
- Commodity: ${load.commodity || 'General freight'}

AVAILABLE CARRIERS:
${activeCarriers.map(c => `
- ${c.company_name} (MC: ${c.mc_number})
  Equipment: ${c.equipment_types?.join(', ') || 'Not specified'}
  On-Time: ${c.on_time_percentage || 0}%
  Compliance: ${c.compliance_score || 0}%
  Rating: ${c.rating || 0}/5
  Total Loads: ${c.total_loads || 0}
  Preferred Lanes: ${c.preferred_lanes?.map(l => `${l.origin}-${l.destination}`).join(', ') || 'None'}
`).join('\n')}

ANALYSIS REQUIRED:
1. Rank the top 3 carriers best suited for this load
2. For each carrier, provide:
   - Match Score (0-100) - how well they fit this load
   - Suggested Tender Rate ($) - what to offer this carrier
   - Match Reasons (3-5 specific reasons why they're a good fit)
   - Risk Factors (any concerns or potential issues)
   - Acceptance Probability (LOW/MEDIUM/HIGH)
   - Lane Fit Score (0-100) - how well this lane matches their preferences
   - Equipment Availability (CONFIRMED/LIKELY/UNCERTAIN)

Consider:
- Lane preferences and history
- Equipment type match
- Performance metrics (on-time %, compliance)
- Current market rates
- Carrier reliability and rating
- Geographic positioning
- Seasonal factors
- Margin requirements (aim for 15-20% margin)`,
          response_json_schema: {
            type: "object",
            properties: {
              top_matches: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    carrier_id: { type: "string" },
                    carrier_name: { type: "string" },
                    match_score: { type: "number" },
                    suggested_rate: { type: "number" },
                    match_reasons: {
                      type: "array",
                      items: { type: "string" }
                    },
                    risk_factors: {
                      type: "array",
                      items: { type: "string" }
                    },
                    acceptance_probability: { type: "string" },
                    lane_fit_score: { type: "number" },
                    equipment_availability: { type: "string" }
                  }
                }
              },
              analysis_summary: { type: "string" }
            }
          }
        });

        return {
          load,
          matches: result.top_matches?.map(match => {
            const carrier = activeCarriers.find(c => 
              c.company_name === match.carrier_name || c.id === match.carrier_id
            );
            return {
              ...match,
              carrier: carrier
            };
          }) || []
        };
      });

      const results = await Promise.all(matchPromises);
      setMatches(results);

    } catch (error) {
      console.error('TenderBot error:', error);
      alert('Failed to analyze loads. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendTender = async (loadId, carrierId, tenderRate) => {
    // In a real system, this would send email/SMS to carrier
    // For now, we'll auto-assign the load
    updateLoadMutation.mutate({
      id: loadId,
      data: {
        carrier_id: carrierId,
        carrier_pay: tenderRate,
        status: 'tendered'
      }
    });
  };

  const handleToggleAutoTender = () => {
    const newValue = !autoTenderEnabled;
    setAutoTenderEnabled(newValue);
    localStorage.setItem('auto_tender_enabled', newValue.toString());
  };

  const tenderedLoads = loads.filter(l => l.status === 'tendered');
  const acceptedLoads = loads.filter(l => ['assigned', 'dispatched'].includes(l.status));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
            TenderBot: AI Load Tender Automation
          </h1>
          <p className="text-slate-600 text-lg">
            Intelligent carrier matching and automated tender management
          </p>
          <Badge className="mt-3 bg-indigo-600">AI-Powered</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Available Loads</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{availableLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tendered</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{tenderedLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Accepted</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{acceptedLoads.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Carriers</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{activeCarriers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={runTenderBot}
                  disabled={isAnalyzing || availableLoads.length === 0}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Analyzing Matches...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Run TenderBot Analysis
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoTenderEnabled}
                    onChange={handleToggleAutoTender}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Auto-Tender Enabled
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                {availableLoads.length} loads ready to tender
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tender Matches */}
        {matches.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">AI-Generated Tender Matches</h2>
            {matches.map((match, index) => (
              <TenderMatchCard
                key={match.load.id}
                load={match.load}
                matches={match.matches}
                onSendTender={handleSendTender}
              />
            ))}
          </div>
        )}

        {/* Tender History */}
        <TenderHistory loads={[...tenderedLoads, ...acceptedLoads]} carriers={carriers} />

        {/* Rules Configuration */}
        <TenderRulesConfig />

      </div>
    </div>
  );
}