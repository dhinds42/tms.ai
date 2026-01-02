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
  Shield,
  AlertTriangle,
  DollarSign,
  Ban,
  CheckCircle,
  Clock,
  Search,
  TrendingUp,
  Users
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

export default function CreditHoldManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [holdReason, setHoldReason] = useState('');
  const [holdStatus, setHoldStatus] = useState('SOFT_HOLD');
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date', 100),
    initialData: [],
  });

  const { data: parties } = useQuery({
    queryKey: ['parties'],
    queryFn: () => base44.entities.Party.list('-created_date', 200),
    initialData: [],
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 500),
    initialData: [],
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSelectedCustomer(null);
      setHoldReason('');
    },
  });

  const customersWithParties = customers.map(c => {
    const party = parties.find(p => p.id === c.party_id);
    return { ...c, party };
  });

  const onHoldCustomers = customersWithParties.filter(c => c.credit_hold_status && c.credit_hold_status !== 'OFF');
  const hardHolds = onHoldCustomers.filter(c => c.credit_hold_status === 'HARD_HOLD');
  const softHolds = onHoldCustomers.filter(c => c.credit_hold_status === 'SOFT_HOLD');

  const filteredCustomers = customersWithParties.filter(c =>
    !searchTerm ||
    c.party?.legal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.party?.dba_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSetHold = () => {
    if (!selectedCustomer || !holdReason) {
      alert('Please provide a reason');
      return;
    }

    updateCustomerMutation.mutate({
      id: selectedCustomer.id,
      data: {
        credit_hold_status: holdStatus,
        credit_hold_reason: holdReason,
        credit_hold_set_by: 'current_user@tms.ai',
        credit_hold_set_at: new Date().toISOString()
      }
    });
  };

  const handleRemoveHold = (customer) => {
    updateCustomerMutation.mutate({
      id: customer.id,
      data: {
        credit_hold_status: 'OFF',
        credit_hold_reason: null,
        credit_hold_set_by: null,
        credit_hold_set_at: null
      }
    });
  };

  const getCustomerOutstanding = (customerId) => {
    const customerInvoices = invoices.filter(inv => 
      inv.customer_party_id === customerId && 
      ['open', 'sent', 'overdue', 'partial'].includes(inv.status)
    );
    return customerInvoices.reduce((sum, inv) => sum + (inv.amount_remaining || inv.total_amount || 0), 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Credit Hold Management"
        subtitle={`Monitor customer credit status • ${onHoldCustomers.length} customers on hold`}
        icon={Shield}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">{customers.length}</p>
              <p className="text-xs text-slate-500">Customers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Ban className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-600">{hardHolds.length}</p>
              <p className="text-xs text-slate-500">Hard Holds</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600">{softHolds.length}</p>
              <p className="text-xs text-slate-500">Soft Holds</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-600">{customers.length - onHoldCustomers.length}</p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers on Hold Alert */}
        {onHoldCustomers.length > 0 && (
          <Card className="border-l-4 border-l-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-4 h-4" /> Customers on Credit Hold
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {onHoldCustomers.map(customer => (
                <div key={customer.id} className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{customer.party?.legal_name}</h3>
                      <p className="text-xs text-slate-500">Outstanding: ${getCustomerOutstanding(customer.party_id).toLocaleString()}</p>
                    </div>
                    <Badge className={customer.credit_hold_status === 'HARD_HOLD' ? 'bg-red-600' : 'bg-amber-600'}>
                      {customer.credit_hold_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{customer.credit_hold_reason}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Set by {customer.credit_hold_set_by} on {customer.credit_hold_set_at ? new Date(customer.credit_hold_set_at).toLocaleDateString() : 'N/A'}</span>
                    <Button onClick={() => handleRemoveHold(customer)} size="sm" variant="outline" className="h-7">
                      Remove Hold
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Customers</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">Set Credit Hold</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Credit Hold</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <FormField label="Customer" required>
                      <Select onValueChange={(value) => setSelectedCustomer(customersWithParties.find(c => c.id === value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customersWithParties.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.party?.legal_name || 'Unknown'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Hold Type" required>
                      <Select value={holdStatus} onValueChange={setHoldStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SOFT_HOLD">Soft Hold (Block Dispatch)</SelectItem>
                          <SelectItem value="HARD_HOLD">Hard Hold (Block Load Creation)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Reason" required>
                      <Textarea
                        value={holdReason}
                        onChange={(e) => setHoldReason(e.target.value)}
                        placeholder="e.g., Past due invoices over $50K"
                      />
                    </FormField>
                    <Button onClick={handleSetHold} className="w-full" disabled={!selectedCustomer || !holdReason}>
                      Set Credit Hold
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No customers found"
                description="Try adjusting your search"
              />
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map(customer => {
                  const outstanding = getCustomerOutstanding(customer.party_id);
                  return (
                    <div key={customer.id} className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{customer.party?.legal_name}</h3>
                            {customer.credit_hold_status && customer.credit_hold_status !== 'OFF' ? (
                              <Badge className={customer.credit_hold_status === 'HARD_HOLD' ? 'bg-red-600' : 'bg-amber-600'}>
                                {customer.credit_hold_status}
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-600">ACTIVE</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-slate-500 text-xs">Credit Limit</p>
                              <p className="font-semibold">
                                {customer.credit_limit_cents ? `$${(customer.credit_limit_cents / 100).toLocaleString()}` : 'Not Set'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs">Outstanding</p>
                              <p className="font-semibold text-amber-600">${outstanding.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs">Payment Terms</p>
                              <p className="font-semibold">Net {customer.default_payment_terms_days || 30}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs">Status</p>
                              <Badge variant="outline" className={
                                customer.credit_hold_status === 'HARD_HOLD' ? 'border-red-600 text-red-600' :
                                customer.credit_hold_status === 'SOFT_HOLD' ? 'border-amber-600 text-amber-600' :
                                'border-emerald-600 text-emerald-600'
                              }>
                                {customer.credit_hold_status || 'OFF'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}