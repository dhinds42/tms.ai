import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, CheckCircle, AlertTriangle, DollarSign } from "lucide-react";

export default function BulkPayments({ loads, carriers, drivers, operatingMode }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedPayments, setParsedPayments] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Parse CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const payments = lines.slice(1).filter(line => line.trim()).map((line, idx) => {
          const values = line.split(',');
          return {
            id: idx,
            load_number: values[0]?.trim(),
            payee: values[1]?.trim(),
            amount: parseFloat(values[2]) || 0,
            status: 'pending'
          };
        });
        
        setParsedPayments(payments);
      };
      reader.readAsText(file);
    }
  };

  const handleProcessBulkPayments = () => {
    setProcessing(true);
    setTimeout(() => {
      setParsedPayments(parsedPayments.map(p => ({...p, status: 'processed'})));
      setProcessing(false);
      alert(`${parsedPayments.length} payments processed successfully!`);
    }, 2000);
  };

  const handleDownloadTemplate = () => {
    const template = `Load Number,Payee,Amount\nLOAD-001,Carrier ABC,1500.00\nLOAD-002,Driver John,800.00`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_payment_template.csv';
    a.click();
  };

  const totalAmount = parsedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 mt-6">
      
      {/* Upload Section */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Bulk Payment Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 mb-2">
              📋 <strong>Instructions:</strong>
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download the CSV template</li>
              <li>• Fill in load numbers, payee names, and amounts</li>
              <li>• Upload the completed file</li>
              <li>• Review and process payments</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleDownloadTemplate} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
            <div className="flex-1">
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload CSV</span>
                </div>
              </Label>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {uploadedFile && (
            <div className="p-3 bg-emerald-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-900">
                  {uploadedFile.name} uploaded
                </span>
              </div>
              <Badge className="bg-emerald-600">
                {parsedPayments.length} payments
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      {parsedPayments.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Total Payments</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {parsedPayments.length}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Total Amount</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">
                      ${totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Status</p>
                    <p className="text-xl font-bold text-purple-600 mt-2">
                      {parsedPayments.filter(p => p.status === 'processed').length > 0 
                        ? 'Processed' 
                        : 'Ready'}
                    </p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment List */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Details</CardTitle>
                <Button 
                  onClick={handleProcessBulkPayments}
                  disabled={processing || parsedPayments[0]?.status === 'processed'}
                  className="bg-emerald-600 text-white"
                >
                  {processing ? 'Processing...' : 'Process All Payments'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {parsedPayments.map((payment) => (
                  <div key={payment.id} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {payment.status === 'processed' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900">{payment.load_number}</p>
                        <p className="text-sm text-slate-600">{payment.payee}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-slate-900">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <Badge className={
                        payment.status === 'processed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

    </div>
  );
}