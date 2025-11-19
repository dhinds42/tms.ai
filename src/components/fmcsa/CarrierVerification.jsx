import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, CheckCircle, AlertTriangle } from "lucide-react";

export default function CarrierVerification() {
  const [dotNumber, setDotNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const verifyCarrier = async () => {
    if (!dotNumber) return;
    
    setVerifying(true);
    try {
      const verification = await base44.integrations.Core.InvokeLLM({
        prompt: `Verify FMCSA carrier authority for DOT# ${dotNumber}.
        
Check:
1. Active authority status
2. Insurance compliance
3. Safety rating
4. Out-of-service status
5. Cargo/broker authority

Provide verification results with pass/fail status.`,
        response_json_schema: {
          type: "object",
          properties: {
            dot_number: { type: "string" },
            carrier_name: { type: "string" },
            authority_status: { type: "string" },
            insurance_current: { type: "boolean" },
            safety_rating: { type: "string" },
            out_of_service: { type: "boolean" },
            verification_passed: { type: "boolean" },
            issues: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setResult(verification);
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
        
        <div className="flex gap-2">
          <Input
            placeholder="Enter DOT Number"
            value={dotNumber}
            onChange={(e) => setDotNumber(e.target.value)}
          />
          <Button onClick={verifyCarrier} disabled={verifying} className="bg-blue-600">
            <Search className="w-4 h-4 mr-2" />
            Verify
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border-2 ${
            result.verification_passed 
              ? 'bg-emerald-50 border-emerald-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {result.verification_passed ? (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-bold text-slate-900">{result.carrier_name}</p>
                <p className="text-sm text-slate-600">DOT# {result.dot_number}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Authority Status:</span>
                <Badge className={result.authority_status === 'Active' ? 'bg-emerald-600' : 'bg-red-600'}>
                  {result.authority_status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Insurance:</span>
                <Badge className={result.insurance_current ? 'bg-emerald-600' : 'bg-red-600'}>
                  {result.insurance_current ? 'Current' : 'Lapsed'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Safety Rating:</span>
                <Badge className="bg-blue-600">{result.safety_rating}</Badge>
              </div>
            </div>

            {result.issues && result.issues.length > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-1">Issues:</p>
                <ul className="text-xs text-red-700 space-y-1">
                  {result.issues.map((issue, idx) => (
                    <li key={idx}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}