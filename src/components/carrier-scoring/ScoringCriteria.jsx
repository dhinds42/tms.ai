import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

export default function ScoringCriteria() {
  const criteria = [
    {
      category: "Reliability",
      weight: "30%",
      factors: [
        "On-time delivery performance",
        "Load completion rate",
        "Communication responsiveness",
        "Issue resolution track record"
      ],
      color: "blue"
    },
    {
      category: "Safety",
      weight: "25%",
      factors: [
        "FMCSA safety rating",
        "Accident history",
        "Regulatory compliance",
        "Driver qualifications"
      ],
      color: "emerald"
    },
    {
      category: "Financial",
      weight: "20%",
      factors: [
        "Insurance coverage adequacy",
        "Payment reliability",
        "Credit standing",
        "Financial stability"
      ],
      color: "indigo"
    },
    {
      category: "Service Quality",
      weight: "15%",
      factors: [
        "Customer/broker ratings",
        "Equipment condition",
        "Professional conduct",
        "Value-added services"
      ],
      color: "purple"
    },
    {
      category: "Compliance",
      weight: "10%",
      factors: [
        "Document currency",
        "Regulatory adherence",
        "Required certifications",
        "Audit readiness"
      ],
      color: "amber"
    }
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader className="border-b border-blue-200 pb-6">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Info className="w-5 h-5 text-blue-600" />
          Scoring Methodology
        </CardTitle>
        <p className="text-sm text-blue-700 mt-2">
          AI-powered comprehensive evaluation based on 5 weighted categories
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-5 gap-4">
          {criteria.map((item, idx) => (
            <div key={idx} className={`p-4 bg-white rounded-xl border-2 border-${item.color}-200`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-bold text-${item.color}-900`}>{item.category}</h4>
                <Badge className={`bg-${item.color}-600 text-white`}>{item.weight}</Badge>
              </div>
              <ul className="space-y-2">
                {item.factors.map((factor, fIdx) => (
                  <li key={fIdx} className={`text-xs text-${item.color}-800`}>
                    • {factor}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border-2 border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Performance Tiers</h4>
          <div className="grid md:grid-cols-5 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-300">
              <p className="font-bold text-yellow-900">Platinum</p>
              <p className="text-xs text-yellow-700 mt-1">90-100</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-300">
              <p className="font-bold text-gray-900">Gold</p>
              <p className="text-xs text-gray-700 mt-1">80-89</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-300">
              <p className="font-bold text-orange-900">Silver</p>
              <p className="text-xs text-orange-700 mt-1">70-79</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-400">
              <p className="font-bold text-amber-900">Bronze</p>
              <p className="text-xs text-amber-700 mt-1">60-69</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300">
              <p className="font-bold text-slate-900">Needs Work</p>
              <p className="text-xs text-slate-700 mt-1">&lt; 60</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}