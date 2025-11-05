import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";

export default function CarrierScoreCard({ carrier, onAnalyze, isAnalyzing, variant = "default" }) {
  const complianceScore = carrier.compliance_score || 0;
  const scoreColor = complianceScore >= 90 ? 'text-emerald-600' : 
                     complianceScore >= 70 ? 'text-amber-600' : 'text-red-600';
  const scoreBg = complianceScore >= 90 ? 'bg-emerald-100' : 
                  complianceScore >= 70 ? 'bg-amber-100' : 'bg-red-100';

  const cardBg = variant === "success" ? "bg-gradient-to-br from-emerald-50 to-green-50" : "bg-white";
  const borderColor = variant === "success" ? "border-emerald-200" : "border-slate-200";

  return (
    <Card className={`${cardBg} border ${borderColor} shadow-md hover:shadow-lg transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${scoreBg} rounded-lg`}>
              <Building2 className={`w-5 h-5 ${scoreColor}`} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{carrier.company_name}</h4>
              <p className="text-xs text-slate-600">{carrier.mc_number}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${scoreColor}`}>
              {complianceScore}
            </div>
            <p className="text-xs text-slate-500">Score</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <Shield className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">Safety</p>
            <p className="text-sm font-semibold text-slate-900 capitalize">
              {carrier.fmcsa_safety_rating?.replace(/_/g, ' ').slice(0, 4) || 'N/A'}
            </p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-slate-500">On-Time</p>
            <p className="text-sm font-semibold text-slate-900">
              {carrier.on_time_percentage || 0}%
            </p>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Loads</p>
            <p className="text-sm font-semibold text-slate-900">
              {carrier.total_loads || 0}
            </p>
          </div>
        </div>

        {!carrier.insurance_expiration && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-700 font-medium">Missing Insurance Info</span>
          </div>
        )}

        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          variant="outline"
          className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Run Scout Analysis
        </Button>
      </CardContent>
    </Card>
  );
}