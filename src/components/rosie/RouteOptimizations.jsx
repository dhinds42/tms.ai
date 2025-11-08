import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, DollarSign } from "lucide-react";

export default function RouteOptimizations({ loads }) {
  const optimizations = [
    {
      type: "Fuel Savings",
      description: "Alternative route via I-70 saves 12 miles and $45 in fuel",
      impact: "$45",
      loadCount: 3
    },
    {
      type: "Time Optimization",
      description: "Avoiding rush hour traffic saves 1.5 hours on average",
      impact: "1.5h",
      loadCount: 5
    },
    {
      type: "HOS Compliance",
      description: "Suggested rest stop locations to maximize driving time",
      impact: "2h",
      loadCount: 2
    }
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-indigo-600" />
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              AI Route Optimizations
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Rosie's recommendations for active loads
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {optimizations.map((opt, index) => (
            <div key={index} className="p-4 bg-white rounded-xl border border-indigo-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-slate-900">{opt.type}</h4>
                  </div>
                  <p className="text-sm text-slate-700">{opt.description}</p>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-300">
                  {opt.loadCount} loads
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-600">
                  Potential Impact: {opt.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}