import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radio,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Search,
  Zap
} from "lucide-react";
import AutomatedTendering from "../components/tendering/AutomatedTendering";

export default function LoadTendering() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAutomation, setShowAutomation] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState(null);
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
      data: {
        response_status: 'accepted',
        response_at: new Date().toISOString()
      }
    });
  };

  const handleDeclineTender = (tenderId) => {
    updateTenderMutation.mutate({
      id: tenderId,
      data: {
        response_status: 'declined',
        response_at: new Date().toISOString()
      }
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

  // Calculate stats
  const pendingCount = tenders.filter(t => t.response_status === 'pending').length;
  const acceptedCount = tenders.filter(t => t.response_status === 'accepted').length;
  const declinedCount = tenders.filter(t => t.response_status === 'declined').length;
  const acceptanceRate = tenders.length > 0 
    ? ((acceptedCount / tenders.length) * 100).toFixed(1)
    : 0;

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-800',
      'accepted': 'bg-emerald-100 text-emerald-800',
      'declined': 'bg-red-100 text-red-800',
      'expired': 'bg-slate-100 text-slate-800',
      'withdrawn': 'bg-slate-100 text-slate-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
              Load Tendering System
            </h1>
            <p className="text-slate-600 mt-2">AI-powered automated tendering with carrier intelligence</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAutomation(!showAutomation)}
              variant="outline"
              className="border-purple-300 text-purple-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {showAutomation ? 'Hide' : 'Show'} AI Automation
            </Button>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Send className="w-4 h-4 mr-2" />
              Send Tender
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Response</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingCount}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Accepted</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{acceptedCount}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Declined</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{declinedCount}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Acceptance Rate</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{acceptanceRate}%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Automated Tendering */}
        {showAutomation && loads.length > 0 && (
          <AutomatedTendering
            load={loads[0]}
            carriers={carriers}
            onTenderingComplete={(tenders) => {
              queryClient.invalidateQueries({ queryKey: ['tenders'] });
              setShowAutomation(false);
              alert(`✅ Successfully tendered to ${tenders.length} carriers!`);
            }}
          />
        )}

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by tender # or load..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">All ({tenders.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                <TabsTrigger value="accepted">Accepted ({acceptedCount})</TabsTrigger>
                <TabsTrigger value="declined">Declined ({declinedCount})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tenders List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTenders.length === 0 ? (
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Radio className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No tenders found</h3>
                  <p className="text-slate-600">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Send your first tender to get started'}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredTenders.map((tender) => {
              const load = loads.find(l => l.id === tender.shipment_id);
              const carrier = carriers.find(c => c.id === tender.tendered_to_carrier_party_id);

              return (
                <Card key={tender.id} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardHeader className="border-b border-slate-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{tender.tender_number || tender.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                          {carrier?.company_name || 'Unknown Carrier'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(tender.response_status)}>{tender.response_status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Load</span>
                        <span className="font-semibold text-slate-900">{load?.load_number || 'N/A'}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                        <span className="text-sm text-slate-600">Offered Rate</span>
                        <span className="text-2xl font-bold text-emerald-600">${tender.offered_rate_amount?.toLocaleString() || 0}</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tendered At</span>
                          <span className="font-semibold">{new Date(tender.tendered_at).toLocaleString()}</span>
                        </div>
                        {tender.valid_until && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Valid Until</span>
                            <span className="font-semibold">{new Date(tender.valid_until).toLocaleString()}</span>
                          </div>
                        )}
                        {tender.response_at && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Responded At</span>
                            <span className="font-semibold">{new Date(tender.response_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      {tender.response_status === 'pending' && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={() => handleAcceptTender(tender.id)}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleDeclineTender(tender.id)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}