import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle, CheckCircle, TrendingUp, DollarSign } from "lucide-react";

export default function CreditManagement({ loads, shippers, operatingMode }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate customer credit data
  const customersWithCredit = shippers.map(shipper => {
    const shipperLoads = loads.filter(l => l.shipper_id === shipper.id);
    const totalAR = shipperLoads.filter(l => l.invoice_status !== 'paid').reduce((sum, l) => sum + (l.customer_rate || 0), 0);
    const overdueAmount = shipperLoads.filter(l => {
      if (!l.invoice_due_date || l.invoice_status === 'paid') return false;
      return new Date(l.invoice_due_date) < new Date();
    }).reduce((sum, l) => sum + (l.customer_rate || 0), 0);

    return {
      id: shipper.id,
      name: shipper.company_name,
      credit_limit: shipper.credit_limit || 50000,
      current_ar: totalAR,
      overdue_ar: overdueAmount,
      credit_available: (shipper.credit_limit || 50000) - totalAR,
      credit_hold: shipper.credit_hold || false,
      payment_terms: shipper.payment_terms || 'net_30'
    };
  });

  const onCreditHold = customersWithCredit.filter(c => c.credit_hold);
  const overCreditLimit = customersWithCredit.filter(c => c.current_ar > c.credit_limit);
  const totalCreditExtended = customersWithCredit.reduce((sum, c) => sum + c.credit_limit, 0);
  const totalCreditUsed = customersWithCredit.reduce((sum, c) => sum + c.current_ar, 0);

  const filteredCustomers = customersWithCredit.filter(c => 
    searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlaceCreditHold = (customerId) => {
    alert(`Credit hold placed on customer ${customerId}`);
  };

  const handleRemoveCreditHold = (customerId) => {
    alert(`Credit hold removed from customer ${customerId}`);
  };

  const handleAdjustCreditLimit = (customerId) => {
    const newLimit = prompt('Enter new credit limit:');
    if (newLimit) {
      alert(`Credit limit updated to $${parseFloat(newLimit).toLocaleString()}`);
    }
  };

  const handleCreateCredit = (customerId) => {
    const amount = prompt('Enter credit amount:');
    if (amount) {
      alert(`$${amount} credit created for customer`);
    }
  };

  const handleApplyCredit = (customerId) => {
    alert('Apply credit to invoice');
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Credit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Total Credit Extended</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ${(totalCreditExtended / 1000).toFixed(0)}K
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Credit in Use</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  ${(totalCreditUsed / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Over Limit</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{overCreditLimit.length}</p>
                <p className="text-sm text-slate-600 mt-1">customers</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">On Credit Hold</p>
                <p className="text-3xl font-bold text-slate-600 mt-2">{onCreditHold.length}</p>
                <p className="text-sm text-slate-600 mt-1">customers</p>
              </div>
              <XCircle className="w-12 h-12 text-slate-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Customer Credit List */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Customer Credit & Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className={`p-4 border rounded-lg ${
                customer.credit_hold ? 'border-red-300 bg-red-50' :
                customer.current_ar > customer.credit_limit ? 'border-amber-300 bg-amber-50' :
                'border-slate-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-900">{customer.name}</h4>
                      {customer.credit_hold && (
                        <Badge className="bg-red-600">
                          <XCircle className="w-3 h-3 mr-1" />
                          Credit Hold
                        </Badge>
                      )}
                      {customer.current_ar > customer.credit_limit && (
                        <Badge className="bg-amber-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Over Limit
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Credit Limit</p>
                        <p className="font-semibold text-slate-900">
                          ${customer.credit_limit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Current AR</p>
                        <p className="font-semibold text-amber-600">
                          ${customer.current_ar.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Available Credit</p>
                        <p className="font-semibold text-emerald-600">
                          ${customer.credit_available.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Overdue</p>
                        <p className="font-semibold text-red-600">
                          ${customer.overdue_ar.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {customer.credit_hold ? (
                      <Button 
                        onClick={() => handleRemoveCreditHold(customer.id)}
                        size="sm"
                        className="bg-emerald-600 text-white"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Remove Hold
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handlePlaceCreditHold(customer.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Place Hold
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleAdjustCreditLimit(customer.id)}
                      size="sm"
                      variant="outline"
                    >
                      Adjust Limit
                    </Button>
                    <Button 
                      onClick={() => handleCreateCredit(customer.id)}
                      size="sm"
                      variant="outline"
                    >
                      Create Credit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}