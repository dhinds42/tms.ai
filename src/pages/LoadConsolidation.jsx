import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Layers, 
  TrendingUp, 
  Package, 
  Brain, 
  Search, 
  RefreshCw, 
  Lightbulb, 
  Zap, 
  MapPin, 
  Calendar, 
  Truck,
  DollarSign,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Target,
  Clock,
  Leaf,
  Filter
} from "lucide-react";

import LoadOptimizer from "../components/optimization/LoadOptimizer";

export default function LoadConsolidation() {
  const [analyzing, setAnalyzing] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: loads } = useScopedEntity('Load', { limit: 100 });

  const pendingLoads = loads.filter(l => ['available', 'pending', 'tendered'].includes(l.status));
  const potentialSavings = opportunities.reduce((sum, o) => sum + (o.savings_potential || 0), 0);

  const findConsolidationOpportunities = async () => {
    setAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these loads for consolidation opportunities:
${JSON.stringify(loads.slice(0, 20).map(l => ({
  id: l.id,
  origin: l.pickup_location?.city,
  destination: l.dropoff_location?.city,
  weight: l.weight,
  pickup_date: l.pickup_date
})))}

Find loads that can be consolidated based on similar lanes and timing.`,
        response_json_schema: {
          type: "object",
          properties: {
            opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  load_ids: { type: "array", items: { type: "string" } },
                  combined_weight: { type: "number" },
                  savings_potential: { type: "number" },
                  lane: { type: "string" },
                  utilization: { type: "number" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });
      setOpportunities(result.opportunities || []);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Load Consolidation AI</h1>
                  <p className="text-purple-200 text-base mt-1">Smart grouping to maximize trailer utilization & reduce costs</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-emerald-500/90 text-white border-0 px-3 py-1 text-sm font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  AI Powered
                </Badge>
                <Badge className="bg-purple-500/90 text-white border-0 px-3 py-1 text-sm font-medium">
                  {pendingLoads.length} Loads Available
                </Badge>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search loads by origin, destination, or load number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-0 shadow-lg rounded-xl"
                />
              </div>
              <Button
                onClick={findConsolidationOpportunities}
                disabled={analyzing}
                className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl shadow-lg"
              >
                {analyzing ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Brain className="w-5 h-5 mr-2" />}
                {analyzing ? 'Analyzing...' : 'Find Opportunities'}
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{pendingLoads.length}</p>
                <p className="text-xs text-slate-500">Available</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{opportunities.length}</p>
                <p className="text-xs text-slate-500">Opportunities</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">${potentialSavings.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Savings</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">{Math.round(opportunities.length * 1.5)}</p>
                <p className="text-xs text-slate-500">Trucks Saved</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{(opportunities.length * 2.5).toFixed(1)}t</p>
                <p className="text-xs text-slate-500">CO₂ Saved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Opportunities List - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Consolidation Opportunities
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-1" /> Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {opportunities.length > 0 ? (
                  <div className="space-y-3">
                    {opportunities.map((opp, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-purple-900">{opp.lane}</span>
                              <Badge className={opp.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                                {opp.priority || 'Medium'} Priority
                              </Badge>
                            </div>
                            <p className="text-sm text-purple-700">{opp.load_ids?.length || 2} loads can be combined</p>
                          </div>
                          <Badge className="bg-emerald-600 text-white text-base px-3 py-1">
                            Save ${(opp.savings_potential || 0).toLocaleString()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div className="text-center p-2 bg-white/70 rounded-lg">
                            <p className="text-lg font-bold text-slate-900">{(opp.combined_weight || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Combined lbs</p>
                          </div>
                          <div className="text-center p-2 bg-white/70 rounded-lg">
                            <p className="text-lg font-bold text-slate-900">{opp.utilization || 85}%</p>
                            <p className="text-xs text-slate-500">Utilization</p>
                          </div>
                          <div className="text-center p-2 bg-white/70 rounded-lg">
                            <p className="text-lg font-bold text-emerald-600">{((opp.savings_potential || 0) * 0.15).toFixed(1)}t</p>
                            <p className="text-xs text-slate-500">CO₂ Saved</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                            <CheckCircle className="w-4 h-4 mr-1" /> Consolidate
                          </Button>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layers className="w-10 h-10 text-purple-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Opportunities Yet</h3>
                    <p className="text-slate-500 mb-4">Click "Find Opportunities" to analyze your loads</p>
                    <Button onClick={findConsolidationOpportunities} disabled={analyzing} className="bg-purple-600">
                      <Brain className="w-4 h-4 mr-2" />
                      Analyze Loads
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Load Optimizer */}
            <LoadOptimizer />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            
            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                  <Lightbulb className="w-4 h-4" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingLoads.length > 5 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">📦 High Volume Detected</p>
                    <p className="text-xs text-amber-700">{pendingLoads.length} loads available. Run analysis to find savings.</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">🎯 Same-Day Grouping</p>
                  <p className="text-xs text-purple-700">Group loads with same pickup date for max efficiency.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">🛤️ Lane Optimization</p>
                  <p className="text-xs text-purple-700">Combine loads on similar routes to reduce deadhead.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">⚖️ Weight Balancing</p>
                  <p className="text-xs text-purple-700">Target 85-95% trailer capacity for best ROI.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">🌱 Sustainability Impact</p>
                  <p className="text-xs text-emerald-700">Each consolidation saves ~2.5 tons of CO₂ emissions.</p>
                </div>
              </CardContent>
            </Card>

            {/* Consolidation Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Consolidation Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Avg Trailer Utilization</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Consolidation Rate</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Cost Reduction</span>
                    <span className="font-medium text-emerald-600">18%</span>
                  </div>
                  <Progress value={18} className="h-2" />
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
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Brain className="w-4 h-4 mr-2 text-purple-600" /> Auto-Consolidate All
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" /> Group by Date
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <MapPin className="w-4 h-4 mr-2 text-emerald-600" /> Group by Lane
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <TrendingUp className="w-4 h-4 mr-2 text-amber-600" /> View Savings Report
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
                <p>• Consolidate LTL shipments under 10,000 lbs</p>
                <p>• Target 85%+ trailer utilization</p>
                <p>• Group shipments within 50-mile radius</p>
                <p>• Match compatible commodity types</p>
                <p>• Consider pickup time windows</p>
                <p>• Check temperature requirements</p>
              </CardContent>
            </Card>

            {/* Weekly Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <TrendingUp className="w-4 h-4" /> This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Loads Consolidated</span>
                  <span className="font-bold text-emerald-700">24</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Total Savings</span>
                  <span className="font-bold text-emerald-700">$8,450</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Trucks Reduced</span>
                  <span className="font-bold text-emerald-700">12</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}