import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, EmptyState } from "@/components/design-system";
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  DollarSign,
  FileText,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Mail
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function VarianceInbox() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('');
  const queryClient = useQueryClient();

  const { data: varianceCases } = useQuery({
    queryKey: ['variance-cases'],
    queryFn: () => base44.entities.VarianceCase.list('-created_date', 200),
    initialData: [],
  });

  const { data: quotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 200),
    initialData: [],
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 200),
    initialData: [],
  });

  const updateCaseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VarianceCase.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variance-cases'] });
      setSelectedCase(null);
      setResolutionAction('');
    },
  });

  const openCases = varianceCases.filter(c => c.status === 'OPEN');
  const acknowledgedCases = varianceCases.filter(c => c.status === 'ACKNOWLEDGED');
  const resolvedCases = varianceCases.filter(c => c.status === 'RESOLVED');
  
  const totalVariance = openCases.reduce((sum, c) => sum + Math.abs(c.variance_amount_cents || 0), 0) / 100;

  const handleAcknowledge = (caseId) => {
    updateCaseMutation.mutate({
      id: caseId,
      data: {
        status: 'ACKNOWLEDGED',
        acknowledged_by: 'current_user@tms.ai',
        acknowledged_at: new Date().toISOString()
      }
    });
  };

  const handleResolve = () => {
    if (!selectedCase || !resolutionAction) {
      alert('Please provide resolution details');
      return;
    }

    updateCaseMutation.mutate({
      id: selectedCase.id,
      data: {
        status: 'RESOLVED',
        resolved_by: 'current_user@tms.ai',
        resolved_at: new Date().toISOString(),
        resolution_action: resolutionAction
      }
    });
  };

  const handleNotifyCustomer = (caseId) => {
    updateCaseMutation.mutate({
      id: caseId,
      data: {
        customer_notified: true,
        customer_notified_at: new Date().toISOString()
      }
    });
    alert('Customer notification sent');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Variance Inbox"
        subtitle={`Quote vs Invoice variance tracking • ${openCases.length} open cases`}
        icon={TrendingUp}
        primaryAction={{
          label: 'Export',
          icon: Download,
          onClick: () => alert('Export coming soon')
        }}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600">{openCases.length}</p>
              <p className="text-xs text-slate-500">Open Cases</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{acknowledgedCases.length}</p>
              <p className="text-xs text-slate-500">Acknowledged</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-600">{resolvedCases.length}</p>
              <p className="text-xs text-slate-500">Resolved</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-purple-600">${(totalVariance / 1000).toFixed(0)}K</p>
              <p className="text-xs text-slate-500">Total Δ</p>
            </div>
          </div>
        </div>

        {/* Variance Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Variance Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {varianceCases.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No variance cases"
                description="Cases are created automatically when invoice varies from quote"
              />
            ) : (
              <div className="space-y-3">
                {varianceCases.map(varCase => {
                  const quote = quotes.find(q => q.id === varCase.quote_id);
                  const invoice = invoices.find(i => i.id === varCase.invoice_id);
                  const varianceDirection = varCase.variance_amount_cents >= 0 ? 'increase' : 'decrease';
                  
                  return (
                    <div key={varCase.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{varCase.case_number}</h3>
                            <Badge className={
                              varCase.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                              varCase.status === 'ACKNOWLEDGED' ? 'bg-blue-100 text-blue-800' :
                              varCase.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-800'
                            }>
                              {varCase.status}
                            </Badge>
                            {varCase.variance_category && (
                              <Badge variant="outline">{varCase.variance_category}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            Invoice {invoice?.invoice_number} • Quote {quote?.quote_number}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center gap-1 ${varianceDirection === 'increase' ? 'text-red-600' : 'text-emerald-600'}`}>
                            {varianceDirection === 'increase' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            <span className="text-lg font-bold">${Math.abs((varCase.variance_amount_cents || 0) / 100).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-500">{Math.abs((varCase.variance_percent_bps || 0) / 100).toFixed(1)}%</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs mb-3 p-2 bg-slate-50 rounded">
                        <div>
                          <span className="text-slate-500">Quote:</span>
                          <span className="ml-1 font-semibold">${((varCase.quote_total_cents || 0) / 100).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Invoice:</span>
                          <span className="ml-1 font-semibold">${((varCase.invoice_total_cents || 0) / 100).toLocaleString()}</span>
                        </div>
                      </div>

                      {varCase.status === 'OPEN' && (
                        <div className="flex gap-2">
                          <Button onClick={() => handleAcknowledge(varCase.id)} size="sm" variant="outline" className="flex-1">
                            <CheckCircle className="w-4 h-4 mr-2" /> Acknowledge
                          </Button>
                          <Button onClick={() => setSelectedCase(varCase)} size="sm" variant="outline" className="flex-1">
                            <FileText className="w-4 h-4 mr-2" /> Resolve
                          </Button>
                          <Button onClick={() => handleNotifyCustomer(varCase.id)} size="sm" variant="outline" className="flex-1">
                            <Mail className="w-4 h-4 mr-2" /> Notify
                          </Button>
                        </div>
                      )}
                      
                      {varCase.resolution_action && (
                        <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs">
                          <span className="font-semibold text-emerald-900">Resolution: </span>
                          <span className="text-emerald-700">{varCase.resolution_action}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resolve Modal */}
        <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Variance Case</DialogTitle>
            </DialogHeader>
            {selectedCase && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-sm font-semibold mb-1">{selectedCase.case_number}</p>
                  <p className="text-lg font-bold text-red-600">
                    Variance: ${Math.abs((selectedCase.variance_amount_cents || 0) / 100).toLocaleString()}
                    ({Math.abs((selectedCase.variance_percent_bps || 0) / 100).toFixed(1)}%)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Resolution Action</label>
                  <Textarea
                    value={resolutionAction}
                    onChange={(e) => setResolutionAction(e.target.value)}
                    placeholder="Explain how this variance was resolved..."
                  />
                </div>
                <Button onClick={handleResolve} className="w-full">Mark as Resolved</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}