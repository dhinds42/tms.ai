import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Search
} from "lucide-react";

export default function SettlementManagement() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: settlements, isLoading: settlementsLoading } = useQuery({
    queryKey: ['settlements'],
    queryFn: () => base44.entities.Settlement.list('-created_date', 100),
    initialData: [],
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
  });

  const updateSettlementMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Settlement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
    },
  });

  const handleApproveSettlement = (settlementId) => {
    updateSettlementMutation.mutate({
      id: settlementId,
      data: {
        status: 'approved',
        approved_date: new Date().toISOString()
      }
    });
  };

  const handlePaySettlement = (settlementId) => {
    updateSettlementMutation.mutate({
      id: settlementId,
      data: {
        status: 'paid',
        paid_date: new Date().toISOString()
      }
    });
  };

  // Filter settlements
  const filteredSettlements = settlements.filter(s => {
    const statusMatch = statusFilter === 'all' || s.status === statusFilter;
    const searchMatch = searchTerm === '' ||
      s.settlement_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.driver_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.carrier_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Calculate stats
  const totalPending = settlements.filter(s => s.status === 'pending').length;
  const totalApproved = settlements.filter(s => s.status === 'approved').length;
  const totalPaid = settlements.filter(s => s.status === 'paid').length;
  const pendingAmount = settlements
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + (s.total_amount || 0), 0);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-800',
      'approved': 'bg-blue-100 text-blue-800',
      'paid': 'bg-emerald-100 text-emerald-800',
      'disputed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 bg-clip-text text-transparent">
              Settlement Management
            </h1>
            <p className="text-slate-600 mt-2">Driver & carrier payment settlements with detailed pay calculations</p>
          </div>
          <Badge className={operatingMode === 'carrier' ? 'bg-blue-600' : 'bg-indigo-600'}>
            {operatingMode.toUpperCase()} MODE
          </Badge>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Review</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{totalPending}</p>
                </div>
                <Clock className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Approved</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{totalApproved}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Paid</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">{totalPaid}</p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Pending Amount</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">${pendingAmount.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search by settlement #, driver, or carrier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList className="bg-slate-100">
                <TabsTrigger value="all">All ({settlements.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({totalPending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({totalApproved})</TabsTrigger>
                <TabsTrigger value="paid">Paid ({totalPaid})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Settlements List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSettlements.length === 0 ? (
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">No settlements found</h3>
                  <p className="text-slate-600">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No settlements available'}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredSettlements.map((settlement) => {
              const driver = drivers.find(d => d.id === settlement.driver_id);
              const carrier = carriers.find(c => c.id === settlement.carrier_id);
              const recipient = driver || carrier;

              return (
                <Card key={settlement.id} className="border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardHeader className="border-b border-slate-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{settlement.settlement_number || settlement.id.slice(0, 8)}</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                          {recipient ? `${recipient.first_name || recipient.company_name} ${recipient.last_name || ''}` : 'Unknown'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(settlement.status)}>{settlement.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Period</span>
                        <span className="font-semibold text-slate-900">
                          {new Date(settlement.period_start).toLocaleDateString()} - {new Date(settlement.period_end).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                        <span className="text-sm text-slate-600">Total Amount</span>
                        <span className="text-2xl font-bold text-emerald-600">${settlement.total_amount?.toLocaleString() || 0}</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Gross Pay</span>
                          <span className="font-semibold">${settlement.gross_amount?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Deductions</span>
                          <span className="font-semibold text-red-600">-${settlement.deductions_amount?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Advances</span>
                          <span className="font-semibold text-red-600">-${settlement.advances_amount?.toLocaleString() || 0}</span>
                        </div>
                      </div>

                      {settlement.status === 'pending' && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={() => handleApproveSettlement(settlement.id)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Dispute
                          </Button>
                        </div>
                      )}

                      {settlement.status === 'approved' && (
                        <Button
                          onClick={() => handlePaySettlement(settlement.id)}
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-600"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Mark as Paid
                        </Button>
                      )}

                      {settlement.status === 'paid' && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                          <p className="text-sm font-semibold text-emerald-800">
                            ✓ Paid on {new Date(settlement.paid_date).toLocaleDateString()}
                          </p>
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