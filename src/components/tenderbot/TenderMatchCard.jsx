import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, DollarSign, CheckCircle, Send, TrendingUp, Shield, AlertTriangle } from "lucide-react";

const acceptanceProbabilityColors = {
  LOW: "bg-red-100 text-red-700 border-red-300",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-300",
  HIGH: "bg-emerald-100 text-emerald-700 border-emerald-300"
};

export default function TenderMatchCard({ load, matches, onSendTender }) {
  return (
    <Card className="border-0 shadow-xl bg-white overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {load.load_number || `Load #${load.id.slice(0, 8)}`}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4" />
              {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Truck className="w-3 h-3 mr-1" />
                {load.equipment_type?.replace(/_/g, ' ')}
              </Badge>
              <span className="text-sm text-slate-600">
                {load.distance_miles} miles
              </span>
              <span className="text-sm font-semibold text-emerald-600">
                ${load.customer_rate?.toLocaleString()} customer rate
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        <h3 className="font-semibold text-slate-900 mb-4">Top Carrier Matches</h3>

        <div className="space-y-4">
          {matches.map((match, index) => {
            const margin = load.customer_rate ? load.customer_rate - match.suggested_rate : 0;
            const marginPercent = load.customer_rate ? (margin / load.customer_rate * 100).toFixed(1) : 0;

            return (
              <Card key={index} className={`border-2 ${index === 0 ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50' : 'border-slate-200 bg-slate-50'}`}>
                <CardContent className="p-5">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {index === 0 && <span className="text-2xl">🏆</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {match.carrier?.company_name || match.carrier_name}
                          </h4>
                          <p className="text-xs text-slate-600">
                            MC: {match.carrier?.mc_number || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={acceptanceProbabilityColors[match.acceptance_probability]}>
                          {match.acceptance_probability} Probability
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          Match: {match.match_score}/100
                        </Badge>
                        <Badge variant="outline" className="bg-white">
                          Lane Fit: {match.lane_fit_score}/100
                        </Badge>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${index === 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {match.match_score}
                      </div>
                      <p className="text-xs text-slate-500">Match Score</p>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-white rounded-lg border border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Suggested Rate</p>
                      <p className="text-lg font-bold text-blue-600">
                        ${match.suggested_rate?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Projected Margin</p>
                      <p className="text-lg font-bold text-emerald-600">
                        ${margin.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Margin %</p>
                      <p className={`text-lg font-bold ${marginPercent >= 15 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {marginPercent}%
                      </p>
                    </div>
                  </div>

                  {/* Carrier Performance */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 bg-white rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">On-Time</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {match.carrier?.on_time_percentage || 0}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <Shield className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-500">Compliance</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {match.carrier?.compliance_score || 0}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">Rating</p>
                      <p className="text-sm font-semibold text-slate-900">
                        ⭐ {match.carrier?.rating || 0}/5
                      </p>
                    </div>
                  </div>

                  {/* Match Reasons */}
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Why This Carrier
                    </h5>
                    <ul className="space-y-1">
                      {match.match_reasons?.map((reason, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-600">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risk Factors */}
                  {match.risk_factors && match.risk_factors.length > 0 && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <h5 className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        Risk Factors
                      </h5>
                      <ul className="space-y-1">
                        {match.risk_factors.map((risk, i) => (
                          <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                            <span>•</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => onSendTender(load.id, match.carrier?.id, match.suggested_rate)}
                    className={`w-full ${
                      index === 0 
                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:shadow-lg hover:shadow-emerald-500/50' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/50'
                    } text-white`}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Tender at ${match.suggested_rate?.toLocaleString()}
                  </Button>

                </CardContent>
              </Card>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}