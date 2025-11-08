import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, AlertTriangle, Users } from "lucide-react";

export default function CarrierPerformancePredictor({ carrierInsights }) {
  if (!carrierInsights) return null;

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Carrier Performance Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Top Performers */}
          <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900">Top Performers</h4>
                <p className="text-xs text-emerald-700">Prioritize these carriers</p>
              </div>
            </div>

            {carrierInsights.top_performers && carrierInsights.top_performers.length > 0 ? (
              <div className="space-y-2">
                {carrierInsights.top_performers.map((carrier, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">{carrier}</span>
                      <Badge className="bg-emerald-600 text-white text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Top
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-emerald-800 text-center py-4">
                Building carrier performance data...
              </p>
            )}

            <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
              <p className="text-xs text-emerald-900">
                <span className="font-semibold">Strategy:</span> Increase load volume with these carriers. 
                Offer preferential rates and maintain strong relationships.
              </p>
            </div>
          </div>

          {/* At-Risk Carriers */}
          <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-red-900">At-Risk Relationships</h4>
                <p className="text-xs text-red-700">Requires attention</p>
              </div>
            </div>

            {carrierInsights.at_risk && carrierInsights.at_risk.length > 0 ? (
              <div className="space-y-2">
                {carrierInsights.at_risk.map((carrier, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">{carrier}</span>
                      <Badge className="bg-red-600 text-white text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Risk
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-800 text-center py-4">
                No at-risk carriers identified
              </p>
            )}

            <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
              <p className="text-xs text-red-900">
                <span className="font-semibold">Action Required:</span> Review relationships, address concerns, 
                and consider backup carriers if performance doesn't improve.
              </p>
            </div>
          </div>

        </div>

        {/* Recruitment Priority */}
        {carrierInsights.recruitment_priority && (
          <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-indigo-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-bold text-indigo-900 mb-2">Recruitment Priority</h4>
                <p className="text-sm text-indigo-800 mb-4">
                  {carrierInsights.recruitment_priority}
                </p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-indigo-200 text-center">
                    <p className="text-xs text-slate-600 mb-1">Focus Area</p>
                    <p className="font-semibold text-indigo-900">Equipment Types</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-indigo-200 text-center">
                    <p className="text-xs text-slate-600 mb-1">Target</p>
                    <p className="font-semibold text-indigo-900">High Performers</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-indigo-200 text-center">
                    <p className="text-xs text-slate-600 mb-1">Timeline</p>
                    <p className="font-semibold text-indigo-900">Next 30 Days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Trends */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-3">Performance Trends to Watch</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>📊 Monitor on-time delivery percentages weekly</li>
            <li>💰 Track average rates and margin trends monthly</li>
            <li>📞 Maintain regular communication with top carriers</li>
            <li>🔍 Review new carrier applications quarterly</li>
            <li>⚡ Act quickly on at-risk relationships</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
}