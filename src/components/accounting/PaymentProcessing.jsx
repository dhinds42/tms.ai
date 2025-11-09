import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DollarSign, CreditCard, Download, Trash2, Edit } from "lucide-react";

export default function PaymentProcessing({ loads, shippers, carriers, operatingMode }) {
  const [activeTab, setActiveTab] = useState("receive");
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Mock payment history
  const payments = loads.filter(l => l.payment_received_date).map(load => ({
    id: load.id,
    type: 'received',
    payment_date: load.payment_received_date,
    amount: load.customer_rate,
    reference: load.load_number,
    customer: load.shipper_id,
    method: 'check'
  }));

  const handleReceivePayment = () => {
    alert('Payment recorded successfully');
  };

  const handleChargeCreditCard = () => {
    alert('Processing credit card payment...');
  };

  const handleDeletePayment = (paymentId) => {
    if (confirm('Delete this payment?')) {
      alert('Payment deleted');
    }
  };

  const handleModifyPayment = (paymentId) => {
    alert('Modify payment');
  };

  return (
    <div className="space-y-6 mt-6">
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="receive">Receive Payments</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="credit">Credit Card Processing</TabsTrigger>
          <TabsTrigger value="advance">Truckload Advance</TabsTrigger>
        </TabsList>

        {/* Receive Payments Tab */}
        <TabsContent value="receive">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle>Receive Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <select className="w-full mt-2 px-3 py-2 border rounded-lg">
                    <option>Select customer...</option>
                    {shippers.map(s => (
                      <option key={s.id} value={s.id}>{s.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Payment Amount</Label>
                  <Input type="number" placeholder="0.00" className="mt-2" />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <select className="w-full mt-2 px-3 py-2 border rounded-lg">
                    <option>Check</option>
                    <option>ACH</option>
                    <option>Wire Transfer</option>
                    <option>Credit Card</option>
                    <option>Cash</option>
                  </select>
                </div>
                <div>
                  <Label>Reference Number</Label>
                  <Input placeholder="Check #, Transaction ID, etc." className="mt-2" />
                </div>
                <div>
                  <Label>Payment Date</Label>
                  <Input type="date" className="mt-2" />
                </div>
                <div>
                  <Label>Apply to Invoice(s)</Label>
                  <Input placeholder="Invoice numbers..." className="mt-2" />
                </div>
              </div>
              <Button onClick={handleReceivePayment} className="w-full bg-emerald-600 text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment History</CardTitle>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{payment.reference}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <Button 
                          onClick={() => handleModifyPayment(payment.id)}
                          size="sm" 
                          variant="outline"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          onClick={() => handleDeletePayment(payment.id)}
                          size="sm" 
                          variant="outline"
                          className="text-red-600 border-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Card Processing Tab */}
        <TabsContent value="credit">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle>Credit Card Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  💳 Credit card processing includes a {localStorage.getItem('credit_card_fee') || '3.0'}% surcharge
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <select className="w-full mt-2 px-3 py-2 border rounded-lg">
                    <option>Select customer...</option>
                    {shippers.map(s => (
                      <option key={s.id} value={s.id}>{s.company_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Invoice Amount</Label>
                  <Input type="number" placeholder="0.00" className="mt-2" />
                </div>
              </div>
              <Button onClick={handleChargeCreditCard} className="w-full bg-indigo-600 text-white">
                <CreditCard className="w-4 h-4 mr-2" />
                Charge Credit Card
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Truckload Advance Tab */}
        <TabsContent value="advance">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <CardTitle>Truckload Advance Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Process advance payments to carriers before delivery completion
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Load Number</Label>
                  <Input placeholder="Select load..." className="mt-2" />
                </div>
                <div>
                  <Label>Advance Amount</Label>
                  <Input type="number" placeholder="0.00" className="mt-2" />
                </div>
                <div>
                  <Label>Carrier/Driver</Label>
                  <Input placeholder="Auto-filled from load" className="mt-2" disabled />
                </div>
                <div>
                  <Label>Advance Percentage</Label>
                  <Input type="number" placeholder="e.g., 40%" className="mt-2" />
                </div>
              </div>
              <Button className="w-full bg-purple-600 text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                Process Advance Payment
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

    </div>
  );
}