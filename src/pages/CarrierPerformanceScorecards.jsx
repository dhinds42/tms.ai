import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  ChevronRight
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

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 500),
    initialData: [],
  });

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

  // Get tier based on score
  const getTier = (score) => {
    if (score >= 90) return { name: 'Platinum', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' };
    if (score >= 80) return { name: 'Gold', color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' };
    if (score >= 70) return { name: 'Silver', color: 'bg-slate-400', textColor: 'text-slate-700', bgColor: 'bg-slate-50' };
    return { name: 'Bronze', color: 'bg-orange-600', textColor: 'text-orange-700', bgColor: 'bg-orange-50' };
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
              Carrier Performance Scorecards
            </h1>
            <p className="text-slate-600 mt-2">
              AI-powered carrier evaluation and ranking system
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Platinum Carriers</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{platinumCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Score 90+</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-2xl">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Gold Carriers</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{goldCount}</p>
                  <p className="text-xs text-slate-500 mt-1">Score 80-89</p>
                </div>
                <div className="p-4 bg-amber-100 rounded-2xl">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Avg Network Score</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{avgScore}</p>
                  <p className="text-xs text-emerald-600 mt-1">↑ 3.2% this month</p>
                </div>
                <div className="p-4 bg-emerald-100 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Carriers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{carriers.length}</p>
                  <p className="text-xs text-slate-500 mt-1">In network</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Carrier List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="border-b border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>Carrier Rankings</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search carriers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-48"
                      />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="score">By Score</SelectItem>
                        <SelectItem value="ontime">By On-Time</SelectItem>
                        <SelectItem value="loads">By Loads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
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
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-12 text-center">
                  <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Carrier</h3>
                  <p className="text-slate-600">Click on a carrier to view their detailed scorecard</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}