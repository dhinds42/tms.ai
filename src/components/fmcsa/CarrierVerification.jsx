import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, AlertTriangle, Search } from "lucide-react";

export default function CarrierVerification({ onVerificationComplete }) {
  const [mcNumber, setMcNumber] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const verifyCarrier = async () => {
    if (!mcNumber) return;
    
    setVerifying(true);
    try {
      const verification = await base44.integrations.Core.InvokeLLM({
        prompt: `Perform FMCSA carrier verification for MC Number: ${mcNumber}
        
        Verify the following:
        1. Authority Status (Active, Inactive, Revoked)
        2. Operating Status (Authorized, Not Authorized, Out of Service)
        3. Insurance Requirements (Cargo, Liability, Bond)
        4. Safety Rating (Satisfactory, Conditional, Unsatisfactory, None)
        5. Out of Service Percentage (Vehicle, Driver, Hazmat)
        6. Carrier Legal Name and DBA
        7. Physical Address
        8. Phone Number
        9. Common/Contract Authority
        10. Fraud Risk Indicators (recent authority, no insurance, address issues)
        
        Return detailed verification report with pass/fail status.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            mc_number: { type: "string" },
            dot_number: { type: "string" },
            legal_name: { type: "string" },
            dba_name: { type: "string" },
            authority_status: { type: "string" },
            operating_status: { type: "string" },
            insurance_on_file: { type: "boolean" },
            cargo_insurance_required: { type: "number" },
            liability_insurance_required: { type: "number" },
            bond_required: { type: "number" },
            safety_rating: { type: "string" },
            out_of_service_vehicle_pct: { type: "number" },
            out_of_service_driver_pct: { type: "number" },
            physical_address: { type: "string" },
            phone: { type: "string" },
            common_authority: { type: "boolean" },
            contract_authority: { type: "boolean" },
            fraud_risk_score: { type: "number" },
            fraud_indicators: { type: "array", items: { type: "string" } },
            verification_passed: { type: "boolean" },
            verification_notes: { type: "string" }
          }
        }
      });

      setResult(verification);
      onVerificationComplete?.(verification);
      
    } catch (error) {
      alert('Verification failed: ' + error.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          FMCSA Carrier Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex gap-3">
          <Input
            placeholder="Enter MC Number"
            value={mcNumber}
            onChange={(e) => setMcNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && verifyCarrier()}
          />
          <Button 
            onClick={verifyCarrier}
            disabled={verifying || !mcNumber}
            className="bg-blue-600"
          >
            <Search className="w-4 h-4 mr-2" />
            {verifying ? 'Verifying...' : 'Verify'}
          </Button>
        </div>

        {result && (
          <div className="space-y-4 mt-6">
            
            {/* Overall Status */}
            <div className={`p-4 rounded-lg border-2 ${
              result.verification_passed 
                ? 'bg-emerald-50 border-emerald-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">
                    {result.verification_passed ? '✓ VERIFIED' : '✗ FAILED'}
                  </h3>
                  <p className="text-sm mt-1">{result.legal_name}</p>
                </div>
                {result.verification_passed ? (
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600" />
                )}
              </div>
            </div>

            {/* Carrier Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">MC Number</p>
                <p className="font-semibold">{result.mc_number}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">DOT Number</p>
                <p className="font-semibold">{result.dot_number}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">Authority Status</p>
                <Badge className={result.authority_status === 'Active' ? 'bg-emerald-600' : 'bg-red-600'}>
                  {result.authority_status}
                </Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">Operating Status</p>
                <Badge className={result.operating_status === 'Authorized' ? 'bg-emerald-600' : 'bg-red-600'}>
                  {result.operating_status}
                </Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">Safety Rating</p>
                <Badge className={
                  result.safety_rating === 'Satisfactory' ? 'bg-emerald-600' :
                  result.safety_rating === 'Conditional' ? 'bg-amber-600' : 'bg-red-600'
                }>
                  {result.safety_rating}
                </Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600">Insurance on File</p>
                <Badge className={result.insurance_on_file ? 'bg-emerald-600' : 'bg-red-600'}>
                  {result.insurance_on_file ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            {/* Fraud Risk */}
            {result.fraud_risk_score > 50 && (
              <div className="p-4 bg-amber-50 border-2 border-amber-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900">⚠️ Fraud Risk Detected ({result.fraud_risk_score}%)</h4>
                    <ul className="text-sm text-amber-800 mt-2 space-y-1">
                      {result.fraud_indicators?.map((indicator, idx) => (
                        <li key={idx}>• {indicator}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {result.verification_notes && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">{result.verification_notes}</p>
              </div>
            )}

          </div>
        )}

      </CardContent>
    </Card>
  );
}