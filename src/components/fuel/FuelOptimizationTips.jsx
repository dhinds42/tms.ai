import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, DollarSign, Zap, TrendingUp } from "lucide-react";

export default function FuelOptimizationTips({ totalCost, avgMPG }) {
  const tips = [
    {
      title: "Improve MPG by 0.5",
      description: "Driver training on fuel-efficient driving techniques could save",
      savings: (totalCost * 0.08).toFixed(0),
      icon: TrendingUp,
      color: "emerald"
    },
    {
      title: "Route Optimization",
      description: "Better routing to avoid traffic and idling could reduce fuel cost by",
      savings: (totalCost * 0.12).toFixed(0),
      icon: Zap,
      color: "blue"
    },
    {
      title: "Fuel Card Discounts",
      description: "Negotiating better fuel network rates could save",
      savings: (totalCost * 0.05).toFixed(0),
      icon: DollarSign,
      color: "purple"
    },
    {
      title: "Tire Pressure Monitoring",
      description: "Proper tire inflation across fleet could improve efficiency and save",
      savings: (totalCost * 0.03).toFixed(0),
      icon: Lightbulb,
      color: "amber"
    }
  ];

  const colorClasses = {
    emerald: "from-emerald-600 to-green-600",
    blue: "from-blue-600 to-cyan-600",
    purple: "from-purple-600 to-indigo-600",
    amber: "from-amber-600 to-orange-600"
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="border-b border-blue-200 pb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          <div>
            <CardTitle className="text-xl">AI Optimization Opportunities</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Potential annual savings: ${(totalCost * 0.28).toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div key={index} className="p-5 bg-white rounded-xl border border-blue-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-gradient-to-br ${colorClasses[tip.color]} rounded-xl`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{tip.title}</h4>
                    <p className="text-sm text-slate-600 mb-3">{tip.description}</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="text-lg font-bold text-emerald-600">
                        ${tip.savings} / year
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}