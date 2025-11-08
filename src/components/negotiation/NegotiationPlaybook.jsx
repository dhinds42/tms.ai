import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle } from "lucide-react";

export default function NegotiationPlaybook({ operatingMode }) {
  const tactics = operatingMode === 'broker' ? [
    {
      title: "Anchor High, Concede Strategically",
      description: "Start with lower carrier pay offer, have room to negotiate up while maintaining margin"
    },
    {
      title: "Leverage Volume Commitment",
      description: "Offer consistent lane access in exchange for better rates"
    },
    {
      title: "Highlight Quick Pay Options",
      description: "Faster payment terms can justify slightly lower rates"
    },
    {
      title: "Use Market Data",
      description: "Reference current market rates to justify your position"
    },
    {
      title: "Build Long-term Relationships",
      description: "Frame current rate as entry point to ongoing partnership"
    }
  ] : [
    {
      title: "Emphasize Your Track Record",
      description: "Highlight your on-time percentage and safety record to command premium rates"
    },
    {
      title: "Know Your Costs",
      description: "Calculate your minimum rate based on fuel, maintenance, and time"
    },
    {
      title: "Counter with Market Data",
      description: "Use current market rates to justify your rate request"
    },
    {
      title: "Offer Flexibility",
      description: "Be flexible on timing or equipment if they meet your rate"
    },
    {
      title: "Build Broker Relationships",
      description: "Accept slightly lower rate on first load to establish trust"
    }
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <div>
            <CardTitle className="text-xl">
              {operatingMode === 'broker' ? 'Broker' : 'Carrier'} Negotiation Playbook
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Proven tactics for successful rate negotiations
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {tactics.map((tactic, idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl border border-indigo-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{tactic.title}</h4>
                  <p className="text-sm text-slate-600">{tactic.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}