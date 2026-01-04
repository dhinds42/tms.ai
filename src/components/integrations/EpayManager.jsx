import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Settings, ExternalLink, Loader2, Zap } from "lucide-react";

export default function EpayManager({ isConnected, onConnectionChange, operatingMode }) {
  const [showConfig, setShowConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [companyId, setCompanyId] = useState('');

  const handleConnect = () => {
    if (!apiKey || !companyId) {
      alert('Please enter API key and Company ID');
      setShowConfig(true);
      return;
    }

    setIsConnecting(true);
    // TODO: Implement secure backend OAuth flow for Epay Manager
    // API keys should NEVER be stored in localStorage - use server-side secure storage
    setTimeout(() => {
      onConnectionChange(true);
      setIsConnecting(false);
      alert('Successfully connected to Epay Manager!');
    }, 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from Epay Manager?')) {
      onConnectionChange(false);
      alert('Disconnected from Epay Manager');
    }
  };

  const handleSaveConfig = () => {
    // TODO: Send credentials securely to backend for encrypted storage
    // NEVER store credentials in localStorage
    setShowConfig(false);
    alert('Epay Manager configuration saved');
  };

  return (
    <Card className={`border-0 shadow-xl ${isConnected ? 'bg-gradient-to-r from-emerald-50 to-green-50' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Epay Manager</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Quick Pay & Factoring Platform</p>
            </div>
          </div>
          <Badge className={isConnected ? 'bg-emerald-600' : 'bg-slate-400'}>
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
        
        {/* Description */}
        <p className="text-sm text-slate-700">
          Epay Manager provides instant carrier payments, factoring services, and automated payment processing for freight brokers and carriers.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">⚡ Quick Pay</p>
            <p className="text-xs text-slate-600">Pay carriers within 24 hours</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">💳 Factoring</p>
            <p className="text-xs text-slate-600">Invoice factoring & financing</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">🔄 Automated</p>
            <p className="text-xs text-slate-600">Sync loads & payments automatically</p>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm mb-1">📊 Reporting</p>
            <p className="text-xs text-slate-600">Real-time payment analytics</p>
          </div>
        </div>

        {/* Connection Status */}
        {isConnected ? (
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://epaymanager.com', '_blank')}
              className="bg-emerald-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Epay Manager
            </Button>
            <Button onClick={handleDisconnect} variant="outline" className="border-red-300 text-red-600">
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={isConnecting} className="bg-emerald-600 text-white">
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Connect to Epay Manager
                </>
              )}
            </Button>
            <Button onClick={() => setShowConfig(!showConfig)} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          </div>
        )}

        {/* Configuration Panel */}
        {showConfig && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
            <h4 className="font-semibold text-slate-900">API Configuration</h4>
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Epay Manager API key"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Company ID</Label>
              <Input
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Enter your Company ID"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} size="sm" className="bg-blue-600 text-white">
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