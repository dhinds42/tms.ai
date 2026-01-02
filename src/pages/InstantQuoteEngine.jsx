import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, 
  TrendingUp, 
  Award, 
  Loader2, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Truck, 
  DollarSign,
  Lightbulb,
  History,
  Star,
  CheckCircle,
  AlertTriangle,
  Package,
  Calendar,
  BarChart2,
  Target,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { PageHeader, EmptyState, FormField } from "@/components/design-system";

export default function InstantQuoteEngine() {
  const [quoting, setQuoting] = useState(false);
  const [quotes, setQuotes] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    equipment: 'dry_van',
    weight: '',
    pickup_date: '',
    commodity: '',
    special_requirements: ''
  });

  const queryClient = useQueryClient();

  const { data: savedQuotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 20),
    initialData: [],
  });

  const createQuoteMutation = useMutation({
    mutationFn: (quoteData) => base44.entities.Quote.create(quoteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });

  const generateInstantQuote = async () => {
    if (!formData.origin || !formData.destination) {
      alert('Please enter origin and destination');
      return;
    }

    setQuoting(true);
    setQuotes(null);
    
    try {
      const prompt = `Generate instant freight quotes for:
Origin: ${formData.origin}
Destination: ${formData.destination}
Equipment: ${formData.equipment}
Weight: ${formData.weight || 40000} lbs
Pickup: ${formData.pickup_date || 'ASAP'}
Commodity: ${formData.commodity || 'General Freight'}

Provide 3 pricing tiers (economy, standard, expedited) with realistic carrier recommendations, ETAs, and market insights. Include rate per mile calculation.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            economy: {
              type: "object",
              properties: {
                price: { type: "number" },
                transit_days: { type: "number" },
                carriers: { type: "array", items: { type: "string" } },
                rate_per_mile: { type: "number" },
                confidence: { type: "number" }
              }
            },
            standard: {
              type: "object",
              properties: {
                price: { type: "number" },
                transit_days: { type: "number" },
                carriers: { type: "array", items: { type: "string" } },
                rate_per_mile: { type: "number" },
                confidence: { type: "number" }
              }
            },
            expedited: {
              type: "object",
              properties: {
                price: { type: "number" },
                transit_days: { type: "number" },
                carriers: { type: "array", items: { type: "string" } },
                rate_per_mile: { type: "number" },
                confidence: { type: "number" }
              }
            },
            estimated_miles: { type: "number" },
            market_trend: { type: "string" },
            recommendation: { type: "string" }
          }
        }
      });

      setQuotes(result);
      setRecentQuotes(prev => [{
        ...formData,
        quotes: result,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 4)]);
    } catch (error) {
      alert('Failed to generate quote. Please try again.');
    } finally {
      setQuoting(false);
    }
  };

  const handleBookQuote = async (tier) => {
    const quoteData = {
      quote_number: `IQ-${Date.now().toString().slice(-6)}`,
      pickup_location: { city: formData.origin.split(',')[0]?.trim(), state: formData.origin.split(',')[1]?.trim() },
      dropoff_location: { city: formData.destination.split(',')[0]?.trim(), state: formData.destination.split(',')[1]?.trim() },
      equipment_type: formData.equipment,
      weight: parseInt(formData.weight) || 40000,
      pickup_date: formData.pickup_date,
      commodity: formData.commodity,
      quoted_rate: quotes[tier]?.price,
      estimated_cost: Math.round(quotes[tier]?.price * 0.85),
      margin: Math.round(quotes[tier]?.price * 0.15),
      status: 'pending',
      mode: 'TL',
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    await createQuoteMutation.mutateAsync(quoteData);
    alert(`Quote ${quoteData.quote_number} created successfully!`);
    setSelectedTier(null);
  };

  const popularLanes = [
    { origin: 'Chicago, IL', destination: 'Los Angeles, CA' },
    { origin: 'Dallas, TX', destination: 'Atlanta, GA' },
    { origin: 'New York, NY', destination: 'Miami, FL' },
    { origin: 'Seattle, WA', destination: 'Phoenix, AZ' },
  ];

  const tierConfig = {
    economy: { icon: Clock, color: 'blue', label: 'Economy', desc: 'Best price, flexible timing' },
    standard: { icon: CheckCircle, color: 'emerald', label: 'Standard', desc: 'Balanced price & speed' },
    expedited: { icon: Zap, color: 'purple', label: 'Expedited', desc: 'Fastest delivery' }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Instant Quote Engine"
        subtitle="AI-powered real-time rate shopping"
        icon={Zap}
        badge={<Badge className="bg-emerald-600">Live Rates</Badge>}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-4">

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar - Quick Actions & History */}
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
                  {popularLanes.map((lane, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFormData(prev => ({ ...prev, origin: lane.origin, destination: lane.destination }))}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span className="truncate">{lane.origin}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{lane.destination}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quotes */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 max-h-[200px] overflow-y-auto">
                {recentQuotes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">No searches yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentQuotes.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, origin: q.origin, destination: q.destination, equipment: q.equipment }));
                          setQuotes(q.quotes);
                        }}
                        className="w-full text-left p-2 bg-slate-50 rounded-lg text-xs hover:bg-slate-100"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-medium truncate">{q.origin}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="font-medium truncate">{q.destination}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>${q.quotes?.standard?.price?.toLocaleString() || 'N/A'}</span>
                          <span>{format(new Date(q.timestamp), 'h:mm a')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <p className="text-xs font-medium text-slate-600 mb-2">Today's Activity</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-emerald-600">{recentQuotes.length}</p>
                    <p className="text-xs text-emerald-700">Quotes</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-600">{savedQuotes.filter(q => q.status === 'pending').length}</p>
                    <p className="text-xs text-blue-700">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Quote Form & Results */}
          <div className="lg:col-span-6 space-y-3">
            
            {/* Quote Form */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-green-50">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Get Instant Quote
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField label="Origin City, State" required>
                    <Input
                      value={formData.origin}
                      onChange={(e) => setFormData({...formData, origin: e.target.value})}
                      placeholder="Chicago, IL"
                      className="h-9 text-sm"
                    />
                  </FormField>
                  <FormField label="Destination City, State" required>
                    <Input
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      placeholder="Los Angeles, CA"
                      className="h-9 text-sm"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FormField label="Equipment">
                    <Select value={formData.equipment} onValueChange={(v) => setFormData({...formData, equipment: v})}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry_van">Dry Van</SelectItem>
                        <SelectItem value="reefer">Reefer</SelectItem>
                        <SelectItem value="flatbed">Flatbed</SelectItem>
                        <SelectItem value="step_deck">Step Deck</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Weight" helper="lbs">
                    <Input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="40000"
                      className="h-9 text-sm"
                    />
                  </FormField>
                  <FormField label="Pickup Date">
                    <Input
                      type="date"
                      value={formData.pickup_date}
                      onChange={(e) => setFormData({...formData, pickup_date: e.target.value})}
                      className="h-9 text-sm"
                    />
                  </FormField>
                  <FormField label="Commodity">
                    <Input
                      value={formData.commodity}
                      onChange={(e) => setFormData({...formData, commodity: e.target.value})}
                      placeholder="General"
                      className="h-9 text-sm"
                    />
                  </FormField>
                </div>

                <Button
                  onClick={generateInstantQuote}
                  disabled={quoting || !formData.origin || !formData.destination}
                  className="w-full h-10 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                >
                  {quoting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Quotes...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Get Instant Quotes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Quote Results */}
            {quotes && (
              <div className="space-y-3">
                {/* Market Insight Banner */}
                {quotes.recommendation && (
                  <Card className="border border-indigo-200 bg-indigo-50 shadow-sm">
                    <CardContent className="p-3 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-semibold text-indigo-900">AI Recommendation</p>
                        <p className="text-indigo-700">{quotes.recommendation}</p>
                        {quotes.market_trend && (
                          <Badge variant="outline" className="mt-1 text-indigo-600 border-indigo-300">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {quotes.market_trend}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pricing Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['economy', 'standard', 'expedited'].map((tier) => {
                    const config = tierConfig[tier];
                    const TierIcon = config.icon;
                    const isSelected = selectedTier === tier;
                    const isRecommended = tier === 'standard';

                    return (
                      <Card 
                        key={tier} 
                        className={`border-2 cursor-pointer transition-all ${
                          isSelected ? `border-${config.color}-500 shadow-lg` : 
                          isRecommended ? `border-${config.color}-300 shadow-md` : 
                          'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedTier(tier)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <TierIcon className={`w-4 h-4 text-${config.color}-600`} />
                              <span className="font-semibold text-sm capitalize">{config.label}</span>
                            </div>
                            {isRecommended && (
                              <Badge className="bg-emerald-100 text-emerald-700 text-xs">Best Value</Badge>
                            )}
                          </div>
                          
                          <div className="text-2xl font-bold text-slate-900 mb-1">
                            ${quotes[tier]?.price?.toLocaleString() || '—'}
                          </div>
                          
                          <div className="space-y-1 text-xs text-slate-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{quotes[tier]?.transit_days || '—'} days transit</span>
                            </div>
                            {quotes[tier]?.rate_per_mile && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span>${quotes[tier].rate_per_mile.toFixed(2)}/mi</span>
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mb-3">{config.desc}</p>

                          <Button 
                            size="sm" 
                            className={`w-full h-8 text-xs ${
                              isSelected ? `bg-${config.color}-600 hover:bg-${config.color}-700` : ''
                            }`}
                            variant={isSelected ? 'default' : 'outline'}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookQuote(tier);
                            }}
                            disabled={createQuoteMutation.isPending}
                          >
                            {createQuoteMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Book This Rate'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Route Summary */}
                {quotes.estimated_miles && (
                  <Card className="border border-slate-200 shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium">{formData.origin}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{formData.destination}</span>
                          </div>
                        </div>
                        <Badge variant="outline">{quotes.estimated_miles?.toLocaleString()} miles</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Empty State */}
            {!quotes && !quoting && (
              <EmptyState
                icon={Zap}
                title="Ready to Quote"
                description="Enter origin and destination to get instant rates"
              />
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
                
                {/* Rate Tip */}
                <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <p className="font-semibold text-emerald-900">Market Tip</p>
                  </div>
                  <p className="text-emerald-700">Mid-week pickups typically have 5-10% lower rates than Monday/Friday</p>
                </div>

                {/* Equipment Tip */}
                <div className="p-2 bg-white rounded-lg border border-blue-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Truck className="w-3 h-3 text-blue-600" />
                    <p className="font-semibold text-blue-900">Equipment</p>
                  </div>
                  <p className="text-blue-700">Dry van has highest availability and best rates for most lanes</p>
                </div>

                {/* Timing Tip */}
                <div className="p-2 bg-white rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3 h-3 text-amber-600" />
                    <p className="font-semibold text-amber-900">Book Ahead</p>
                  </div>
                  <p className="text-amber-700">Booking 3-5 days ahead can save 8-12% on average</p>
                </div>

                {/* Lane Analysis */}
                <div className="p-2 bg-white rounded-lg border border-indigo-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BarChart2 className="w-3 h-3 text-indigo-600" />
                    <p className="font-semibold text-indigo-900">Lane Analysis</p>
                  </div>
                  <p className="text-indigo-700">Compare multiple lanes to find backhaul opportunities</p>
                </div>

                {/* Volume Discount */}
                <div className="p-2 bg-white rounded-lg border border-purple-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="w-3 h-3 text-purple-600" />
                    <p className="font-semibold text-purple-900">Volume Savings</p>
                  </div>
                  <p className="text-purple-700">Regular lanes may qualify for contracted rates - ask about volume discounts</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Saved Quotes */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Package className="w-3.5 h-3.5 text-slate-600" />
                  Saved Quotes
                  <Badge variant="secondary" className="ml-auto text-xs">{savedQuotes.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 max-h-[200px] overflow-y-auto">
                {savedQuotes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">No saved quotes yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {savedQuotes.slice(0, 5).map((q) => (
                      <div key={q.id} className="p-2 bg-slate-50 rounded-lg text-xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-slate-900">{q.quote_number}</span>
                          <Badge className={`text-xs px-1 py-0 h-4 ${
                            q.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                            q.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {q.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="truncate">{q.pickup_location?.city} → {q.dropoff_location?.city}</span>
                          <span className="font-medium text-emerald-600">${q.quoted_rate?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    onClick={() => setFormData({ origin: '', destination: '', equipment: 'dry_van', weight: '', pickup_date: '', commodity: '', special_requirements: '' })}
                  >
                    <RefreshCw className="w-3 h-3 mr-1.5 text-slate-600" />
                    Clear Form
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs justify-start"
                  >
                    <History className="w-3 h-3 mr-1.5 text-indigo-600" />
                    View All Quotes
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