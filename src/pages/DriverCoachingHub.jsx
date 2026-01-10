import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, TrendingUp, Target } from "lucide-react";
import AIDriverCoachingAssistant from "../components/coaching/AIDriverCoachingAssistant";
import FeatureAdoptionAnalytics from "../components/analytics/FeatureAdoptionAnalytics";
import PredictiveEligibilityForecaster from "../components/analytics/PredictiveEligibilityForecaster";

export default function DriverCoachingHub() {
  const [selectedDriver, setSelectedDriver] = useState(null);

  const { data: drivers, isLoading } = useScopedEntity('Driver', { limit: 100, sort: '-performance_score' });

  // Identify drivers needing coaching
  const needsCoaching = drivers.filter(d => 
    (d.performance_score || 0) < 75 || 
    (d.on_time_percentage || 0) < 85
  );

  const highPotential = drivers.filter(d => 
    (d.performance_score || 0) >= 75 && 
    (d.performance_score || 0) < 90
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            AI Driver Coaching Hub
          </h1>
          <p className="text-slate-600 text-lg">
            Personalized coaching, forecasting, and development planning
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Drivers</p>
                  <p className="text-2xl font-bold text-slate-900">{drivers.length}</p>
                </div>
                <Users className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Needs Coaching</p>
                  <p className="text-2xl font-bold text-amber-600">{needsCoaching.length}</p>
                </div>
                <Target className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">High Potential</p>
                  <p className="text-2xl font-bold text-purple-600">{highPotential.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Driver Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedDriver?.id} 
              onValueChange={(id) => setSelectedDriver(drivers.find(d => d.id === id))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a driver..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>
                    <div className="flex items-center gap-2">
                      {driver.first_name} {driver.last_name}
                      {driver.performance_tier && (
                        <Badge className="ml-2">{driver.performance_tier}</Badge>
                      )}
                      <span className="text-slate-500">
                        - {driver.total_loads || 0} loads, {driver.on_time_percentage || 0}% on-time
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedDriver && (
          <Tabs defaultValue="coaching" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="coaching">AI Coaching</TabsTrigger>
              <TabsTrigger value="forecast">Eligibility Forecast</TabsTrigger>
              <TabsTrigger value="adoption">Feature Usage</TabsTrigger>
            </TabsList>

            <TabsContent value="coaching">
              <AIDriverCoachingAssistant driverId={selectedDriver.id} />
            </TabsContent>

            <TabsContent value="forecast">
              <PredictiveEligibilityForecaster driverId={selectedDriver.id} />
            </TabsContent>

            <TabsContent value="adoption">
              <Card>
                <CardHeader>
                  <CardTitle>Driver Feature Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Individual driver usage metrics will be displayed here.
                    Currently showing fleet-wide adoption data.
                  </p>
                  <div className="mt-4">
                    <FeatureAdoptionAnalytics carrierId={selectedDriver.party_id} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {!selectedDriver && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-slate-600">Select a driver above to access coaching tools</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}