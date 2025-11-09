import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Fuel,
  CreditCard,
  Shield,
  Truck,
  Users,
  CheckCircle,
  XCircle
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
    quickbooks: localStorage.getItem('quickbooks_connected') === 'true',
    breakthrough_fuel: localStorage.getItem('breakthrough_fuel_connected') === 'true',
    epay: localStorage.getItem('epay_connected') === 'true',
    roadsync: localStorage.getItem('roadsync_connected') === 'true',
    triumph: localStorage.getItem('triumph_connected') === 'true',
    highway: localStorage.getItem('highway_connected') === 'true',
    mycarrierportal: localStorage.getItem('mycarrierportal_connected') === 'true',
    rmis: localStorage.getItem('rmis_connected') === 'true'
  });

  const activeCount = Object.values(integrations).filter(v => v).length;

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
              Connect your TMS with leading industry platforms for payments, fuel, and compliance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              {activeCount} Active
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2">
              {operatingMode === 'carrier' ? 'Carrier Mode' : 'Broker Mode'}
            </Badge>
          </div>
        </div>

        {/* Integration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Payment</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {[integrations.epay, integrations.roadsync, integrations.triumph].filter(v => v).length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Accounting</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {integrations.quickbooks ? 1 : 0}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Fuel</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">
                    {integrations.breakthrough_fuel ? 1 : 0}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl">
                  <Fuel className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Compliance</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {[integrations.highway, integrations.mycarrierportal, integrations.rmis].filter(v => v).length}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payments & Factoring
            </TabsTrigger>
            <TabsTrigger value="accounting" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Accounting
            </TabsTrigger>
            <TabsTrigger value="fuel" className="flex items-center gap-2">
              <Fuel className="w-4 h-4" />
              Fuel Management
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Carrier Compliance
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
        </Tabs>

      </div>
    </div>
  );
}