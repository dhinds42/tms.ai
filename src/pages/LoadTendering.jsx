import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Radio,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Search,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Target,
  DollarSign,
  MapPin,
  Truck,
  Calendar
} from "lucide-react";
import AutomatedTendering from "../components/tendering/AutomatedTendering";
import { format } from "date-fns";

export default function LoadTendering() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAutomation, setShowAutomation] = useState(false);
  const [selectedLoadForTender, setSelectedLoadForTender] = useState(null);
  const queryClient = useQueryClient();

  const { data: tenders, isLoading: tendersLoading } = useQuery({
    queryKey: ['tenders'],
    queryFn: () => base44.entities.Tender.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads, isLoading: loadsLoading } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const updateTenderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Tender.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
    },
  });

  const handleAcceptTender = (tenderId) => {
    updateTenderMutation.mutate({
      id: tenderId,
      data: { response_status: 'accepted', response_at: new Date().toISOString() }
    });
  };

  const handleDeclineTender = (tenderId) => {
    updateTenderMutation.mutate({
      id: tenderId,
      data: { response_status: 'declined', response_at: new Date().toISOString() }
    });
  };

  // Filter tenders
  const filteredTenders = tenders.filter(t => {
    const statusMatch = statusFilter === 'all' || t.response_status === statusFilter;
    const searchMatch = searchTerm === '' ||
      t.tender_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shipment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Stats
  const pendingCount = tenders.filter(t => t.response_status === 'pending').length;
  const acceptedCount = tenders.filter(t => t.response_status === 'accepted').length;
  const declinedCount = tenders.filter(t => t.response_status === 'declined').length;
  const expiredCount = tenders.filter(t => t.response_status === 'expired').length;
  const acceptanceRate = tenders.length > 0 ? ((acceptedCount / tenders.length) * 100).toFixed(0) : 0;

  // Loads ready to tender (available, no carrier assigned)
  const loadsReadyToTender = loads.filter(l => 
    ['available', 'quote'].includes(l.status) && !l.carrier_id
  );

  // Expiring soon tenders (within 2 hours)
  const expiringSoon = tenders.filter(t => {
    if (t.response_status !== 'pending' || !t.valid_until) return false;
    const hoursLeft = (new Date(t.valid_until) - new Date()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft <= 2;
  });

  const getStatusConfig = (status) => {
    const config = {
      'pending': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
      'accepted': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
      'declined': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
      'expired': { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' },
      'withdrawn': { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' }
    };
    return config[status] || config.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Load Tendering</h1>
              <p className="text-xs text-slate-500">{tenders.length} tenders • {pendingCount} awaiting response</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['tenders'] })}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => setShowAutomation(!showAutomation)}
              size="sm"
              variant={showAutomation ? "default" : "outline"}
              className={showAutomation ? "bg-purple-600" : "border-purple-300 text-purple-700"}
            >
              <Zap className="w-4 h-4 mr-1" />
              AI Tender
            </Button>
          </div>
        </div>

        {/* Compact Stats Bar */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <div className="grid grid-cols-5 gap-2">
              <div className="bg-amber-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setStatusFilter('pending')}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-slate-500">Pending</span>
                </div>
                <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setStatusFilter('accepted')}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-500">Accepted</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{acceptedCount}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setStatusFilter('declined')}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-medium text-slate-500">Declined</span>
                </div>
                <p className="text-lg font-bold text-red-600">{declinedCount}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-slate-500">Accept %</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{acceptanceRate}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-medium text-slate-500">Ready</span>
                </div>
                <p className="text-lg font-bold text-purple-600">{loadsReadyToTender.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Recommendations Row */}
        {(expiringSoon.length > 0 || loadsReadyToTender.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expiringSoon.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">{expiringSoon.length} tender{expiringSoon.length > 1 ? 's' : ''} expiring soon</p>
                  <p className="text-xs text-amber-700">Review within 2 hours to avoid expiration</p>
                </div>
                <Button size="sm" variant="ghost" className="text-amber-700 hover:bg-amber-100" onClick={() => setStatusFilter('pending')}>
                  Review
                </Button>
              </div>
            )}
            {loadsReadyToTender.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900">{loadsReadyToTender.length} load{loadsReadyToTender.length > 1 ? 's' : ''} ready to tender</p>
                  <p className="text-xs text-purple-700">Use AI to find the best carriers</p>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAutomation(true)}>
                  <Zap className="w-3 h-3 mr-1" />
                  AI Tender
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          
          {/* Left Sidebar - AI & Quick Actions */}
          <div className="xl:col-span-1 space-y-4">
            
            {/* AI Automation Panel */}
            {showAutomation && (
              <AutomatedTendering
                load={selectedLoadForTender || loadsReadyToTender[0]}
                carriers={carriers}
                onTenderingComplete={(createdTenders) => {
                  queryClient.invalidateQueries({ queryKey: ['tenders'] });
                  setShowAutomation(false);
                  setSelectedLoadForTender(null);
                }}
              />
            )}

            {/* Loads Ready to Tender */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-purple-600" />
                  Loads Ready to Tender
                  <Badge variant="secondary" className="ml-auto">{loadsReadyToTender.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 max-h-[300px] overflow-y-auto">
                {loadsReadyToTender.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                    All loads tendered
                  </div>
                ) : (
                  <div className="space-y-2">
                    {loadsReadyToTender.slice(0, 5).map((load) => (
                      <div 
                        key={load.id} 
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          selectedLoadForTender?.id === load.id 
                            ? 'border-purple-400 bg-purple-50' 
                            : 'border-slate-200 bg-white hover:border-purple-300'
                        }`}
                        onClick={() => {
                          setSelectedLoadForTender(load);
                          setShowAutomation(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-900">
                            {load.load_number || load.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            ${load.customer_rate?.toLocaleString() || '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <span>{load.pickup_location?.city}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{load.dropoff_location?.city}</span>
                        </div>
                      </div>
                    ))}
                    {loadsReadyToTender.length > 5 && (
                      <p className="text-xs text-center text-slate-400 pt-2">
                        +{loadsReadyToTender.length - 5} more loads
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats Summary */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-3 px-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-blue-600" />
                  Tendering Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Acceptance Rate</span>
                    <span className="font-bold text-blue-600">{acceptanceRate}%</span>
                  </div>
                  <Progress value={Number(acceptanceRate)} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-500">Avg Response</p>
                    <p className="font-bold text-slate-700">2.4 hrs</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-500">Top Carrier</p>
                    <p className="font-bold text-slate-700 truncate">ABC Trucking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Tenders List */}
          <div className="xl:col-span-3 space-y-4">
            
            {/* Search and Filters */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search by tender # or load..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                  <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                    <TabsList className="bg-slate-100 h-9">
                      <TabsTrigger value="all" className="text-xs px-3">All ({tenders.length})</TabsTrigger>
                      <TabsTrigger value="pending" className="text-xs px-3">Pending ({pendingCount})</TabsTrigger>
                      <TabsTrigger value="accepted" className="text-xs px-3">Accepted ({acceptedCount})</TabsTrigger>
                      <TabsTrigger value="declined" className="text-xs px-3">Declined ({declinedCount})</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            {/* Tenders List */}
            {tendersLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-3 text-sm text-slate-600">Loading tenders...</p>
              </div>
            ) : filteredTenders.length === 0 ? (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-10 text-center">
                  <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No tenders found</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Select a load and use AI to send tenders'}
                  </p>
                  {loadsReadyToTender.length > 0 && (
                    <Button 
                      onClick={() => setShowAutomation(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Start AI Tendering
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredTenders.map((tender) => {
                  const load = loads.find(l => l.id === tender.shipment_id);
                  const carrier = carriers.find(c => c.id === tender.tendered_to_carrier_party_id);
                  const config = getStatusConfig(tender.response_status);
                  const isExpiringSoon = tender.response_status === 'pending' && tender.valid_until && 
                    (new Date(tender.valid_until) - new Date()) / (1000 * 60 * 60) <= 2;

                  return (
                    <Card 
                      key={tender.id} 
                      className={`border shadow-sm hover:shadow-md transition-all ${config.border} ${isExpiringSoon ? 'ring-2 ring-amber-300' : ''}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Status Indicator */}
                          <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                            {tender.response_status === 'pending' && <Clock className={`w-5 h-5 ${config.text}`} />}
                            {tender.response_status === 'accepted' && <CheckCircle className={`w-5 h-5 ${config.text}`} />}
                            {tender.response_status === 'declined' && <XCircle className={`w-5 h-5 ${config.text}`} />}
                            {tender.response_status === 'expired' && <AlertTriangle className={`w-5 h-5 ${config.text}`} />}
                          </div>

                          {/* Main Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 text-sm">
                                  {tender.tender_number || tender.id.slice(0, 8).toUpperCase()}
                                </span>
                                <Badge className={`text-xs px-1.5 py-0 h-5 ${config.bg} ${config.text}`}>
                                  {tender.response_status}
                                </Badge>
                                {isExpiringSoon && (
                                  <Badge className="text-xs px-1.5 py-0 h-5 bg-amber-100 text-amber-700">
                                    Expiring Soon
                                  </Badge>
                                )}
                              </div>
                              <span className="text-lg font-bold text-emerald-600">
                                ${tender.offered_rate_amount?.toLocaleString() || 0}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {carrier?.company_name || 'Unknown Carrier'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                {load?.load_number || 'N/A'}
                              </span>
                              {load?.pickup_location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {load.pickup_location.city} → {load.dropoff_location?.city}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Sent {tender.tendered_at ? format(new Date(tender.tendered_at), 'MMM d, h:mm a') : 'N/A'}
                                </span>
                                {tender.valid_until && tender.response_status === 'pending' && (
                                  <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-amber-600 font-medium' : ''}`}>
                                    <Clock className="w-3 h-3" />
                                    Expires {format(new Date(tender.valid_until), 'MMM d, h:mm a')}
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              {tender.response_status === 'pending' && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => handleDeclineTender(tender.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Decline
                                  </Button>
                                  <Button
                                    onClick={() => handleAcceptTender(tender.id)}
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Accept
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}