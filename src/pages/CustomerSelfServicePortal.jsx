import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Package, FileText, MapPin, DollarSign, TrendingUp } from "lucide-react";

export default function CustomerSelfServicePortal() {
  const [activeTab, setActiveTab] = useState("shipments");
  
  const { data: loads } = useQuery({
    queryKey: ['customer_loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 50),
    initialData: [],
  });

  const { data: invoices } = useQuery({
    queryKey: ['customer_invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 50),
    initialData: [],
  });

  const { data: quotes } = useQuery({
    queryKey: ['customer_quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 50),
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Customer Self-Service Portal
          </h1>
          <p className="text-slate-600 mt-2">Book loads, track shipments, manage invoices - all in one place</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Shipments</p>
                  <p className="text-2xl font-bold text-indigo-600">{loads.filter(l => l.status !== 'delivered').length}</p>
                </div>
                <Package className="w-10 h-10 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Quotes</p>
                  <p className="text-2xl font-bold text-amber-600">{quotes.filter(q => q.status === 'pending').length}</p>
                </div>
                <FileText className="w-10 h-10 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Open Invoices</p>
                  <p className="text-2xl font-bold text-red-600">{invoices.filter(i => i.status === 'unpaid').length}</p>
                </div>
                <DollarSign className="w-10 h-10 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">This Month</p>
                  <p className="text-2xl font-bold text-emerald-600">{loads.length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="shipments">My Shipments</TabsTrigger>
                <TabsTrigger value="quotes">Request Quote</TabsTrigger>
                <TabsTrigger value="tracking">Track & Trace</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
              </TabsList>

              <TabsContent value="shipments" className="space-y-4">
                {loads.map(load => (
                  <Card key={load.id} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{load.load_number}</p>
                          <p className="text-sm text-slate-600">{load.origin_city} → {load.destination_city}</p>
                        </div>
                        <Badge>{load.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="quotes">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Request a Quote</h3>
                  <p className="text-slate-600 mb-6">Get instant pricing for your shipment</p>
                  <Button className="bg-indigo-600">Start New Quote</Button>
                </div>
              </TabsContent>

              <TabsContent value="tracking">
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
                  <p className="text-slate-600">Track your shipments in real-time</p>
                </div>
              </TabsContent>

              <TabsContent value="invoices">
                {invoices.map(invoice => (
                  <Card key={invoice.id} className="border border-slate-200 mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{invoice.invoice_number}</p>
                          <p className="text-sm text-slate-600">${invoice.amount}</p>
                        </div>
                        <Badge>{invoice.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}