import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, MessageSquare, Sparkles, Users, TrendingUp, AlertTriangle } from "lucide-react";
import AIDriverCoachingAssistant from "../components/coaching/AIDriverCoachingAssistant";
import PredictiveEligibilityForecaster from "../components/analytics/PredictiveEligibilityForecaster";
import FeatureEligibilityDashboard from "../components/driver-portal/FeatureEligibilityDashboard";

export default function DriverPerformanceDashboard() {
  const [selectedDriver, setSelectedDriver] = useState(null);

  const { data: drivers, isLoading } = useScopedEntity('Driver', { limit: 100, sort: '-performance_score' });
  const { data: loads } = useScopedEntity('Load', { limit: 500 });

  const tierCounts = {
    Elite: drivers.filter(d => d.performance_tier === 'Elite').length,
    Professional: drivers.filter(d => d.performance_tier === 'Professional').length,
    Standard: drivers.filter(d => d.performance_tier === 'Standard').length,
    Training: drivers.filter(d => d.performance_tier === 'Training').length
  };

  const avgScore = drivers.length > 0 
    ? Math.round(drivers.reduce((sum, d) => sum + (d.performance_score || 0), 0) / drivers.length)
    : 0;

  const needsCoaching = drivers.filter(d => (d.performance_score || 0) < 75);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Driver Performance Intelligence
          </h1>
          <p className="text-slate-600 text-lg">AI-powered coaching, forecasting, and development</p>
        </div>

        {/* Fleet Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Total Drivers</p>
              <p className="text-3xl font-bold text-slate-900">{drivers.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-indigo-600">{avgScore}</p>
              <Progress value={avgScore} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-amber-50">
            <CardContent className="p-4">
              <p className="text-sm text-amber-700 mb-1">Elite</p>
              <p className="text-3xl font-bold text-amber-600">{tierCounts.Elite}</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50">
            <CardContent className="p-4">
              <p className="text-sm text-emerald-700 mb-1">Professional</p>
              <p className="text-3xl font-bold text-emerald-600">{tierCounts.Professional}</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm text-red-700 mb-1">Needs Coaching</p>
              <p className="text-3xl font-bold text-red-600">{needsCoaching.length}</p>
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
                <SelectValue placeholder="Choose a driver to analyze..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.first_name} {driver.last_name} - Score: {driver.performance_score || 0} ({driver.performance_tier || 'Unranked'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedDriver && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="coaching">AI Coaching</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedDriver.first_name} {selectedDriver.last_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-indigo-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-indigo-600">{selectedDriver.performance_score || 0}</p>
                      <p className="text-xs text-indigo-700">Performance Score</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedDriver.on_time_percentage || 0}%</p>
                      <p className="text-xs text-green-700">On-Time</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedDriver.total_loads || 0}</p>
                      <p className="text-xs text-blue-700">Total Loads</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-amber-600">{selectedDriver.performance_tier || 'Training'}</p>
                      <p className="text-xs text-amber-700">Tier</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coaching">
              <AIDriverCoachingAssistant driverId={selectedDriver.id} />
            </TabsContent>

            <TabsContent value="forecast">
              <PredictiveEligibilityForecaster driverId={selectedDriver.id} />
            </TabsContent>

            <TabsContent value="eligibility">
              <FeatureEligibilityDashboard driverId={selectedDriver.id} />
            </TabsContent>
          </Tabs>
        )}

        {!selectedDriver && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-slate-600">Select a driver to view performance intelligence</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}