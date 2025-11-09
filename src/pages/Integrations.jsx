import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Fuel,
  CreditCard,
  Shield,
  Truck,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  MapPin,
  Eye,
  Settings
} from "lucide-react";

import BreakthroughFuel from "../components/integrations/BreakthroughFuel";
import EpayManager from "../components/integrations/EpayManager";
import RoadSyncPay from "../components/integrations/RoadSyncPay";
import TriumphPay from "../components/integrations/TriumphPay";
import Highway from "../components/integrations/Highway";
import MyCarrierPortal from "../components/integrations/MyCarrierPortal";
import RMIS from "../components/integrations/RMIS";
import QuickBooksIntegration from "../components/integrations/QuickBooksIntegration";

export default function Integrations() {
  const [activeTab, setActiveTab] = useState("payments");
  const [operatingMode] = useState(localStorage.getItem('tms_operating_mode') || 'broker');

  // Track integration statuses
  const [integrations, setIntegrations] = useState({
    // Payments
    quickbooks: localStorage.getItem('quickbooks_connected') === 'true',
    breakthrough_fuel: localStorage.getItem('breakthrough_fuel_connected') === 'true',
    epay: localStorage.getItem('epay_connected') === 'true',
    roadsync: localStorage.getItem('roadsync_connected') === 'true',
    triumph: localStorage.getItem('triumph_connected') === 'true',
    // Compliance
    highway: localStorage.getItem('highway_connected') === 'true',
    mycarrierportal: localStorage.getItem('mycarrierportal_connected') === 'true',
    rmis: localStorage.getItem('rmis_connected') === 'true',
    // Loadboards
    loadboard123: localStorage.getItem('123loadboard_api_key') !== '' && localStorage.getItem('123loadboard_api_key') !== null,
    dat: localStorage.getItem('dat_api_key') !== '' && localStorage.getItem('dat_api_key') !== null,
    keeptruckin: localStorage.getItem('keeptruckin_api_key') !== '' && localStorage.getItem('keeptruckin_api_key') !== null,
    truckertools: localStorage.getItem('truckertools_api_key') !== '' && localStorage.getItem('truckertools_api_key') !== null,
    truckstop: localStorage.getItem('truckstop_api_key') !== '' && localStorage.getItem('truckstop_api_key') !== null,
    // LTL
    fedex: localStorage.getItem('fedex_api_key') !== '' && localStorage.getItem('fedex_api_key') !== null,
    averitt: localStorage.getItem('averitt_api_key') !== '' && localStorage.getItem('averitt_api_key') !== null,
    // Rate Intelligence
    sonar: localStorage.getItem('sonar_api_key') !== '' && localStorage.getItem('sonar_api_key') !== null,
    // Tracking
    project44: localStorage.getItem('project44_api_key') !== '' && localStorage.getItem('project44_api_key') !== null,
    fourkites: localStorage.getItem('fourkites_api_key') !== '' && localStorage.getItem('fourkites_api_key') !== null,
    macropoint: localStorage.getItem('macropoint_api_key') !== '' && localStorage.getItem('macropoint_api_key') !== null,
    transporeon: localStorage.getItem('transporeon_api_key') !== '' && localStorage.getItem('transporeon_api_key') !== null
  });

  const activeCount = Object.values(integrations).filter(v => v).length;

  const loadboardCount = [integrations.loadboard123, integrations.dat, integrations.keeptruckin, integrations.truckertools, integrations.truckstop].filter(v => v).length;
  const ltlCount = [integrations.fedex, integrations.averitt].filter(v => v).length;
  const trackingCount = [integrations.project44, integrations.fourkites, integrations.macropoint, integrations.transporeon].filter(v => v).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Integrations Hub
            </h1>
            <p className="text-slate-600 mt-2">
              Connect your TMS with leading industry platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Settings")}>
              <Button className="bg-indigo-600 text-white">
                <Settings className="w-4 h-4 mr-2" />
                Configure All
              </Button>
            </Link>
            <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              {activeCount} Active
            </Badge>
          </div>
        </div>

        {/* Integration Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="text-center">
                <DollarSign className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                <p className="text-2xl font-bold text-emerald-600">
                  {[integrations.epay, integrations.roadsync, integrations.triumph].filter(v => v).length}
                </p>
                <p className="text-xs text-slate-600">Payment</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="text-center">
                <CreditCard className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {integrations.quickbooks ? 1 : 0}
                </p>
                <p className="text-xs text-slate-600">Accounting</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="text-center">
                <Fuel className="w-6 h-6 mx-auto text-amber-600 mb-2" />
                <p className="text-2xl font-bold text-amber-600">
                  {integrations.breakthrough_fuel ? 1 : 0}
                </p>
                <p className="text-xs text-slate-600">Fuel</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {[integrations.highway, integrations.mycarrierportal, integrations.rmis].filter(v => v).length}
                </p>
                <p className="text-xs text-slate-600">Compliance</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-600">{loadboardCount}</p>
                <p className="text-xs text-slate-600">Loadboards</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 mx-auto text-cyan-600 mb-2" />
                <p className="text-2xl font-bold text-cyan-600">
                  {ltlCount + (integrations.sonar ? 1 : 0)}
                </p>
                <p className="text-xs text-slate-600">Rating</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-4">
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto text-teal-600 mb-2" />
                <p className="text-2xl font-bold text-teal-600">{trackingCount}</p>
                <p className="text-xs text-slate-600">Tracking</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 flex-wrap h-auto">
            <TabsTrigger value="payments">
              <DollarSign className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="accounting">
              <CreditCard className="w-4 h-4 mr-2" />
              Accounting
            </TabsTrigger>
            <TabsTrigger value="fuel">
              <Fuel className="w-4 h-4 mr-2" />
              Fuel
            </TabsTrigger>
            <TabsTrigger value="compliance">
              <Shield className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="loadboards">
              <Truck className="w-4 h-4 mr-2" />
              Loadboards
            </TabsTrigger>
            <TabsTrigger value="ltl">
              <MapPin className="w-4 h-4 mr-2" />
              LTL Rating
            </TabsTrigger>
            <TabsTrigger value="rateintel">
              <TrendingUp className="w-4 h-4 mr-2" />
              Rate Intel
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <Eye className="w-4 h-4 mr-2" />
              Tracking
            </TabsTrigger>
          </TabsList>

          {/* Payments & Factoring Tab */}
          <TabsContent value="payments" className="space-y-6">
            <EpayManager 
              isConnected={integrations.epay}
              onConnectionChange={(status) => setIntegrations({...integrations, epay: status})}
              operatingMode={operatingMode}
            />
            <RoadSyncPay 
              isConnected={integrations.roadsync}
              onConnectionChange={(status) => setIntegrations({...integrations, roadsync: status})}
              operatingMode={operatingMode}
            />
            <TriumphPay 
              isConnected={integrations.triumph}
              onConnectionChange={(status) => setIntegrations({...integrations, triumph: status})}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Accounting Tab */}
          <TabsContent value="accounting">
            <QuickBooksIntegration 
              isConnected={integrations.quickbooks}
              onConnectionChange={(status) => setIntegrations({...integrations, quickbooks: status})}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Fuel Management Tab */}
          <TabsContent value="fuel">
            <BreakthroughFuel 
              isConnected={integrations.breakthrough_fuel}
              onConnectionChange={(status) => setIntegrations({...integrations, breakthrough_fuel: status})}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Carrier Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Highway 
              isConnected={integrations.highway}
              onConnectionChange={(status) => setIntegrations({...integrations, highway: status})}
              operatingMode={operatingMode}
            />
            <MyCarrierPortal 
              isConnected={integrations.mycarrierportal}
              onConnectionChange={(status) => setIntegrations({...integrations, mycarrierportal: status})}
              operatingMode={operatingMode}
            />
            <RMIS 
              isConnected={integrations.rmis}
              onConnectionChange={(status) => setIntegrations({...integrations, rmis: status})}
              operatingMode={operatingMode}
            />
          </TabsContent>

          {/* Loadboards Tab */}
          <TabsContent value="loadboards">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Loadboard Integrations</CardTitle>
                  <Link to={createPageUrl("Settings") + "?tab=loadboards"}>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {name: "123 Loadboard", configured: integrations.loadboard123, desc: "Post and search freight"},
                    {name: "DAT", configured: integrations.dat, desc: "Industry-leading load board"},
                    {name: "KeepTruckin", configured: integrations.keeptruckin, desc: "ELD and load tracking"},
                    {name: "Trucker Tools", configured: integrations.truckertools, desc: "Load tracking"},
                    {name: "Truckstop.com", configured: integrations.truckstop, desc: "Freight matching"}
                  ].map((lb) => (
                    <div key={lb.name} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{lb.name}</h4>
                        <Badge className={lb.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                          {lb.configured ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {lb.configured ? 'Configured' : 'Not Set'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{lb.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LTL Rating Tab */}
          <TabsContent value="ltl">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>LTL Rating Integrations</CardTitle>
                  <Link to={createPageUrl("Settings") + "?tab=ltl"}>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {name: "FedEx Express", configured: integrations.fedex, desc: "Real-time LTL rates"},
                    {name: "Averitt Rating API", configured: integrations.averitt, desc: "LTL pricing engine"}
                  ].map((ltl) => (
                    <div key={ltl.name} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{ltl.name}</h4>
                        <Badge className={ltl.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                          {ltl.configured ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {ltl.configured ? 'Configured' : 'Not Set'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{ltl.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rate Intelligence Tab */}
          <TabsContent value="rateintel">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Rate Intelligence</CardTitle>
                  <Link to={createPageUrl("Settings") + "?tab=rateintel"}>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">FreightWaves SONAR</h4>
                    <Badge className={integrations.sonar ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                      {integrations.sonar ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {integrations.sonar ? 'Configured' : 'Not Set'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">Market intelligence and rate data</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tracking/Visibility Tab */}
          <TabsContent value="tracking">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tracking & Visibility</CardTitle>
                  <Link to={createPageUrl("Settings") + "?tab=tracking"}>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {name: "Project 44", configured: integrations.project44, desc: "Real-time visibility platform"},
                    {name: "FourKites", configured: integrations.fourkites, desc: "Predictive shipment tracking"},
                    {name: "MacroPoint", configured: integrations.macropoint, desc: "Load tracking network"},
                    {name: "Transporeon", configured: integrations.transporeon, desc: "Supply chain visibility"}
                  ].map((track) => (
                    <div key={track.name} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{track.name}</h4>
                        <Badge className={track.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}>
                          {track.configured ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {track.configured ? 'Configured' : 'Not Set'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{track.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}