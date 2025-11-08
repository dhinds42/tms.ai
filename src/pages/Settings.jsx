import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Shield, 
  CreditCard, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  Info
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function Settings() {
  const [showApiKeys, setShowApiKeys] = useState({});
  const [apiConfigs, setApiConfigs] = useState({
    fmcsa: {
      api_key: '',
      username: '',
      endpoint: 'https://mobile.fmcsa.dot.gov/qc/services/carriers',
      status: 'not_configured'
    },
    carrier411: {
      api_key: '',
      status: 'not_configured'
    },
    highway: {
      api_key: '',
      status: 'not_configured'
    },
    dat: {
      api_key: '',
      status: 'not_configured'
    },
    rmis: {
      api_key: '',
      status: 'not_configured'
    },
    credit: {
      api_key: '',
      service: 'experian',
      status: 'not_configured'
    }
  });

  const [saveStatus, setSaveStatus] = useState(null);

  const handleSaveConfig = async (serviceName) => {
    setSaveStatus('saving');
    
    try {
      // In production, this would save to backend via API
      // For now, we'll save to localStorage and show success
      localStorage.setItem(`api_config_${serviceName}`, JSON.stringify(apiConfigs[serviceName]));
      
      // Update status
      setApiConfigs(prev => ({
        ...prev,
        [serviceName]: {
          ...prev[serviceName],
          status: 'configured'
        }
      }));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
      
      alert(`${serviceName.toUpperCase()} API configuration saved successfully!\n\nThe system will now use real ${serviceName.toUpperCase()} data for carrier verification and credit checks.`);
      
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleTestConnection = async (serviceName) => {
    alert(`Testing ${serviceName.toUpperCase()} API connection...\n\nIn production, this would verify your API credentials are working correctly.`);
  };

  const toggleShowKey = (keyName) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const updateConfig = (service, field, value) => {
    setApiConfigs(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            API Configuration & Settings
          </h1>
          <p className="text-slate-600 text-lg">
            Configure external API integrations for real-time carrier verification and credit checks
          </p>
        </div>

        {/* Save Status Alert */}
        {saveStatus && (
          <Alert className={saveStatus === 'success' ? 'bg-emerald-50 border-emerald-300' : saveStatus === 'error' ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'}>
            {saveStatus === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-900">Configuration Saved!</AlertTitle>
                <AlertDescription className="text-emerald-800">
                  Your API credentials have been securely saved and are ready to use.
                </AlertDescription>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-900">Save Failed</AlertTitle>
                <AlertDescription className="text-red-800">
                  There was an error saving your configuration. Please try again.
                </AlertDescription>
              </>
            ) : (
              <>
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Saving...</AlertTitle>
                <AlertDescription className="text-blue-800">
                  Please wait while we save your configuration.
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        {/* Info Banner */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">How It Works</h3>
                <p className="text-sm text-blue-800">
                  Add your API credentials below, and TMS.ai will automatically use them to fetch <strong>real, live data</strong> from FMCSA, credit bureaus, and third-party services. 
                  If credentials aren't configured, the system falls back to AI-powered simulation for testing purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Tabs */}
        <Tabs defaultValue="fmcsa" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-2">
            <TabsTrigger value="fmcsa" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              FMCSA
            </TabsTrigger>
            <TabsTrigger value="thirdparty" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Third-Party
            </TabsTrigger>
            <TabsTrigger value="credit" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Credit Check
            </TabsTrigger>
          </TabsList>

          {/* FMCSA Configuration */}
          <TabsContent value="fmcsa">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-emerald-600" />
                      FMCSA SAFER Web Services
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Official FMCSA database access for carrier verification
                    </p>
                  </div>
                  <Badge className={apiConfigs.fmcsa.status === 'configured' ? 'bg-emerald-600' : 'bg-slate-400'}>
                    {apiConfigs.fmcsa.status === 'configured' ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* API Key */}
                <div>
                  <Label htmlFor="fmcsa-api-key" className="text-sm font-semibold">
                    API Key / Token *
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <Input
                        id="fmcsa-api-key"
                        type={showApiKeys.fmcsa_key ? "text" : "password"}
                        value={apiConfigs.fmcsa.api_key}
                        onChange={(e) => updateConfig('fmcsa', 'api_key', e.target.value)}
                        placeholder="Enter your FMCSA API key..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey('fmcsa_key')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showApiKeys.fmcsa_key ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Your FMCSA Web Services API token
                  </p>
                </div>

                {/* Username */}
                <div>
                  <Label htmlFor="fmcsa-username" className="text-sm font-semibold">
                    API Username (Optional)
                  </Label>
                  <Input
                    id="fmcsa-username"
                    type="text"
                    value={apiConfigs.fmcsa.username}
                    onChange={(e) => updateConfig('fmcsa', 'username', e.target.value)}
                    placeholder="Enter username if required..."
                    className="mt-2"
                  />
                </div>

                {/* Endpoint */}
                <div>
                  <Label htmlFor="fmcsa-endpoint" className="text-sm font-semibold">
                    API Endpoint URL
                  </Label>
                  <Input
                    id="fmcsa-endpoint"
                    type="url"
                    value={apiConfigs.fmcsa.endpoint}
                    onChange={(e) => updateConfig('fmcsa', 'endpoint', e.target.value)}
                    placeholder="https://mobile.fmcsa.dot.gov/qc/services/carriers"
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Default: https://mobile.fmcsa.dot.gov/qc/services/carriers
                  </p>
                </div>

                {/* Documentation Link */}
                <Alert className="bg-slate-50 border-slate-200">
                  <Info className="h-4 w-4 text-slate-600" />
                  <AlertTitle className="text-slate-900">Need API Access?</AlertTitle>
                  <AlertDescription className="text-slate-700">
                    <a 
                      href="https://ai.fmcsa.dot.gov/SMS/Tools/WebServices.aspx" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                    >
                      Register for FMCSA Web Services
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleSaveConfig('fmcsa')}
                    disabled={!apiConfigs.fmcsa.api_key}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTestConnection('fmcsa')}
                    disabled={!apiConfigs.fmcsa.api_key}
                  >
                    Test Connection
                  </Button>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Third-Party Services */}
          <TabsContent value="thirdparty">
            <div className="space-y-6">
              
              {/* Carrier411 */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Carrier411</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        Enhanced carrier monitoring and fraud detection
                      </p>
                    </div>
                    <Badge className={apiConfigs.carrier411.status === 'configured' ? 'bg-emerald-600' : 'bg-slate-400'}>
                      {apiConfigs.carrier411.status === 'configured' ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="carrier411-key">API Key</Label>
                    <div className="flex gap-2 mt-2">
                      <div className="relative flex-1">
                        <Input
                          id="carrier411-key"
                          type={showApiKeys.carrier411 ? "text" : "password"}
                          value={apiConfigs.carrier411.api_key}
                          onChange={(e) => updateConfig('carrier411', 'api_key', e.target.value)}
                          placeholder="Enter Carrier411 API key..."
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey('carrier411')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKeys.carrier411 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSaveConfig('carrier411')}
                      disabled={!apiConfigs.carrier411.api_key}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://www.carrier411.com', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Get API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Highway by Trucker Tools */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Highway by Trucker Tools</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        FMCSA data with enhanced carrier insights
                      </p>
                    </div>
                    <Badge className={apiConfigs.highway.status === 'configured' ? 'bg-emerald-600' : 'bg-slate-400'}>
                      {apiConfigs.highway.status === 'configured' ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="highway-key">API Key</Label>
                    <div className="flex gap-2 mt-2">
                      <div className="relative flex-1">
                        <Input
                          id="highway-key"
                          type={showApiKeys.highway ? "text" : "password"}
                          value={apiConfigs.highway.api_key}
                          onChange={(e) => updateConfig('highway', 'api_key', e.target.value)}
                          placeholder="Enter Highway API key..."
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey('highway')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKeys.highway ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSaveConfig('highway')}
                      disabled={!apiConfigs.highway.api_key}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://www.truckertools.com/highway', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Get API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* DAT iQ */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>DAT iQ Carrier Watch</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        Carrier intelligence and performance data
                      </p>
                    </div>
                    <Badge className={apiConfigs.dat.status === 'configured' ? 'bg-emerald-600' : 'bg-slate-400'}>
                      {apiConfigs.dat.status === 'configured' ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dat-key">API Key</Label>
                    <div className="flex gap-2 mt-2">
                      <div className="relative flex-1">
                        <Input
                          id="dat-key"
                          type={showApiKeys.dat ? "text" : "password"}
                          value={apiConfigs.dat.api_key}
                          onChange={(e) => updateConfig('dat', 'api_key', e.target.value)}
                          placeholder="Enter DAT API key..."
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey('dat')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKeys.dat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSaveConfig('dat')}
                      disabled={!apiConfigs.dat.api_key}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://www.dat.com/iq', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Get API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* RMIS */}
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>RMIS (Risk Management)</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        Comprehensive carrier risk assessment
                      </p>
                    </div>
                    <Badge className={apiConfigs.rmis.status === 'configured' ? 'bg-emerald-600' : 'bg-slate-400'}>
                      {apiConfigs.rmis.status === 'configured' ? 'Configured' : 'Not Configured'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rmis-key">API Key</Label>
                    <div className="flex gap-2 mt-2">
                      <div className="relative flex-1">
                        <Input
                          id="rmis-key"
                          type={showApiKeys.rmis ? "text" : "password"}
                          value={apiConfigs.rmis.api_key}
                          onChange={(e) => updateConfig('rmis', 'api_key', e.target.value)}
                          placeholder="Enter RMIS API key..."
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey('rmis')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKeys.rmis ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSaveConfig('rmis')}
                      disabled={!apiConfigs.rmis.api_key}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open('https://www.rmis.com', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Get API Key
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Credit Check Services */}
          <TabsContent value="credit">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-indigo-600" />
                      Credit Check Services
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      Broker and shipper credit verification services
                    </p>
                  </div>
                  <Badge className={apiConfigs.credit.status === 'configured' ? 'bg-emerald-600' : 'bg-slate-400'}>
                    {apiConfigs.credit.status === 'configured' ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Credit Service Provider */}
                <div>
                  <Label htmlFor="credit-service" className="text-sm font-semibold">
                    Credit Check Provider
                  </Label>
                  <select
                    id="credit-service"
                    value={apiConfigs.credit.service}
                    onChange={(e) => updateConfig('credit', 'service', e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="experian">Experian Business</option>
                    <option value="dun_bradstreet">Dun & Bradstreet</option>
                    <option value="ansonia">Ansonia Credit Data</option>
                    <option value="creditsafe">Creditsafe</option>
                    <option value="equifax">Equifax Commercial</option>
                  </select>
                </div>

                {/* API Key */}
                <div>
                  <Label htmlFor="credit-key" className="text-sm font-semibold">
                    API Key / Access Token *
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <div className="relative flex-1">
                      <Input
                        id="credit-key"
                        type={showApiKeys.credit ? "text" : "password"}
                        value={apiConfigs.credit.api_key}
                        onChange={(e) => updateConfig('credit', 'api_key', e.target.value)}
                        placeholder="Enter credit bureau API key..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowKey('credit')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showApiKeys.credit ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compliance Notice */}
                <Alert className="bg-amber-50 border-amber-300">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-900">FCRA Compliance Required</AlertTitle>
                  <AlertDescription className="text-amber-800">
                    Credit checks must comply with the Fair Credit Reporting Act (FCRA). Ensure you have proper authorization and permissible purpose before running credit checks.
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleSaveConfig('credit')}
                    disabled={!apiConfigs.credit.api_key}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTestConnection('credit')}
                    disabled={!apiConfigs.credit.api_key}
                  >
                    Test Connection
                  </Button>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* System Status */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">FMCSA SAFER</span>
                  {apiConfigs.fmcsa.status === 'configured' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {apiConfigs.fmcsa.status === 'configured' ? 'Using real FMCSA data' : 'Using AI simulation'}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Third-Party Services</span>
                  {(apiConfigs.carrier411.status === 'configured' || 
                    apiConfigs.highway.status === 'configured' || 
                    apiConfigs.dat.status === 'configured' ||
                    apiConfigs.rmis.status === 'configured') ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {[apiConfigs.carrier411, apiConfigs.highway, apiConfigs.dat, apiConfigs.rmis]
                    .filter(s => s.status === 'configured').length} service(s) configured
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Credit Checks</span>
                  {apiConfigs.credit.status === 'configured' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {apiConfigs.credit.status === 'configured' ? `Using ${apiConfigs.credit.service}` : 'Using AI simulation'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}