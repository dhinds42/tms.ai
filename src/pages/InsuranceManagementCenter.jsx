import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, AlertTriangle, DollarSign } from "lucide-react";

export default function InsuranceManagementCenter() {
  const { data: policies } = useQuery({
    queryKey: ['policies'],
    queryFn: () => base44.entities.InsurancePolicy.list(),
    initialData: [],
  });

  const { data: claims } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.Claim.list('-created_date', 50),
    initialData: [],
  });

  const activePolicies = policies.filter(p => p.status === 'active');
  const expiringPolicies = policies.filter(p => {
    if (!p.expiration_date) return false;
    const expDate = new Date(p.expiration_date);
    const now = new Date();
    const daysUntil = (expDate - now) / (1000 * 60 * 60 * 24);
    return daysUntil <= 30 && daysUntil > 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Insurance Management Center
          </h1>
          <p className="text-slate-600 mt-2">Policy tracking, certificate generation, claims workflow</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Policies</p>
                  <p className="text-3xl font-bold text-blue-600">{activePolicies.length}</p>
                </div>
                <Shield className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Expiring Soon</p>
                  <p className="text-3xl font-bold text-amber-600">{expiringPolicies.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Open Claims</p>
                  <p className="text-3xl font-bold text-red-600">{claims.filter(c => c.status === 'open').length}</p>
                </div>
                <FileText className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Coverage</p>
                  <p className="text-3xl font-bold text-emerald-600">$5M</p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Policies</CardTitle>
                <Button className="bg-blue-600">Add Policy</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activePolicies.slice(0, 5).map(policy => (
                  <div key={policy.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-900">{policy.policy_type}</p>
                        <p className="text-sm text-blue-700">Policy: {policy.policy_number}</p>
                      </div>
                      <Badge className="bg-emerald-600">Active</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Claims</CardTitle>
                <Button variant="outline">File Claim</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {claims.slice(0, 5).map(claim => (
                  <div key={claim.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{claim.claim_number}</p>
                        <p className="text-sm text-slate-600">${claim.claimed_amount}</p>
                      </div>
                      <Badge className={
                        claim.status === 'settled' ? 'bg-emerald-600' :
                        claim.status === 'approved' ? 'bg-blue-600' :
                        'bg-amber-600'
                      }>
                        {claim.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}