import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Zap, Sparkles } from "lucide-react";
import PredictiveEligibilityForecaster from "../components/analytics/PredictiveEligibilityForecaster";
import FeatureAdoptionAnalytics from "../components/analytics/FeatureAdoptionAnalytics";
import { PageHeader, StandardTabs, EmptyState } from "@/components/design-system";

export default function PredictiveEligibilityDashboard() {
  const [selectedDriver, setSelectedDriver] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-performance_score', 100),
    initialData: []
  });

  const { data: carriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => base44.entities.Carrier.list('-created_date', 100),
    initialData: [],
    enabled: user?.role === 'admin' || user?.role === 'broker'
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Predictive Eligibility"
        subtitle="AI-powered forecasting and feature adoption analytics"
        icon={Sparkles}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        <Tabs defaultValue="forecasting" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Eligibility Forecasting
            </TabsTrigger>
            <TabsTrigger value="adoption" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Feature Adoption
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forecasting" className="space-y-6">
            {/* Driver Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Select Driver for Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedDriver?.id} 
                  onValueChange={(id) => setSelectedDriver(drivers.find(d => d.id === id))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a driver to analyze..." />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name} - {driver.total_loads || 0} loads, {driver.on_time_percentage || 0}% on-time
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Forecaster */}
            {selectedDriver && (
              <PredictiveEligibilityForecaster driverId={selectedDriver.id} />
            )}

            {!selectedDriver && (
              <EmptyState
                icon={Users}
                title="Select Driver"
                description="Choose a driver above to generate AI-powered eligibility forecast"
              />
            )}
          </TabsContent>

          <TabsContent value="adoption" className="space-y-6">
            <FeatureAdoptionAnalytics carrierId={null} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}