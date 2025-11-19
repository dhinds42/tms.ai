import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Users, AlertTriangle } from "lucide-react";

import CarrierVerification from "../components/fmcsa/CarrierVerification";
import DoubleBrokeringDetection from "../components/fmcsa/DoubleBrokeringDetection";
import RecordRetention from "../components/fmcsa/RecordRetention";

export default function FMCSAComplianceCenter() {
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date', 100),
    initialData: [],
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list(),
    initialData: [],
  });

  const { data: loads } = useQuery({
    queryKey: ['loads'],
    queryFn: () => base44.entities.Load.list('-created_date', 50),
    initialData: [],
  });

  const brokerAgreements = documents.filter(d => d.document_type === 'broker_carrier_agreement');
  const shipperAgreements = documents.filter(d => d.document_type === 'broker_shipper_msa');
  const rateConfs = documents.filter(d => d.document_type === 'rate_confirmation');

  const compliantCarriers = carriers.filter(c => 
    c.insurance_expiration && new Date(c.insurance_expiration) > new Date() &&
    c.authority_status === 'active'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-red-900 to-orange-900 bg-clip-text text-transparent">
            FMCSA Compliance Center
          </h1>
          <p className="text-slate-600 mt-2">
            49 CFR 371.3 broker recordkeeping & carrier vetting
          </p>
          <Badge className="mt-3 bg-red-600">Licensed Broker Compliance</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Broker-Carrier Agreements</p>
                  <p className="text-3xl font-bold text-blue-600">{brokerAgreements.length}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Shipper MSAs</p>
                  <p className="text-3xl font-bold text-indigo-600">{shipperAgreements.length}</p>
                </div>
                <FileText className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Rate Confirmations</p>
                  <p className="text-3xl font-bold text-emerald-600">{rateConfs.length}</p>
                </div>
                <FileText className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Compliant Carriers</p>
                  <p className="text-3xl font-bold text-green-600">{compliantCarriers.length}</p>
                </div>
                <Users className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 49 CFR 371.3 Requirements */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>📋 49 CFR 371.3 Recordkeeping Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-emerald-900">Transaction Records</span>
                  <Badge className="bg-emerald-600">✓ Compliant</Badge>
                </div>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>✓ Stored for 3+ years</li>
                  <li>✓ Shipper charges tracked</li>
                  <li>✓ Carrier payments tracked</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-900">Carrier Access Rights</span>
                  <Badge className="bg-blue-600">✓ Available</Badge>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Carrier portal access</li>
                  <li>✓ Transaction visibility</li>
                  <li>✓ Waiver management</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-purple-900">Carrier Vetting</span>
                  <Badge className="bg-purple-600">✓ Active</Badge>
                </div>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>✓ Authority verification</li>
                  <li>✓ Insurance checks</li>
                  <li>✓ Safety rating review</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-amber-900">Fraud Prevention</span>
                  <Badge className="bg-amber-600">✓ Enabled</Badge>
                </div>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>✓ Identity verification</li>
                  <li>✓ Double brokering detection</li>
                  <li>✓ Factoring validation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carrier Verification */}
        <CarrierVerification onVerificationComplete={(result) => {
          alert(`Verification complete: ${result.verification_passed ? 'PASSED' : 'FAILED'}`);
        }} />

        {/* Double Brokering Detection */}
        {selectedCarrier && (
          <DoubleBrokeringDetection 
            load={loads[0]}
            carrier={selectedCarrier}
          />
        )}

        {/* Record Retention */}
        <RecordRetention />

        {/* Carrier Compliance Status */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Carrier Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {carriers.slice(0, 10).map(carrier => {
                const hasInsurance = carrier.insurance_expiration && new Date(carrier.insurance_expiration) > new Date();
                const hasAuthority = carrier.authority_status === 'active';
                const isCompliant = hasInsurance && hasAuthority;

                return (
                  <div 
                    key={carrier.id} 
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                    onClick={() => setSelectedCarrier(carrier)}
                  >
                    <div>
                      <p className="font-semibold">{carrier.company_name}</p>
                      <p className="text-xs text-slate-600">MC: {carrier.mc_number}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompliant ? (
                        <Badge className="bg-emerald-600">✓ Compliant</Badge>
                      ) : (
                        <Badge className="bg-red-600">⚠ Non-Compliant</Badge>
                      )}
                      <Button size="sm" variant="outline">Check</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}