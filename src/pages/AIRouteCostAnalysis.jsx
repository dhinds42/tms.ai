import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Navigation, Fuel, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AIRouteCostAnalysis() {
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const { data: loads = [], isLoading } = useScopedEntity('Load', { limit: 100 });

  const activeLoads = loads.filter(l => ['available', 'assigned', 'in_transit'].includes(l.status));

  const handleAnalyzeRoute = async () => {
    if (!selectedLoad) return;

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI route cost analysis agent for freight transportation.

LOAD DETAILS:
- Load Number: ${selectedLoad.load_number || selectedLoad.id.slice(0, 8)}
- Origin: ${selectedLoad.pickup_location?.city}, ${selectedLoad.pickup_location?.state}
- Destination: ${selectedLoad.dropoff_location?.city}, ${selectedLoad.dropoff_location?.state}
- Distance: ${selectedLoad.distance_miles || 'Unknown'} miles
- Equipment: ${selectedLoad.equipment_type}
- Customer Rate: $${selectedLoad.customer_rate || 'TBD'}
- Carrier Pay: $${selectedLoad.carrier_pay || 'TBD'}
- Pickup Date: ${selectedLoad.pickup_date}
- Delivery Date: ${selectedLoad.delivery_date}

PERFORM COMPREHENSIVE ROUTE COST ANALYSIS:

1. **Fuel Cost Analysis**
   - Calculate fuel consumption (assume 6.5 MPG for truck)
   - Current national average fuel price: $3.85/gallon
   - Factor in terrain, weather, and routing
   - Estimate fuel surcharge recommendations

2. **Driver/Labor Costs**
   - Calculate driver hours (assume 50 mph average)
   - Factor in HOS regulations
   - Estimate driver pay (percentage or per-mile)
   - Include potential detention/layover costs

3. **Route Optimization Opportunities**
   - Identify most fuel-efficient routes
   - Suggest toll vs. free route tradeoffs
   - Recommend best pickup/delivery times
   - Estimate potential savings with optimization

4. **Hidden Costs**
   - Tolls (estimate major corridors)
   - Urban congestion delays
   - Border crossing delays (if applicable)
   - Parking fees
   - Potential lumper fees

5. **Equipment-Specific Costs**
   - Reefer fuel surcharge (if applicable)
   - Specialized equipment fees
   - Maintenance considerations for route

6. **Profitability Analysis**
   - Total estimated operating cost
   - Margin analysis
   - Break-even rate calculation
   - Competitive rate recommendations
   - Risk-adjusted profit forecast

7. **Market Comparison**
   - Compare to typical market rates for this lane
   - Assess if rate is competitive
   - Identify margin improvement opportunities

8. **Risk Factors**
   - Weather risks
   - Construction delays
   - Seasonal pricing impacts
   - Market volatility

Provide detailed cost breakdown and actionable recommendations to maximize profitability.`,
        response_json_schema: {
          type: "object",
          properties: {
            fuel_analysis: {
              type: "object",
              properties: {
                estimated_gallons: { type: "number" },
                fuel_cost: { type: "number" },
                cost_per_mile: { type: "number" },
                fuel_surcharge_recommended: { type: "number" }
              }
            },
            labor_costs: {
              type: "object",
              properties: {
                driving_hours: { type: "number" },
                driver_pay: { type: "number" },
                detention_risk: { type: "string" },
                total_labor_cost: { type: "number" }
              }
            },
            route_optimization: {
              type: "object",
              properties: {
                optimal_route: { type: "string" },
                potential_savings: { type: "number" },
                time_savings_hours: { type: "number" },
                recommendations: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            hidden_costs: {
              type: "object",
              properties: {
                tolls: { type: "number" },
                parking: { type: "number" },
                lumper_fees: { type: "number" },
                other_fees: { type: "number" },
                total_hidden_costs: { type: "number" }
              }
            },
            total_operating_cost: { type: "number" },
            profitability: {
              type: "object",
              properties: {
                current_margin: { type: "number" },
                margin_percentage: { type: "number" },
                break_even_rate: { type: "number" },
                recommended_rate: { type: "number" },
                profit_potential: { type: "string" }
              }
            },
            market_comparison: {
              type: "object",
              properties: {
                typical_market_rate: { type: "number" },
                rate_competitiveness: { type: "string" },
                margin_vs_market: { type: "string" }
              }
            },
            risk_factors: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            summary: { type: "string" }
          }
        }
      });

      setAnalysis(result);

    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze route costs');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent mb-2">
            AI Route Cost Analysis
          </h1>
          <p className="text-slate-600 text-lg">
            Comprehensive cost breakdown and profitability optimization for freight routes
          </p>
          <Badge className="mt-3 bg-blue-600">AI-Powered</Badge>
        </div>

        {/* Load Selection */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-lg mb-2">Select Load for Analysis</h3>
                <Select value={selectedLoad?.id} onValueChange={(id) => setSelectedLoad(loads.find(l => l.id === id))}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Choose a load..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLoads.map((load) => (
                      <SelectItem key={load.id} value={load.id}>
                        {load.load_number || load.id.slice(0, 8)} - {load.pickup_location?.city} → {load.dropoff_location?.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAnalyzeRoute}
                disabled={!selectedLoad || analyzing}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Costs
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <>
            {/* Summary */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Cost Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-lg">{analysis.summary}</p>
              </CardContent>
            </Card>

            {/* Cost Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Fuel Costs */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-amber-600" />
                    Fuel Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Est. Gallons:</span>
                    <span className="font-semibold">{analysis.fuel_analysis?.estimated_gallons?.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fuel Cost:</span>
                    <span className="font-semibold text-amber-700">${analysis.fuel_analysis?.fuel_cost?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cost/Mile:</span>
                    <span className="font-semibold">${analysis.fuel_analysis?.cost_per_mile?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-slate-600">FSC Recommended:</span>
                    <span className="font-semibold text-blue-700">${analysis.fuel_analysis?.fuel_surcharge_recommended?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Labor Costs */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Labor Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Driving Hours:</span>
                    <span className="font-semibold">{analysis.labor_costs?.driving_hours?.toFixed(1)}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Driver Pay:</span>
                    <span className="font-semibold text-emerald-700">${analysis.labor_costs?.driver_pay?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Detention Risk:</span>
                    <span className="font-semibold">{analysis.labor_costs?.detention_risk}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-slate-600">Total Labor:</span>
                    <span className="font-semibold text-blue-700">${analysis.labor_costs?.total_labor_cost?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Hidden Costs */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Hidden Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tolls:</span>
                    <span className="font-semibold">${analysis.hidden_costs?.tolls?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Parking:</span>
                    <span className="font-semibold">${analysis.hidden_costs?.parking?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Lumper Fees:</span>
                    <span className="font-semibold">${analysis.hidden_costs?.lumper_fees?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-slate-600">Total Hidden:</span>
                    <span className="font-semibold text-red-700">${analysis.hidden_costs?.total_hidden_costs?.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Total Operating Cost */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1">Total Operating Cost</p>
                    <p className="text-4xl font-bold text-indigo-900">${analysis.total_operating_cost?.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-1">Current Margin</p>
                    <p className={`text-4xl font-bold ${
                      (analysis.profitability?.margin_percentage || 0) > 20 
                        ? 'text-emerald-600' 
                        : (analysis.profitability?.margin_percentage || 0) > 10
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                      {analysis.profitability?.margin_percentage?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profitability & Market */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Profitability Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Break-Even Rate:</span>
                    <span className="font-semibold">${analysis.profitability?.break_even_rate?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Recommended Rate:</span>
                    <span className="font-semibold text-blue-700">${analysis.profitability?.recommended_rate?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Profit Potential:</span>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {analysis.profitability?.profit_potential}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    Market Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Market Rate:</span>
                    <span className="font-semibold">${analysis.market_comparison?.typical_market_rate?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Competitiveness:</span>
                    <span className="font-semibold">{analysis.market_comparison?.rate_competitiveness}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">vs Market:</span>
                    <span className="font-semibold">{analysis.market_comparison?.margin_vs_market}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Route Optimization */}
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-cyan-600" />
                  Route Optimization Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Optimal Route</p>
                    <p className="font-semibold text-slate-900">{analysis.route_optimization?.optimal_route}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Potential Savings</p>
                    <p className="font-semibold text-emerald-700">${analysis.route_optimization?.potential_savings?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Time Savings</p>
                    <p className="font-semibold text-blue-700">{analysis.route_optimization?.time_savings_hours?.toFixed(1)}h</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {analysis.route_optimization?.recommendations?.map((rec, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-cyan-600">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            {analysis.risk_factors?.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <AlertTriangle className="w-5 h-5" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.risk_factors.map((risk, idx) => (
                      <li key={idx} className="text-sm text-red-900 flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Final Recommendations */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700 p-3 bg-white rounded-lg border border-indigo-200">
                      <span className="font-bold text-indigo-600">{idx + 1}. </span>{rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}

      </div>
    </div>
  );
}