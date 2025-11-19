import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, FileText, DollarSign, Ship } from "lucide-react";

export default function GlobalTradeManagement() {
  const shipments = [
    { id: 1, ref: 'GT-001', origin: 'Shanghai', destination: 'Los Angeles', incoterm: 'FOB', status: 'in_transit' },
    { id: 2, ref: 'GT-002', origin: 'Rotterdam', destination: 'New York', incoterm: 'CIF', status: 'customs' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-teal-900 to-cyan-900 bg-clip-text text-transparent">
            Global Trade Management
          </h1>
          <p className="text-slate-600 mt-2">Incoterms, letters of credit, international documentation</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Shipments</p>
                  <p className="text-3xl font-bold text-teal-600">{shipments.length}</p>
                </div>
                <Ship className="w-12 h-12 text-teal-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">L/C Processed</p>
                  <p className="text-3xl font-bold text-indigo-600">12</p>
                </div>
                <FileText className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Countries</p>
                  <p className="text-3xl font-bold text-blue-600">24</p>
                </div>
                <Globe className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Trade Value</p>
                  <p className="text-3xl font-bold text-emerald-600">$2.4M</p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>International Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shipments.map(shipment => (
                <Card key={shipment.id} className="border border-teal-200 bg-teal-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-teal-900">{shipment.ref}</p>
                        <p className="text-sm text-teal-700">
                          {shipment.origin} → {shipment.destination}
                        </p>
                        <Badge variant="outline" className="mt-2">{shipment.incoterm}</Badge>
                      </div>
                      <Badge className="bg-teal-600">{shipment.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}