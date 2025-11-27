import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Radio,
  Truck,
  MapPin,
  Clock,
  Users,
  Phone,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Zap,
  Activity,
  RefreshCw,
  Search,
  Filter,
  MessageSquare,
  Bell,
  MoreVertical,
  ArrowRight,
  Calendar,
  DollarSign,
  Package,
  Lightbulb,
  TrendingUp,
  Target,
  Fuel,
  ThermometerSun,
  Route,
  BarChart3
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DispatchConsole() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const queryClient = useQueryClient();

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
    refetchInterval: 30000
  });

  const updateLoadMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Load.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      setSelectedLoad(null);
    },
  });

  // Active loads (in motion)
  const activeLoads = loads.filter(l => 
    ['dispatched', 'picked_up', 'in_transit'].includes(l.status)
  );

  // Available drivers
  const availableDrivers = drivers.filter(d => 
    ['available', 'off_duty'].includes(d.driver_status)
  );

  // Loads needing dispatch
  const pendingLoads = loads.filter(l => 
    ['available', 'tendered', 'booked'].includes(l.status)
  );

  // Loads with issues
  const problemLoads = loads.filter(l => 
    l.exceptions?.length > 0 || l.delay_minutes > 30
  );

  // Delivered today
  const deliveredToday = loads.filter(l => {
    if (l.status !== 'delivered') return false;
    const today = new Date().toDateString();
    return new Date(l.actual_delivery || l.updated_date).toDateString() === today;
  });

  // Search filter
  const filteredActiveLoads = activeLoads.filter(l => 
    !searchTerm || 
    l.load_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.dropoff_location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['loads'] });
    queryClient.invalidateQueries({ queryKey: ['drivers'] });
    setLastRefresh(new Date());
  };

  const handleQuickDispatch = (loadId, driverId) => {
    updateLoadMutation.mutate({
      id: loadId,
      data: {
        driver_id: driverId,
        status: 'dispatched',
        dispatched_at: new Date().toISOString()
      }
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'dispatched': 'bg-blue-100 text-blue-800',
      'picked_up': 'bg-purple-100 text-purple-800',
      'in_transit': 'bg-indigo-100 text-indigo-800',
      'available': 'bg-slate-100 text-slate-800',
      'tendered': 'bg-yellow-100 text-yellow-800',
      'booked': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto space-y-4">
        
        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <Radio className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dispatch Command Center</h1>
                  <p className="text-blue-200 text-sm mt-1">Real-time fleet coordination & driver management</p>
                </div>
              </div>
              <div className="md:ml-auto flex items-center gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Badge className="bg-emerald-500/90 text-white px-3 py-1.5 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </Badge>
                <Badge className={`text-xs px-3 py-1.5 ${operatingMode === 'carrier' ? 'bg-blue-500' : 'bg-indigo-500'} text-white`}>
                  {operatingMode.toUpperCase()} MODE
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-slate-200">
          <Search className="w-5 h-5 text-slate-400" />
          <Input 
            placeholder="Search loads by number, origin, or destination..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 shadow-none focus-visible:ring-0 text-sm"
          />
          <span className="text-xs text-slate-400">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border border-blue-100 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('active')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Active</p>
                  <p className="text-2xl font-bold text-blue-600">{activeLoads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-emerald-100 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Drivers</p>
                  <p className="text-2xl font-bold text-emerald-600">{availableDrivers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-amber-100 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('pending')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingLoads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-red-100 shadow-sm bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Issues</p>
                  <p className="text-2xl font-bold text-red-600">{problemLoads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-purple-100 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Delivered</p>
                  <p className="text-2xl font-bold text-purple-600">{deliveredToday.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Active Loads Panel */}
          <Card className="border border-slate-200 shadow-sm lg:col-span-2">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Radio className="w-4 h-4 text-blue-600" />
                  Active Loads
                  <Badge variant="secondary" className="ml-1">{filteredActiveLoads.length}</Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 max-h-[500px] overflow-y-auto">
              <div className="space-y-2">
                {filteredActiveLoads.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No active loads</p>
                  </div>
                ) : (
                  filteredActiveLoads.map((load) => {
                    const driver = drivers.find(d => d.id === load.driver_id);
                    return (
                      <div key={load.id} className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 text-sm">{load.load_number || load.id.slice(0, 8)}</h3>
                            <Badge className={`text-xs ${getStatusColor(load.status)}`}>{load.status?.replace('_', ' ')}</Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Phone className="w-4 h-4 mr-2" /> Call Driver</DropdownMenuItem>
                              <DropdownMenuItem><MessageSquare className="w-4 h-4 mr-2" /> Send Message</DropdownMenuItem>
                              <DropdownMenuItem><MapPin className="w-4 h-4 mr-2" /> Track Location</DropdownMenuItem>
                              <DropdownMenuItem><Bell className="w-4 h-4 mr-2" /> Send Update</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                          <span className="font-medium">{load.pickup_location?.city}, {load.pickup_location?.state}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-medium">{load.dropoff_location?.city}, {load.dropoff_location?.state}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-slate-500">
                            {driver && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {driver.first_name} {driver.last_name?.charAt(0)}.
                              </span>
                            )}
                            {load.eta && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ETA: {new Date(load.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            )}
                          </div>
                          {load.customer_rate && (
                            <span className="font-semibold text-emerald-600">${load.customer_rate.toLocaleString()}</span>
                          )}
                        </div>

                        {load.delay_minutes > 0 && (
                          <div className="mt-2 py-1 px-2 bg-amber-50 border border-amber-200 rounded text-xs flex items-center gap-1 text-amber-700">
                            <AlertTriangle className="w-3 h-3" />
                            Delayed {load.delay_minutes}min
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Drivers Panel */}
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-4 h-4 text-emerald-600" />
                Available Drivers
                <Badge variant="secondary" className="ml-1 bg-emerald-100 text-emerald-700">{availableDrivers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 max-h-[500px] overflow-y-auto">
              {selectedLoad && (
                <div className="mb-3 p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-xs text-indigo-700 font-medium">
                    🎯 Assigning to: <span className="font-bold">{selectedLoad.load_number || selectedLoad.id.slice(0, 8)}</span>
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-6 mt-1 text-indigo-600"
                    onClick={() => setSelectedLoad(null)}
                  >
                    Cancel Selection
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {availableDrivers.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No drivers available</p>
                  </div>
                ) : (
                  availableDrivers.map((driver) => (
                    <div key={driver.id} className="p-3 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{driver.first_name} {driver.last_name}</h4>
                          <p className="text-xs text-slate-500">{driver.equipment_assigned || 'Unassigned'}</p>
                        </div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-emerald-200"></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {driver.current_location?.city || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {driver.hos_remaining || 0}h HOS
                        </span>
                      </div>

                      {selectedLoad ? (
                        <Button
                          onClick={() => handleQuickDispatch(selectedLoad.id, driver.id)}
                          size="sm"
                          className="w-full h-8 text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Dispatch Now
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                            <Phone className="w-3 h-3 mr-1" /> Call
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" /> Message
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid with Pending and AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Pending Dispatch Queue - Takes 3 columns */}
          <div className="lg:col-span-3">
            {pendingLoads.length > 0 && (
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="py-3 px-4 border-b border-slate-100 bg-amber-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Pending Dispatch
                      <Badge variant="secondary" className="ml-1 bg-amber-100 text-amber-700">{pendingLoads.length}</Badge>
                    </CardTitle>
                    <p className="text-xs text-slate-500">Click a load to select, then assign a driver above</p>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {pendingLoads.map((load) => (
                      <div
                        key={load.id}
                        onClick={() => setSelectedLoad(selectedLoad?.id === load.id ? null : load)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedLoad?.id === load.id
                            ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900 text-sm">{load.load_number || load.id.slice(0, 8)}</h3>
                          <Badge className={`text-xs ${getStatusColor(load.status)}`}>{load.status}</Badge>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                          <span>{load.pickup_location?.city}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span>{load.dropoff_location?.city}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {load.distance_miles_planned || load.miles_planned || '—'} mi
                          </span>
                          {load.customer_rate && (
                            <span className="font-semibold text-emerald-600">${load.customer_rate.toLocaleString()}</span>
                          )}
                        </div>

                        {load.pickup_date && (
                          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(load.pickup_date).toLocaleDateString()}
                          </div>
                        )}

                        {selectedLoad?.id === load.id && (
                          <div className="mt-2 py-1 px-2 bg-indigo-600 text-white text-xs rounded text-center font-medium">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {pendingLoads.length === 0 && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-1">All Caught Up!</h3>
                  <p className="text-sm text-slate-500">No loads pending dispatch</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Recommendations Sidebar */}
          <div className="space-y-4">
            {/* AI Dispatch Recommendations */}
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                  <Lightbulb className="w-4 h-4" /> AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {problemLoads.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-red-200">
                    <p className="text-xs font-semibold text-red-900 mb-1">⚠️ Attention Required</p>
                    <p className="text-xs text-red-700">{problemLoads.length} load(s) have issues that need resolution.</p>
                  </div>
                )}
                {pendingLoads.length > 3 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-amber-900 mb-1">📋 High Queue</p>
                    <p className="text-xs text-amber-700">Consider batch dispatch or auto-matching to clear backlog.</p>
                  </div>
                )}
                {availableDrivers.length === 0 && pendingLoads.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">👤 Driver Shortage</p>
                    <p className="text-xs text-blue-700">No drivers available. Consider posting to load boards.</p>
                  </div>
                )}
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">💡 Smart Match</p>
                  <p className="text-xs text-purple-700">Use AI matching to auto-assign best-fit drivers.</p>
                </div>
                <div className="p-3 bg-white/80 rounded-lg border border-purple-100">
                  <p className="text-xs font-semibold text-purple-900 mb-1">📍 Location Priority</p>
                  <p className="text-xs text-purple-700">Dispatch nearby drivers to reduce deadhead miles.</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Today's Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-600">On-Time Rate</span>
                  <span className="text-sm font-bold text-emerald-600">92%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-600">Avg Response</span>
                  <span className="text-sm font-bold text-blue-600">4.2 min</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-600">Load Coverage</span>
                  <span className="text-sm font-bold text-purple-600">87%</span>
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
                  <Target className="w-4 h-4 mr-2 text-purple-600" /> Auto-Match All
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Bell className="w-4 h-4 mr-2 text-amber-600" /> Send Check Calls
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" /> View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" /> Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-600 space-y-2">
                <p>• Prioritize loads by pickup time</p>
                <p>• Check driver HOS before dispatch</p>
                <p>• Confirm equipment compatibility</p>
                <p>• Set up auto check-call reminders</p>
                <p>• Monitor ETAs for delays</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}