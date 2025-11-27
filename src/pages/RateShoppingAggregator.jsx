import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  TrendingDown, 
  TrendingUp,
  Award, 
  Loader2,
  MapPin,
  ArrowRight,
  Clock,
  Truck,
  Star,
  Lightbulb,
  History,
  CheckCircle,
  BarChart2,
  Percent,
  RefreshCw,
  Filter
} from "lucide-react";
import { format } from "date-fns";

export default function RateShoppingAggregator() {
  const [shopping, setShopping] = useState(false);
  const [rates, setRates] = useState([]);
  const [sortBy, setSortBy] = useState('rate');
  const [recentSearches, setRecentSearches] = useState([]);
  const [lane, setLane] = useState({ 
    origin: '', 
    destination: '', 
    equipment: 'dry_van',
    weight: '',
    pickup_date: ''
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 50),
    initialData: [],
  });

  const shopRates = async () => {
    if (!lane.origin || !lane.destination) {
      alert('Please enter origin and destination');
      return;
    }

    setShopping(true);
    setRates([]);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Get competitive freight rate quotes from multiple carriers for:
Origin: ${lane.origin}
Destination: ${lane.destination}
Equipment: ${lane.equipment}
Weight: ${lane.weight || 40000} lbs
Pickup Date: ${lane.pickup_date || 'ASAP'}

Provide 6 realistic carrier quotes with pricing, transit time, carrier rating, on-time percentage, and service level. Include rate per mile.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            quotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  carrier: { type: "string" },
                  rate: { type: "number" },
                  rate_per_mile: { type: "number" },
                  transit_days: { type: "number" },
                  rating: { type: "number" },
                  on_time_percent: { type: "number" },
                  service_level: { type: "string" }
                }
              }
            },
            estimated_miles: { type: "number" },
            market_average: { type: "number" },
            market_trend: { type: "string" }
          }
        }
      });
      setRates(result.quotes || []);
      setRecentSearches(prev => [{
        ...lane,
        quotes: result.quotes,
        market_average: result.market_average,
        estimated_miles: result.estimated_miles,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 4)]);
    } catch (error) {
      alert('Rate shopping failed. Please try again.');
    } finally {
      setShopping(false);
    }
  };

  const popularLanes = [
    { origin: 'Los Angeles, CA', destination: 'Dallas, TX' },
    { origin: 'Chicago, IL', destination: 'Atlanta, GA' },
    { origin: 'New York, NY', destination: 'Chicago, IL' },
    { origin: 'Houston, TX', destination: 'Phoenix, AZ' },
  ];

  const sortedRates = [...rates].sort((a, b) => {
    if (sortBy === 'rate') return a.rate - b.rate;
    if (sortBy === 'transit') return a.transit_days - b.transit_days;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const lowestRate = rates.length > 0 ? Math.min(...rates.map(r => r.rate)) : 0;
  const highestRate = rates.length > 0 ? Math.max(...rates.map(r => r.rate)) : 0;
  const avgRate = rates.length > 0 ? Math.round(rates.reduce((sum, r) => sum + r.rate, 0) / rates.length) : 0;
  const savings = highestRate - lowestRate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Rate Shopping</h1>
              <p className="text-xs text-slate-500">Compare rates across carriers in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600">Live Rates</Badge>
            <Badge variant="outline" className="text-slate-600">{carriers.length} carriers</Badge>
          </div>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar - Quick Lanes & History */}
          <div className="lg:col-span-3 space-y-3">
            
            {/* Popular Lanes */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  Popular Lanes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {popularLanes.map((l, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLane(prev => ({ ...prev, origin: l.origin, destination: l.destination }))}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span className="truncate">{l.origin}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{l.destination}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 max-h-[180px] overflow-y-auto">
                {recentSearches.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">No recent searches</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentSearches.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setLane(prev => ({ ...prev, origin: s.origin, destination: s.destination, equipment: s.equipment }));
                          setRates(s.quotes || []);
                        }}
                        className="w-full text-left p-2 bg-slate-50 rounded-lg text-xs hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-medium truncate">{s.origin}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="font-medium truncate">{s.destination}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>{s.quotes?.length || 0} quotes</span>
                          <span>{format(new Date(s.timestamp), 'h:mm a')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            {rates.length > 0 && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-2.5">
                  <p className="text-xs font-medium text-slate-600 mb-2">Rate Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                      <span className="text-xs text-emerald-700">Lowest</span>
                      <span className="text-sm font-bold text-emerald-600">${lowestRate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                      <span className="text-xs text-blue-700">Average</span>
                      <span className="text-sm font-bold text-blue-600">${avgRate.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                      <span className="text-xs text-amber-700">Savings</span>
                      <span className="text-sm font-bold text-amber-600">${savings.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area - Search & Results */}
          <div className="lg:col-span-6 space-y-3">
            
            {/* Search Form */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Search className="w-4 h-4 text-blue-600" />
                  Search Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Origin City, State</Label>
                    <Input
                      value={lane.origin}
                      onChange={(e) => setLane({...lane, origin: e.target.value})}
                      placeholder="Los Angeles, CA"
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Destination City, State</Label>
                    <Input
                      value={lane.destination}
                      onChange={(e) => setLane({...lane, destination: e.target.value})}
                      placeholder="Dallas, TX"
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Equipment</Label>
                    <Select value={lane.equipment} onValueChange={(v) => setLane({...lane, equipment: v})}>
                      <SelectTrigger className="mt-1 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry_van">Dry Van</SelectItem>
                        <SelectItem value="reefer">Reefer</SelectItem>
                        <SelectItem value="flatbed">Flatbed</SelectItem>
                        <SelectItem value="step_deck">Step Deck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Weight (lbs)</Label>
                    <Input
                      type="number"
                      value={lane.weight}
                      onChange={(e) => setLane({...lane, weight: e.target.value})}
                      placeholder="40000"
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Pickup Date</Label>
                    <Input
                      type="date"
                      value={lane.pickup_date}
                      onChange={(e) => setLane({...lane, pickup_date: e.target.value})}
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={shopRates}
                  disabled={shopping || !lane.origin || !lane.destination}
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {shopping ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Shopping Rates...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Shop Rates
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {rates.length > 0 && (
              <div className="space-y-3">
                {/* Sort & Filter Bar */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs text-slate-600">{rates.length} quotes found</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Sort:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rate">Price</SelectItem>
                        <SelectItem value="transit">Transit</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quote Cards */}
                <div className="space-y-2">
                  {sortedRates.map((quote, idx) => {
                    const isBest = quote.rate === lowestRate;
                    const isFastest = quote.transit_days === Math.min(...rates.map(r => r.transit_days));
                    
                    return (
                      <Card 
                        key={idx} 
                        className={`border-2 transition-all hover:shadow-md ${
                          isBest ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200'
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Truck className="w-4 h-4 text-slate-600" />
                                <span className="font-semibold text-sm">{quote.carrier}</span>
                                {isBest && <Badge className="bg-emerald-600 text-xs px-1.5 py-0">Best Price</Badge>}
                                {isFastest && !isBest && <Badge className="bg-blue-600 text-xs px-1.5 py-0">Fastest</Badge>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {quote.transit_days} days
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-500" />
                                  {quote.rating}/5
                                </span>
                                {quote.on_time_percent && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    {quote.on_time_percent}% on-time
                                  </span>
                                )}
                                {quote.service_level && (
                                  <Badge variant="outline" className="text-xs">{quote.service_level}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xl font-bold text-blue-600">${quote.rate?.toLocaleString()}</p>
                              {quote.rate_per_mile && (
                                <p className="text-xs text-slate-500">${quote.rate_per_mile?.toFixed(2)}/mi</p>
                              )}
                              <Button size="sm" className="mt-1.5 h-7 text-xs bg-blue-600 hover:bg-blue-700">
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {rates.length === 0 && !shopping && (
              <Card className="border border-dashed border-slate-300 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">Ready to Shop</h3>
                  <p className="text-sm text-slate-500">Enter origin and destination to compare carrier rates</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - AI Recommendations */}
          <div className="lg:col-span-3 space-y-3">
            
            {/* AI Recommendations */}
            <Card className="border border-purple-200 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="py-2.5 px-3 border-b border-purple-200 bg-purple-100/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 space-y-2">
                
                {/* Best Value */}
                <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Award className="w-3 h-3 text-emerald-600" />
                    <p className="font-semibold text-emerald-900">Best Value Tip</p>
                  </div>
                  <p className="text-emerald-700">Compare at least 5 carriers to ensure you're getting the best rate</p>
                </div>

                {/* Market Insight */}
                <div className="p-2 bg-white rounded-lg border border-blue-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown className="w-3 h-3 text-blue-600" />
                    <p className="font-semibold text-blue-900">Market Insight</p>
                  </div>
                  <p className="text-blue-700">Spot rates are typically 10-15% lower mid-week vs Monday/Friday</p>
                </div>

                {/* Carrier Quality */}
                <div className="p-2 bg-white rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star className="w-3 h-3 text-amber-600" />
                    <p className="font-semibold text-amber-900">Carrier Quality</p>
                  </div>
                  <p className="text-amber-700">Consider on-time % and rating along with price for best results</p>
                </div>

                {/* Negotiation Tip */}
                <div className="p-2 bg-white rounded-lg border border-indigo-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Percent className="w-3 h-3 text-indigo-600" />
                    <p className="font-semibold text-indigo-900">Negotiation</p>
                  </div>
                  <p className="text-indigo-700">Use the lowest quote as leverage when negotiating with preferred carriers</p>
                </div>

                {/* Volume Discount */}
                <div className="p-2 bg-white rounded-lg border border-purple-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BarChart2 className="w-3 h-3 text-purple-600" />
                    <p className="font-semibold text-purple-900">Volume Savings</p>
                  </div>
                  <p className="text-purple-700">Frequent lanes may qualify for contracted rates - ask about volume discounts</p>
                </div>

                {/* Service Level */}
                <div className="p-2 bg-white rounded-lg border border-cyan-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Truck className="w-3 h-3 text-cyan-600" />
                    <p className="font-semibold text-cyan-900">Service Levels</p>
                  </div>
                  <p className="text-cyan-700">Expedited service adds 15-25% but guarantees faster delivery</p>
                </div>
              </CardContent>
            </Card>

            {/* Market Trends */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Dry Van</span>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <TrendingDown className="w-3 h-3" />
                      <span>-3.2%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Reefer</span>
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingUp className="w-3 h-3" />
                      <span>+5.1%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Flatbed</span>
                    <div className="flex items-center gap-1 text-slate-600">
                      <ArrowRight className="w-3 h-3" />
                      <span>+0.5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <p className="text-xs font-medium text-slate-600 mb-2">Quick Actions</p>
                <div className="space-y-1.5">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs justify-start"
                    onClick={() => {
                      setLane({ origin: '', destination: '', equipment: 'dry_van', weight: '', pickup_date: '' });
                      setRates([]);
                    }}
                  >
                    <RefreshCw className="w-3 h-3 mr-1.5 text-slate-600" />
                    Clear Search
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs justify-start"
                  >
                    <Filter className="w-3 h-3 mr-1.5 text-indigo-600" />
                    Advanced Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}