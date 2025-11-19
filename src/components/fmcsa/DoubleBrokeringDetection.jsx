import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, CheckCircle } from "lucide-react";

export default function DoubleBrokeringDetection({ load, carrier }) {
  const [analysis, setAnalysis] = useState(null);

  const checkForDoubleBrokering = () => {
    // Simulated detection logic - in production would check:
    // 1. Carrier authority type (must have motor carrier authority)
    // 2. Compare MC# on rate conf vs truck/driver assignment
    // 3. Check for broker-only authority attempting to self-dispatch
    // 4. Verify insurance matches assigned carrier
    // 5. Cross-reference with factoring company records
    
    const redFlags = [];
    let riskScore = 0;

    if (carrier?.authority_type === 'broker_only') {
      redFlags.push('Carrier has broker-only authority, not motor carrier authority');
      riskScore += 40;
    }

    if (!carrier?.insurance_expiration || new Date(carrier.insurance_expiration) < new Date()) {
      redFlags.push('Expired or missing insurance on file');
      riskScore += 30;
    }

    if (carrier?.created_date && (new Date() - new Date(carrier.created_date)) < 30 * 24 * 60 * 60 * 1000) {
      redFlags.push('Recently added carrier (< 30 days)');
      riskScore += 20;
    }

    if (!carrier?.safety_rating || carrier.safety_rating === 'none') {
      redFlags.push('No safety rating on file');
      riskScore += 15;
    }

    setAnalysis({
      riskScore,
      redFlags,
      isPassed: riskScore < 50,
      recommendation: riskScore < 30 ? 'Low risk - proceed' :
                      riskScore < 50 ? 'Moderate risk - verify documents' :
                      'High risk - do not tender'
    });
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-600" />
          Double Brokering Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>What is Double Brokering?</strong><br/>
            Illegal practice where a broker poses as a carrier, accepts a load, then re-brokers it to another carrier without shipper knowledge. This violates 49 CFR 371.3 and exposes brokers to liability.
          </p>
        </div>

        <Button 
          onClick={checkForDoubleBrokering}
          className="w-full bg-orange-600"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Scan for Double Brokering Risk
        </Button>

        {analysis && (
          <div className={`p-4 rounded-lg border-2 ${
            analysis.isPassed 
              ? 'bg-emerald-50 border-emerald-500'
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">Risk Score: {analysis.riskScore}%</h3>
                <p className="text-sm mt-1">{analysis.recommendation}</p>
              </div>
              {analysis.isPassed ? (
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-red-600" />
              )}
            </div>

            {analysis.redFlags.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">🚩 Red Flags Detected:</h4>
                <ul className="space-y-1">
                  {analysis.redFlags.map((flag, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 p-3 bg-white rounded border border-slate-200">
              <h4 className="font-semibold text-sm mb-2">✓ Required Verification Steps:</h4>
              <ul className="text-sm space-y-1 text-slate-700">
                <li>☐ Verify carrier has motor carrier authority (not broker-only)</li>
                <li>☐ Confirm insurance certificate matches MC number on rate confirmation</li>
                <li>☐ Validate truck/trailer/driver assignment before pickup</li>
                <li>☐ Check carrier is not on fraud watchlist</li>
                <li>☐ Obtain signed broker-carrier agreement</li>
              </ul>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}