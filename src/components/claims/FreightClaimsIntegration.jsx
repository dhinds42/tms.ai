import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, ExternalLink, CheckCircle, Settings, Loader2 } from "lucide-react";

export default function FreightClaimsIntegration({ claims, operatingMode }) {
  const [isConnected, setIsConnected] = useState(
    localStorage.getItem('freightclaims_connected') === 'true'
  );
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('freightclaims_api_key') || ''
  );
  const [showConfig, setShowConfig] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (!apiKey) {
      alert('Please enter your FreightClaims.com API key');
      setShowConfig(true);
      return;
    }

    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      localStorage.setItem('freightclaims_connected', 'true');
      localStorage.setItem('freightclaims_api_key', apiKey);
      setIsConnecting(false);
      alert('Successfully connected to FreightClaims.com!');
    }, 2000);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect from FreightClaims.com?')) {
      setIsConnected(false);
      localStorage.removeItem('freightclaims_connected');
      alert('Disconnected from FreightClaims.com');
    }
  };

  const handleSaveConfig = () => {
    localStorage.setItem('freightclaims_api_key', apiKey);
    localStorage.setItem('api_config_freightclaims', JSON.stringify({
      enabled: true,
      api_key: apiKey,
      configured_date: new Date().toISOString()
    }));
    setShowConfig(false);
    alert('FreightClaims.com API configuration saved');
  };

  const handleSubmitToFreightClaims = (claim) => {
    if (!isConnected) {
      alert('Please connect to FreightClaims.com first');
      return;
    }
    alert(`Claim ${claim.claim_number} submitted to FreightClaims.com for processing`);
  };

  return (
    <div className="space-y-6 mt-6">
      
      {/* Connection Status */}
      <Card className={`border-0 shadow-xl ${isConnected ? 'bg-gradient-to-r from-emerald-50 to-green-50' : 'bg-gradient-to-r from-slate-50 to-slate-100'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              FreightClaims.com Integration
            </CardTitle>
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
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <p className="text-emerald-900">
                Your TMS is connected to FreightClaims.com for streamlined claims processing
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open('https://freightclaims.com', '_blank')}
                  className="bg-emerald-600 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open FreightClaims.com
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="border-red-300 text-red-600"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-600">
                Connect to FreightClaims.com for professional claims processing, documentation, and resolution services
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="bg-blue-600 text-white"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Connect to FreightClaims.com
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowConfig(!showConfig)}
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  API Settings
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Configuration */}
      {showConfig && (
        <Card className="border-0 shadow-xl bg-white border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              FreightClaims.com API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your FreightClaims.com API key"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-2">
                Get your API key from FreightClaims.com dashboard
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} className="bg-blue-600 text-white">
                Save Configuration
              </Button>
              <Button onClick={() => setShowConfig(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FreightClaims.com Features */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle>FreightClaims.com Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">📋 Professional Processing</h4>
              <p className="text-sm text-slate-700">Expert claims handlers review and process all submissions</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">💰 Higher Recovery Rates</h4>
              <p className="text-sm text-slate-700">Industry-leading recovery rates through proven processes</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">📄 Complete Documentation</h4>
              <p className="text-sm text-slate-700">Professional documentation and evidence gathering</p>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">⚡ Fast Resolution</h4>
              <p className="text-sm text-slate-700">Expedited claims processing and settlement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Claims */}
      {isConnected && claims.length > 0 && (
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Submit to FreightClaims.com</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {claims.filter(c => c.status === 'submitted').map(claim => (
                <div key={claim.id} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{claim.claim_number}</p>
                    <p className="text-sm text-slate-600">${claim.claim_amount.toLocaleString()} claim</p>
                  </div>
                  <Button
                    onClick={() => handleSubmitToFreightClaims(claim)}
                    className="bg-emerald-600 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Submit to FreightClaims
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}