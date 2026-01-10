import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, TrendingUp, TrendingDown, Target, Loader2, ThumbsUp, Award, DollarSign } from "lucide-react";

export default function RateNegotiationAssistant() {
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [brokerOffer, setBrokerOffer] = useState('');
  const [carrierCounter, setCarrierCounter] = useState('');
  const [negotiating, setNegotiating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const queryClient = useQueryClient();

  const { data: loads = [] } = useScopedEntity('Load', { limit: 100 });
  const { data: carriers = [] } = useScopedEntity('Carrier', { limit: 100 });
  const { data: laneRates = [] } = useScopedEntity('LaneRate', { limit: 100 });

  const createNegotiationMutation = useMutation({
    mutationFn: (data) => base44.entities.RateNegotiation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
    }
  });

  const getAINegotiationAdvice = async () => {
    if (!selectedLoad || !selectedCarrier || !brokerOffer) return;

    setNegotiating(true);
    
    try {
      const load = loads.find(l => l.id === selectedLoad);
      const carrier = carriers.find(c => c.id === selectedCarrier);
      
      // Find relevant lane rates
      const relevantRate = laneRates.find(lr => 
        lr.origin_city === load.pickup_location?.city &&
        lr.destination_city === load.delivery_location?.city
      );

      const prompt = `You are a freight rate negotiation expert. Analyze this negotiation scenario and provide strategic advice.

LOAD DETAILS:
- Origin: ${load.pickup_location?.city}, ${load.pickup_location?.state}
- Destination: ${load.delivery_location?.city}, ${load.delivery_location?.state}
- Distance: ${load.distance_miles || 'N/A'} miles
- Equipment: ${load.equipment_type}
- Weight: ${load.weight} lbs
- Pickup Date: ${load.pickup_date}

CARRIER PROFILE:
- Name: ${carrier.company_name}
- Performance Score: ${carrier.performance_score || 'N/A'}/100
- On-Time Delivery: ${carrier.on_time_percentage || 'N/A'}%
- Insurance Status: ${carrier.insurance_expiration ? 'Active' : 'Unknown'}
- Previous Loads: ${carrier.total_loads_completed || 0}

RATE CONTEXT:
- Your Offer: $${brokerOffer}
${carrierCounter ? `- Carrier Counter: $${carrierCounter}` : ''}
${relevantRate ? `- Historical Lane Rate: $${relevantRate.carrier_rate || 'N/A'}` : ''}
- Market Avg (estimated): $${load.distance_miles ? (load.distance_miles * 2.00).toFixed(2) : 'N/A'}

Provide:
1. Is your offer competitive? (yes/no/maybe)
2. Suggested counter-offer amount
3. Negotiation strategy (anchor_high, meet_middle, walk_away, urgent_acceptance)
4. Key talking points to use
5. Risk assessment (carrier reliability, market conditions)
6. Maximum rate you should pay (based on profitability)`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            competitive: { type: "string", enum: ["yes", "no", "maybe"] },
            suggested_counter_cents: { type: "number" },
            strategy: { type: "string", enum: ["anchor_high", "meet_middle", "walk_away", "urgent_acceptance"] },
            talking_points: { type: "array", items: { type: "string" } },
            risk_level: { type: "string", enum: ["low", "medium", "high"] },
            risk_factors: { type: "array", items: { type: "string" } },
            max_rate_cents: { type: "number" },
            explanation: { type: "string" }
          }
        }
      });

      setAiSuggestion(aiResponse);

      // Save negotiation record
      await createNegotiationMutation.mutateAsync({
        load_id: selectedLoad,
        carrier_id: selectedCarrier,
        initial_offer_cents: Math.round(parseFloat(brokerOffer) * 100),
        carrier_counter_cents: carrierCounter ? Math.round(parseFloat(carrierCounter) * 100) : null,
        market_rate_cents: load.distance_miles ? Math.round(load.distance_miles * 200) : null,
        ai_strategy: aiResponse.strategy,
        carrier_performance_score: carrier.performance_score,
        negotiation_rounds: [{
          round: 1,
          broker_offer_cents: Math.round(parseFloat(brokerOffer) * 100),
          carrier_counter_cents: carrierCounter ? Math.round(parseFloat(carrierCounter) * 100) : null,
          ai_suggestion: aiResponse.explanation,
          timestamp: new Date().toISOString()
        }],
        status: 'in_progress'
      });

    } catch (error) {
      console.error('AI negotiation error:', error);
    } finally {
      setNegotiating(false);
    }
  };

  const strategyIcons = {
    anchor_high: <TrendingUp className="w-4 h-4" />,
    meet_middle: <Target className="w-4 h-4" />,
    walk_away: <TrendingDown className="w-4 h-4" />,
    urgent_acceptance: <ThumbsUp className="w-4 h-4" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            AI Rate Negotiation Assistant
          </h1>
          <p className="text-slate-600 mt-1">Get AI-powered negotiation strategies and real-time market insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Input Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Negotiation Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div>
                <Label>Select Load</Label>
                <Select value={selectedLoad || ''} onValueChange={setSelectedLoad}>
                  <SelectTrigger><SelectValue placeholder="Choose a load" /></SelectTrigger>
                  <SelectContent>
                    {loads.map(load => (
                      <SelectItem key={load.id} value={load.id}>
                        {load.pickup_location?.city} → {load.delivery_location?.city} ({load.distance_miles}mi)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Select Carrier</Label>
                <Select value={selectedCarrier || ''} onValueChange={setSelectedCarrier}>
                  <SelectTrigger><SelectValue placeholder="Choose a carrier" /></SelectTrigger>
                  <SelectContent>
                    {carriers.map(carrier => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.company_name} - Score: {carrier.performance_score || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Your Offer ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="2500" 
                    value={brokerOffer}
                    onChange={(e) => setBrokerOffer(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Carrier Counter ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="2800 (optional)" 
                    value={carrierCounter}
                    onChange={(e) => setCarrierCounter(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={getAINegotiationAdvice}
                disabled={!selectedLoad || !selectedCarrier || !brokerOffer || negotiating}
                className="w-full bg-indigo-600"
              >
                {negotiating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Get AI Negotiation Strategy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Market Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold">Average Market Rate</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${selectedLoad && loads.find(l => l.id === selectedLoad)?.distance_miles ? 
                    (loads.find(l => l.id === selectedLoad).distance_miles * 2.00).toFixed(2) : 
                    '0.00'}
                </p>
              </div>
              
              {selectedCarrier && carriers.find(c => c.id === selectedCarrier) && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold">Carrier Score</p>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-700" />
                    <p className="text-2xl font-bold text-green-900">
                      {carriers.find(c => c.id === selectedCarrier).performance_score || 'N/A'}/100
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestion Panel */}
        {aiSuggestion && (
          <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                AI Negotiation Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold mb-1">Competitive?</p>
                  <Badge className={
                    aiSuggestion.competitive === 'yes' ? 'bg-green-500' :
                    aiSuggestion.competitive === 'no' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }>
                    {aiSuggestion.competitive.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold mb-1">Suggested Counter</p>
                  <p className="text-xl font-bold text-slate-900">
                    ${(aiSuggestion.suggested_counter_cents / 100).toFixed(2)}
                  </p>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold mb-1">Max Rate</p>
                  <p className="text-xl font-bold text-slate-900">
                    ${(aiSuggestion.max_rate_cents / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  {strategyIcons[aiSuggestion.strategy]}
                  <p className="font-semibold text-indigo-900">
                    Strategy: {aiSuggestion.strategy.replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
                <p className="text-sm text-indigo-800">{aiSuggestion.explanation}</p>
              </div>

              <div>
                <p className="font-semibold text-slate-900 mb-2">Talking Points:</p>
                <ul className="space-y-2">
                  {aiSuggestion.talking_points?.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-indigo-600">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={
                    aiSuggestion.risk_level === 'low' ? 'bg-green-500' :
                    aiSuggestion.risk_level === 'medium' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }>
                    {aiSuggestion.risk_level.toUpperCase()} RISK
                  </Badge>
                </div>
                {aiSuggestion.risk_factors?.length > 0 && (
                  <ul className="space-y-1">
                    {aiSuggestion.risk_factors.map((risk, idx) => (
                      <li key={idx} className="text-sm text-slate-600">⚠️ {risk}</li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}