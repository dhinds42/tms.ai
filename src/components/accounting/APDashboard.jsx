import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  DollarSign, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Download,
  Edit,
  Trash2,
  Clock
} from "lucide-react";

export default function APDashboard({ loads, carriers, drivers, operatingMode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBills, setSelectedBills] = useState([]);
  const [viewMode, setViewMode] = useState("unapproved"); // unapproved, approved, all

  // Calculate bills (unpaid carrier payments)
  const bills = loads.filter(l => l.status === 'delivered' && l.carrier_pay > 0).map(load => ({
    id: load.id,
    load_number: load.load_number || load.id.slice(0, 8),
    carrier_id: load.carrier_id,
    driver_id: load.driver_id,
    amount: load.carrier_pay || 0,
    delivery_date: load.actual_delivery || load.delivery_date,
    status: load.carrier_paid ? 'paid' : (load.bill_approved ? 'approved' : 'unapproved'),
    payment_date: load.carrier_payment_date,
    check_number: load.check_number,
    disputed: load.bill_disputed || false,
    dispute_reason: load.dispute_reason
  }));

  const unapprovedBills = bills.filter(b => b.status === 'unapproved');
  const approvedBills = bills.filter(b => b.status === 'approved');
  const paidBills = bills.filter(b => b.status === 'paid');
  const disputedBills = bills.filter(b => b.disputed);

  const totalUnapproved = unapprovedBills.reduce((sum, b) => sum + b.amount, 0);
  const totalApproved = approvedBills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = paidBills.reduce((sum, b) => sum + b.amount, 0);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = searchTerm === '' || 
      bill.load_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesView = viewMode === 'all' || 
      (viewMode === 'unapproved' && bill.status === 'unapproved') ||
      (viewMode === 'approved' && bill.status === 'approved');
    return matchesSearch && matchesView;
  });

  const getCarrierName = (carrierId, driverId) => {
    if (operatingMode === 'carrier' && driverId) {
      const driver = drivers.find(d => d.id === driverId);
      return driver?.full_name || 'Unknown Driver';
    }
    const carrier = carriers.find(c => c.id === carrierId);
    return carrier?.company_name || 'Unknown Carrier';
  };

  const handleApproveBill = (billId) => {
    alert(`Bill ${billId} approved for payment`);
    // In production: update load with bill_approved: true
  };

  const handleBulkApprove = () => {
    alert(`${selectedBills.length} bills approved`);
    setSelectedBills([]);
  };

  const handleAssignCheckNumber = (billId) => {
    const checkNum = prompt('Enter check number:');
    if (checkNum) {
      alert(`Check #${checkNum} assigned to bill ${billId}`);
      // In production: update load with check_number
    }
  };

  const handleDisputeBill = (billId) => {
    const reason = prompt('Enter dispute reason:');
    if (reason) {
      alert(`Bill ${billId} marked as disputed`);
      // In production: update load with disputed: true, dispute_reason
    }
  };

  const handlePayBill = (billId) => {
    alert(`Processing payment for bill ${billId}`);
    // In production: mark as paid, record payment date
  };

  const handleExportRemittances = () => {
    const csv = filteredBills.map(b => 
      `${b.load_number},${getCarrierName(b.carrier_id, b.driver_id)},${b.amount},${b.status}`
    ).join('\n');
    
    const blob = new Blob([`Load,Payee,Amount,Status\n${csv}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remittances_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* AP Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Unapproved Bills</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  ${(totalUnapproved / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">{unapprovedBills.length} bills</p>
              </div>
              <Clock className="w-12 h-12 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Approved Bills</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ${(totalApproved / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">{approvedBills.length} bills</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Paid Bills</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  ${(totalPaid / 1000).toFixed(1)}K
                </p>
                <p className="text-sm text-slate-600 mt-1">{paidBills.length} bills</p>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Disputed Bills</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{disputedBills.length}</p>
                <p className="text-sm text-slate-600 mt-1">Requires attention</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search bills by load number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={viewMode === 'unapproved' ? 'default' : 'outline'}
                onClick={() => setViewMode('unapproved')}
              >
                Unapproved ({unapprovedBills.length})
              </Button>
              <Button
                variant={viewMode === 'approved' ? 'default' : 'outline'}
                onClick={() => setViewMode('approved')}
              >
                Approved ({approvedBills.length})
              </Button>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                onClick={() => setViewMode('all')}
              >
                All Bills
              </Button>
            </div>
            <Button onClick={handleExportRemittances} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {selectedBills.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-900">
                {selectedBills.length} bills selected
              </span>
              <div className="flex gap-2">
                <Button onClick={handleBulkApprove} size="sm" className="bg-blue-600 text-white">
                  Approve Selected
                </Button>
                <Button onClick={() => setSelectedBills([])} size="sm" variant="outline">
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bills List */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Bills for Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredBills.map((bill) => (
              <div key={bill.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedBills.includes(bill.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBills([...selectedBills, bill.id]);
                        } else {
                          setSelectedBills(selectedBills.filter(id => id !== bill.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-slate-900">{bill.load_number}</h4>
                        <Badge className={
                          bill.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          bill.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }>
                          {bill.status}
                        </Badge>
                        {bill.disputed && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Disputed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        Payee: {getCarrierName(bill.carrier_id, bill.driver_id)}
                      </p>
                      <p className="text-sm text-slate-600">
                        Delivered: {bill.delivery_date ? new Date(bill.delivery_date).toLocaleDateString() : 'Pending'}
                      </p>
                      {bill.check_number && (
                        <p className="text-sm text-emerald-600 font-semibold">
                          Check #{bill.check_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      ${bill.amount.toLocaleString()}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {bill.status === 'unapproved' && (
                        <Button 
                          onClick={() => handleApproveBill(bill.id)}
                          size="sm"
                          className="bg-blue-600 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      {bill.status === 'approved' && (
                        <>
                          <Button 
                            onClick={() => handleAssignCheckNumber(bill.id)}
                            size="sm"
                            variant="outline"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Check #
                          </Button>
                          <Button 
                            onClick={() => handlePayBill(bill.id)}
                            size="sm"
                            className="bg-emerald-600 text-white"
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Pay
                          </Button>
                        </>
                      )}
                      <Button 
                        onClick={() => handleDisputeBill(bill.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300"
                      >
                        <AlertTriangle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredBills.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No bills found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}