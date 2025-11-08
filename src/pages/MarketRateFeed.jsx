import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, RefreshCw, DollarSign, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function MarketRateFeed() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [equipmentType, setEquipmentType] = useState('dry_van');
  const [isLoading, setIsLoading] = useState(false);
  const [rateData, setRateData] = useState(null);

  const fetchMarketRates = async () => {
    if (!origin || !destination) {
      alert('Please enter origin and destination');
      return;
    }

    setIsLoading(true);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a freight market intelligence AI providing real-time rate data.

ROUTE QUERY:
Origin: ${origin}
Destination: ${destination}
Equipment: ${equipmentType}

Provide ACCURATE market intelligence for this lane:

1. **Current Spot Rate**:
   - Current spot market rate per mile
   - All-in rate for the lane
   - Rate per mile ($/mi)

2. **Contract Rate Benchmark**:
   - Typical contract rate for this lane
   - Rate stability score (0-100)

3. **7-Day Trend**:
   - Rate movement (up/down/flat)
   - Percentage change
   - Trend direction

4. **30-Day Historical Data**:
   - Daily rate averages for chart
   - High/low range

5. **Market Conditions**:
   - Supply/demand ratio
   - Capacity tightness (loose/balanced/tight)
   - Seasonal factors
   - Weather/disruption impacts

6. **Competitive Intelligence**:
   - Broker margin typically charged
   - Carrier acceptance likelihood
   - Negotiation leverage (shipper/broker/carrier)

7. **Recommendations**:
   - Suggested broker rate to shipper
   - Suggested carrier pay
   - Expected margin percentage
   - Best time to book

Base analysis on real-world freight market dynamics, fuel costs, capacity, and seasonal patterns.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            spot_rate: {
              type: "object",
              properties: {
                rate_per_mile: { type: "number" },
                all_in_rate: { type: "number" },
                confidence: { type: "string" }
              }
            },
            contract_rate: {
              type: "object",
              properties: {
                rate_per_mile: { type: "number" },
                stability_score: { type: "number" }
              }
            },
            trend_7day: {
              type: "object",
              properties: {
                direction: { type: "string" },
                percentage_change: { type: "number" }
              }
            },
            historical_30day: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  rate: { type: "number" }
                }
              }
            },
            market_conditions: {
              type: "object",
              properties: {
                supply_demand_ratio: { type: "string" },
                capacity_status: { type: "string" },
                factors: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            },
            competitive_intel: {
              type: "object",
              properties: {
                typical_broker_margin: { type: "number" },
                carrier_acceptance_likelihood: { type: "string" },
                negotiation_leverage: { type: "string" }
              }
            },
            recommendations: {
              type: "object",
              properties: {
                suggested_shipper_rate: { type: "number" },
                suggested_carrier_pay: { type: "number" },
                expected_margin_pct: { type: "number" },
                booking_advice: { type: "string" }
              }
            }
          }
        }
      });

      setRateData({
        ...result,
        origin,
        destination,
        equipment: equipmentType
      });

    } catch (error) {
      console.error('Market rate fetch error:', error);
      alert('Failed to fetch market rates');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'up': return <TrendingUp className="w-5 h-5 text-red-600" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-emerald-600" />;
      default: return <Minus className="w-5 h-5 text-blue-600" />;
    }
  };

  const getCapacityColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'tight': return 'bg-red-100 text-red-700';
      case 'balanced': return 'bg-blue-100 text-blue-700';
      case 'loose': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent mb-2">
            Real-time Market Rate Feed
          </h1>
          <p className="text-slate-600 text-lg">
            AI-powered spot and contract rate intelligence with market insights
          </p>
          <Badge className="mt-3 bg-emerald-600">Live Data + AI Analysis</Badge>
        </div>

        {/* Search Form */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
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
              <Select value={equipmentType} onValueChange={setEquipmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry_van">Dry Van</SelectItem>
                  <SelectItem value="reefer">Reefer</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="step_deck">Step Deck</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={fetchMarketRates}
                disabled={isLoading}
                className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Get Rates
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {rateData && (
          <>
            {/* Current Rates */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader className="border-b border-emerald-200 pb-4">
                  <CardTitle className="text-emerald-900">Spot Rate</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold text-emerald-600">
                      ${rateData.spot_rate?.rate_per_mile?.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">per mile</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600">All-in Rate</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      ${rateData.spot_rate?.all_in_rate?.toLocaleString()}
                    </p>
                  </div>
                  <Badge className="mt-3 bg-emerald-600 text-white w-full justify-center">
                    {rateData.spot_rate?.confidence} Confidence
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="border-b border-blue-200 pb-4">
                  <CardTitle className="text-blue-900">Contract Benchmark</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold text-blue-600">
                      ${rateData.contract_rate?.rate_per_mile?.toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">per mile</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600">Stability Score</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {rateData.contract_rate?.stability_score}/100
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="border-b border-amber-200 pb-4">
                  <CardTitle className="text-amber-900">7-Day Trend</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-6">
                    {getTrendIcon(rateData.trend_7day?.direction)}
                    <span className="text-5xl font-bold ml-3" style={{
                      color: rateData.trend_7day?.direction?.toLowerCase() === 'up' ? '#dc2626' :
                             rateData.trend_7day?.direction?.toLowerCase() === 'down' ? '#10b981' : '#3b82f6'
                    }}>
                      {rateData.trend_7day?.percentage_change > 0 ? '+' : ''}
                      {rateData.trend_7day?.percentage_change?.toFixed(1)}%
                    </span>
                  </div>
                  <Badge className="w-full justify-center capitalize" style={{
                    backgroundColor: rateData.trend_7day?.direction?.toLowerCase() === 'up' ? '#dc2626' :
                                   rateData.trend_7day?.direction?.toLowerCase() === 'down' ? '#10b981' : '#3b82f6',
                    color: 'white'
                  }}>
                    {rateData.trend_7day?.direction}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* 30-Day Chart */}
            {rateData.historical_30day && rateData.historical_30day.length > 0 && (
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader className="border-b border-slate-100 pb-6">
                  <CardTitle>30-Day Rate History</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={rateData.historical_30day}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Market Conditions */}
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100 pb-6">
                <CardTitle>Market Conditions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="p-4 bg-slate-50 rounded-xl mb-4">
                      <p className="text-sm text-slate-600 mb-2">Supply/Demand Ratio</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {rateData.market_conditions?.supply_demand_ratio}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-600 mb-2">Capacity Status</p>
                      <Badge className={`${getCapacityColor(rateData.market_conditions?.capacity_status)} text-lg px-4 py-2`}>
                        {rateData.market_conditions?.capacity_status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 mb-3">Market Factors</h5>
                    <ul className="space-y-2">
                      {rateData.market_conditions?.factors?.map((factor, idx) => (
                        <li key={idx} className="text-sm text-slate-700 p-2 bg-blue-50 rounded">
                          • {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500">
              <CardHeader className="border-b border-indigo-200 pb-6">
                <CardTitle className="text-indigo-900">AI Rate Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-xs text-slate-600 mb-1">Suggested Shipper Rate</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      ${rateData.recommendations?.suggested_shipper_rate?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-xs text-slate-600 mb-1">Suggested Carrier Pay</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      ${rateData.recommendations?.suggested_carrier_pay?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl">
                    <p className="text-xs text-slate-600 mb-1">Expected Margin</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {rateData.recommendations?.expected_margin_pct?.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl">
                  <h5 className="font-semibold text-slate-900 mb-2">Booking Strategy</h5>
                  <p className="text-slate-700">{rateData.recommendations?.booking_advice}</p>
                </div>

                <div className="mt-4 p-4 bg-purple-100 rounded-xl">
                  <h5 className="font-semibold text-purple-900 mb-2">Competitive Intel</h5>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-purple-700">Typical Broker Margin</p>
                      <p className="font-bold text-purple-900">
                        {rateData.competitive_intel?.typical_broker_margin}%
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-700">Carrier Acceptance</p>
                      <p className="font-bold text-purple-900 capitalize">
                        {rateData.competitive_intel?.carrier_acceptance_likelihood}
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-700">Negotiation Leverage</p>
                      <p className="font-bold text-purple-900 capitalize">
                        {rateData.competitive_intel?.negotiation_leverage}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

      </div>
    </div>
  );
}