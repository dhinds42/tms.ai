import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Globe, CheckCircle } from "lucide-react";

export default function CustomsCompliance() {
  const filings = [
    { id: 1, shipment: 'SH-001', type: 'AES Filing', status: 'submitted', country: 'Canada' },
    { id: 2, shipment: 'SH-002', type: 'Customs Declaration', status: 'approved', country: 'Mexico' },
    { id: 3, shipment: 'SH-003', type: 'Duty Payment', status: 'pending', country: 'China' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Customs & Trade Compliance
          </h1>
          <p className="text-slate-600 mt-2">AES filing, customs documentation, duty calculator</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Filings</p>
                  <p className="text-3xl font-bold text-blue-600">234</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Approved</p>
                  <p className="text-3xl font-bold text-emerald-600">228</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-amber-600">6</p>
                </div>
                <Shield className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Countries</p>
                  <p className="text-3xl font-bold text-indigo-600">12</p>
                </div>
                <Globe className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Filings</CardTitle>
              <Button className="bg-blue-600">New Filing</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filings.map(filing => (
                <div key={filing.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-semibold text-blue-900">{filing.shipment} - {filing.type}</p>
                    <p className="text-sm text-blue-700">🌍 {filing.country}</p>
                  </div>
                  <Badge className={
                    filing.status === 'approved' ? 'bg-emerald-600' :
                    filing.status === 'submitted' ? 'bg-blue-600' :
                    'bg-amber-600'
                  }>
                    {filing.status}
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