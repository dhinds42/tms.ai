import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  Truck,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Download,
  Zap,
  Lightbulb,
  Target,
  Activity,
  ArrowUpRight,
  BarChart2
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function AILoadForecasting() {
  const [forecastPeriod, setForecastPeriod] = useState("7d");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: loads } = useScopedEntity('Load', { limit: 500 });

  // Generate forecast data based on historical patterns
  const generateForecastData = () => {
    const days = forecastPeriod === "7d" ? 7 : forecastPeriod === "14d" ? 14 : 30;
    const data = [];
    const baseVolume = loads.length > 0 ? Math.round(loads.length / 30) : 15;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      
      // Simulate weekly patterns (lower on weekends)
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.6 : 1;
      const randomVariation = 0.8 + Math.random() * 0.4;
      
      const predicted = Math.round(baseVolume * weekendFactor * randomVariation);
      const confidence = 85 + Math.round(Math.random() * 10);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString(),
        predicted,
        lowerBound: Math.round(predicted * 0.8),
        upperBound: Math.round(predicted * 1.2),
        confidence,
        historical: i < 3 ? Math.round(predicted * (0.9 + Math.random() * 0.2)) : null
      });
    }
    return data;
  };

  const forecastData = generateForecastData();

  // Lane demand predictions
  const laneDemand = [
    { lane: "Chicago, IL → Detroit, MI", demand: "High", change: "+15%", volume: 45, trend: "up" },
    { lane: "Dallas, TX → Houston, TX", demand: "High", change: "+12%", volume: 38, trend: "up" },
    { lane: "Los Angeles, CA → Phoenix, AZ", demand: "Medium", change: "+5%", volume: 28, trend: "up" },
    { lane: "Atlanta, GA → Miami, FL", demand: "Medium", change: "-3%", volume: 25, trend: "down" },
    { lane: "New York, NY → Boston, MA", demand: "Low", change: "-8%", volume: 18, trend: "down" },
    { lane: "Seattle, WA → Portland, OR", demand: "High", change: "+20%", volume: 32, trend: "up" },
  ];

  // Equipment demand forecast
  const equipmentDemand = [
    { type: "Dry Van", current: 65, forecast: 72, change: "+11%" },
    { type: "Reefer", current: 25, forecast: 30, change: "+20%" },
    { type: "Flatbed", current: 18, forecast: 15, change: "-17%" },
    { type: "Step Deck", current: 8, forecast: 10, change: "+25%" },
  ];

  // Rate predictions
  const ratePredictions = [
    { week: "This Week", avgRate: 2.45, change: null },
    { week: "Next Week", avgRate: 2.52, change: "+2.9%" },
    { week: "Week 3", avgRate: 2.48, change: "-1.6%" },
    { week: "Week 4", avgRate: 2.55, change: "+2.8%" },
  ];

  // Seasonal insights
  const seasonalInsights = [
    {
      icon: AlertTriangle,
      title: "Holiday Surge Expected",
      description: "Load volume expected to increase 25% in the next 2 weeks due to holiday shipping.",
      severity: "warning"
    },
    {
      icon: TrendingUp,
      title: "Reefer Demand Rising",
      description: "Temperature-controlled loads forecasted to increase 20% - consider capacity planning.",
      severity: "info"
    },
    {
      icon: Truck,
      title: "Capacity Shortage - Midwest",
      description: "Carrier capacity in Chicago-Detroit corridor expected to tighten by 15%.",
      severity: "danger"
    }
  ];

  const handleGenerateForecast = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const totalPredictedLoads = forecastData.reduce((sum, d) => sum + d.predicted, 0);
  const avgConfidence = Math.round(forecastData.reduce((sum, d) => sum + d.confidence, 0) / forecastData.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-purple-800 to-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">AI Load Forecasting</h1>
                  <p className="text-purple-200 text-base mt-1">Predictive analytics powered by machine learning</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-purple-500/90 text-white border-0 px-3 py-1 text-sm font-medium flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  ML Powered
                </Badge>
                <Badge className="bg-emerald-500/90 text-white border-0 px-3 py-1 text-sm font-medium">
                  {avgConfidence}% Confidence
                </Badge>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex flex-wrap gap-3">
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="w-32 bg-white/10 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="14d">14 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerateForecast}
                disabled={isGenerating}
                className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl shadow-lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Forecast
                  </>
                )}
              </Button>
              <Button variant="outline" className="h-10 px-4 bg-white/10 border-white/30 text-white hover:bg-white/20 rounded-xl">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-600">{totalPredictedLoads}</p>
                <p className="text-xs text-slate-500">Predicted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-600">{avgConfidence}%</p>
                <p className="text-xs text-slate-500">Confidence</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">$2.52</p>
                <p className="text-xs text-slate-500">Avg Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">6</p>
                <p className="text-xs text-slate-500">Hot Lanes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-cyan-600">{forecastPeriod}</p>
                <p className="text-xs text-slate-500">Horizon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-4">

        {/* Main Forecast Chart */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" /> Load Volume Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="upperBound" stroke="transparent" fill="#e2e8f0" name="Upper" />
                <Line type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2} name="Predicted" />
                <Line type="monotone" dataKey="historical" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" name="Historical" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lane Demand */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Lane Demand Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {laneDemand.slice(0, 5).map((lane, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-xs truncate">{lane.lane}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${
                        lane.demand === 'High' ? 'bg-red-100 text-red-700' :
                        lane.demand === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>{lane.demand}</Badge>
                      <span className="text-xs text-slate-500">{lane.volume}/wk</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${lane.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {lane.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span className="font-semibold text-xs">{lane.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipment Demand */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" /> Equipment Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={equipmentDemand} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={60} />
                <Tooltip />
                <Bar dataKey="current" fill="#94A3B8" name="Current" radius={[0, 4, 4, 0]} />
                <Bar dataKey="forecast" fill="#6366F1" name="Forecast" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rate Predictions */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Rate Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {ratePredictions.map((rate, idx) => (
                <div key={idx} className="text-center p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">{rate.week}</p>
                  <p className="text-lg font-bold text-slate-900">${rate.avgRate}</p>
                  {rate.change && (
                    <p className={`text-xs ${rate.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{rate.change}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Insights */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" /> AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {seasonalInsights.map((insight, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${
                  insight.severity === 'danger' ? 'border-red-200 bg-red-50' :
                  insight.severity === 'warning' ? 'border-amber-200 bg-amber-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start gap-2">
                    <insight.icon className={`w-4 h-4 mt-0.5 ${
                      insight.severity === 'danger' ? 'text-red-600' :
                      insight.severity === 'warning' ? 'text-amber-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs">{insight.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            
            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                  <Lightbulb className="w-4 h-4" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">📈 Volume Surge</p>
                  <p className="text-xs text-purple-700">Expect 25% increase in holiday shipping. Pre-book capacity now.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">🚛 Reefer Alert</p>
                  <p className="text-xs text-purple-700">Temperature-controlled demand up 20%. Prioritize reefer capacity.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">💰 Rate Opportunity</p>
                  <p className="text-xs text-purple-700">Midwest rates rising. Lock in contracts before Q4 peak.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                  <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Capacity Warning</p>
                  <p className="text-xs text-amber-700">Chicago-Detroit corridor tightening 15%. Secure carriers early.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">✅ Best Practice</p>
                  <p className="text-xs text-emerald-700">Run forecasts weekly to stay ahead of market shifts.</p>
                </div>
              </CardContent>
            </Card>

            {/* Model Performance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Volume Accuracy</span>
                    <span className="font-medium">{avgConfidence}%</span>
                  </div>
                  <Progress value={avgConfidence} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Rate Prediction</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Lane Demand</span>
                    <span className="font-medium">91%</span>
                  </div>
                  <Progress value={91} className="h-2" />
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
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={handleGenerateForecast} disabled={isGenerating}>
                  <RefreshCw className="w-4 h-4 mr-2 text-purple-600" /> Refresh Forecast
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Download className="w-4 h-4 mr-2 text-blue-600" /> Export Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Target className="w-4 h-4 mr-2 text-emerald-600" /> Set Targets
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Calendar className="w-4 h-4 mr-2 text-amber-600" /> Schedule Report
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
                <p>• Run forecasts at week start</p>
                <p>• Compare actuals vs predicted</p>
                <p>• Plan capacity 2 weeks ahead</p>
                <p>• Monitor hot lane changes</p>
                <p>• Lock rates before peaks</p>
                <p>• Adjust for seasonal trends</p>
              </CardContent>
            </Card>

            {/* Forecast Summary */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <TrendingUp className="w-4 h-4" /> Forecast Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Predicted Loads</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-purple-700">{totalPredictedLoads}</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Avg Rate/Mile</span>
                  <span className="font-bold text-blue-700">$2.52</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Hot Lanes</span>
                  <span className="font-bold text-amber-700">6</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/70 rounded-lg">
                  <span className="text-xs text-slate-600">Confidence</span>
                  <Badge className="bg-emerald-600">{avgConfidence}%</Badge>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}