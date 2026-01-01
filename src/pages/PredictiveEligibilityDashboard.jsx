import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import PredictiveEligibilityForecaster from "../components/analytics/PredictiveEligibilityForecaster";
import FeatureAdoptionAnalytics from "../components/analytics/FeatureAdoptionAnalytics";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Predictive Eligibility & Adoption
          </h1>
          <p className="text-slate-600 text-lg">
            AI-powered forecasting and feature adoption analytics
          </p>
        </div>

        <Tabs defaultValue="forecasting" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
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
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-slate-600">Select a driver above to generate AI-powered eligibility forecast</p>
                </CardContent>
              </Card>
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