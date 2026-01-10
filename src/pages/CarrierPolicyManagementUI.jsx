import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Settings, BeakerIcon, TrendingUp } from "lucide-react";
import CarrierPolicyManager from "../components/carrier-admin/CarrierPolicyManager";
import PolicyAlertsDashboard from "../components/carrier-admin/PolicyAlertsDashboard";
import PolicyABTestFramework from "../components/ab-testing/PolicyABTestFramework";
import FeatureAdoptionAnalytics from "../components/analytics/FeatureAdoptionAnalytics";

export default function CarrierPolicyManagementUI() {
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: carriers } = useScopedEntity('Carrier', { limit: 100, enabled: user?.role === 'admin' || user?.role === 'broker' });

  const { data: alerts } = useQuery({
    queryKey: ['policyAlerts', selectedCarrier?.id],
    queryFn: () => base44.entities.PolicyAlert.filter({ 
      carrier_id: selectedCarrier.id,
      status: 'new'
    }),
    initialData: [],
    enabled: !!selectedCarrier
  });

  const { data: policies } = useQuery({
    queryKey: ['policies', selectedCarrier?.id],
    queryFn: () => base44.entities.CarrierDriverPolicy.filter({
      carrier_id: selectedCarrier.id
    }),
    initialData: [],
    enabled: !!selectedCarrier
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text text-transparent mb-2">
            Carrier Policy Management
          </h1>
          <p className="text-slate-600 text-lg">Configure, monitor, and optimize driver feature policies</p>
        </div>

        {/* Quick Stats */}
        {selectedCarrier && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Active Policies</p>
                    <p className="text-2xl font-bold text-indigo-600">{policies.length}</p>
                  </div>
                  <Settings className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">New Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Enabled Features</p>
                    <p className="text-2xl font-bold text-green-600">
                      {policies.filter(p => p.enabled).length}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Carrier Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Carrier</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedCarrier?.id} 
              onValueChange={(id) => setSelectedCarrier(carriers.find(c => c.id === id))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a carrier..." />
              </SelectTrigger>
              <SelectContent>
                {carriers.map(carrier => (
                  <SelectItem key={carrier.id} value={carrier.id}>
                    {carrier.company_name} ({carrier.carrier_type || 'asset'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCarrier && (
          <Tabs defaultValue="policies" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="alerts">
                Alerts
                {alerts.length > 0 && (
                  <Badge className="ml-2 bg-red-500">{alerts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="adoption">Adoption</TabsTrigger>
              <TabsTrigger value="testing">A/B Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="policies">
              <CarrierPolicyManager carrierId={selectedCarrier.id} />
            </TabsContent>

            <TabsContent value="alerts">
              <PolicyAlertsDashboard carrierId={selectedCarrier.id} />
            </TabsContent>

            <TabsContent value="adoption">
              <FeatureAdoptionAnalytics carrierId={selectedCarrier.id} />
            </TabsContent>

            <TabsContent value="testing">
              <PolicyABTestFramework carrierId={selectedCarrier.id} />
            </TabsContent>
          </Tabs>
        )}

        {!selectedCarrier && (
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-12 text-center">
              <Shield className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
              <p className="text-slate-600">Select a carrier to manage policies</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}