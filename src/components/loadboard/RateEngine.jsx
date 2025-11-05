import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Loader2, Zap } from "lucide-react";

export default function RateEngine({ load, onRateRecommended }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rateAnalysis, setRateAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const analyzeRate = async () => {
    if (!load.pickup_location || !load.dropoff_location) {
      setError("Load must have pickup and dropoff locations");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setRateAnalysis(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Rate Engine for a freight brokerage TMS. 

Analyze the following load and provide optimal pricing recommendations based on market rates:

LOAD DETAILS:
- Lane: ${load.pickup_location.city}, ${load.pickup_location.state} → ${load.dropoff_location.city}, ${load.dropoff_location.state}
- Distance: ${load.distance_miles || 'Unknown'} miles
- Equipment: ${load.equipment_type}
- Commodity: ${load.commodity || 'General freight'}
- Weight: ${load.weight || 'Not specified'} lbs
- Current Customer Rate: $${load.customer_rate || 'Not set'}
- Current Carrier Pay: $${load.carrier_pay || 'Not set'}
- Priority: ${load.priority || 'medium'}
- Pickup Date: ${load.pickup_date || 'Not specified'}

MARKET ANALYSIS REQUIRED:
1. Market Rate Benchmark ($/mile) for this lane and equipment type
2. Suggested Customer Rate ($ total) - what to charge the shipper
3. Suggested Carrier Pay ($ total) - what to pay the carrier
4. Projected Margin ($) - difference between customer rate and carrier pay
5. Margin Percentage (%) - margin as percentage of customer rate
6. Rate Confidence Level (LOW/MEDIUM/HIGH) - how confident you are in this pricing
7. Competitive Position (BELOW_MARKET/AT_MARKET/ABOVE_MARKET)
8. Market Factors (list 3-5 factors affecting pricing: fuel costs, capacity, season, demand)
9. Risk Assessment (list potential margin risks or pricing concerns)
10. Pricing Strategy (recommendations for maximizing margin while staying competitive)
11. Alternative Pricing Options (2-3 alternative pricing scenarios)

Consider:
- Current fuel costs and market conditions
- Seasonal demand fluctuations
- Equipment availability
- Lane popularity and competition
- Typical margins for this equipment type (aim for 15-25% margin)
- Urgency and priority level

Provide realistic, market-based pricing that balances competitiveness with profitability.`,
        response_json_schema: {
          type: "object",
          properties: {
            market_rate_per_mile: { type: "number" },
            suggested_customer_rate: { type: "number" },
            suggested_carrier_pay: { type: "number" },
            projected_margin: { type: "number" },
            margin_percentage: { type: "number" },
            rate_confidence: { type: "string" },
            competitive_position: { type: "string" },
            market_factors: {
              type: "array",
              items: { type: "string" }
            },
            risk_assessment: {
              type: "array",
              items: { type: "string" }
            },
            pricing_strategy: { type: "string" },
            alternative_options: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scenario: { type: "string" },
                  customer_rate: { type: "number" },
                  carrier_pay: { type: "number" },
                  margin: { type: "number" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRateAnalysis(result);
      
      if (onRateRecommended) {
        onRateRecommended({
          ...result,
          load_id: load.id
        });
      }

    } catch (err) {
      setError(err.message || 'Failed to analyze rates');
      console.error('Rate analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    const colors = {
      LOW: 'bg-red-100 text-red-700 border-red-300',
      MEDIUM: 'bg-amber-100 text-amber-700 border-amber-300',
      HIGH: 'bg-emerald-100 text-emerald-700 border-emerald-300'
    };
    return colors[confidence] || colors.MEDIUM;
  };

  const getPositionColor = (position) => {
    const colors = {
      BELOW_MARKET: 'bg-amber-100 text-amber-700 border-amber-300',
      AT_MARKET: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      ABOVE_MARKET: 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return colors[position] || colors.AT_MARKET;
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="border-b border-blue-200 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                AI Rate Engine
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Market-based pricing optimization and margin analysis
              </p>
            </div>
          </div>
          <Badge className="bg-blue-600 text-white">AI-Powered</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        {!rateAnalysis && !isAnalyzing && (
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-6">
              Get AI-powered rate recommendations based on current market conditions
            </p>
            <Button
              onClick={analyzeRate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
            >
              <Zap className="w-4 h-4 mr-2" />
              Analyze Market Rates
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600 font-medium">
              Analyzing market rates and competitive positioning...
            </p>
            <p className="text-sm text-slate-500 mt-2">This may take a few seconds</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Analysis Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {rateAnalysis && (
          <div className="space-y-6">
            
            {/* Pricing Recommendation */}
            <div className="p-6 bg-white rounded-xl border border-blue-200 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">Recommended Pricing</h3>
                  <p className="text-sm text-slate-600">Optimized for competitive margin</p>
                </div>
                <Badge variant="outline" className={getConfidenceColor(rateAnalysis.rate_confidence)}>
                  {rateAnalysis.rate_confidence} Confidence
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Customer Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${rateAnalysis.suggested_customer_rate?.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ${rateAnalysis.market_rate_per_mile?.toFixed(2)}/mile
                  </p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Carrier Pay</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${rateAnalysis.suggested_carrier_pay?.toLocaleString()}
                  </p>
                </div>

                <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Margin</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    ${rateAnalysis.projected_margin?.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {rateAnalysis.margin_percentage?.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Market Position:</span>
                <Badge variant="outline" className={getPositionColor(rateAnalysis.competitive_position)}>
                  {rateAnalysis.competitive_position?.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {/* Market Factors */}
            <div className="p-4 bg-white rounded-xl border border-blue-200">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Market Factors
              </h4>
              <ul className="space-y-2">
                {rateAnalysis.market_factors?.map((factor, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-blue-600 font-bold">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Assessment */}
            {rateAnalysis.risk_assessment && rateAnalysis.risk_assessment.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-2">Margin Risks</h4>
                    <ul className="space-y-1">
                      {rateAnalysis.risk_assessment.map((risk, index) => (
                        <li key={index} className="text-sm text-amber-800">• {risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Strategy */}
            <div className="p-4 bg-white rounded-xl border border-blue-200">
              <h4 className="font-semibold text-slate-900 mb-2">Pricing Strategy</h4>
              <p className="text-sm text-slate-700">{rateAnalysis.pricing_strategy}</p>
            </div>

            {/* Alternative Options */}
            {rateAnalysis.alternative_options && rateAnalysis.alternative_options.length > 0 && (
              <div className="p-4 bg-white rounded-xl border border-blue-200">
                <h4 className="font-semibold text-slate-900 mb-3">Alternative Pricing Scenarios</h4>
                <div className="space-y-3">
                  {rateAnalysis.alternative_options.map((alt, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-slate-900">{alt.scenario}</h5>
                        <Badge variant="outline" className="bg-white">
                          ${alt.margin} margin
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{alt.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Customer:</span>
                          <span className="ml-1 font-semibold text-slate-900">${alt.customer_rate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Carrier:</span>
                          <span className="ml-1 font-semibold text-slate-900">${alt.carrier_pay}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Margin:</span>
                          <span className="ml-1 font-semibold text-emerald-600">${alt.margin}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Re-analyze Button */}
            <Button
              onClick={analyzeRate}
              variant="outline"
              className="w-full"
              disabled={isAnalyzing}
            >
              <Zap className="w-4 h-4 mr-2" />
              Re-analyze Rates
            </Button>

          </div>
        )}

      </CardContent>
    </Card>
  );
}