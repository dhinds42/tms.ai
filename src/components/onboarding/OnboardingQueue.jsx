import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Eye, AlertTriangle } from "lucide-react";

export default function OnboardingQueue({ carriers, isLoading, onApprove, onReject, onViewDetails }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-slate-600">Loading carriers...</p>
        </CardContent>
      </Card>
    );
  }

  if (carriers.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Onboarding Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
          <p className="text-slate-600">No carriers pending approval at this time</p>
        </CardContent>
      </Card>
    );
  }

  const getRiskLevel = (carrier) => {
    if (carrier.fmcsa_safety_rating === 'unsatisfactory') return 'high';
    if (!carrier.insurance_expiration) return 'medium';
    if ((carrier.compliance_score || 0) < 60) return 'medium';
    return 'low';
  };

  const getRiskBadge = (risk) => {
    const colors = {
      low: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      medium: 'bg-amber-100 text-amber-700 border-amber-300',
      high: 'bg-red-100 text-red-700 border-red-300'
    };
    return (
      <Badge variant="outline" className={colors[risk]}>
        {risk === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
        {risk.toUpperCase()} RISK
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Onboarding Queue ({carriers.length})
          </CardTitle>
          <Badge className="bg-amber-100 text-amber-700">
            Requires Action
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {carriers.map((carrier) => {
            const riskLevel = getRiskLevel(carrier);
            const daysPending = carrier.created_date 
              ? Math.floor((Date.now() - new Date(carrier.created_date).getTime()) / (1000 * 60 * 60 * 24))
              : 0;

            return (
              <div key={carrier.id} className="p-5 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-indigo-300 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-slate-900 text-lg">
                        {carrier.company_name}
                      </h4>
                      {getRiskBadge(riskLevel)}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {carrier.contact_name} • {carrier.email}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-600">MC: {carrier.mc_number}</span>
                      <span className="text-slate-600">DOT: {carrier.dot_number}</span>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {daysPending}d pending
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    {carrier.compliance_score ? (
                      <div>
                        <div className="text-2xl font-bold text-indigo-600 mb-1">
                          {carrier.compliance_score}
                        </div>
                        <p className="text-xs text-slate-600">Compliance Score</p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        Not Vetted
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Carrier Details */}
                <div className="grid md:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Safety Rating</p>
                    <Badge className={
                      carrier.fmcsa_safety_rating === 'satisfactory' ? 'bg-emerald-600' :
                      carrier.fmcsa_safety_rating === 'conditional' ? 'bg-amber-600' :
                      'bg-red-600'
                    }>
                      {carrier.fmcsa_safety_rating || 'Not Rated'}
                    </Badge>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Insurance</p>
                    <p className="font-semibold text-slate-900 text-sm">
                      ${(carrier.insurance_amount / 1000000).toFixed(1)}M
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Equipment</p>
                    <p className="font-semibold text-slate-900 text-sm">
                      {carrier.equipment_types?.length || 0} types
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Documents</p>
                    <Badge className={
                      (carrier.w9_url && carrier.coi_url) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }>
                      {(carrier.w9_url && carrier.coi_url) ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                </div>

                {/* Risk Indicators */}
                {riskLevel !== 'low' && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Review Required</p>
                        <ul className="text-xs text-amber-800 mt-1 space-y-1">
                          {carrier.fmcsa_safety_rating === 'unsatisfactory' && (
                            <li>• Unsatisfactory safety rating</li>
                          )}
                          {!carrier.insurance_expiration && (
                            <li>• Missing insurance expiration date</li>
                          )}
                          {(carrier.compliance_score || 0) < 60 && (
                            <li>• Low compliance score ({carrier.compliance_score})</li>
                          )}
                          {!carrier.w9_url && (
                            <li>• W-9 form not uploaded</li>
                          )}
                          {!carrier.coi_url && (
                            <li>• Certificate of Insurance not uploaded</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => onViewDetails(carrier)}
                    variant="outline"
                    className="flex-1 border-indigo-300 text-indigo-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    onClick={() => onApprove(carrier.id)}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => onReject(carrier.id)}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}