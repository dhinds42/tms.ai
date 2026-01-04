import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Settings, ExternalLink, Loader2, FileCheck } from "lucide-react";

export default function TriumphPay({ isConnected, onConnectionChange, operatingMode }) {
  const [showConfig, setShowConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [auditEnabled, setAuditEnabled] = useState(false);

  const handleConnect = () => {
    if (!apiKey) {
      alert('Please enter TriumphPay API key');
      setShowConfig(true);
      return;
    }

    setIsConnecting(true);
    // TODO: Implement secure backend OAuth flow for TriumphPay
    // API keys should NEVER be stored in localStorage - use server-side secure storage
    setTimeout(() => {
      onConnectionChange(true);
      setIsConnecting(false);
      alert('Successfully connected to TriumphPay!');
    }, 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from TriumphPay?')) {
      onConnectionChange(false);
      alert('Disconnected from TriumphPay');
    }
  };

  const handleSaveConfig = () => {
    // TODO: Send credentials securely to backend for encrypted storage
    // NEVER store credentials in localStorage
    setShowConfig(false);
    alert('TriumphPay configuration saved');
  };

  return (
    <Card className={`border-0 shadow-xl ${isConnected ? 'bg-gradient-to-r from-indigo-50 to-purple-50' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>TriumphPay</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Payment Network & Audit Services</p>
            </div>
          </div>
          <Badge className={isConnected ? 'bg-indigo-600' : 'bg-slate-400'}>
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Connected
              </>
            ) : (
              'Not Connected'
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <p className="text-sm text-slate-700">
          TriumphPay provides payment automation, fraud prevention, and audit services to protect brokers and carriers from payment fraud.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🛡️ Fraud Protection</p>
            <p className="text-xs text-slate-600">Advanced fraud detection</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">📋 Audit Services</p>
            <p className="text-xs text-slate-600">Invoice & document auditing</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">💸 Quick Pay</p>
            <p className="text-xs text-slate-600">Expedited carrier payments</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🔄 Network</p>
            <p className="text-xs text-slate-600">Trusted payment network</p>
          </div>
        </div>

        {/* Audit Toggle */}
        {isConnected && (
          <div className="p-4 bg-white rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">TriumphPay Audit</p>
                <p className="text-xs text-slate-600">Automatic invoice and document auditing</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={auditEnabled}
                  onChange={(e) => setAuditEnabled(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <Badge className={auditEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                  {auditEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {isConnected ? (
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://triumphpay.com', '_blank')}
              className="bg-indigo-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open TriumphPay
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="border-red-300 text-red-600">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-indigo-600 text-white">
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Connect to TriumphPay
                </>
              )}
            </Button>
            <Button onClick={() => setShowConfig(!showConfig)} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        )}

        {showConfig && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
            <h4 className="font-semibold text-slate-900">API Configuration</h4>
            <div>
              <Label>TriumphPay API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter TriumphPay API key"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} size="sm" className="bg-indigo-600 text-white">
                Save Configuration
              </Button>
              <Button onClick={() => setShowConfig(false)} size="sm" variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}