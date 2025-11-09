
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, CheckCircle, Save, Key, User, Info } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("payments");

  // Payment integrations
  const [epayKey, setEpayKey] = useState(localStorage.getItem('epay_api_key') || '');
  const [epayCompanyId, setEpayCompanyId] = useState(localStorage.getItem('epay_company_id') || '');
  const [roadsyncKey, setRoadsyncKey] = useState(localStorage.getItem('roadsync_api_key') || '');
  const [triumphKey, setTriumphKey] = useState(localStorage.getItem('triumph_api_key') || '');

  // Accounting
  const [quickbooksKey, setQuickbooksKey] = useState(localStorage.getItem('quickbooks_api_key') || '');

  // Fuel
  const [breakthroughKey, setBreakthroughKey] = useState(localStorage.getItem('breakthrough_fuel_api_key') || '');
  const [breakthroughAccount, setBreakthroughAccount] = useState(localStorage.getItem('breakthrough_fuel_account') || '');

  // Compliance
  const [highwayKey, setHighwayKey] = useState(localStorage.getItem('highway_api_key') || '');
  const [mycarrierKey, setMycarrierKey] = useState(localStorage.getItem('mycarrierportal_api_key') || '');
  const [rmisKey, setRmisKey] = useState(localStorage.getItem('rmis_api_key') || '');

  // Loadboards
  const [dat123Key, setDat123Key] = useState(localStorage.getItem('123loadboard_api_key') || '');
  const [datKey, setDatKey] = useState(localStorage.getItem('dat_api_key') || '');
  const [datUsername, setDatUsername] = useState(localStorage.getItem('dat_username') || '');
  const [datPassword, setDatPassword] = useState(localStorage.getItem('dat_password') || '');
  const [keeptruckinKey, setKeeptruckinKey] = useState(localStorage.getItem('keeptruckin_api_key') || '');
  const [truckerToolsKey, setTruckerToolsKey] = useState(localStorage.getItem('truckertools_api_key') || '');
  const [truckstopKey, setTruckstopKey] = useState(localStorage.getItem('truckstop_api_key') || '');
  const [truckstopUsername, setTruckstopUsername] = useState(localStorage.getItem('truckstop_username') || '');
  const [truckstopPassword, setTruckstopPassword] = useState(localStorage.getItem('truckstop_password') || '');

  // LTL Rating
  const [fedexKey, setFedexKey] = useState(localStorage.getItem('fedex_api_key') || '');
  const [fedexAccount, setFedexAccount] = useState(localStorage.getItem('fedex_account') || '');
  const [averittKey, setAverittKey] = useState(localStorage.getItem('averitt_api_key') || '');

  // Rate Intelligence
  const [sonarKey, setSonarKey] = useState(localStorage.getItem('sonar_api_key') || '');

  // Tracking/Visibility
  const [project44Key, setProject44Key] = useState(localStorage.getItem('project44_api_key') || '');
  const [fourkitesKey, setFourkitesKey] = useState(localStorage.getItem('fourkites_api_key') || '');
  const [macropointKey, setMacropointKey] = useState(localStorage.getItem('macropoint_api_key') || '');
  const [macropointUsername, setMacropointUsername] = useState(localStorage.getItem('macropoint_username') || '');
  const [macropointPassword, setMacropointPassword] = useState(localStorage.getItem('macropoint_password') || '');
  const [transporeonKey, setTransporeonKey] = useState(localStorage.getItem('transporeon_api_key') || '');

  // Freightos
  const [freightosKey, setFreightosKey] = useState(localStorage.getItem('freightos_api_key') || '');

  // USPS (NEW)
  const [uspsClientId, setUspsClientId] = useState(localStorage.getItem('usps_client_id') || '');
  const [uspsClientSecret, setUspsClientSecret] = useState(localStorage.getItem('usps_client_secret') || '');

  const handleSavePayments = () => {
    localStorage.setItem('epay_api_key', epayKey);
    localStorage.setItem('epay_company_id', epayCompanyId);
    localStorage.setItem('roadsync_api_key', roadsyncKey);
    localStorage.setItem('triumph_api_key', triumphKey);
    alert('Payment integration settings saved!');
  };

  const handleSaveAccounting = () => {
    localStorage.setItem('quickbooks_api_key', quickbooksKey);
    alert('Accounting integration settings saved!');
  };

  const handleSaveFuel = () => {
    localStorage.setItem('breakthrough_fuel_api_key', breakthroughKey);
    localStorage.setItem('breakthrough_fuel_account', breakthroughAccount);
    alert('Fuel integration settings saved!');
  };

  const handleSaveCompliance = () => {
    localStorage.setItem('highway_api_key', highwayKey);
    localStorage.setItem('mycarrierportal_api_key', mycarrierKey);
    localStorage.setItem('rmis_api_key', rmisKey);
    alert('Compliance integration settings saved!');
  };

  const handleSaveLoadboards = () => {
    localStorage.setItem('123loadboard_api_key', dat123Key);
    localStorage.setItem('dat_api_key', datKey);
    localStorage.setItem('dat_username', datUsername);
    localStorage.setItem('dat_password', datPassword);
    localStorage.setItem('keeptruckin_api_key', keeptruckinKey);
    localStorage.setItem('truckertools_api_key', truckerToolsKey);
    localStorage.setItem('truckstop_api_key', truckstopKey);
    localStorage.setItem('truckstop_username', truckstopUsername);
    localStorage.setItem('truckstop_password', truckstopPassword);
    alert('Loadboard integration settings saved!');
  };

  const handleSaveLTL = () => {
    localStorage.setItem('fedex_api_key', fedexKey);
    localStorage.setItem('fedex_account', fedexAccount);
    localStorage.setItem('averitt_api_key', averittKey);
    alert('LTL Rating integration settings saved!');
  };

  const handleSaveRateIntel = () => {
    localStorage.setItem('sonar_api_key', sonarKey);
    alert('Rate Intelligence integration settings saved!');
  };

  const handleSaveTracking = () => {
    localStorage.setItem('project44_api_key', project44Key);
    localStorage.setItem('fourkites_api_key', fourkitesKey);
    localStorage.setItem('macropoint_api_key', macropointKey);
    localStorage.setItem('macropoint_username', macropointUsername);
    localStorage.setItem('macropoint_password', macropointPassword);
    localStorage.setItem('transporeon_api_key', transporeonKey);
    alert('Tracking/Visibility integration settings saved!');
  };

  const handleSaveFreightos = () => {
    localStorage.setItem('freightos_api_key', freightosKey);
    alert('Freightos integration settings saved!');
  };

  const handleSaveUSPS = () => {
    localStorage.setItem('usps_client_id', uspsClientId);
    localStorage.setItem('usps_client_secret', uspsClientSecret);
    alert('USPS integration settings saved!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
            <SettingsIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
              Integration Settings
            </h1>
            <p className="text-slate-600 mt-1">
              Configure API credentials and authentication for all integrations
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 flex-wrap h-auto">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="fuel">Fuel</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="loadboards">Loadboards</TabsTrigger>
            <TabsTrigger value="ltl">LTL Rating</TabsTrigger>
            <TabsTrigger value="rateintel">Rate Intelligence</TabsTrigger>
            <TabsTrigger value="tracking">Tracking/Visibility</TabsTrigger>
            <TabsTrigger value="international">International <Badge className="ml-2 bg-blue-500">NEW</Badge></TabsTrigger>
            <TabsTrigger value="usps">USPS Validation <Badge className="ml-2 bg-emerald-500">NEW</Badge></TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Payment & Factoring Integrations</CardTitle>
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
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounting Tab */}
          <TabsContent value="accounting">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Accounting Integrations</CardTitle>
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
                  Save Accounting Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fuel Tab */}
          <TabsContent value="fuel">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Fuel Management Integrations</CardTitle>
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

                <Button onClick={handleSaveFuel} className="w-full bg-amber-600 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Fuel Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Carrier Compliance Integrations</CardTitle>
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
                  Save Compliance Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loadboards Tab */}
          <TabsContent value="loadboards">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Loadboard Integrations</CardTitle>
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
                  <h3 className="font-bold text-lg mb-4">KeepTruckin</h3>
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
                  Save Loadboard Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LTL Rating Tab */}
          <TabsContent value="ltl">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>LTL Rating Integrations</CardTitle>
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
                  Save LTL Rating Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Intelligence Tab */}
          <TabsContent value="rateintel">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Rate Intelligence Integrations</CardTitle>
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
                  Save Rate Intelligence Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking/Visibility Tab */}
          <TabsContent value="tracking">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Tracking & Visibility Integrations</CardTitle>
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
                  Save Tracking Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* International Tab (NEW) */}
          <TabsContent value="international">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>International Freight Integrations</CardTitle>
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
                  Save International Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USPS Validation Tab (NEW) */}
          <TabsContent value="usps">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>USPS Address Validation Integration</CardTitle>
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
                  Save USPS Settings
                </Button>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
