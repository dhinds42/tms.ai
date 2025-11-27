import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Plus,
  TrendingUp,
  Zap,
  CheckCircle,
  CheckCircle2,
  DollarSign,
  MapPin,
  ArrowRight,
  Truck,
  History,
  Search,
  Filter,
  RefreshCw,
  Lightbulb,
  Clock,
  AlertTriangle,
  Calendar,
  XCircle,
  BarChart2,
  Target
} from "lucide-react";
import { format } from "date-fns";

import QuoteForm from "../components/quotes/QuoteForm";
import SpotQuoteRequestModal from "../components/quotes/SpotQuoteRequestModal";
import QuoteApprovalModal from "../components/quotes/QuoteApprovalModal";

export default function QuoteManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSpotQuoteModal, setShowSpotQuoteModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [currentUser] = useState({ email: 'demo@example.com', id: 'user_123' });

  const queryClient = useQueryClient();

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 200),
    initialData: [],
  });

  // New query for Quote History
  const { data: quoteHistory } = useQuery({
    queryKey: ['quoteHistory'],
    queryFn: () => base44.entities.QuoteHistory.list('-created_date', 500),
    initialData: [],
  });

  const createQuoteMutation = useMutation({
    mutationFn: (quoteData) => base44.entities.Quote.create(quoteData),
    onSuccess: () => {
      // This general onSuccess handles query invalidation and modal closing
      // after *any* quote creation (from CreateQuote or SpotQuote modals).
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setShowCreateModal(false);
      setShowSpotQuoteModal(false);
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Quote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      setShowApprovalModal(false);
      setSelectedQuote(null);
    },
  });

  const createLoadMutation = useMutation({
    mutationFn: (loadData) => base44.entities.Load.create(loadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loads'] });
    },
  });

  // New mutation for Quote History
  const createHistoryMutation = useMutation({
    mutationFn: (data) => base44.entities.QuoteHistory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quoteHistory'] });
    },
  });

  const handleSpotQuoteRequest = (quoteData) => {
    // Modified to include onSuccess callback for history logging
    createQuoteMutation.mutate(quoteData, {
      onSuccess: (newQuote) => {
        // Log quote creation in history
        createHistoryMutation.mutate({
          quote_id: newQuote.id,
          quote_number: newQuote.quote_number,
          action_type: 'created',
          action_by: currentUser?.email || 'system',
          new_value: JSON.stringify(quoteData), // Stringify object for storage
          notes: 'Spot quote requested'
        });
        // The general onSuccess of createQuoteMutation will handle invalidation and modal closing.
      }
    });
  };

  const handleApproveQuote = async (approvalData) => {
    const { quote, carrier, notes, auto_create_load } = approvalData;

    // Update quote status
    await updateQuoteMutation.mutateAsync({
      id: quote.id,
      data: {
        ...quote,
        status: 'accepted',
        approval_notes: notes,
        approved_carrier_id: carrier?.id,
        approved_date: new Date().toISOString()
      }
    });

    // Log approval in history
    createHistoryMutation.mutate({
      quote_id: quote.id,
      quote_number: quote.quote_number,
      action_type: 'accepted',
      action_by: currentUser?.email || 'system',
      carrier_id: carrier?.id,
      carrier_name: carrier?.company_name,
      previous_value: JSON.stringify({ status: quote.status }), // Stringify object for storage
      new_value: JSON.stringify({ status: 'accepted', approved_carrier_id: carrier?.id }), // Stringify object for storage
      notes: notes || 'Quote approved'
    });

    // Auto-create load if enabled
    if (auto_create_load && carrier) {
      const loadData = {
        mode: operatingMode,
        quote_id: quote.id,
        pickup_location: quote.pickup_location,
        dropoff_location: quote.dropoff_location,
        pickup_date: quote.pickup_date,
        delivery_date: quote.delivery_date,
        commodity: quote.commodity,
        weight: quote.weight,
        equipment_type: quote.equipment_type,
        customer_rate: quote.quoted_rate,
        carrier_pay: quote.estimated_cost,
        margin: quote.margin,
        carrier_id: carrier.id,
        status: 'tendered',
        special_instructions: quote.special_requirements || '',
        reference_number: quote.quote_number
      };

      await createLoadMutation.mutateAsync(loadData);

      // Log conversion to load
      createHistoryMutation.mutate({
        quote_id: quote.id,
        quote_number: quote.quote_number,
        action_type: 'converted',
        action_by: currentUser?.email || 'system',
        carrier_id: carrier?.id,
        carrier_name: carrier?.company_name,
        notes: 'Quote converted to load and assigned to carrier'
      });

      alert(`✅ Quote Approved!\n\n✓ Load created: ${quote.quote_number}\n✓ Assigned to: ${carrier.company_name}\n✓ Status: Tendered\n\nThe load is now in your Load Planner and the carrier has been notified.`);
    } else {
      alert(`✅ Quote Approved!\n\nQuote ${quote.quote_number} has been accepted. Create a load manually from the Load Board.`);
    }
  };

  const handleRejectQuote = async (rejectionData) => {
    const { quote, notes } = rejectionData;

    await updateQuoteMutation.mutateAsync({
      id: quote.id,
      data: {
        ...quote,
        status: 'rejected',
        rejection_notes: notes,
        rejected_date: new Date().toISOString()
      }
    });

    // Log rejection in history
    createHistoryMutation.mutate({
      quote_id: quote.id,
      quote_number: quote.quote_number,
      action_type: 'rejected',
      action_by: currentUser?.email || 'system',
      previous_value: JSON.stringify({ status: quote.status }), // Stringify object for storage
      new_value: JSON.stringify({ status: 'rejected' }), // Stringify object for storage
      notes: notes || 'Quote rejected'
    });

    alert(`Quote ${quote.quote_number} has been rejected.`);
  };

  const handleQuoteClick = (quote) => {
    if (quote.status === 'pending') {
      setSelectedQuote(quote);
      setShowApprovalModal(true);
    }
  };

  const handleSaveQuote = (quoteData) => {
    if (selectedQuote) {
      updateQuoteMutation.mutate({ id: selectedQuote.id, data: quoteData });
      // TODO: Add history logging for update
    } else {
      createQuoteMutation.mutate(quoteData, {
        onSuccess: (newQuote) => {
          // Log quote creation from the regular QuoteForm
          createHistoryMutation.mutate({
            quote_id: newQuote.id,
            quote_number: newQuote.quote_number,
            action_type: 'created',
            action_by: currentUser?.email || 'system',
            new_value: JSON.stringify(quoteData),
            notes: 'Quote created manually'
          });
          // The general onSuccess of createQuoteMutation will handle invalidation and modal closing.
        }
      });
    }
  };

  // Helper function to get and sort quote history
  const getQuoteHistory = (quoteId) => {
    return quoteHistory.filter(h => h.quote_id === quoteId).sort((a, b) =>
      new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
    );
  };

  // Calculations
  const pendingQuotes = quotes.filter(q => q.status === 'pending');
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
  const convertedQuotes = quotes.filter(q => q.status === 'converted');
  const rejectedQuotes = quotes.filter(q => q.status === 'rejected');
  const expiringQuotes = pendingQuotes.filter(q => {
    if (!q.valid_until) return false;
    const daysUntilExpiry = Math.ceil((new Date(q.valid_until) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  });
  const expiredQuotes = quotes.filter(q => {
    if (!q.valid_until) return false;
    return new Date(q.valid_until) < new Date() && q.status === 'pending';
  });
  const totalValue = quotes.reduce((sum, q) => sum + (q.quoted_rate || 0), 0);
  const avgMargin = quotes.length > 0 
    ? (quotes.reduce((sum, q) => sum + (q.margin || 0), 0) / quotes.length).toFixed(0)
    : 0;
  const conversionRate = quotes.length > 0 
    ? Math.round((convertedQuotes.length / quotes.length) * 100) 
    : 0;
  const highValueQuotes = pendingQuotes.filter(q => (q.quoted_rate || 0) >= 5000);

  const filteredQuotes = quotes.filter(quote => {
    const statusMatch = statusFilter === 'all' || quote.status === statusFilter;
    const searchMatch = searchTerm === '' ||
      quote.quote_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.pickup_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.dropoff_location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.commodity?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const queryClient2 = useQueryClient();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Quote Management</h1>
              <p className="text-xs text-slate-500">
                {quotes.length} total • {pendingQuotes.length} pending review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowSpotQuoteModal(true)}
              size="sm"
              className="h-8 bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <Zap className="w-3 h-3 mr-1" />
              Spot Quote
            </Button>
            <Button onClick={() => setShowCreateModal(true)} variant="outline" size="sm" className="h-8">
              <Plus className="w-3 h-3 mr-1" />
              Create
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => queryClient2.invalidateQueries({ queryKey: ['quotes'] })}
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Compact Stats Bar */}
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              <div className="bg-blue-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-blue-100" onClick={() => setStatusFilter('pending')}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-slate-500">Pending</span>
                </div>
                <p className="text-lg font-bold text-blue-600">{pendingQuotes.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-emerald-100" onClick={() => setStatusFilter('accepted')}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-slate-500">Accepted</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{acceptedQuotes.length}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-purple-100" onClick={() => setStatusFilter('converted')}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs font-medium text-slate-500">Converted</span>
                </div>
                <p className="text-lg font-bold text-purple-600">{convertedQuotes.length}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2.5 text-center cursor-pointer hover:bg-red-100 hidden md:block" onClick={() => setStatusFilter('rejected')}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-xs font-medium text-slate-500">Rejected</span>
                </div>
                <p className="text-lg font-bold text-red-600">{rejectedQuotes.length}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2.5 text-center hidden md:block">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-medium text-slate-500">Value</span>
                </div>
                <p className="text-lg font-bold text-amber-600">${(totalValue / 1000).toFixed(0)}K</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-2.5 text-center hidden md:block">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-xs font-medium text-slate-500">Avg Margin</span>
                </div>
                <p className="text-lg font-bold text-indigo-600">${avgMargin}</p>
              </div>
              <div className="bg-cyan-50 rounded-lg p-2.5 text-center hidden md:block">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Target className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="text-xs font-medium text-slate-500">Conv Rate</span>
                </div>
                <p className="text-lg font-bold text-cyan-600">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Sidebar - Quick Filters & Actions */}
          <div className="lg:col-span-2 space-y-3">
            {/* Search */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search quotes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status Filters */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <Filter className="w-3.5 h-3.5 text-slate-600" />
                  Filter by Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {[
                    { key: 'all', label: 'All Quotes', count: quotes.length, color: 'text-slate-600' },
                    { key: 'pending', label: 'Pending', count: pendingQuotes.length, color: 'text-blue-600' },
                    { key: 'accepted', label: 'Accepted', count: acceptedQuotes.length, color: 'text-emerald-600' },
                    { key: 'converted', label: 'Converted', count: convertedQuotes.length, color: 'text-purple-600' },
                    { key: 'rejected', label: 'Rejected', count: rejectedQuotes.length, color: 'text-red-600' },
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setStatusFilter(filter.key)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        statusFilter === filter.key 
                          ? 'bg-indigo-50 border border-indigo-200' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className={`font-medium ${statusFilter === filter.key ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {filter.label}
                      </span>
                      <Badge variant="secondary" className={`text-xs ${filter.color}`}>{filter.count}</Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-slate-200 shadow-sm">
              <CardContent className="p-2.5">
                <p className="text-xs font-medium text-slate-600 mb-2">Conversion Funnel</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Quotes → Accepted</span>
                      <span className="font-medium text-emerald-600">
                        {quotes.length > 0 ? Math.round(((acceptedQuotes.length + convertedQuotes.length) / quotes.length) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={quotes.length > 0 ? ((acceptedQuotes.length + convertedQuotes.length) / quotes.length) * 100 : 0} 
                      className="h-1.5" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Accepted → Loads</span>
                      <span className="font-medium text-purple-600">
                        {(acceptedQuotes.length + convertedQuotes.length) > 0 
                          ? Math.round((convertedQuotes.length / (acceptedQuotes.length + convertedQuotes.length)) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={(acceptedQuotes.length + convertedQuotes.length) > 0 
                        ? (convertedQuotes.length / (acceptedQuotes.length + convertedQuotes.length)) * 100 
                        : 0} 
                      className="h-1.5" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Quotes List */}
          <div className="lg:col-span-7 space-y-3">
            {/* Results Header */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-slate-600">{filteredQuotes.length} quote{filteredQuotes.length !== 1 ? 's' : ''} found</span>
              {searchTerm && (
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSearchTerm('')}>
                  Clear search
                </Button>
              )}
            </div>

            {/* Quotes Grid */}
            <div className="grid grid-cols-1 gap-3">
              {filteredQuotes.map((quote) => {
                const assignedCarrier = carriers.find(c => c.id === quote.approved_carrier_id);
                const history = getQuoteHistory(quote.id);
                const isExpiring = quote.valid_until && 
                  Math.ceil((new Date(quote.valid_until) - new Date()) / (1000 * 60 * 60 * 24)) <= 3 &&
                  Math.ceil((new Date(quote.valid_until) - new Date()) / (1000 * 60 * 60 * 24)) > 0;
                const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date();

                return (
                  <Card
                    key={quote.id}
                    className={`border shadow-sm bg-white cursor-pointer hover:shadow-md transition-all ${
                      quote.status === 'pending' ? 'border-blue-200' : 'border-slate-200'
                    } ${isExpiring ? 'ring-2 ring-amber-300' : ''} ${isExpired ? 'opacity-60' : ''}`}
                    onClick={() => handleQuoteClick(quote)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{quote.quote_number || `Q-${quote.id.slice(0, 6)}`}</h3>
                          <Badge className={`text-xs px-1.5 py-0 h-5 ${
                            quote.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                            quote.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                            quote.status === 'converted' ? 'bg-purple-100 text-purple-700' :
                            quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {quote.status}
                          </Badge>
                          {isExpiring && <Badge className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0 h-5">Expiring</Badge>}
                          {isExpired && quote.status === 'pending' && <Badge className="bg-red-100 text-red-700 text-xs px-1.5 py-0 h-5">Expired</Badge>}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-indigo-600">${quote.quoted_rate?.toLocaleString() || '0'}</p>
                          {quote.margin !== undefined && (
                            <p className="text-xs text-slate-500">Margin: ${quote.margin.toLocaleString()}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs mb-2">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span className="text-slate-700 truncate">{quote.pickup_location?.city}, {quote.pickup_location?.state}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span className="text-slate-700 truncate">{quote.dropoff_location?.city}, {quote.dropoff_location?.state}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{quote.equipment_type?.replace(/_/g, ' ') || 'N/A'}</span>
                        <span>•</span>
                        <span>{quote.weight?.toLocaleString() || 'N/A'} lbs</span>
                        {quote.pickup_date && (
                          <>
                            <span>•</span>
                            <span>{format(new Date(quote.pickup_date), 'MMM d')}</span>
                          </>
                        )}
                      </div>

                      {assignedCarrier && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                          <Truck className="w-3 h-3" />
                          <span>{assignedCarrier.company_name}</span>
                        </div>
                      )}

                      {quote.status === 'pending' && (
                        <Button size="sm" className="w-full mt-2 h-7 text-xs bg-gradient-to-r from-emerald-600 to-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Review & Approve
                        </Button>
                      )}

                      {quote.status === 'accepted' && !quote.converted_to_load_id && (
                        <Button size="sm" className="w-full mt-2 h-7 text-xs bg-gradient-to-r from-purple-600 to-pink-600">
                          <Truck className="w-3 h-3 mr-1" />
                          Convert to Load
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredQuotes.length === 0 && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No quotes found</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Request your first spot quote'}
                  </p>
                  <Button size="sm" onClick={() => setShowSpotQuoteModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Zap className="w-4 h-4 mr-1" />
                    Request Spot Quote
                  </Button>
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
                
                {/* Pending Review Alert */}
                {pendingQuotes.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-blue-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <p className="font-semibold text-blue-900">Pending Review</p>
                    </div>
                    <p className="text-blue-700 mb-1.5">{pendingQuotes.length} quote{pendingQuotes.length > 1 ? 's' : ''} awaiting your decision</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-xs w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => setStatusFilter('pending')}
                    >
                      Review Now
                    </Button>
                  </div>
                )}

                {/* Expiring Quotes Alert */}
                {expiringQuotes.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-amber-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <p className="font-semibold text-amber-900">Expiring Soon</p>
                    </div>
                    <p className="text-amber-700 mb-1.5">{expiringQuotes.length} quote{expiringQuotes.length > 1 ? 's' : ''} expiring in 3 days</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs w-full border-amber-200 text-amber-700 hover:bg-amber-50">
                      View Expiring
                    </Button>
                  </div>
                )}

                {/* Expired Quotes */}
                {expiredQuotes.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-red-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <XCircle className="w-3 h-3 text-red-600" />
                      <p className="font-semibold text-red-900">Expired</p>
                    </div>
                    <p className="text-red-700">{expiredQuotes.length} quote{expiredQuotes.length > 1 ? 's have' : ' has'} expired</p>
                  </div>
                )}

                {/* High Value Quotes */}
                {highValueQuotes.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      <p className="font-semibold text-emerald-900">High Value</p>
                    </div>
                    <p className="text-emerald-700 mb-1.5">{highValueQuotes.length} pending quote{highValueQuotes.length > 1 ? 's' : ''} over $5,000</p>
                    <Button size="sm" variant="outline" className="h-6 text-xs w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      Prioritize
                    </Button>
                  </div>
                )}

                {/* Ready to Convert */}
                {acceptedQuotes.length > 0 && (
                  <div className="p-2 bg-white rounded-lg border border-purple-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Truck className="w-3 h-3 text-purple-600" />
                      <p className="font-semibold text-purple-900">Ready to Convert</p>
                    </div>
                    <p className="text-purple-700 mb-1.5">{acceptedQuotes.length} accepted quote{acceptedQuotes.length > 1 ? 's' : ''} can become loads</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-xs w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => setStatusFilter('accepted')}
                    >
                      Convert to Loads
                    </Button>
                  </div>
                )}

                {/* All Clear */}
                {pendingQuotes.length === 0 && expiringQuotes.length === 0 && acceptedQuotes.length === 0 && (
                  <div className="p-2 bg-white rounded-lg border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <p className="font-semibold text-emerald-900">All Caught Up</p>
                    </div>
                    <p className="text-emerald-700">No pending actions on quotes</p>
                  </div>
                )}

                {/* Market Intelligence */}
                <div className="p-2 bg-white rounded-lg border border-indigo-200 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BarChart2 className="w-3 h-3 text-indigo-600" />
                    <p className="font-semibold text-indigo-900">Market Tip</p>
                  </div>
                  <p className="text-indigo-700">Check market rates before sending new quotes</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border border-slate-200 shadow-sm">
              <CardHeader className="py-2.5 px-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2 text-xs font-semibold">
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2.5 max-h-[200px] overflow-y-auto">
                {quoteHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">No recent activity</p>
                ) : (
                  <div className="space-y-1.5">
                    {quoteHistory.slice(0, 6).map((h) => (
                      <div key={h.id} className="p-2 bg-slate-50 rounded-lg text-xs">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-slate-900 capitalize">{h.action_type}</span>
                          <span className="text-slate-400">{h.created_date ? format(new Date(h.created_date), 'MMM d') : ''}</span>
                        </div>
                        <p className="text-slate-600 truncate">{h.quote_number || h.quote_id?.slice(0, 8)}</p>
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
                    onClick={() => setShowSpotQuoteModal(true)}
                  >
                    <Zap className="w-3 h-3 mr-1.5 text-purple-600" />
                    Request Spot Quote
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full h-7 text-xs justify-start"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus className="w-3 h-3 mr-1.5 text-indigo-600" />
                    Create Manual Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quote Form Modal */}
        {showCreateModal && (
          <QuoteForm
            quote={selectedQuote}
            onSave={handleSaveQuote}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedQuote(null);
            }}
            isLoading={createQuoteMutation.isPending || updateQuoteMutation.isPending}
          />
        )}

        {/* Spot Quote Request Modal */}
        {showSpotQuoteModal && (
          <SpotQuoteRequestModal
            onSubmit={handleSpotQuoteRequest}
            onClose={() => setShowSpotQuoteModal(false)}
            isLoading={createQuoteMutation.isPending}
          />
        )}

        {/* Quote Approval Modal */}
        {showApprovalModal && selectedQuote && (
          <QuoteApprovalModal
            quote={selectedQuote}
            carriers={carriers}
            onApprove={handleApproveQuote}
            onReject={handleRejectQuote}
            onClose={() => {
              setShowApprovalModal(false);
              setSelectedQuote(null);
            }}
          />
        )}

      </div>
    </div>
  );
}