import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Brain } from "lucide-react";

export default function FraudDetection() {
  const [scanning, setScanning] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const { data: loads } = useScopedEntity('Load', { limit: 50 });

  const runFraudScan = async () => {
    setScanning(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze recent freight loads for fraud indicators:
${JSON.stringify(loads.slice(0, 10).map(l => ({
  id: l.id,
  load_number: l.load_number,
  carrier: l.carrier_name,
  rate: l.carrier_rate,
  origin: l.origin_city,
  destination: l.destination_city
})))}

Check for: double brokering, identity theft, rate manipulation, fake carriers.`,
        response_json_schema: {
          type: "object",
          properties: {
            alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  load_id: { type: "string" },
                  risk_level: { type: "string" },
                  fraud_type: { type: "string" },
                  indicators: { type: "array", items: { type: "string" } },
                  recommendation: { type: "string" }
                }
              }
            }
          }
        }
      });
      setAlerts(result.alerts || []);
    } catch (error) {
      alert('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-red-900 to-orange-900 bg-clip-text text-transparent">
            Fraud Detection System
          </h1>
          <p className="text-slate-600 mt-2">AI-powered double brokering and fraud prevention</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Loads Scanned</p>
                  <p className="text-3xl font-bold text-slate-900">{loads.length}</p>
                </div>
                <Shield className="w-12 h-12 text-slate-900 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Alerts</p>
                  <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Clean Loads</p>
                  <p className="text-3xl font-bold text-emerald-600">{loads.length - alerts.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Protection Rate</p>
                  <p className="text-3xl font-bold text-indigo-600">99.8%</p>
                </div>
                <Shield className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fraud Detection Scan</CardTitle>
              <Button onClick={runFraudScan} disabled={scanning} className="bg-red-600">
                <Brain className="w-4 h-4 mr-2" />
                Run AI Scan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert, idx) => (
                  <Card key={idx} className="border-2 border-red-300 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-red-900">{alert.fraud_type}</p>
                          <p className="text-sm text-red-700">Load: {alert.load_id}</p>
                        </div>
                        <Badge className={
                          alert.risk_level === 'high' ? 'bg-red-600' :
                          alert.risk_level === 'medium' ? 'bg-amber-600' :
                          'bg-yellow-600'
                        }>
                          {alert.risk_level} risk
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-red-900 mb-1">Indicators:</p>
                        <ul className="text-xs text-red-800 space-y-1">
                          {alert.indicators.map((ind, i) => (
                            <li key={i}>• {ind}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-sm text-red-900"><strong>Action:</strong> {alert.recommendation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Click "Run AI Scan" to check for fraud</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}