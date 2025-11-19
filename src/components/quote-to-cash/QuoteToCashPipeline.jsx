import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";

export default function QuoteToCashPipeline() {
  const { data: quotes } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => base44.entities.Quote.list('-created_date', 100),
    initialData: [],
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list('-created_date', 100),
    initialData: [],
  });

  const pipelineStages = {
    quoted: quotes.filter(q => q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    in_progress: quotes.filter(q => q.status === 'accepted').length,
    invoiced: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Quote-to-Cash Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
            <div>
              <p className="font-semibold text-blue-900">Quoted</p>
              <p className="text-sm text-blue-700">{pipelineStages.quoted} opportunities</p>
            </div>
            <Badge className="bg-blue-600">${(pipelineStages.quoted * 2500).toLocaleString()}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-indigo-50 rounded">
            <div>
              <p className="font-semibold text-indigo-900">Accepted</p>
              <p className="text-sm text-indigo-700">{pipelineStages.accepted} loads</p>
            </div>
            <Badge className="bg-indigo-600">${(pipelineStages.accepted * 2500).toLocaleString()}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
            <div>
              <p className="font-semibold text-purple-900">Invoiced</p>
              <p className="text-sm text-purple-700">{pipelineStages.invoiced} invoices</p>
            </div>
            <Badge className="bg-purple-600">${(pipelineStages.invoiced * 2500).toLocaleString()}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded">
            <div>
              <p className="font-semibold text-emerald-900">Paid</p>
              <p className="text-sm text-emerald-700">{pipelineStages.paid} completed</p>
            </div>
            <Badge className="bg-emerald-600">${(pipelineStages.paid * 2500).toLocaleString()}</Badge>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}