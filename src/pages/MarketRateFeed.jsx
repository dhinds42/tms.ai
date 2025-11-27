import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, RefreshCw, DollarSign, Loader2, Search, Activity, Lightbulb, Zap, Target, BarChart3, ArrowUpRight, Clock, Truck, Download } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-emerald-800 to-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Market Rate Feed</h1>
                  <p className="text-emerald-200 text-base mt-1">Real-time spot & contract rate intelligence</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-emerald-500/90 text-white border-0 px-3 py-1 text-sm font-medium flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Live Data
                </Badge>
                <Badge className="bg-purple-500/90 text-white border-0 px-3 py-1 text-sm font-medium">
                  AI Powered
                </Badge>
              </div>
            </div>

            {/* Search Form */}
            <div className="grid md:grid-cols-5 gap-3">
              <Input
                placeholder="Origin (e.g., Chicago, IL)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="h-12 border-0 shadow-lg rounded-xl"
              />
              <Input
                placeholder="Destination (e.g., Atlanta, GA)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="h-12 border-0 shadow-lg rounded-xl"
              />
              <Select value={equipmentType} onValueChange={setEquipmentType}>
                <SelectTrigger className="h-12 border-0 shadow-lg rounded-xl bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry_van">Dry Van</SelectItem>
                  <SelectItem value="reefer">Reefer</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="step_deck">Step Deck / Drop Deck</SelectItem>
                  <SelectItem value="cargo_van">Cargo Van</SelectItem>
                  <SelectItem value="hotshot">Hotshot</SelectItem>
                  <SelectItem value="auto_carrier">Auto Carrier</SelectItem>
                  <SelectItem value="tanker">Tanker Truck</SelectItem>
                  <SelectItem value="dump_truck">Dump Truck</SelectItem>
                  <SelectItem value="box_truck">Box Truck / Straight Truck</SelectItem>
                  <SelectItem value="lowboy">Lowboy</SelectItem>
                  <SelectItem value="pickup_truck">Pickup Truck</SelectItem>
                  <SelectItem value="container_ship">Container Ship</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={fetchMarketRates}
                disabled={isLoading}
                className="h-12 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Get Rates
                  </>
                )}
              </Button>
              <Button variant="outline" className="h-12 bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl">
                <Download className="w-5 h-5 mr-2" /> Export
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{rateData?.spot_rate?.rate_per_mile?.toFixed(2) || '—'}</p>
                <p className="text-xs text-slate-500">Spot $/mi</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{rateData?.contract_rate?.rate_per_mile?.toFixed(2) || '—'}</p>
                <p className="text-xs text-slate-500">Contract $/mi</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{rateData?.recommendations?.expected_margin_pct?.toFixed(0) || '—'}%</p>
                <p className="text-xs text-slate-500">Margin</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600 capitalize">{rateData?.market_conditions?.capacity_status || '—'}</p>
                <p className="text-xs text-slate-500">Capacity</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-cyan-600">{rateData?.trend_7day?.percentage_change ? `${rateData.trend_7day.percentage_change > 0 ? '+' : ''}${rateData.trend_7day.percentage_change.toFixed(1)}%` : '—'}</p>
                <p className="text-xs text-slate-500">7-Day Trend</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Rate Data */}
          <div className="lg:col-span-2 space-y-4">

        {rateData ? (
          <>
            {/* Current Rates */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-emerald-900">Spot Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-3">
                    <p className="text-3xl font-bold text-emerald-600">
                      ${rateData.spot_rate?.rate_per_mile?.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-600">per mile</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg text-center">
                    <p className="text-xs text-slate-600">All-in</p>
                    <p className="text-lg font-bold text-emerald-600">
                      ${rateData.spot_rate?.all_in_rate?.toLocaleString()}
                    </p>
                  </div>
                  <Badge className="mt-2 bg-emerald-600 text-white w-full justify-center text-xs">
                    {rateData.spot_rate?.confidence}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-900">Contract Benchmark</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-3">
                    <p className="text-3xl font-bold text-blue-600">
                      ${rateData.contract_rate?.rate_per_mile?.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-600">per mile</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg text-center">
                    <p className="text-xs text-slate-600">Stability</p>
                    <p className="text-lg font-bold text-blue-600">
                      {rateData.contract_rate?.stability_score}/100
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-900">7-Day Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-3">
                    {getTrendIcon(rateData.trend_7day?.direction)}
                    <span className="text-3xl font-bold ml-2" style={{
                      color: rateData.trend_7day?.direction?.toLowerCase() === 'up' ? '#dc2626' :
                             rateData.trend_7day?.direction?.toLowerCase() === 'down' ? '#10b981' : '#3b82f6'
                    }}>
                      {rateData.trend_7day?.percentage_change > 0 ? '+' : ''}
                      {rateData.trend_7day?.percentage_change?.toFixed(1)}%
                    </span>
                  </div>
                  <Badge className="w-full justify-center capitalize text-xs" style={{
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
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">30-Day Rate History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={rateData.historical_30day}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Market Conditions */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Market Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">Supply/Demand</p>
                      <p className="text-lg font-bold text-slate-900">
                        {rateData.market_conditions?.supply_demand_ratio}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-600">Capacity</p>
                      <Badge className={`${getCapacityColor(rateData.market_conditions?.capacity_status)} text-sm`}>
                        {rateData.market_conditions?.capacity_status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Market Factors</p>
                    <ul className="space-y-1">
                      {rateData.market_conditions?.factors?.slice(0, 4).map((factor, idx) => (
                        <li key={idx} className="text-xs text-slate-700 p-2 bg-blue-50 rounded">
                          • {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-indigo-900">AI Rate Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-xs text-slate-600">Shipper Rate</p>
                    <p className="text-xl font-bold text-indigo-600">
                      ${rateData.recommendations?.suggested_shipper_rate?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-xs text-slate-600">Carrier Pay</p>
                    <p className="text-xl font-bold text-emerald-600">
                      ${rateData.recommendations?.suggested_carrier_pay?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg text-center">
                    <p className="text-xs text-slate-600">Margin</p>
                    <p className="text-xl font-bold text-purple-600">
                      {rateData.recommendations?.expected_margin_pct?.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg mb-3">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Booking Strategy</p>
                  <p className="text-xs text-slate-600">{rateData.recommendations?.booking_advice}</p>
                </div>

                <div className="p-3 bg-purple-100 rounded-lg">
                  <p className="text-xs font-semibold text-purple-900 mb-2">Competitive Intel</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-purple-700">Broker Margin</p>
                      <p className="font-bold text-purple-900">{rateData.competitive_intel?.typical_broker_margin}%</p>
                    </div>
                    <div>
                      <p className="text-purple-700">Acceptance</p>
                      <p className="font-bold text-purple-900 capitalize">{rateData.competitive_intel?.carrier_acceptance_likelihood}</p>
                    </div>
                    <div>
                      <p className="text-purple-700">Leverage</p>
                      <p className="font-bold text-purple-900 capitalize">{rateData.competitive_intel?.negotiation_leverage}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Get Market Rates</h3>
              <p className="text-sm text-slate-500">Enter origin, destination, and equipment type above</p>
            </CardContent>
          </Card>
        )}

          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <Lightbulb className="w-4 h-4" /> AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">📊 Rate Strategy</p>
                  <p className="text-xs text-emerald-700">Check rates before quoting to maximize margin.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">⏰ Timing Matters</p>
                  <p className="text-xs text-emerald-700">Book early in week for better carrier rates.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">🎯 Lane Focus</p>
                  <p className="text-xs text-emerald-700">Compare spot vs contract for each lane.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                  <p className="text-xs font-semibold text-amber-900 mb-1">📈 Trend Alerts</p>
                  <p className="text-xs text-amber-700">Lock rates when trend shows upward movement.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-1">✅ Best Practice</p>
                  <p className="text-xs text-blue-700">Use 30-day history to set competitive quotes.</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Market Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Rate Accuracy</span>
                    <span className="font-medium text-emerald-600">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Data Freshness</span>
                    <span className="font-medium">Real-time</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Market Coverage</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={fetchMarketRates} disabled={isLoading || !origin || !destination}>
                  <RefreshCw className="w-4 h-4 mr-2 text-emerald-600" /> Refresh Rates
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Download className="w-4 h-4 mr-2 text-blue-600" /> Export Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Target className="w-4 h-4 mr-2 text-purple-600" /> Set Rate Alert
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <TrendingUp className="w-4 h-4 mr-2 text-amber-600" /> View Trends
                </Button>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" /> Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>• Check rates before quoting</p>
                <p>• Compare spot vs contract</p>
                <p>• Monitor 7-day trends</p>
                <p>• Factor in fuel surcharge</p>
                <p>• Consider capacity status</p>
                <p>• Lock rates when favorable</p>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
                  <TrendingUp className="w-4 h-4" /> Rate Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Spot Rate</span>
                  <span className="font-bold text-emerald-700">${rateData?.spot_rate?.rate_per_mile?.toFixed(2) || '—'}/mi</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Contract</span>
                  <span className="font-bold text-blue-700">${rateData?.contract_rate?.rate_per_mile?.toFixed(2) || '—'}/mi</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Margin</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-purple-700">{rateData?.recommendations?.expected_margin_pct?.toFixed(0) || '—'}%</span>
                    {rateData && <ArrowUpRight className="w-3 h-3 text-emerald-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}