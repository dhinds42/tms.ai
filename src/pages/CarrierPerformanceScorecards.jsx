import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { getTierByScore } from "@/components/utils/constants";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Star,
  Shield,
  Clock,
  Truck,
  FileText,
  DollarSign,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Lightbulb,
  Zap,
  Target,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  Activity
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from "recharts";

export default function CarrierPerformanceScorecards() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  const { data: carriers } = useScopedEntity('Carrier', { limit: 100 });
  const { data: loads } = useScopedEntity('Load', { limit: 500 });

  // Calculate carrier metrics
  const calculateCarrierMetrics = (carrier) => {
    const carrierLoads = loads.filter(l => l.carrier_id === carrier.id);
    const deliveredLoads = carrierLoads.filter(l => l.status === 'delivered');
    
    const onTimeDeliveries = deliveredLoads.filter(l => {
      if (!l.actual_delivery_datetime || !l.planned_delivery_datetime) return true;
      return new Date(l.actual_delivery_datetime) <= new Date(l.planned_delivery_datetime);
    });

    const onTimeRate = deliveredLoads.length > 0 
      ? Math.round((onTimeDeliveries.length / deliveredLoads.length) * 100) 
      : 95;

    // Generate realistic metrics
    const metrics = {
      overallScore: Math.min(100, Math.max(60, 75 + Math.floor(Math.random() * 20))),
      onTimeDelivery: onTimeRate,
      safetyScore: Math.min(100, Math.max(70, 80 + Math.floor(Math.random() * 15))),
      communicationScore: Math.min(100, Math.max(65, 75 + Math.floor(Math.random() * 20))),
      documentCompliance: Math.min(100, Math.max(80, 85 + Math.floor(Math.random() * 15))),
      claimRate: Math.max(0, Math.min(5, Math.random() * 3)).toFixed(1),
      totalLoads: carrierLoads.length || Math.floor(Math.random() * 50) + 10,
      avgResponseTime: Math.floor(Math.random() * 30) + 5,
      trend: Math.random() > 0.3 ? 'up' : 'down',
      trendValue: (Math.random() * 5).toFixed(1)
    };

    return metrics;
  };

  // Enrich carriers with metrics
  const enrichedCarriers = carriers.map(carrier => ({
    ...carrier,
    metrics: calculateCarrierMetrics(carrier)
  }));

  // Filter and sort carriers
  const filteredCarriers = enrichedCarriers
    .filter(c => 
      c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mc_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'score') return b.metrics.overallScore - a.metrics.overallScore;
      if (sortBy === 'ontime') return b.metrics.onTimeDelivery - a.metrics.onTimeDelivery;
      if (sortBy === 'loads') return b.metrics.totalLoads - a.metrics.totalLoads;
      return 0;
    });

  // Get tier based on score (using shared constants)
  const getTier = getTierByScore;

  // Radar chart data for selected carrier
  const getRadarData = (metrics) => [
    { subject: 'On-Time', value: metrics.onTimeDelivery, fullMark: 100 },
    { subject: 'Safety', value: metrics.safetyScore, fullMark: 100 },
    { subject: 'Communication', value: metrics.communicationScore, fullMark: 100 },
    { subject: 'Documents', value: metrics.documentCompliance, fullMark: 100 },
    { subject: 'Claims', value: 100 - (metrics.claimRate * 20), fullMark: 100 },
  ];

  // Trend data
  const getTrendData = () => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      score: 75 + Math.floor(Math.random() * 20),
      onTime: 85 + Math.floor(Math.random() * 12)
    }));
  };

  // Summary stats
  const platinumCount = enrichedCarriers.filter(c => c.metrics.overallScore >= 90).length;
  const goldCount = enrichedCarriers.filter(c => c.metrics.overallScore >= 80 && c.metrics.overallScore < 90).length;
  const avgScore = enrichedCarriers.length > 0 
    ? Math.round(enrichedCarriers.reduce((sum, c) => sum + c.metrics.overallScore, 0) / enrichedCarriers.length)
    : 0;

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-amber-800 to-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Carrier Performance Scorecards</h1>
                  <p className="text-amber-200 text-base mt-1">AI-powered carrier evaluation & ranking system</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-amber-500/90 text-white border-0 px-3 py-1 text-sm font-medium flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Live Scoring
                </Badge>
                <Badge className="bg-purple-500/90 text-white border-0 px-3 py-1 text-sm font-medium">
                  {platinumCount} Platinum
                </Badge>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search carriers by name or MC number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-0 shadow-lg rounded-xl"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12 bg-white border-0 shadow-lg rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">By Score</SelectItem>
                  <SelectItem value="ontime">By On-Time</SelectItem>
                  <SelectItem value="loads">By Loads</SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl shadow-lg">
                <Download className="w-5 h-5 mr-2" /> Export
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{platinumCount}</p>
                <p className="text-xs text-slate-500">Platinum</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">{goldCount}</p>
                <p className="text-xs text-slate-500">Gold</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{avgScore}</p>
                <p className="text-xs text-slate-500">Avg Score</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{carriers.length}</p>
                <p className="text-xs text-slate-500">Carriers</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-cyan-600">94%</p>
                <p className="text-xs text-slate-500">On-Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Carrier List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-2 border-b border-slate-100">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-600" /> Carrier Rankings
                  <Badge variant="secondary" className="ml-2">{filteredCarriers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {filteredCarriers.map((carrier, idx) => {
                    const tier = getTier(carrier.metrics.overallScore);
                    const isSelected = selectedCarrier?.id === carrier.id;
                    
                    return (
                      <div
                        key={carrier.id}
                        onClick={() => setSelectedCarrier(carrier)}
                        className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${
                          isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-bold text-slate-400 w-8">
                              #{idx + 1}
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tier.bgColor}`}>
                              <Award className={`w-6 h-6 ${tier.textColor}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {carrier.company_name || `Carrier ${carrier.id.slice(0, 6)}`}
                                </p>
                                <Badge className={`${tier.bgColor} ${tier.textColor} text-xs`}>
                                  {tier.name}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-500">
                                MC-{carrier.mc_number || '000000'} • {carrier.metrics.totalLoads} loads
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">{carrier.metrics.overallScore}</p>
                              <div className={`flex items-center gap-1 text-sm ${
                                carrier.metrics.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {carrier.metrics.trend === 'up' ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {carrier.metrics.trendValue}%
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                        
                        {/* Quick Metrics Bar */}
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          <div className="text-center">
                            <p className="text-xs text-slate-500">On-Time</p>
                            <p className="text-sm font-semibold">{carrier.metrics.onTimeDelivery}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Safety</p>
                            <p className="text-sm font-semibold">{carrier.metrics.safetyScore}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Docs</p>
                            <p className="text-sm font-semibold">{carrier.metrics.documentCompliance}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">Claims</p>
                            <p className="text-sm font-semibold">{carrier.metrics.claimRate}%</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carrier Detail */}
          <div className="space-y-6">
            {selectedCarrier ? (
              <>
                {/* Score Breakdown */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg">
                      {selectedCarrier.company_name || 'Carrier'} Scorecard
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={getRadarData(selectedCarrier.metrics)}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="#6366F1"
                          fill="#6366F1"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" /> On-Time Delivery
                        </span>
                        <span className="font-semibold">{selectedCarrier.metrics.onTimeDelivery}%</span>
                      </div>
                      <Progress value={selectedCarrier.metrics.onTimeDelivery} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600 flex items-center gap-1">
                          <Shield className="w-4 h-4" /> Safety Score
                        </span>
                        <span className="font-semibold">{selectedCarrier.metrics.safetyScore}%</span>
                      </div>
                      <Progress value={selectedCarrier.metrics.safetyScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-slate-600 flex items-center gap-1">
                          <FileText className="w-4 h-4" /> Document Compliance
                        </span>
                        <span className="font-semibold">{selectedCarrier.metrics.documentCompliance}%</span>
                      </div>
                      <Progress value={selectedCarrier.metrics.documentCompliance} className="h-2" />
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500">Avg Response</p>
                          <p className="text-lg font-bold text-slate-900">{selectedCarrier.metrics.avgResponseTime}m</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500">Claim Rate</p>
                          <p className="text-lg font-bold text-slate-900">{selectedCarrier.metrics.claimRate}%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trend Chart */}
                <Card className="border-0 shadow-xl bg-white">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg">6-Month Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={getTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-dashed border-2 border-slate-200">
                <CardContent className="p-8 text-center">
                  <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Select a Carrier</h3>
                  <p className="text-xs text-slate-500">Click on a carrier to view their scorecard</p>
                </CardContent>
              </Card>
            )}

            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
                  <Lightbulb className="w-4 h-4" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {platinumCount < 3 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">📈 Growth Opportunity</p>
                    <p className="text-xs text-amber-700">Focus on improving carrier scores to increase Platinum tier count.</p>
                  </div>
                )}
                {enrichedCarriers.filter(c => c.metrics.overallScore < 70).length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-red-200">
                    <p className="text-xs font-semibold text-red-900 mb-1">⚠️ At-Risk Carriers</p>
                    <p className="text-xs text-red-700">{enrichedCarriers.filter(c => c.metrics.overallScore < 70).length} carrier(s) below Bronze threshold. Review immediately.</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-amber-900 mb-1">🎯 Top Performers</p>
                  <p className="text-xs text-amber-700">Prioritize loads to Platinum carriers for best service quality.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-amber-900 mb-1">⚡ Quick Win</p>
                  <p className="text-xs text-amber-700">Review carriers with 75-79 scores for easy tier upgrades.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-amber-100">
                  <p className="text-xs font-semibold text-amber-900 mb-1">📊 Monthly Review</p>
                  <p className="text-xs text-amber-700">Schedule performance reviews with bottom 10% carriers.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">✅ Best Practice</p>
                  <p className="text-xs text-emerald-700">Export monthly scorecards to share with carrier partners.</p>
                </div>
              </CardContent>
            </Card>

            {/* Network Performance Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Network Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Avg On-Time Rate</span>
                    <span className="font-medium text-emerald-600">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Avg Safety Score</span>
                    <span className="font-medium">88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Doc Compliance</span>
                    <span className="font-medium">91%</span>
                  </div>
                  <Progress value={91} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Communication</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Claim Rate (Low is Good)</span>
                    <span className="font-medium text-emerald-600">1.2%</span>
                  </div>
                  <Progress value={12} className="h-2 [&>div]:bg-emerald-500" />
                </div>
              </CardContent>
            </Card>

            {/* Tier Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Award className="w-4 h-4" /> Tier Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-xs font-medium text-purple-800">Platinum (90+)</span>
                  </div>
                  <span className="text-xs font-bold text-purple-700">{platinumCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-xs font-medium text-amber-800">Gold (80-89)</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700">{goldCount}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-700">Silver (70-79)</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600">{enrichedCarriers.filter(c => c.metrics.overallScore >= 70 && c.metrics.overallScore < 80).length}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-xs font-medium text-orange-800">Bronze (&lt;70)</span>
                  </div>
                  <span className="text-xs font-bold text-orange-700">{enrichedCarriers.filter(c => c.metrics.overallScore < 70).length}</span>
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
                  <Download className="w-4 h-4 mr-2 text-blue-600" /> Export All Scorecards
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <RefreshCw className="w-4 h-4 mr-2 text-emerald-600" /> Recalculate Scores
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Target className="w-4 h-4 mr-2 text-purple-600" /> Set Tier Thresholds
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" /> View At-Risk Carriers
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
                <p>• Review scorecards monthly</p>
                <p>• Share feedback with carriers</p>
                <p>• Reward top performers</p>
                <p>• Coach underperformers</p>
                <p>• Track improvement trends</p>
                <p>• Align incentives with KPIs</p>
              </CardContent>
            </Card>

            {/* Network Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <TrendingUp className="w-4 h-4" /> Network Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Avg Score</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-emerald-700">{avgScore}</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Platinum</span>
                  <span className="font-bold text-purple-700">{platinumCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Gold</span>
                  <span className="font-bold text-amber-700">{goldCount}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Total</span>
                  <Badge className="bg-blue-600">{carriers.length}</Badge>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
    </TooltipProvider>
  );
}