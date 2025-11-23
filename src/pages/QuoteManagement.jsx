import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  History, // Added History icon
} from "lucide-react";

import QuoteForm from "../components/quotes/QuoteForm";
import SpotQuoteRequestModal from "../components/quotes/SpotQuoteRequestModal";
import QuoteApprovalModal from "../components/quotes/QuoteApprovalModal";

export default function QuoteManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSpotQuoteModal, setShowSpotQuoteModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  // Placeholder for currentUser. In a real app, this would come from an auth context or prop.
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

  const filteredQuotes = quotes.filter(quote => {
    if (statusFilter === 'all') return true;
    return quote.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
              Quote Management
            </h1>
            <p className="text-slate-600 mt-2">
              Request spot quotes, manage bids, and convert to loads
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSpotQuoteModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Request Spot Quote
            </Button>
            <Button onClick={() => setShowCreateModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Quotes</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {quotes.filter(q => q.status === 'pending').length}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Accepted</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {quotes.filter(q => q.status === 'accepted').length}
                  </p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Converted</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {quotes.filter(q => q.status === 'converted').length}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Total Value</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    ${quotes.reduce((sum, q) => sum + (q.quoted_rate || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            onClick={() => setStatusFilter('all')}
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All ({quotes.length})
          </Button>
          <Button
            onClick={() => setStatusFilter('pending')}
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            className={statusFilter === 'pending' ? 'bg-blue-600 text-white' : ''}
          >
            Pending ({quotes.filter(q => q.status === 'pending').length})
          </Button>
          <Button
            onClick={() => setStatusFilter('accepted')}
            variant={statusFilter === 'accepted' ? 'default' : 'outline'}
            size="sm"
            className={statusFilter === 'accepted' ? 'bg-emerald-600 text-white' : ''}
          >
            Accepted ({quotes.filter(q => q.status === 'accepted').length})
          </Button>
          <Button
            onClick={() => setStatusFilter('converted')}
            variant={statusFilter === 'converted' ? 'default' : 'outline'}
            size="sm"
            className={statusFilter === 'converted' ? 'bg-purple-600 text-white' : ''}
          >
            Converted ({quotes.filter(q => q.status === 'converted').length})
          </Button>
        </div>

        {/* Quotes List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQuotes.map((quote) => {
            const assignedCarrier = carriers.find(c => c.id === quote.approved_carrier_id);
            const history = getQuoteHistory(quote.id); // Get history for the current quote

            return (
              <Card
                key={quote.id}
                className={`border-0 shadow-xl bg-white cursor-pointer hover:shadow-2xl transition-all ${
                  quote.status === 'pending' ? 'ring-2 ring-blue-300 animate-pulse' : ''
                }`}
                onClick={() => handleQuoteClick(quote)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {quote.quote_number}
                      </h3>
                      <Badge className={
                        quote.status === 'pending' ? 'bg-blue-100 text-blue-800 mt-2' :
                        quote.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 mt-2' :
                        quote.status === 'converted' ? 'bg-purple-100 text-purple-800 mt-2' :
                        'bg-slate-100 text-slate-800 mt-2'
                      }>
                        {quote.status}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">
                        ${quote.quoted_rate?.toLocaleString() || '0'}
                      </p>
                      {quote.margin !== undefined && (
                        <p className="text-sm text-slate-600">
                          Margin: ${quote.margin.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-700">
                        {quote.pickup_location?.city}, {quote.pickup_location?.state}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-700">
                        {quote.dropoff_location?.city}, {quote.dropoff_location?.state}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Mode</p>
                      <p className="font-semibold text-slate-900">{quote.mode}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Equipment</p>
                      <p className="font-semibold text-slate-900">{quote.equipment_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Weight</p>
                      <p className="font-semibold text-slate-900">{quote.weight || 'N/A'} lbs</p>
                    </div>
                  </div>

                  {assignedCarrier && (
                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-xs font-semibold text-indigo-900 mb-1">Assigned Carrier:</p>
                      <p className="text-sm text-indigo-800">{assignedCarrier.company_name}</p>
                    </div>
                  )}

                  {/* Quote History Preview */}
                  {history.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <History className="w-4 h-4 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-700">Recent Activity:</p>
                      </div>
                      <div className="space-y-1">
                        {history.slice(0, 2).map((h) => (
                          <div key={h.id} className="text-xs text-slate-600">
                            <span className="font-semibold capitalize">{h.action_type}</span> by {h.action_by} - {new Date(h.created_date).toLocaleDateString()}
                          </div>
                        ))}
                        {history.length > 2 && (
                          <p className="text-xs text-slate-500 mt-1">+ {history.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  {quote.status === 'pending' && (
                    <Button className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Review & Approve
                    </Button>
                  )}

                  {quote.status === 'accepted' && !quote.converted_to_load_id && (
                    <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <Truck className="w-4 h-4 mr-2" />
                      Convert to Load
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredQuotes.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No quotes found</h3>
            <p className="text-slate-600">
              {statusFilter !== 'all' ? 'Try adjusting your filters' : 'Request your first spot quote to get started'}
            </p>
          </div>
        )}

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