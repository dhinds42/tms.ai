import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, DollarSign, FileText, CheckCircle } from "lucide-react";

export default function QuoteToCash() {
  const pipeline = [
    { stage: 'Quote', count: 12, value: 45000, color: 'blue' },
    { stage: 'Booked', count: 8, value: 32000, color: 'indigo' },
    { stage: 'In Transit', count: 5, value: 21000, color: 'purple' },
    { stage: 'Delivered', count: 3, value: 13500, color: 'emerald' },
    { stage: 'Invoiced', count: 2, value: 9000, color: 'amber' },
    { stage: 'Paid', count: 1, value: 4500, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Quote-to-Cash Pipeline
          </h1>
          <p className="text-slate-600 mt-2">Track complete revenue lifecycle</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pipeline Value</p>
                  <p className="text-3xl font-bold text-indigo-600">$125K</p>
                </div>
                <DollarSign className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-emerald-600">67%</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Cycle Time</p>
                  <p className="text-3xl font-bold text-blue-600">14 days</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Revenue Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pipeline.map((stage, idx) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${stage.color}-600`}></div>
                      <span className="font-semibold text-slate-900">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-600">{stage.count} deals</span>
                      <span className="font-bold text-lg">${(stage.value / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className={`bg-${stage.color}-600 h-3 rounded-full`}
                      style={{ width: `${(stage.count / 12) * 100}%` }}
                    ></div>
                  </div>
                  {idx < pipeline.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-slate-400 mx-auto my-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}