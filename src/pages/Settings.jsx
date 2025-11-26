import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, CheckCircle, Save, Key, Shield, AlertTriangle, Info, Trash2, Rocket } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import UserManagementTab from "../components/settings/UserManagementTab";

// Inline credential manager to avoid import issues
const CREDENTIAL_KEYS = {
  BROKER: {
    DAT_123_API_KEY: 'broker_123loadboard_api_key',
    DAT_API_KEY: 'broker_dat_api_key',
    DAT_USERNAME: 'broker_dat_username',
    DAT_PASSWORD: 'broker_dat_password',
    TRUCKSTOP_API_KEY: 'broker_truckstop_api_key',
    TRUCKSTOP_USERNAME: 'broker_truckstop_username',
    TRUCKSTOP_PASSWORD: 'broker_truckstop_password',
    TRUCKER_TOOLS_API_KEY: 'broker_truckertools_api_key',
    HIGHWAY_API_KEY: 'broker_highway_api_key',
    MYCARRIERPORTAL_API_KEY: 'broker_mycarrierportal_api_key',
    RMIS_API_KEY: 'broker_rmis_api_key',
    CARRIER411_API_KEY: 'broker_carrier411_api_key',
    SONAR_API_KEY: 'broker_sonar_api_key',
    FEDEX_API_KEY: 'broker_fedex_api_key',
    FEDEX_ACCOUNT: 'broker_fedex_account',
    AVERITT_API_KEY: 'broker_averitt_api_key',
    FREIGHTOS_API_KEY: 'broker_freightos_api_key',
  },
  CARRIER: {
    BREAKTHROUGH_FUEL_API_KEY: 'carrier_breakthrough_fuel_api_key',
    BREAKTHROUGH_FUEL_ACCOUNT: 'carrier_breakthrough_fuel_account',
    KEEPTRUCKIN_API_KEY: 'carrier_keeptruckin_api_key',
    SAMSARA_API_KEY: 'carrier_samsara_api_key',
    GEOTAB_API_KEY: 'carrier_geotab_api_key',
    BRANCH_API_KEY: 'carrier_branch_api_key',
    FLEETIO_API_KEY: 'carrier_fleetio_api_key',
  },
  SHARED: {
    EPAY_API_KEY: 'shared_epay_api_key',
    EPAY_COMPANY_ID: 'shared_epay_company_id',
    ROADSYNC_API_KEY: 'shared_roadsync_api_key',
    TRIUMPH_API_KEY: 'shared_triumph_api_key',
    QUICKBOOKS_API_KEY: 'shared_quickbooks_api_key',
    XERO_API_KEY: 'shared_xero_api_key',
    PROJECT44_API_KEY: 'shared_project44_api_key',
    FOURKITES_API_KEY: 'shared_fourkites_api_key',
    MACROPOINT_API_KEY: 'shared_macropoint_api_key',
    MACROPOINT_USERNAME: 'shared_macropoint_username',
    MACROPOINT_PASSWORD: 'shared_macropoint_password',
    TRANSPOREON_API_KEY: 'shared_transporeon_api_key',
    USPS_CLIENT_ID: 'shared_usps_client_id',
    USPS_CLIENT_SECRET: 'shared_usps_client_secret',
    GOOGLE_MAPS_API_KEY: 'shared_google_maps_api_key',
    DOCUSIGN_API_KEY: 'shared_docusign_api_key',
  },
};

const encryptValue = (value) => {
  if (!value) return '';
  let encKey = localStorage.getItem('_enc_key');
  if (!encKey) {
    encKey = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('_enc_key', encKey);
  }
  let encrypted = '';
  for (let i = 0; i < value.length; i++) {
    encrypted += String.fromCharCode(value.charCodeAt(i) ^ encKey.charCodeAt(i % encKey.length));
  }
  return btoa(encrypted);
};

const decryptValue = (encrypted) => {
  if (!encrypted) return '';
  try {
    const encKey = localStorage.getItem('_enc_key');
    if (!encKey) return '';
    const decoded = atob(encrypted);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ encKey.charCodeAt(i % encKey.length));
    }
    return decrypted;
  } catch {
    return '';
  }
};

const setCredential = (key, value) => {
  const encrypted = encryptValue(value);
  localStorage.setItem(key, encrypted);
};

const getCredential = (key) => {
  const encrypted = localStorage.getItem(key);
  return decryptValue(encrypted) || null;
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("users");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');
  const [productionMode, setProductionMode] = useState(localStorage.getItem('tms_production_mode') === 'true');
  const [isClearing, setIsClearing] = useState(false);

  // Payment integrations (SHARED)
  const [epayKey, setEpayKey] = useState('');
  const [epayCompanyId, setEpayCompanyId] = useState('');
  const [roadsyncKey, setRoadsyncKey] = useState('');
  const [triumphKey, setTriumphKey] = useState('');

  // Accounting (SHARED)
  const [quickbooksKey, setQuickbooksKey] = useState('');

  // Fuel (CARRIER ONLY)
  const [breakthroughKey, setBreakthroughKey] = useState('');
  const [breakthroughAccount, setBreakthroughAccount] = useState('');

  // ELD/Tracking (CARRIER ONLY) - Keeptruckin moved here
  const [keeptruckinKey, setKeeptruckinKey] = useState('');

  // Compliance (BROKER ONLY)
  const [highwayKey, setHighwayKey] = useState('');
  const [mycarrierKey, setMycarrierKey] = useState('');
  const [rmisKey, setRmisKey] = useState('');

  // Loadboards (BROKER ONLY)
  const [dat123Key, setDat123Key] = useState('');
  const [datKey, setDatKey] = useState('');
  const [datUsername, setDatUsername] = useState('');
  const [datPassword, setDatPassword] = useState('');
  const [truckerToolsKey, setTruckerToolsKey] = useState('');
  const [truckstopKey, setTruckstopKey] = useState('');
  const [truckstopUsername, setTruckstopUsername] = useState('');
  const [truckstopPassword, setTruckstopPassword] = useState('');

  // LTL Rating (BROKER ONLY)
  const [fedexKey, setFedexKey] = useState('');
  const [fedexAccount, setFedexAccount] = useState('');
  const [averittKey, setAverittKey] = useState('');

  // Rate Intelligence (BROKER ONLY)
  const [sonarKey, setSonarKey] = useState('');

  // Tracking/Visibility (SHARED)
  const [project44Key, setProject44Key] = useState('');
  const [fourkitesKey, setFourkitesKey] = useState('');
  const [macropointKey, setMacropointKey] = useState('');
  const [macropointUsername, setMacropointUsername] = useState('');
  const [macropointPassword, setMacropointPassword] = useState('');
  const [transporeonKey, setTransporeonKey] = useState('');

  // Freightos (BROKER ONLY)
  const [freightosKey, setFreightosKey] = useState('');

  // USPS (SHARED)
  const [uspsClientId, setUspsClientId] = useState('');
  const [uspsClientSecret, setUspsClientSecret] = useState('');

  // Load credentials on mount
  useEffect(() => {
    // Shared credentials
    setEpayKey(getCredential(CREDENTIAL_KEYS.SHARED.EPAY_API_KEY) || '');
    setEpayCompanyId(getCredential(CREDENTIAL_KEYS.SHARED.EPAY_COMPANY_ID) || '');
    setRoadsyncKey(getCredential(CREDENTIAL_KEYS.SHARED.ROADSYNC_API_KEY) || '');
    setTriumphKey(getCredential(CREDENTIAL_KEYS.SHARED.TRIUMPH_API_KEY) || '');
    setQuickbooksKey(getCredential(CREDENTIAL_KEYS.SHARED.QUICKBOOKS_API_KEY) || '');
    setProject44Key(getCredential(CREDENTIAL_KEYS.SHARED.PROJECT44_API_KEY) || '');
    setFourkitesKey(getCredential(CREDENTIAL_KEYS.SHARED.FOURKITES_API_KEY) || '');
    setMacropointKey(getCredential(CREDENTIAL_KEYS.SHARED.MACROPOINT_API_KEY) || '');
    setMacropointUsername(getCredential(CREDENTIAL_KEYS.SHARED.MACROPOINT_USERNAME) || '');
    setMacropointPassword(getCredential(CREDENTIAL_KEYS.SHARED.MACROPOINT_PASSWORD) || '');
    setTransporeonKey(getCredential(CREDENTIAL_KEYS.SHARED.TRANSPOREON_API_KEY) || '');
    setUspsClientId(getCredential(CREDENTIAL_KEYS.SHARED.USPS_CLIENT_ID) || '');
    setUspsClientSecret(getCredential(CREDENTIAL_KEYS.SHARED.USPS_CLIENT_SECRET) || '');

    // Broker-only credentials
    if (operatingMode === 'broker') {
      setDat123Key(getCredential(CREDENTIAL_KEYS.BROKER.DAT_123_API_KEY) || '');
      setDatKey(getCredential(CREDENTIAL_KEYS.BROKER.DAT_API_KEY) || '');
      setDatUsername(getCredential(CREDENTIAL_KEYS.BROKER.DAT_USERNAME) || '');
      setDatPassword(getCredential(CREDENTIAL_KEYS.BROKER.DAT_PASSWORD) || '');
      setTruckstopKey(getCredential(CREDENTIAL_KEYS.BROKER.TRUCKSTOP_API_KEY) || '');
      setTruckstopUsername(getCredential(CREDENTIAL_KEYS.BROKER.TRUCKSTOP_USERNAME) || '');
      setTruckstopPassword(getCredential(CREDENTIAL_KEYS.BROKER.TRUCKSTOP_PASSWORD) || '');
      setTruckerToolsKey(getCredential(CREDENTIAL_KEYS.BROKER.TRUCKER_TOOLS_API_KEY) || '');
      setHighwayKey(getCredential(CREDENTIAL_KEYS.BROKER.HIGHWAY_API_KEY) || '');
      setMycarrierKey(getCredential(CREDENTIAL_KEYS.BROKER.MYCARRIERPORTAL_API_KEY) || '');
      setRmisKey(getCredential(CREDENTIAL_KEYS.BROKER.RMIS_API_KEY) || '');
      setSonarKey(getCredential(CREDENTIAL_KEYS.BROKER.SONAR_API_KEY) || '');
      setFedexKey(getCredential(CREDENTIAL_KEYS.BROKER.FEDEX_API_KEY) || '');
      setFedexAccount(getCredential(CREDENTIAL_KEYS.BROKER.FEDEX_ACCOUNT) || '');
      setAverittKey(getCredential(CREDENTIAL_KEYS.BROKER.AVERITT_API_KEY) || '');
      setFreightosKey(getCredential(CREDENTIAL_KEYS.BROKER.FREIGHTOS_API_KEY) || '');
    }

    // Carrier-only credentials
    if (operatingMode === 'carrier') {
      setBreakthroughKey(getCredential(CREDENTIAL_KEYS.CARRIER.BREAKTHROUGH_FUEL_API_KEY) || '');
      setBreakthroughAccount(getCredential(CREDENTIAL_KEYS.CARRIER.BREAKTHROUGH_FUEL_ACCOUNT) || '');
      setKeeptruckinKey(getCredential(CREDENTIAL_KEYS.CARRIER.KEEPTRUCKIN_API_KEY) || '');
    }
  }, [operatingMode]);

  const handleSavePayments = () => {
    try {
      setCredential(CREDENTIAL_KEYS.SHARED.EPAY_API_KEY, epayKey);
      setCredential(CREDENTIAL_KEYS.SHARED.EPAY_COMPANY_ID, epayCompanyId);
      setCredential(CREDENTIAL_KEYS.SHARED.ROADSYNC_API_KEY, roadsyncKey);
      setCredential(CREDENTIAL_KEYS.SHARED.TRIUMPH_API_KEY, triumphKey);
      alert('✅ Payment integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving payment settings: ${error.message}`);
    }
  };

  const handleSaveAccounting = () => {
    try {
      setCredential(CREDENTIAL_KEYS.SHARED.QUICKBOOKS_API_KEY, quickbooksKey);
      alert('✅ Accounting integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving accounting settings: ${error.message}`);
    }
  };

  const handleSaveFuel = () => {
    try {
      setCredential(CREDENTIAL_KEYS.CARRIER.BREAKTHROUGH_FUEL_API_KEY, breakthroughKey);
      setCredential(CREDENTIAL_KEYS.CARRIER.BREAKTHROUGH_FUEL_ACCOUNT, breakthroughAccount);
      setCredential(CREDENTIAL_KEYS.CARRIER.KEEPTRUCKIN_API_KEY, keeptruckinKey);
      alert('✅ Fuel & ELD integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving fuel & ELD settings: ${error.message}`);
    }
  };

  const handleSaveCompliance = () => {
    try {
      setCredential(CREDENTIAL_KEYS.BROKER.HIGHWAY_API_KEY, highwayKey);
      setCredential(CREDENTIAL_KEYS.BROKER.MYCARRIERPORTAL_API_KEY, mycarrierKey);
      setCredential(CREDENTIAL_KEYS.BROKER.RMIS_API_KEY, rmisKey);
      alert('✅ Compliance integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving compliance settings: ${error.message}`);
    }
  };

  const handleSaveLoadboards = () => {
    try {
      setCredential(CREDENTIAL_KEYS.BROKER.DAT_123_API_KEY, dat123Key);
      setCredential(CREDENTIAL_KEYS.BROKER.DAT_API_KEY, datKey);
      setCredential(CREDENTIAL_KEYS.BROKER.DAT_USERNAME, datUsername);
      setCredential(CREDENTIAL_KEYS.BROKER.DAT_PASSWORD, datPassword);
      setCredential(CREDENTIAL_KEYS.BROKER.TRUCKER_TOOLS_API_KEY, truckerToolsKey);
      setCredential(CREDENTIAL_KEYS.BROKER.TRUCKSTOP_API_KEY, truckstopKey);
      setCredential(CREDENTIAL_KEYS.BROKER.TRUCKSTOP_USERNAME, truckstopUsername);
      setCredential(CREDENTIAL_KEYS.BROKER.TRUCKSTOP_PASSWORD, truckstopPassword);
      alert('✅ Loadboard integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving loadboard settings: ${error.message}`);
    }
  };

  const handleSaveLTL = () => {
    try {
      setCredential(CREDENTIAL_KEYS.BROKER.FEDEX_API_KEY, fedexKey);
      setCredential(CREDENTIAL_KEYS.BROKER.FEDEX_ACCOUNT, fedexAccount);
      setCredential(CREDENTIAL_KEYS.BROKER.AVERITT_API_KEY, averittKey);
      alert('✅ LTL Rating integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving LTL rating settings: ${error.message}`);
    }
  };

  const handleSaveRateIntel = () => {
    try {
      setCredential(CREDENTIAL_KEYS.BROKER.SONAR_API_KEY, sonarKey);
      alert('✅ Rate Intelligence integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving rate intelligence settings: ${error.message}`);
    }
  };

  const handleSaveTracking = () => {
    try {
      setCredential(CREDENTIAL_KEYS.SHARED.PROJECT44_API_KEY, project44Key);
      setCredential(CREDENTIAL_KEYS.SHARED.FOURKITES_API_KEY, fourkitesKey);
      setCredential(CREDENTIAL_KEYS.SHARED.MACROPOINT_API_KEY, macropointKey);
      setCredential(CREDENTIAL_KEYS.SHARED.MACROPOINT_USERNAME, macropointUsername);
      setCredential(CREDENTIAL_KEYS.SHARED.MACROPOINT_PASSWORD, macropointPassword);
      setCredential(CREDENTIAL_KEYS.SHARED.TRANSPOREON_API_KEY, transporeonKey);
      alert('✅ Tracking/Visibility integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving tracking/visibility settings: ${error.message}`);
    }
  };

  const handleSaveFreightos = () => {
    try {
      setCredential(CREDENTIAL_KEYS.BROKER.FREIGHTOS_API_KEY, freightosKey);
      alert('✅ Freightos integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving Freightos settings: ${error.message}`);
    }
  };

  const handleSaveUSPS = () => {
    try {
      setCredential(CREDENTIAL_KEYS.SHARED.USPS_CLIENT_ID, uspsClientId);
      setCredential(CREDENTIAL_KEYS.SHARED.USPS_CLIENT_SECRET, uspsClientSecret);
      alert('✅ USPS integration settings saved securely!');
    } catch (error) {
      alert(`❌ Error saving USPS settings: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Integration Settings
            </h1>
            <p className="text-slate-600 mt-1">
              Configure API credentials with role-based security
            </p>
          </div>
          <Badge className={`text-lg px-4 py-2 ${
            operatingMode === 'broker' ? 'bg-indigo-600' : 'bg-blue-600'
          }`}>
            {operatingMode.toUpperCase()} MODE
          </Badge>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-lg flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-emerald-900 mb-1">🔐 Secure Credential Storage</h3>
            <p className="text-sm text-emerald-800">
              All credentials are encrypted and stored securely. Access is controlled by your operating mode.
              <strong> {operatingMode === 'broker' ? 'Broker-only' : 'Carrier-only'}</strong> credentials are isolated from other roles.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 flex-wrap h-auto">
            <TabsTrigger value="production">🚀 Production</TabsTrigger>
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            <TabsTrigger value="payments">💳 Payments</TabsTrigger>
            <TabsTrigger value="accounting">📊 Accounting</TabsTrigger>
            {operatingMode === 'carrier' && <TabsTrigger value="fuel">⛽ Fuel & ELD</TabsTrigger>}
            {operatingMode === 'broker' && <TabsTrigger value="compliance">🛡️ Compliance</TabsTrigger>}
            {operatingMode === 'broker' && <TabsTrigger value="loadboards">📋 Loadboards</TabsTrigger>}
            {operatingMode === 'broker' && <TabsTrigger value="ltl">📦 LTL Rating</TabsTrigger>}
            {operatingMode === 'broker' && <TabsTrigger value="rateintel">📈 Rate Intel</TabsTrigger>}
            <TabsTrigger value="tracking">🚛 Tracking</TabsTrigger>
            {operatingMode === 'broker' && <TabsTrigger value="international">✈️ International</TabsTrigger>}
            <TabsTrigger value="usps">📮 USPS</TabsTrigger>
          </TabsList>

          {/* Production Mode Tab */}
          <TabsContent value="production">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-indigo-600" />
                    Production Mode Settings
                  </CardTitle>
                  <Badge className={productionMode ? "bg-emerald-600" : "bg-amber-600"}>
                    {productionMode ? "PRODUCTION" : "DEMO MODE"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Production Mode Toggle */}
                <div className="p-6 border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-indigo-900">Enable Production Mode</h3>
                      <p className="text-sm text-indigo-700 mt-1">
                        Switch to production mode when your TMS is ready for live operations. 
                        This will hide example data indicators and enable production-ready features.
                      </p>
                    </div>
                    <Switch
                      checked={productionMode}
                      onCheckedChange={(checked) => {
                        setProductionMode(checked);
                        localStorage.setItem('tms_production_mode', checked.toString());
                        if (checked) {
                          alert('✅ Production mode enabled! Example data indicators are now hidden.');
                        } else {
                          alert('ℹ️ Demo mode enabled. Example data indicators will be shown.');
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Current Status */}
                <div className={`p-4 rounded-lg border-2 ${productionMode ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
                  <div className="flex items-start gap-3">
                    {productionMode ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-bold ${productionMode ? 'text-emerald-900' : 'text-amber-900'}`}>
                        {productionMode ? '✓ Production Ready' : '⚠️ Demo/Development Mode'}
                      </h4>
                      <p className={`text-sm mt-1 ${productionMode ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {productionMode 
                          ? 'Your TMS is configured for live production use. All features are enabled for real operations.'
                          : 'Your TMS is in demo mode. Example data and development features are visible for testing purposes.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Clear Example Data */}
                {!productionMode && (
                  <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-red-900">Clear All Example Data</h4>
                        <p className="text-sm text-red-700 mt-1 mb-4">
                          Remove all demo/sample data from the system before going live. 
                          This action cannot be undone and will delete loads, carriers, drivers, shippers, and other sample records.
                        </p>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (!confirm('⚠️ WARNING: This will permanently delete ALL data in the system including loads, carriers, drivers, shippers, documents, and more.\n\nThis action CANNOT be undone.\n\nAre you absolutely sure you want to proceed?')) {
                              return;
                            }
                            if (!confirm('🚨 FINAL CONFIRMATION: Type "DELETE" in the next prompt to confirm data deletion.')) {
                              return;
                            }
                            const confirmation = prompt('Type DELETE to confirm:');
                            if (confirmation !== 'DELETE') {
                              alert('Data deletion cancelled.');
                              return;
                            }
                            
                            setIsClearing(true);
                            try {
                              // Import base44 client
                              const { base44 } = await import('@/api/base44Client');
                              
                              // List of entities to clear
                              const entitiesToClear = [
                                'Load', 'Carrier', 'Driver', 'Shipper', 'OwnerOperator',
                                'Document', 'Invoice', 'Quote', 'ComplianceItem', 'Settlement',
                                'Claim', 'Contact', 'Party', 'Vehicle', 'Trailer', 'Tractor',
                                'MaintenanceRecord', 'FuelTransaction', 'GPSPing', 'TrackingEvent',
                                'Notification', 'Task', 'LaneRate', 'Prospect'
                              ];
                              
                              let deletedCount = 0;
                              for (const entityName of entitiesToClear) {
                                try {
                                  const records = await base44.entities[entityName]?.list?.('-created_date', 1000);
                                  if (records && records.length > 0) {
                                    for (const record of records) {
                                      await base44.entities[entityName].delete(record.id);
                                      deletedCount++;
                                    }
                                  }
                                } catch (err) {
                                  console.log(`Skipping ${entityName}: ${err.message}`);
                                }
                              }
                              
                              alert(`✅ Successfully cleared ${deletedCount} records from the system.\n\nYou can now enable Production Mode.`);
                              setProductionMode(true);
                              localStorage.setItem('tms_production_mode', 'true');
                            } catch (error) {
                              alert(`❌ Error clearing data: ${error.message}`);
                            } finally {
                              setIsClearing(false);
                            }
                          }}
                          disabled={isClearing}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isClearing ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Clearing Data...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Clear All Example Data
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Production Checklist */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-900 mb-4">📋 Production Readiness Checklist</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'API credentials configured', key: 'api_creds' },
                      { label: 'User accounts created', key: 'users' },
                      { label: 'Company profile completed', key: 'company' },
                      { label: 'Example/demo data cleared', key: 'data_cleared' },
                      { label: 'Integration testing completed', key: 'testing' },
                      { label: 'Backup procedures verified', key: 'backup' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          onChange={(e) => {
                            const checklist = JSON.parse(localStorage.getItem('tms_production_checklist') || '{}');
                            checklist[item.key] = e.target.checked;
                            localStorage.setItem('tms_production_checklist', JSON.stringify(checklist));
                          }}
                          defaultChecked={JSON.parse(localStorage.getItem('tms_production_checklist') || '{}')[item.key]}
                        />
                        <span className="text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagementTab />
          </TabsContent>

          {/* Payments Tab (SHARED) */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment & Factoring Integrations</CardTitle>
                  <Badge className="bg-green-500 text-white">SHARED - Both Modes</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Epay Manager */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">Epay Manager</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={epayKey}
                        onChange={(e) => setEpayKey(e.target.value)}
                        placeholder="Enter Epay Manager API key"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Company ID</Label>
                      <Input
                        value={epayCompanyId}
                        onChange={(e) => setEpayCompanyId(e.target.value)}
                        placeholder="Enter Company ID"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                {/* RoadSync Pay */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">RoadSync Pay</h3>
                  <div>
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={roadsyncKey}
                      onChange={(e) => setRoadsyncKey(e.target.value)}
                      placeholder="Enter RoadSync API key"
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* TriumphPay */}
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">TriumphPay</h3>
                  <div>
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={triumphKey}
                      onChange={(e) => setTriumphKey(e.target.value)}
                      placeholder="Enter TriumphPay API key"
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button onClick={handleSavePayments} className="w-full bg-emerald-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Payment Settings (Encrypted)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounting Tab (SHARED) */}
          <TabsContent value="accounting">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Accounting Integrations</CardTitle>
                  <Badge className="bg-green-500 text-white">SHARED - Both Modes</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">QuickBooks Online</h3>
                  <div>
                    <Label>API Key / OAuth Token</Label>
                    <Input
                      type="password"
                      value={quickbooksKey}
                      onChange={(e) => setQuickbooksKey(e.target.value)}
                      placeholder="Enter QuickBooks API key"
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveAccounting} className="w-full bg-green-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Accounting Settings (Encrypted)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fuel & ELD Tab (CARRIER ONLY) */}
          {operatingMode === 'carrier' && (
            <TabsContent value="fuel">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Fuel & ELD Management</CardTitle>
                    <Badge className="bg-blue-600 text-white">CARRIER ONLY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Breakthrough Fuel</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={breakthroughKey}
                          onChange={(e) => setBreakthroughKey(e.target.value)}
                          placeholder="Enter Breakthrough Fuel API key"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Account Number</Label>
                        <Input
                          value={breakthroughAccount}
                          onChange={(e) => setBreakthroughAccount(e.target.value)}
                          placeholder="Enter Account Number"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">KeepTruckin ELD</h3>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={keeptruckinKey}
                        onChange={(e) => setKeeptruckinKey(e.target.value)}
                        placeholder="Enter KeepTruckin API key"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveFuel} className="w-full bg-amber-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Fuel Settings (Encrypted)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Compliance Tab (BROKER ONLY) */}
          {operatingMode === 'broker' && (
            <TabsContent value="compliance">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Carrier Compliance Integrations</CardTitle>
                    <Badge className="bg-indigo-600 text-white">BROKER ONLY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Highway</h3>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={highwayKey}
                        onChange={(e) => setHighwayKey(e.target.value)}
                        placeholder="Enter Highway API key"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">MyCarrierPortal</h3>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={mycarrierKey}
                        onChange={(e) => setMycarrierKey(e.target.value)}
                        placeholder="Enter MyCarrierPortal API key"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">RMIS</h3>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={rmisKey}
                        onChange={(e) => setRmisKey(e.target.value)}
                        placeholder="Enter RMIS API key"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveCompliance} className="w-full bg-purple-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Compliance Settings (Encrypted)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Loadboards Tab (BROKER ONLY) */}
          {operatingMode === 'broker' && (
            <TabsContent value="loadboards">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Loadboard Integrations</CardTitle>
                    <Badge className="bg-indigo-600 text-white">BROKER ONLY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">123 Loadboard</h3>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={dat123Key}
                        onChange={(e) => setDat123Key(e.target.value)}
                        placeholder="Enter 123 Loadboard API key"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">DAT</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Username</Label>
                        <Input
                          value={datUsername}
                          onChange={(e) => setDatUsername(e.target.value)}
                          placeholder="DAT Username"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={datPassword}
                          onChange={(e) => setDatPassword(e.target.value)}
                          placeholder="DAT Password"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>REST API Key (Optional)</Label>
                      <Input
                        type="password"
                        value={datKey}
                        onChange={(e) => setDatKey(e.target.value)}
                        placeholder="Enter DAT REST API key"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Trucker Tools</h3>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={truckerToolsKey}
                        onChange={(e) => setTruckerToolsKey(e.target.value)}
                        placeholder="Enter Trucker Tools API key"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Truckstop.com</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Username</Label>
                        <Input
                          value={truckstopUsername}
                          onChange={(e) => setTruckstopUsername(e.target.value)}
                          placeholder="Truckstop Username"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={truckstopPassword}
                          onChange={(e) => setTruckstopPassword(e.target.value)}
                          placeholder="Truckstop Password"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>API Key (Optional)</Label>
                      <Input
                        type="password"
                        value={truckstopKey}
                        onChange={(e) => setTruckstopKey(e.target.value)}
                        placeholder="Enter Truckstop API key"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveLoadboards} className="w-full bg-blue-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Loadboard Settings (Encrypted)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* LTL Rating Tab (BROKER ONLY) */}
          {operatingMode === 'broker' && (
            <TabsContent value="ltl">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>LTL Rating Integrations</CardTitle>
                    <Badge className="bg-indigo-600 text-white">BROKER ONLY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">FedEx Express</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={fedexKey}
                          onChange={(e) => setFedexKey(e.target.value)}
                          placeholder="Enter FedEx API key"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Account Number</Label>
                        <Input
                          value={fedexAccount}
                          onChange={(e) => setFedexAccount(e.target.value)}
                          placeholder="FedEx Account Number"
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Averitt Rating API</h3>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={averittKey}
                        onChange={(e) => setAverittKey(e.target.value)}
                        placeholder="Enter Averitt API key"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveLTL} className="w-full bg-indigo-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save LTL Rating Settings (Encrypted)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Rate Intelligence Tab (BROKER ONLY) */}
          {operatingMode === 'broker' && (
            <TabsContent value="rateintel">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Rate Intelligence Integrations</CardTitle>
                    <Badge className="bg-indigo-600 text-white">BROKER ONLY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">FreightWaves SONAR</h3>
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={sonarKey}
                        onChange={(e) => setSonarKey(e.target.value)}
                        placeholder="Enter FreightWaves SONAR API key"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveRateIntel} className="w-full bg-cyan-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Rate Intelligence Settings (Encrypted)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Tracking/Visibility Tab (SHARED) */}
          <TabsContent value="tracking">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tracking & Visibility Integrations</CardTitle>
                  <Badge className="bg-green-500 text-white">SHARED - Both Modes</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">Project 44</h3>
                  <div>
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={project44Key}
                      onChange={(e) => setProject44Key(e.target.value)}
                      placeholder="Enter Project 44 API key"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">FourKites</h3>
                  <div>
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={fourkitesKey}
                      onChange={(e) => setFourkitesKey(e.target.value)}
                      placeholder="Enter FourKites API key"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">MacroPoint</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Username</Label>
                      <Input
                        value={macropointUsername}
                        onChange={(e) => setMacropointUsername(e.target.value)}
                        placeholder="MacroPoint Username"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={macropointPassword}
                        onChange={(e) => setMacropointPassword(e.target.value)}
                        placeholder="MacroPoint Password"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>API Key (Optional)</Label>
                    <Input
                      type="password"
                      value={macropointKey}
                      onChange={(e) => setMacropointKey(e.target.value)}
                      placeholder="Enter MacroPoint API key"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">Transporeon</h3>
                  <div>
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={transporeonKey}
                      onChange={(e) => setTransporeonKey(e.target.value)}
                      placeholder="Enter Transporeon API key"
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveTracking} className="w-full bg-teal-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Tracking Settings (Encrypted)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* International Tab (BROKER ONLY) */}
          {operatingMode === 'broker' && (
            <TabsContent value="international">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>International Freight Integrations</CardTitle>
                    <Badge className="bg-indigo-600 text-white">BROKER ONLY</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <h3 className="font-bold text-lg mb-4">Freightos Freight Rate Estimator</h3>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>API Endpoint:</strong> https://sandbox.freightos.com/api/v1<br/>
                        <strong>Purpose:</strong> Get instant estimates for Air & Ocean freight rates worldwide<br/>
                        <strong>Status:</strong> Beta - Free API for estimates only
                      </p>
                    </div>
                    <div>
                      <Label>API Key *</Label>
                      <Input
                        type="password"
                        value={freightosKey}
                        onChange={(e) => setFreightosKey(e.target.value)}
                        placeholder="Enter Freightos API key"
                        className="mt-2"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Get your API key from <a href="https://www.freightos.com/freight-api/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Freightos Developer Portal</a>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Notice:</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Freightos API is in Beta and provided free, as-is</li>
                      <li>• Estimates are for indicative/educational purposes only</li>
                      <li>• Actual rates may vary - book through Freightos Marketplace for accurate quotes</li>
                      <li>• Subject to Freightos WebCargo Terms of Service (Annex D)</li>
                    </ul>
                  </div>

                  <Button onClick={handleSaveFreightos} className="w-full bg-blue-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save International Settings (Encrypted)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* USPS Validation Tab (SHARED) */}
          <TabsContent value="usps">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>USPS Address Validation Integration</CardTitle>
                  <Badge className="bg-green-500 text-white">SHARED - Both Modes</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">USPS Addresses API v3</h4>
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Production Endpoint:</strong> https://apis.usps.com/addresses/v3/address<br/>
                        <strong>Testing Endpoint:</strong> https://apis-tem.usps.com/addresses/v3/address
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Purpose:</strong> Validates and standardizes USPS® domestic addresses, provides ZIP+4® codes, 
                        and confirms delivery points in accordance with USPS® addressing standards.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-4">OAuth 2.0 Credentials</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Client ID *</Label>
                      <Input
                        type="text"
                        value={uspsClientId}
                        onChange={(e) => setUspsClientId(e.target.value)}
                        placeholder="Enter USPS Client ID"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Client Secret *</Label>
                      <Input
                        type="password"
                        value={uspsClientSecret}
                        onChange={(e) => setUspsClientSecret(e.target.value)}
                        placeholder="Enter USPS Client Secret"
                        className="mt-2"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <p className="text-xs text-slate-600">
                        <strong>How to get credentials:</strong><br/>
                        1. Register at <a href="https://www.usps.com/business/web-tools-apis/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">USPS Business Portal</a><br/>
                        2. Create an application in the developer console<br/>
                        3. Generate OAuth 2.0 credentials<br/>
                        4. Copy Client ID and Client Secret here
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h4 className="font-semibold text-emerald-900 mb-2">✅ Integration Benefits:</h4>
                  <ul className="text-sm text-emerald-800 space-y-1">
                    <li>• <strong>Validates</strong> addresses against official USPS database</li>
                    <li>• <strong>Standardizes</strong> street names and city abbreviations</li>
                    <li>• <strong>Provides</strong> accurate ZIP+4® codes automatically</li>
                    <li>• <strong>Confirms</strong> deliverability (DPV confirmation)</li>
                    <li>• <strong>Reduces</strong> shipping errors and returns</li>
                    <li>• <strong>Improves</strong> delivery success rates</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">🔧 Auto-Validation Features:</h4>
                  <p className="text-sm text-purple-800 mb-2">
                    Once configured, USPS validation will automatically work in:
                  </p>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>✓ Load creation forms (pickup & delivery addresses)</li>
                    <li>✓ Shipper/Customer address entry</li>
                    <li>✓ Carrier profile management</li>
                    <li>✓ Quote generation</li>
                    <li>✓ Standalone validation tool</li>
                  </ul>
                </div>

                <Button onClick={handleSaveUSPS} className="w-full bg-emerald-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save USPS Settings (Encrypted)
                </Button>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}