import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, AlertTriangle, UserPlus } from "lucide-react";

export default function CarrierPerformancePredictor({ carrierInsights }) {
  if (!carrierInsights) return null;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      
      {/* Top Performers */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader className="border-b border-emerald-200 pb-4">
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <Award className="w-5 h-5" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-2">
            {carrierInsights.top_performers?.map((carrier, idx) => (
              <li key={idx} className="p-3 bg-white rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2">
                  {idx === 0 && <span className="text-lg">🏆</span>}
                  <span className="text-sm font-medium text-emerald-900">{carrier}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* At Risk */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="border-b border-amber-200 pb-4">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5" />
            At-Risk Relationships
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-2">
            {carrierInsights.at_risk?.map((carrier, idx) => (
              <li key={idx} className="p-3 bg-white rounded-lg border border-amber-200">
                <span className="text-sm font-medium text-amber-900">{carrier}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recruitment Priority */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="border-b border-blue-200 pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <UserPlus className="w-5 h-5" />
            Recruitment Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900 leading-relaxed">
              {carrierInsights.recruitment_priority}
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}