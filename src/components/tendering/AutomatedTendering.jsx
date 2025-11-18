import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Brain, CheckCircle, Loader2, Radio, Target } from "lucide-react";

export default function AutomatedTendering({ load, carriers, onTenderingComplete }) {
  const [processing, setProcessing] = useState(false);
  const [tenderingStrategy, setTenderingStrategy] = useState('performance_based');
  const [maxCarriers, setMaxCarriers] = useState('5');
  const [results, setResults] = useState(null);

  const runAutomatedTendering = async () => {
    setProcessing(true);
    
    try {
      // AI-powered carrier selection and tendering
      const tenderingPrompt = `
        You are an expert freight broker automating load tendering.
        
        LOAD DETAILS:
        - Origin: ${load.origin_city}, ${load.origin_state}
        - Destination: ${load.destination_city}, ${load.destination_state}
        - Equipment: ${load.equipment_type}
        - Weight: ${load.weight} lbs
        - Pickup Date: ${load.pickup_date}
        - Delivery Date: ${load.delivery_date}
        - Target Rate: $${load.target_carrier_rate || 0}
        
        AVAILABLE CARRIERS (${carriers.length}):
        ${JSON.stringify(carriers.map(c => ({
          id: c.id,
          name: c.company_name,
          performance_score: c.performance_score || 0,
          on_time_rate: c.on_time_percentage || 0,
          service_lanes: c.service_lanes || [],
          equipment_types: c.equipment_types || [],
          preferred_rate_per_mile: c.preferred_rate_per_mile || 0,
          total_loads_with_us: c.total_loads || 0
        })).slice(0, 20), null, 2)}
        
        TENDERING STRATEGY: ${tenderingStrategy}
        MAX CARRIERS TO TENDER: ${maxCarriers}
        
        ANALYSIS REQUIRED:
        
        1. CARRIER MATCHING
           - Match carriers by lane coverage (origin/destination)
           - Match by equipment type availability
           - Consider geographic service area
        
        2. CARRIER RANKING
           Strategy: ${tenderingStrategy}
           ${tenderingStrategy === 'performance_based' ? '- Prioritize highest performance scores' : ''}
           ${tenderingStrategy === 'price_competitive' ? '- Balance rate competitiveness with reliability' : ''}
           ${tenderingStrategy === 'relationship' ? '- Prioritize carriers with most loads history' : ''}
           ${tenderingStrategy === 'balanced' ? '- Optimize across all factors' : ''}
        
        3. RATE RECOMMENDATIONS
           - Suggest optimal tender rate for each carrier
           - Consider carrier's typical rates
           - Factor in market conditions
           - Balance competitiveness vs profitability
        
        4. TENDER SEQUENCE
           - Order carriers by tender priority (1st, 2nd, 3rd choice)
           - Simultaneous vs waterfall approach
           - Timeout settings
        
        5. SUCCESS PROBABILITY
           - Predict acceptance likelihood per carrier (0-100%)
           - Estimate response time
           - Suggest backup carriers
        
        Return top ${maxCarriers} carriers ranked and ready to tender.
      `;

      const aiRecommendations = await base44.integrations.Core.InvokeLLM({
        prompt: tenderingPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_carriers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  carrier_id: { type: "string" },
                  carrier_name: { type: "string" },
                  rank: { type: "number" },
                  recommended_rate: { type: "number" },
                  acceptance_probability: { type: "number" },
                  match_score: { type: "number" },
                  match_reasons: {
                    type: "array",
                    items: { type: "string" }
                  },
                  estimated_response_hours: { type: "number" }
                }
              }
            },
            tendering_approach: { type: "string", description: "simultaneous or waterfall" },
            overall_confidence: { type: "number" },
            notes: { type: "string" }
          }
        }
      });

      setResults(aiRecommendations);

      // Auto-create tenders
      const tendersCreated = [];
      for (const rec of aiRecommendations.recommended_carriers) {
        const tender = await base44.entities.Tender.create({
          shipment_id: load.id,
          tendered_to_carrier_party_id: rec.carrier_id,
          offered_rate_amount: rec.recommended_rate,
          tendered_at: new Date().toISOString(),
          response_status: 'pending',
          valid_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          priority: rec.rank === 1 ? 'high' : 'normal',
          notes: `AI-recommended. Match score: ${rec.match_score}. Probability: ${rec.acceptance_probability}%`
        });
        tendersCreated.push(tender);
      }

      if (onTenderingComplete) {
        onTenderingComplete(tendersCreated);
      }

    } catch (error) {
      console.error('Automated tendering error:', error);
      alert('Failed to complete automated tendering');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="border-b border-purple-100">
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Automated Load Tendering AI
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        
        {!processing && !results && (
          <div className="space-y-4">
            
            <div className="p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3">🤖 AI Tendering Features:</h4>
              <ul className="text-sm text-purple-800 space-y-2">
                <li>• <strong>Smart Matching:</strong> Auto-matches carriers by lane, equipment, performance</li>
                <li>• <strong>Rate Optimization:</strong> Suggests optimal tender rates per carrier</li>
                <li>• <strong>Predictive Scoring:</strong> Forecasts acceptance probability</li>
                <li>• <strong>Auto-Sequencing:</strong> Determines simultaneous vs waterfall approach</li>
                <li>• <strong>One-Click Execution:</strong> Sends tenders to top carriers instantly</li>
              </ul>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <div>
                <Label>Tendering Strategy</Label>
                <Select value={tenderingStrategy} onValueChange={setTenderingStrategy}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance_based">🏆 Performance-Based (Best Carriers First)</SelectItem>
                    <SelectItem value="price_competitive">💰 Price-Competitive (Best Rates)</SelectItem>
                    <SelectItem value="relationship">🤝 Relationship-Based (Top Partners)</SelectItem>
                    <SelectItem value="balanced">⚖️ Balanced Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Max Carriers to Tender</Label>
                <Select value={maxCarriers} onValueChange={setMaxCarriers}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Carriers</SelectItem>
                    <SelectItem value="5">5 Carriers</SelectItem>
                    <SelectItem value="10">10 Carriers</SelectItem>
                    <SelectItem value="15">15 Carriers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={runAutomatedTendering}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6"
            >
              <Brain className="w-5 h-5 mr-2" />
              Run Automated Tendering
            </Button>
          </div>
        )}

        {processing && (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
            <p className="font-semibold text-purple-900 mb-3">AI Tendering in Progress...</p>
            <div className="space-y-2 text-sm text-purple-700">
              <p>🔍 Analyzing {carriers.length} carriers...</p>
              <p>🎯 Matching lane compatibility...</p>
              <p>💰 Optimizing rate recommendations...</p>
              <p>📊 Calculating acceptance probabilities...</p>
              <p>📤 Creating tender packages...</p>
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">Tendering Complete!</span>
              </div>
              <p className="text-sm text-emerald-800 mb-3">{results.notes}</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-600">Carriers Tendered</p>
                  <p className="text-2xl font-bold text-indigo-600">{results.recommended_carriers.length}</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-600">Confidence Level</p>
                  <p className="text-2xl font-bold text-emerald-600">{results.overall_confidence}%</p>
                </div>
              </div>
            </div>

            {/* Recommended Carriers */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Tender Recipients (Ranked):</h4>
              {results.recommended_carriers.map((rec) => (
                <div key={rec.carrier_id} className="p-4 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-600">#{rec.rank}</Badge>
                      <span className="font-semibold text-slate-900">{rec.carrier_name}</span>
                    </div>
                    <Badge className={
                      rec.acceptance_probability >= 70 ? 'bg-emerald-600' :
                      rec.acceptance_probability >= 50 ? 'bg-blue-600' :
                      'bg-amber-600'
                    }>
                      {rec.acceptance_probability}% likely
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Tender Rate:</span>
                    <span className="text-lg font-bold text-emerald-600">${rec.recommended_rate}</span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    {rec.match_reasons.slice(0, 2).map((reason, idx) => (
                      <p key={idx}>✓ {reason}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => setResults(null)} variant="outline" className="w-full">
              Tender Another Load
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
  );
}