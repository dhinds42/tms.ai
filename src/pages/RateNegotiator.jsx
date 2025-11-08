import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Sparkles, TrendingUp, DollarSign, Target, Zap, CheckCircle } from "lucide-react";

import NegotiationAssistant from "../components/negotiation/NegotiationAssistant";
import NegotiationHistory from "../components/negotiation/NegotiationHistory";
import MarketRateIntelligence from "../components/negotiation/MarketRateIntelligence";
import NegotiationPlaybook from "../components/negotiation/NegotiationPlaybook";

export default function RateNegotiator() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [negotiationContext, setNegotiationContext] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const queryClient = useQueryClient();

  const { data: loads, isLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: ownerOperators } = useQuery({
    queryKey: ['owner-operators'],
    queryFn: () => base44.entities.OwnerOperator.list('-created_date', 100),
    initialData: [],
  });

  const runNegotiationAnalysis = async (load, counterparty, counterpartyType) => {
    setIsAnalyzing(true);
    setNegotiationContext(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert freight rate negotiation AI assistant.

${operatingMode === 'broker' ? 'BROKER PERSPECTIVE - Negotiating with Carrier:' : 'CARRIER PERSPECTIVE - Negotiating with Broker/Customer:'}

LOAD DETAILS:
- Route: ${load.pickup_location?.city}, ${load.pickup_location?.state} → ${load.dropoff_location?.city}, ${load.dropoff_location?.state}
- Distance: ${load.distance_miles || 'Unknown'} miles
- Equipment: ${load.equipment_type}
- Commodity: ${load.commodity || 'General freight'}
- ${operatingMode === 'broker' ? 'Customer Rate' : 'Offered Rate'}: $${load.customer_rate || 'Not set'}
- ${operatingMode === 'broker' ? 'Current Carrier Offer' : 'Your Ask'}: $${load.carrier_pay || 'Not set'}

${operatingMode === 'broker' ? `
CARRIER PROFILE:
- Company: ${counterparty.company_name}
- On-Time %: ${counterparty.on_time_percentage || 0}%
- Compliance Score: ${counterparty.compliance_score || 0}%
- Total Loads: ${counterparty.total_loads || 0}
- Rating: ${counterparty.rating || 0}/5
- Equipment Match: ${counterparty.equipment_types?.includes(load.equipment_type) ? 'Yes' : 'No'}
` : `
DRIVER/OWNER OPERATOR:
- Name: ${counterparty.full_name}
- Type: ${counterparty.company_name ? 'Owner Operator' : 'Company Driver'}
- On-Time %: ${counterparty.on_time_percentage || 0}%
- Rating: ${counterparty.rating || 0}/5
- Total Loads: ${counterparty.total_loads || 0}
${counterparty.payment_rate ? `- Payment Rate: ${counterparty.payment_rate}%` : ''}
`}

PROVIDE ADVANCED NEGOTIATION INTELLIGENCE:

1. Fair Market Rate Range (min-max based on market conditions)
2. Your Target Rate (optimal rate to offer/accept)
3. Walk-Away Rate (absolute minimum/maximum)
4. Opening Offer Strategy (first number to propose)
5. Concession Strategy (how much to move in negotiations)
6. Negotiation Leverage Points (3-5 specific leverage factors YOU have)
7. Counterparty Motivators (3-5 factors that motivate THEM)
8. Objection Responses (how to handle rate pushback)
9. Alternative Value Props (non-rate benefits to offer)
10. Timing Strategy (when to negotiate, urgency factors)
11. Comparable Deals (similar lanes and what they paid)
12. Market Conditions Impact (supply/demand, seasonality)
13. Recommended Negotiation Script (opening statement)
14. Fallback Options (alternative approaches if primary strategy fails)
15. Success Probability (% chance of closing at target rate)

${operatingMode === 'broker' 
  ? 'Focus on maximizing margin while maintaining carrier relationships.'
  : 'Focus on maximizing your rate while demonstrating value and reliability.'}`,
        response_json_schema: {
          type: "object",
          properties: {
            market_rate_min: { type: "number" },
            market_rate_max: { type: "number" },
            target_rate: { type: "number" },
            walk_away_rate: { type: "number" },
            opening_offer: { type: "number" },
            concession_amount: { type: "number" },
            leverage_points: {
              type: "array",
              items: { type: "string" }
            },
            counterparty_motivators: {
              type: "array",
              items: { type: "string" }
            },
            objection_responses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  objection: { type: "string" },
                  response: { type: "string" }
                }
              }
            },
            alternative_value_props: {
              type: "array",
              items: { type: "string" }
            },
            timing_strategy: { type: "string" },
            comparable_deals: { type: "string" },
            market_conditions: { type: "string" },
            negotiation_script: { type: "string" },
            fallback_options: {
              type: "array",
              items: { type: "string" }
            },
            success_probability: { type: "number" }
          }
        }
      });

      setNegotiationContext({
        load,
        counterparty,
        counterpartyType,
        analysis: result
      });

    } catch (error) {
      console.error('Negotiation analysis error:', error);
      alert('Failed to analyze negotiation strategy');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeNegotiations = loads.filter(l => 
    l.status === 'available' || l.status === 'tendered'
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            AI Rate Negotiation Assistant
          </h1>
          <p className="text-slate-600 text-lg">
            {operatingMode === 'broker' 
              ? 'Maximize margins with intelligent carrier rate negotiation'
              : 'Maximize your rates with intelligent negotiation strategies'}
          </p>
          <Badge className="mt-3 bg-purple-600">AI-Powered Negotiator</Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Negotiations</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{activeNegotiations.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Success Rate</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">87%</p>
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
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {operatingMode === 'broker' ? 'Margin Saved' : 'Extra Revenue'}
                  </p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">$12K</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Rate Intelligence */}
        <MarketRateIntelligence operatingMode={operatingMode} />

        {/* Active Negotiations */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-100 pb-6">
            <CardTitle className="text-xl">
              {operatingMode === 'broker' ? 'Loads Ready for Negotiation' : 'Available Loads to Negotiate'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {activeNegotiations.map((load) => (
                <div key={load.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {load.load_number || `#${load.id.slice(0, 8)}`}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {load.pickup_location?.city} → {load.dropoff_location?.city}
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">
                      ${load.customer_rate?.toLocaleString() || 'TBD'}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedLoad(load);
                      // Select appropriate counterparty
                      if (operatingMode === 'broker') {
                        const carrier = carriers[0]; // In production, select appropriate carrier
                        if (carrier) runNegotiationAnalysis(load, carrier, 'carrier');
                      } else {
                        const driver = drivers[0] || ownerOperators[0];
                        if (driver) runNegotiationAnalysis(load, driver, driver.company_name ? 'owner_operator' : 'driver');
                      }
                    }}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Negotiation Strategy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Negotiation Assistant */}
        {negotiationContext && (
          <NegotiationAssistant 
            context={negotiationContext}
            operatingMode={operatingMode}
            onClose={() => setNegotiationContext(null)}
          />
        )}

        {/* Negotiation Playbook */}
        <NegotiationPlaybook operatingMode={operatingMode} />

        {/* Negotiation History */}
        <NegotiationHistory loads={loads} operatingMode={operatingMode} />

      </div>
    </div>
  );
}