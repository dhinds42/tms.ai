import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, DollarSign, FileText, CheckCircle } from "lucide-react";

export default function QuoteToCashPipeline() {
  const { data: quotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 100),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 100),
    initialData: [],
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 100),
    initialData: [],
  });

  const stages = [
    { name: 'Quotes', count: quotes.length, color: 'bg-blue-500', icon: FileText },
    { name: 'Booked', count: loads.filter(l => l.status !== 'cancelled').length, color: 'bg-indigo-500', icon: CheckCircle },
    { name: 'Invoiced', count: invoices.length, color: 'bg-purple-500', icon: FileText },
    { name: 'Paid', count: invoices.filter(i => i.status === 'paid').length, color: 'bg-emerald-500', icon: DollarSign }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>Quote-to-Cash Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.name}>
                <div className="flex-1">
                  <div className={`${stage.color} p-4 rounded-lg text-white`}>
                    <Icon className="w-6 h-6 mb-2" />
                    <p className="text-sm opacity-90">{stage.name}</p>
                    <p className="text-3xl font-bold">{stage.count}</p>
                  </div>
                </div>
                {idx < stages.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-slate-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-900">Conversion Rate</p>
              <p className="text-2xl font-bold text-emerald-600">
                {quotes.length > 0 ? ((loads.length / quotes.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-emerald-900">Collection Rate</p>
              <p className="text-2xl font-bold text-emerald-600">
                {invoices.length > 0 ? ((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}