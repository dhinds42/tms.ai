import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Radio,
  CheckCircle,
  AlertTriangle,
  Shield,
  Activity,
  Settings as SettingsIcon,
  Play,
  RotateCcw,
  Trash2,
  TestTube
} from "lucide-react";
import {
  saveOpendockConfig,
  getOpendockConfig,
  testOpendockConnection,
  goLiveOpendock,
  rollbackToStaging,
  isOpendockConfigured,
  getOpendockAuditLog,
  clearOpendockAuditLog,
  opendockAPI
} from "@/utils/opendockAPI";

export default function OpendockIntegration() {
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [activeTab, setActiveTab] = useState("config");
  
  // Configuration state
  const [authType, setAuthType] = useState('api_key');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [environment, setEnvironment] = useState('staging');
  
  // Status state
  const [goLiveStatus, setGoLiveStatus] = useState('testing');
  const [goLiveDate, setGoLiveDate] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Audit log state
  const [auditLog, setAuditLog] = useState([]);

  // Load configuration on mount
  useEffect(() => {
    if (operatingMode !== 'carrier') return;
    
    const config = getOpendockConfig();
    if (config) {
      setAuthType(config.authType);
      setApiKey(config.apiKey);
      setUsername(config.username);
      setPassword(config.password);
      setEnvironment(config.environment);
      setGoLiveStatus(config.goLiveStatus);
      setGoLiveDate(config.goLiveDate);
    }
    
    setIsConfigured(isOpendockConfigured());
    loadAuditLog();
  }, [operatingMode]);

  const loadAuditLog = () => {
    const log = getOpendockAuditLog();
    setAuditLog(log.reverse()); // Most recent first
  };

  const handleSaveConfig = () => {
    try {
      saveOpendockConfig({
        authType,
        apiKey,
        username,
        password,
        environment
      });
      
      setIsConfigured(isOpendockConfigured());
      loadAuditLog();
      alert('✅ Opendock configuration saved successfully!');
    } catch (error) {
      alert(`❌ Error saving configuration: ${error.message}`);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const result = await testOpendockConnection();
      setConnectionStatus(result);
      loadAuditLog();
    } catch (error) {
      setConnectionStatus({ success: false, message: error.message });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleGoLive = () => {
    if (!confirm('⚠️ Are you sure you want to go live with production?\n\nThis will switch all Opendock API calls to the production environment.')) {
      return;
    }
    
    try {
      goLiveOpendock();
      setEnvironment('production');
      setGoLiveStatus('live');
      setGoLiveDate(new Date().toISOString());
      loadAuditLog();
      alert('🚀 Successfully switched to production!\n\nAll Opendock API calls are now using the live environment.');
    } catch (error) {
      alert(`❌ Error going live: ${error.message}`);
    }
  };

  const handleRollback = () => {
    if (!confirm('Are you sure you want to rollback to staging?')) {
      return;
    }
    
    try {
      rollbackToStaging();
      setEnvironment('staging');
      setGoLiveStatus('testing');
      loadAuditLog();
      alert('✅ Rolled back to staging environment');
    } catch (error) {
      alert(`❌ Error rolling back: ${error.message}`);
    }
  };

  const handleClearAuditLog = () => {
    if (!confirm('Are you sure you want to clear the audit log?')) {
      return;
    }
    
    clearOpendockAuditLog();
    loadAuditLog();
  };

  // Show error if not in carrier mode
  if (operatingMode !== 'carrier') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-300 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                Carrier Mode Required
              </h2>
              <p className="text-red-700 mb-6">
                Opendock integration is only available in Carrier Mode. Please switch to Carrier Mode in the sidebar to access this feature.
              </p>
              <Badge className="bg-red-600 text-white text-lg px-6 py-2">
                Current Mode: BROKER
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Opendock Integration
            </h1>
            <p className="text-slate-600 mt-1">
              Neutron REST API - Carrier-side integration with staging and production support
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-lg px-4 py-2 ${
              goLiveStatus === 'live' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}>
              {goLiveStatus === 'live' ? '🟢 LIVE' : '🔵 TESTING'}
            </Badge>
            <Badge className="text-lg px-4 py-2 bg-slate-700">
              {environment.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Configuration</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {isConfigured ? 'Ready' : 'Incomplete'}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl ${
                  isConfigured ? 'bg-gradient-to-br from-emerald-600 to-green-600' : 'bg-gradient-to-br from-amber-600 to-orange-600'
                }`}>
                  {isConfigured ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Environment</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {environment === 'staging' ? 'Staging' : 'Production'}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase">Security</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    Encrypted
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="config">🔧 Configuration</TabsTrigger>
            <TabsTrigger value="golive">🚀 Go Live</TabsTrigger>
            <TabsTrigger value="audit">📋 Audit Log</TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="config">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Authentication Type */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Authentication Type</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setAuthType('api_key')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        authType === 'api_key'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">API Key</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Use Bearer token authentication
                      </div>
                    </button>
                    <button
                      onClick={() => setAuthType('username_password')}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        authType === 'username_password'
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">Username/Password</div>
                      <div className="text-sm text-slate-600 mt-1">
                        Generate JWT token automatically
                      </div>
                    </button>
                  </div>
                </div>

                {/* API Key Auth */}
                {authType === 'api_key' && (
                  <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <Label>API Key *</Label>
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter Opendock API key"
                      className="mt-2"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Get your API key from the Opendock carrier portal
                    </p>
                  </div>
                )}

                {/* Username/Password Auth */}
                {authType === 'username_password' && (
                  <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
                    <div>
                      <Label>Username *</Label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Opendock username"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Opendock password"
                        className="mt-2"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      JWT tokens will be generated and cached automatically
                    </p>
                  </div>
                )}

                {/* Environment Selection */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Environment</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setEnvironment('staging')}
                      disabled={goLiveStatus === 'live'}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        environment === 'staging'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      } ${goLiveStatus === 'live' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="font-semibold text-slate-900">🔵 Staging</div>
                      <div className="text-sm text-slate-600 mt-1">
                        neutron.staging.opendock.com
                      </div>
                      <div className="text-xs text-blue-600 mt-2">
                        Test and validate integration
                      </div>
                    </button>
                    <button
                      onClick={() => setEnvironment('production')}
                      disabled={goLiveStatus !== 'live'}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        environment === 'production'
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-slate-300'
                      } ${goLiveStatus !== 'live' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="font-semibold text-slate-900">🟢 Production</div>
                      <div className="text-sm text-slate-600 mt-1">
                        neutron.opendock.com
                      </div>
                      <div className="text-xs text-emerald-600 mt-2">
                        Live production environment
                      </div>
                    </button>
                  </div>
                  {goLiveStatus !== 'live' && (
                    <p className="text-xs text-amber-600 mt-2">
                      ⚠️ Production is locked until you go live from the Go Live tab
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveConfig}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                  <Button
                    onClick={handleTestConnection}
                    disabled={!isConfigured || isTestingConnection}
                    variant="outline"
                    className="flex-1"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {isTestingConnection ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>

                {/* Connection Status */}
                {connectionStatus && (
                  <div className={`p-4 rounded-lg ${
                    connectionStatus.success
                      ? 'bg-emerald-50 border border-emerald-300'
                      : 'bg-red-50 border border-red-300'
                  }`}>
                    <div className="flex items-center gap-2">
                      {connectionStatus.success ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-emerald-900">
                            Connection Successful!
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-900">
                            Connection Failed
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm mt-2 text-slate-700">
                      {connectionStatus.message}
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Go Live Tab */}
          <TabsContent value="golive">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Production Deployment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Current Status */}
                <div className={`p-6 rounded-xl border-2 ${
                  goLiveStatus === 'live'
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-blue-50 border-blue-300'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Current Status: {goLiveStatus === 'live' ? 'LIVE' : 'TESTING'}
                      </h3>
                      <p className="text-slate-600 mt-1">
                        Environment: <strong>{environment.toUpperCase()}</strong>
                      </p>
                    </div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      goLiveStatus === 'live'
                        ? 'bg-emerald-600'
                        : 'bg-blue-600'
                    }`}>
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {goLiveDate && (
                    <p className="text-sm text-slate-600">
                      Went live: {new Date(goLiveDate).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Pre-flight Checklist */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3">✅ Pre-flight Checklist:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {isConfigured ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className={isConfigured ? 'text-emerald-700' : 'text-amber-700'}>
                        API credentials configured
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {connectionStatus?.success ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className={connectionStatus?.success ? 'text-emerald-700' : 'text-amber-700'}>
                        Connection tested successfully
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {environment === 'staging' && goLiveStatus === 'testing' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className={environment === 'staging' && goLiveStatus === 'testing' ? 'text-emerald-700' : 'text-amber-700'}>
                        Staging environment validated
                      </span>
                    </div>
                  </div>
                </div>

                {/* Go Live Actions */}
                {goLiveStatus === 'testing' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>⚠️ Important:</strong> Going live will switch all Opendock API calls to the production environment. 
                        Make sure you've thoroughly tested in staging first.
                      </p>
                    </div>
                    <Button
                      onClick={handleGoLive}
                      disabled={!isConfigured || !connectionStatus?.success}
                      className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-6 text-lg"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      🚀 Go Live to Production
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg">
                      <p className="text-sm text-emerald-800">
                        <strong>✅ You're Live!</strong> All Opendock API calls are using the production environment.
                      </p>
                    </div>
                    <Button
                      onClick={handleRollback}
                      variant="outline"
                      className="w-full border-2 border-amber-500 text-amber-700 hover:bg-amber-50 py-6 text-lg"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Rollback to Staging
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Audit Log
                  </CardTitle>
                  <Button
                    onClick={handleClearAuditLog}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Log
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                
                {auditLog.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No audit entries yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {auditLog.map((entry, index) => (
                      <div
                        key={index}
                        className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={
                                entry.action.includes('success') ? 'bg-emerald-600' :
                                entry.action.includes('failed') || entry.action.includes('error') ? 'bg-red-600' :
                                entry.action.includes('go_live') ? 'bg-purple-600' :
                                'bg-blue-600'
                              }>
                                {entry.action.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                              <span className="text-sm text-slate-600">
                                {entry.environment.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700">
                              {JSON.stringify(entry, null, 2).replace(/[{}"]/g, '').trim()}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}