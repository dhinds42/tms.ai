import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Plane, 
  Ship, 
  Train, 
  Truck, 
  Package, 
  Plus, 
  Search, 
  RefreshCw, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Calendar,
  Globe,
  Activity,
  BarChart3,
  Filter,
  Zap,
  Timer,
  FileText,
  Anchor,
  Navigation,
  Info,
  ShieldCheck,
  Leaf
} from "lucide-react";

export default function MultiModalOrchestration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const shipments = [
    { 
      id: 1, 
      ref: 'MM-2024-001', 
      modes: ['ocean', 'truck'], 
      status: 'in_transit', 
      progress: 65,
      origin: 'Shanghai, CN',
      destination: 'Los Angeles, CA',
      eta: '2024-12-05',
      carrier: 'Maersk + XPO',
      value: 125000,
      weight: '22,500 lbs',
      containers: 2
    },
    { 
      id: 2, 
      ref: 'MM-2024-002', 
      modes: ['air', 'truck'], 
      status: 'customs', 
      progress: 40,
      origin: 'Frankfurt, DE',
      destination: 'Chicago, IL',
      eta: '2024-11-30',
      carrier: 'Lufthansa + Schneider',
      value: 85000,
      weight: '4,200 lbs',
      containers: 0
    },
    { 
      id: 3, 
      ref: 'MM-2024-003', 
      modes: ['rail', 'truck'], 
      status: 'completed', 
      progress: 100,
      origin: 'Seattle, WA',
      destination: 'Dallas, TX',
      eta: '2024-11-25',
      carrier: 'BNSF + Werner',
      value: 62000,
      weight: '45,000 lbs',
      containers: 1
    },
    { 
      id: 4, 
      ref: 'MM-2024-004', 
      modes: ['ocean', 'rail', 'truck'], 
      status: 'in_transit', 
      progress: 25,
      origin: 'Tokyo, JP',
      destination: 'Atlanta, GA',
      eta: '2024-12-15',
      carrier: 'NYK + UP + J.B. Hunt',
      value: 210000,
      weight: '68,000 lbs',
      containers: 3
    },
    { 
      id: 5, 
      ref: 'MM-2024-005', 
      modes: ['air'], 
      status: 'delayed', 
      progress: 55,
      origin: 'London, UK',
      destination: 'New York, NY',
      eta: '2024-11-29',
      carrier: 'FedEx',
      value: 45000,
      weight: '1,200 lbs',
      containers: 0
    },
  ];

  const getModeIcon = (mode) => {
    const icons = {
      ocean: Ship,
      air: Plane,
      rail: Train,
      truck: Truck
    };
    const Icon = icons[mode] || Package;
    return <Icon className="w-4 h-4" />;
  };

  const getModeColor = (mode) => {
    const colors = {
      ocean: 'bg-blue-100 text-blue-700 border-blue-200',
      air: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      rail: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      truck: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return colors[mode] || 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      in_transit: 'bg-blue-600',
      customs: 'bg-amber-600',
      completed: 'bg-emerald-600',
      delayed: 'bg-red-600',
      pending: 'bg-slate-600'
    };
    return colors[status] || 'bg-slate-600';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4" />;
    if (status === 'delayed') return <AlertTriangle className="w-4 h-4" />;
    if (status === 'customs') return <FileText className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = searchTerm === '' || 
      s.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'ocean' && s.modes.includes('ocean')) ||
      (activeTab === 'air' && s.modes.includes('air')) ||
      (activeTab === 'rail' && s.modes.includes('rail')) ||
      (activeTab === 'active' && ['in_transit', 'customs'].includes(s.status)) ||
      (activeTab === 'delayed' && s.status === 'delayed');
    
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    customs: shipments.filter(s => s.status === 'customs').length,
    delayed: shipments.filter(s => s.status === 'delayed').length,
    completed: shipments.filter(s => s.status === 'completed').length,
    totalValue: shipments.reduce((sum, s) => sum + s.value, 0),
    oceanCount: shipments.filter(s => s.modes.includes('ocean')).length,
    airCount: shipments.filter(s => s.modes.includes('air')).length,
    railCount: shipments.filter(s => s.modes.includes('rail')).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Multi-Modal Orchestration</h1>
                  <p className="text-slate-300 text-base mt-1">Coordinate ocean, air, rail & truck shipments from one control panel</p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-wrap gap-2">
                <Badge className="bg-cyan-500/90 text-white border-0 px-3 py-1 text-sm font-medium">
                  {stats.total} Active Shipments
                </Badge>
                <Badge className="bg-emerald-500/90 text-white border-0 px-3 py-1 text-sm font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Live Tracking
                </Badge>
              </div>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by reference, origin, or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-0 shadow-lg rounded-xl"
                />
              </div>
              <Button className="h-12 px-6 bg-cyan-600 hover:bg-cyan-700 font-semibold rounded-xl shadow-lg">
                <Plus className="w-5 h-5 mr-2" /> New Shipment
              </Button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Ship className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stats.oceanCount}</p>
                <p className="text-xs text-slate-500">Ocean</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Plane className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stats.airCount}</p>
                <p className="text-xs text-slate-500">Air</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Train className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{stats.railCount}</p>
                <p className="text-xs text-slate-500">Rail</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-600">{stats.delayed}</p>
                <p className="text-xs text-slate-500">Delayed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">${(stats.totalValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Shipments List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Tabs */}
            <Card>
              <CardContent className="p-3">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-6 h-10">
                    <TabsTrigger value="all" className="text-xs">All ({stats.total})</TabsTrigger>
                    <TabsTrigger value="active" className="text-xs">Active ({stats.inTransit + stats.customs})</TabsTrigger>
                    <TabsTrigger value="ocean" className="text-xs">Ocean</TabsTrigger>
                    <TabsTrigger value="air" className="text-xs">Air</TabsTrigger>
                    <TabsTrigger value="rail" className="text-xs">Rail</TabsTrigger>
                    <TabsTrigger value="delayed" className="text-xs text-red-600">Delayed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Shipment Cards */}
            <div className="space-y-3">
              {filteredShipments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No shipments found</h3>
                    <p className="text-slate-500">Try adjusting your search or filters</p>
                  </CardContent>
                </Card>
              ) : (
                filteredShipments.map(shipment => (
                  <Card key={shipment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{shipment.ref}</h3>
                            <Badge className={`${getStatusColor(shipment.status)} text-white flex items-center gap-1`}>
                              {getStatusIcon(shipment.status)}
                              {shipment.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {shipment.modes.map(mode => (
                              <Badge key={mode} variant="outline" className={`${getModeColor(mode)} flex items-center gap-1`}>
                                {getModeIcon(mode)}
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-900">${shipment.value.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">{shipment.weight}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium">{shipment.origin}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{shipment.destination}</span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{shipment.progress}%</span>
                        </div>
                        <Progress value={shipment.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            ETA: {shipment.eta}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            {shipment.carrier}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            
            {/* Mode Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Mode Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2"><Ship className="w-4 h-4 text-blue-600" /> Ocean</span>
                    <span className="font-medium">{Math.round(stats.oceanCount / stats.total * 100)}%</span>
                  </div>
                  <Progress value={stats.oceanCount / stats.total * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2"><Plane className="w-4 h-4 text-indigo-600" /> Air</span>
                    <span className="font-medium">{Math.round(stats.airCount / stats.total * 100)}%</span>
                  </div>
                  <Progress value={stats.airCount / stats.total * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2"><Train className="w-4 h-4 text-emerald-600" /> Rail</span>
                    <span className="font-medium">{Math.round(stats.railCount / stats.total * 100)}%</span>
                  </div>
                  <Progress value={stats.railCount / stats.total * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                  <Lightbulb className="w-4 h-4" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.delayed > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-red-200">
                    <p className="text-xs font-semibold text-red-900 mb-1">⚠️ Delayed Shipments</p>
                    <p className="text-xs text-red-700">{stats.delayed} shipment(s) delayed. Review for alternate routing.</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">💡 Cost Optimization</p>
                  <p className="text-xs text-purple-700">Consider rail for LA-Dallas lane to save 15% on freight costs.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">🚢 Port Congestion Alert</p>
                  <p className="text-xs text-purple-700">Shanghai port experiencing delays. Plan for 2-3 extra days.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">📦 Consolidation Opportunity</p>
                  <p className="text-xs text-purple-700">2 shipments to Atlanta can be consolidated to reduce costs.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">⚡ Express Alternative</p>
                  <p className="text-xs text-purple-700">Air freight available for urgent shipments with 3-day delivery.</p>
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
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Navigation className="w-4 h-4 mr-2 text-blue-600" /> Optimize Routes
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Timer className="w-4 h-4 mr-2 text-amber-600" /> Check ETAs
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2 text-emerald-600" /> Generate Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2 text-slate-600" /> Refresh Status
                </Button>
              </CardContent>
            </Card>

            {/* Compliance & Customs */}
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4" /> Compliance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                  <p className="text-xs font-semibold text-amber-900 mb-1">📋 Customs Documents</p>
                  <p className="text-xs text-amber-700">1 shipment needs customs documentation update.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">✓ ISF Filing</p>
                  <p className="text-xs text-emerald-700">All ocean shipments have ISF filed on time.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-900 mb-1">🔒 Bond Status</p>
                  <p className="text-xs text-blue-700">Customs bonds valid for all active imports.</p>
                </div>
              </CardContent>
            </Card>

            {/* Carbon Footprint */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" /> Carbon Footprint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-slate-600">This Month</span>
                  <span className="font-bold text-green-700">42.5 tons CO₂</span>
                </div>
                <div className="text-xs text-slate-500">
                  <p className="mb-2">Mode Emissions:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Ship className="w-3 h-3" /> Ocean</span>
                      <span>18.2 tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Plane className="w-3 h-3" /> Air</span>
                      <span>21.8 tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Train className="w-3 h-3" /> Rail</span>
                      <span>2.5 tons</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-green-700 p-2 bg-green-50 rounded">💡 Switch 2 air shipments to rail to save 15 tons CO₂</p>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>• Use ocean+rail for long-distance cost savings</p>
                <p>• Book air freight 5+ days ahead for best rates</p>
                <p>• Monitor customs clearance to avoid delays</p>
                <p>• Consolidate shipments when possible</p>
                <p>• File ISF 72+ hours before vessel departure</p>
                <p>• Use rail for eco-friendly domestic moves</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}