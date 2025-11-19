import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Lock, Link } from "lucide-react";

export default function BlockchainFreight() {
  const transactions = [
    { id: 1, type: 'Load Created', hash: '0x7f9a...3b2c', timestamp: '2025-01-19 14:32', status: 'confirmed' },
    { id: 2, type: 'Payment Sent', hash: '0x4d8b...1a7e', timestamp: '2025-01-19 13:15', status: 'confirmed' },
    { id: 3, type: 'POD Uploaded', hash: '0x9c3f...5d9a', timestamp: '2025-01-19 12:00', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4">
            <Link className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
            Blockchain Freight Network
          </h1>
          <p className="text-slate-600 mt-2">Immutable load/payment records on distributed ledger</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Transactions</p>
                  <p className="text-3xl font-bold text-purple-600">1,247</p>
                </div>
                <Link className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Verified</p>
                  <p className="text-3xl font-bold text-emerald-600">1,245</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Security</p>
                  <p className="text-3xl font-bold text-indigo-600">100%</p>
                </div>
                <Shield className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Uptime</p>
                  <p className="text-3xl font-bold text-blue-600">99.9%</p>
                </div>
                <Lock className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Recent Blockchain Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <p className="font-semibold text-purple-900">{tx.type}</p>
                    <p className="text-sm text-purple-700 font-mono">{tx.hash}</p>
                    <p className="text-xs text-purple-600">{tx.timestamp}</p>
                  </div>
                  <Badge className={tx.status === 'confirmed' ? 'bg-emerald-600' : 'bg-amber-600'}>
                    {tx.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}