import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, XCircle, Calendar } from "lucide-react";

export default function InsuranceWarnings({ carriers, loads, warnings, operatingMode }) {
  
  const getInsuranceStatus = (carrier) => {
    const insuranceAmount = carrier.insurance_amount || 0;
    const insuranceExpiration = carrier.insurance_expiration ? new Date(carrier.insurance_expiration) : null;
    const daysUntilExpiration = insuranceExpiration ? 
      Math.floor((insuranceExpiration - new Date()) / (1000 * 60 * 60 * 24)) : 
      null;

    if (!insuranceAmount || insuranceAmount < 100000) {
      return { status: 'insufficient', color: 'red', icon: XCircle };
    } else if (daysUntilExpiration !== null && daysUntilExpiration < 30) {
      return { status: 'expiring', color: 'amber', icon: AlertTriangle };
    } else if (insuranceAmount >= 100000) {
      return { status: 'adequate', color: 'emerald', icon: CheckCircle };
    } else {
      return { status: 'unknown', color: 'slate', icon: Shield };
    }
  };

  const groupedWarnings = {
    insufficient: warnings.filter(c => !c.insurance_amount || c.insurance_amount < 100000),
    expiring: warnings.filter(c => {
      const exp = c.insurance_expiration ? new Date(c.insurance_expiration) : null;
      const days = exp ? Math.floor((exp - new Date()) / (1000 * 60 * 60 * 24)) : null;
      return days !== null && days < 30 && days >= 0;
    }),
    expired: warnings.filter(c => {
      const exp = c.insurance_expiration ? new Date(c.insurance_expiration) : null;
      return exp && exp < new Date();
    })
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Warning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-slate-600">Insufficient Coverage</p>
                <p className="text-3xl font-bold text-red-600">{groupedWarnings.insufficient.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-slate-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-amber-600">{groupedWarnings.expiring.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-l-slate-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-600">Expired</p>
                <p className="text-3xl font-bold text-slate-600">{groupedWarnings.expired.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Instructions */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Cargo Insurance Warning System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-white rounded-lg">
            <p className="font-semibold text-slate-900 mb-1">🔴 Red Shield Icon</p>
            <p className="text-slate-700">Cargo insurance coverage is lower than shipment's declared value</p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="font-semibold text-slate-900 mb-1">🟡 Yellow Shield Icon</p>
            <p className="text-slate-700">Cargo insurance coverage information not available</p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="font-semibold text-slate-900 mb-1">⚠️ Warning Triggers</p>
            <p className="text-slate-700">Alerts appear during carrier selection when coverage is insufficient</p>
          </div>
        </CardContent>
      </Card>

      {/* Carriers with Warnings */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>Carriers Requiring Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warnings.map((carrier) => {
              const status = getInsuranceStatus(carrier);
              const StatusIcon = status.icon;
              const insuranceExpiration = carrier.insurance_expiration ? new Date(carrier.insurance_expiration) : null;
              const daysUntilExpiration = insuranceExpiration ? 
                Math.floor((insuranceExpiration - new Date()) / (1000 * 60 * 60 * 24)) : 
                null;

              return (
                <div key={carrier.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{carrier.company_name}</h3>
                        <Badge className={`bg-${status.color}-100 text-${status.color}-800`}>
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {status.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        MC: {carrier.mc_number} | DOT: {carrier.dot_number}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Coverage Amount</p>
                      <p className="text-lg font-bold text-slate-900">
                        ${(carrier.insurance_amount || 0).toLocaleString()}
                      </p>
                      {(!carrier.insurance_amount || carrier.insurance_amount < 100000) && (
                        <p className="text-xs text-red-600 font-semibold mt-1">Below $100,000 minimum</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Expiration Date</p>
                      <p className="text-lg font-bold text-slate-900">
                        {insuranceExpiration ? insuranceExpiration.toLocaleDateString() : 'Not Set'}
                      </p>
                      {daysUntilExpiration !== null && daysUntilExpiration < 30 && (
                        <p className={`text-xs font-semibold mt-1 ${daysUntilExpiration < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {daysUntilExpiration < 0 ? 'EXPIRED' : `${daysUntilExpiration} days remaining`}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">COI on File</p>
                      <p className="text-lg font-bold text-slate-900">
                        {carrier.coi_url ? 'Yes' : 'No'}
                      </p>
                      {!carrier.coi_url && (
                        <p className="text-xs text-red-600 font-semibold mt-1">Certificate required</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      Request Updated COI
                    </Button>
                    <Button size="sm" variant="outline">
                      View Carrier Profile
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                      Suspend Carrier
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {warnings.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">All Clear!</h3>
              <p className="text-slate-600">No insurance warnings at this time</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}