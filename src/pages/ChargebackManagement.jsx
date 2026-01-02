import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, EmptyState, FormField } from "@/components/design-system";
import {
  AlertTriangle,
  DollarSign,
  FileText,
  Download,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ChargebackManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: '',
    chargeback_type: 'SHORT_PAY',
    amount_cents: 0,
    reason_text: ''
  });

  const queryClient = useQueryClient();

  const { data: chargebacks } = useQuery({
    queryKey: ['chargebacks'],
    queryFn: () => base44.entities.Chargeback.list('-created_date', 200),
    initialData: [],
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 200),
    initialData: [],
  });

  const createChargebackMutation = useMutation({
    mutationFn: (data) => base44.entities.Chargeback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargebacks'] });
      setShowCreateModal(false);
      setFormData({ invoice_id: '', chargeback_type: 'SHORT_PAY', amount_cents: 0, reason_text: '' });
    },
  });

  const updateChargebackMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Chargeback.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chargebacks'] });
    },
  });

  const openChargebacks = chargebacks.filter(c => c.status === 'OPEN');
  const disputedChargebacks = chargebacks.filter(c => c.status === 'DISPUTED');
  const closedChargebacks = chargebacks.filter(c => c.status === 'CLOSED');
  
  const totalOpenAmount = openChargebacks.reduce((sum, c) => sum + (c.amount_cents || 0), 0) / 100;

  const handleCreate = () => {
    if (!formData.invoice_id || !formData.reason_text || formData.amount_cents <= 0) {
      alert('Please fill all fields');
      return;
    }

    createChargebackMutation.mutate({
      org_id: 'default',
      ...formData,
      chargeback_number: `CB-${Date.now()}`,
      initiated_by: 'current_user@tms.ai',
      initiated_at: new Date().toISOString(),
      status: 'OPEN'
    });
  };

  const handleApprove = (chargebackId) => {
    updateChargebackMutation.mutate({
      id: chargebackId,
      data: {
        status: 'APPROVED',
        approved_by: 'current_user@tms.ai',
        approved_at: new Date().toISOString()
      }
    });
  };

  const handleDispute = (chargebackId, reason) => {
    updateChargebackMutation.mutate({
      id: chargebackId,
      data: {
        status: 'DISPUTED',
        disputed_by: 'current_user@tms.ai',
        disputed_at: new Date().toISOString(),
        dispute_reason: reason || 'Disputed by carrier'
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Chargeback Management"
        subtitle={`Track deductions and disputes • ${openChargebacks.length} open cases`}
        icon={AlertTriangle}
        primaryAction={{
          label: 'Create Chargeback',
          icon: FileText,
          onClick: () => setShowCreateModal(true)
        }}
        secondaryActions={[
          { label: 'Export', icon: Download, onClick: () => alert('Export coming soon') }
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600">{openChargebacks.length}</p>
              <p className="text-xs text-slate-500">Open</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">{disputedChargebacks.length}</p>
              <p className="text-xs text-slate-500">Disputed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-600">{closedChargebacks.length}</p>
              <p className="text-xs text-slate-500">Closed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-purple-600">${(totalOpenAmount / 1000).toFixed(0)}K</p>
              <p className="text-xs text-slate-500">Open $</p>
            </div>
          </div>
        </div>

        {/* Chargebacks List */}
        <Card>
          <CardHeader>
            <CardTitle>Chargeback Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {chargebacks.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No chargebacks"
                description="Chargebacks track short payments and deductions"
              />
            ) : (
              <div className="space-y-3">
                {chargebacks.map(cb => (
                  <div key={cb.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{cb.chargeback_number}</h3>
                          <Badge className={
                            cb.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                            cb.status === 'DISPUTED' ? 'bg-red-100 text-red-800' :
                            cb.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }>
                            {cb.status}
                          </Badge>
                          <Badge variant="outline">{cb.chargeback_type}</Badge>
                        </div>
                        <p className="text-sm text-slate-700">{cb.reason_text}</p>
                      </div>
                      <p className="text-lg font-bold text-red-600">-${((cb.amount_cents || 0) / 100).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                      <span>Invoice: {cb.invoice_id?.slice(0, 8)}</span>
                      <span>{new Date(cb.created_date).toLocaleDateString()}</span>
                    </div>
                    {cb.status === 'OPEN' && (
                      <div className="flex gap-2 mt-3">
                        <Button onClick={() => handleApprove(cb.id)} size="sm" variant="outline" className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button onClick={() => handleDispute(cb.id, prompt('Dispute reason:'))} size="sm" variant="outline" className="flex-1">
                          <MessageSquare className="w-4 h-4 mr-2" /> Dispute
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Chargeback</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <FormField label="Invoice" required>
                <Select value={formData.invoice_id} onValueChange={(value) => setFormData({...formData, invoice_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map(inv => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.invoice_number} - ${inv.total_amount?.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Type" required>
                <Select value={formData.chargeback_type} onValueChange={(value) => setFormData({...formData, chargeback_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHORT_PAY">Short Pay</SelectItem>
                    <SelectItem value="CLAIM_DEDUCT">Claim Deduction</SelectItem>
                    <SelectItem value="LATE_PENALTY">Late Penalty</SelectItem>
                    <SelectItem value="DAMAGE">Damage</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Amount" required helper="USD">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={(formData.amount_cents / 100) || ''}
                  onChange={(e) => setFormData({...formData, amount_cents: Math.round(parseFloat(e.target.value || 0) * 100)})}
                />
              </FormField>
              <FormField label="Reason" required>
                <Textarea
                  value={formData.reason_text}
                  onChange={(e) => setFormData({...formData, reason_text: e.target.value})}
                  placeholder="Explain why this deduction is being applied..."
                />
              </FormField>
              <Button onClick={handleCreate} className="w-full">Create Chargeback</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}