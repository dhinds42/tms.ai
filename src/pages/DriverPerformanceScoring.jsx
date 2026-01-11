import React, { useState } from "react";
import { useScopedEntity } from "@/components/shared/hooks";
import { getTierByScore } from "@/components/utils/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, TrendingUp, AlertTriangle, Shield, Sparkles, Loader2, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { calculateDriverPerformance } from "../components/drivers/AutomatedDriverScoring";
import DriverPerformanceBadge from "../components/drivers/DriverPerformanceBadge";

export default function DriverPerformanceScoring() {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [scoreData, setScoreData] = useState(null);

  const { data: drivers = [], isLoading } = useScopedEntity('Driver', { limit: 100 });
  const { data: loads = [] } = useScopedEntity('Load', { limit: 500 });
  const { data: complianceItems = [] } = useScopedEntity('ComplianceItem', { limit: 200 });

  const handleCalculateScore = () => {
    if (!selectedDriver) return;
    const score = calculateDriverPerformance(selectedDriver, loads, complianceItems);
    setScoreData(score);
  };

  const activeDrivers = drivers.filter(d => d.status === 'active' || d.status === 'available');
  const avgScore = drivers.length > 0
    ? drivers.reduce((sum, d) => sum + (d.performance_score || 0), 0) / drivers.length
    : 0;
  const eliteDrivers = drivers.filter(d => (d.performance_score || 0) >= 90).length;
  const needsTraining = drivers.filter(d => (d.performance_score || 0) < 65).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/30">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent mb-2">
            Driver Performance Scoring
          </h1>
          <p className="text-slate-600 text-lg">
            Automated scoring for driver evaluation and recognition
          </p>
          <Badge className="mt-3 bg-amber-600">Performance Analytics</Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Drivers</p>
                  <p className="text-3xl font-bold text-cyan-600 mt-2">{activeDrivers.length}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Score</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{avgScore.toFixed(0)}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Elite Drivers</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{eliteDrivers}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">In Training</p>
                  <p className="text-3xl font-bold text-slate-600 mt-2">{needsTraining}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-slate-600 to-gray-600 rounded-2xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scoring Interface */}
        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-lg mb-2">Calculate Driver Score</h3>
                <Select value={selectedDriver?.id} onValueChange={(id) => setSelectedDriver(drivers?.find(d => d.id === id))}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a driver..." />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers?.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name} - {driver.cdl_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleCalculateScore}
                disabled={!selectedDriver}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Calculate Score
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Score Results */}
        {scoreData && selectedDriver && (
          <>
            {/* Overall Score */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                    {selectedDriver.first_name} {selectedDriver.last_name}
                  </p>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-6xl font-bold text-slate-900">{scoreData.overall_score}</div>
                    <div>
                      <DriverPerformanceBadge tier={scoreData.tier} size="lg" />
                      <p className="text-xs text-slate-500 mt-2">out of 100</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < scoreData.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base">Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">On-Time Deliveries</span>
                      <span className="font-bold text-emerald-600">{scoreData.on_time_percentage}%</span>
                    </div>
                    <Progress value={scoreData.on_time_percentage} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Load Completion Rate</span>
                      <span className="font-bold text-blue-600">{scoreData.completion_rate}%</span>
                    </div>
                    <Progress value={scoreData.completion_rate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Compliance Rate</span>
                      <span className="font-bold text-indigo-600">{scoreData.compliance_rate}%</span>
                    </div>
                    <Progress value={scoreData.compliance_rate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Reliability Score</span>
                      <span className="font-bold text-purple-600">{scoreData.reliability_rate}%</span>
                    </div>
                    <Progress value={scoreData.reliability_rate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white">
                <CardHeader>
                  <CardTitle className="text-base">Load Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{scoreData.total_loads}</p>
                      <p className="text-xs text-blue-700 mt-1">Total Loads</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-emerald-600">{scoreData.completed_loads}</p>
                      <p className="text-xs text-emerald-700 mt-1">Completed</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-amber-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-3">Score Components</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">On-Time Score</span>
                        <span className="font-medium">{scoreData.breakdown.on_time_score}/35</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Safety & Compliance</span>
                        <span className="font-medium">{scoreData.breakdown.safety_compliance_score}/30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Completion Score</span>
                        <span className="font-medium">{scoreData.breakdown.completion_score}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Reliability Score</span>
                        <span className="font-medium">{scoreData.breakdown.reliability_score}/15</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Driver Leaderboard */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Driver Performance Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drivers
                ?.filter(d => d.performance_score)
                ?.sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
                ?.slice(0, 10)
                ?.map((driver, idx) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-amber-50 rounded-xl border border-slate-200 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-amber-500 text-white' :
                        idx === 1 ? 'bg-slate-400 text-white' :
                        idx === 2 ? 'bg-orange-500 text-white' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {driver.first_name} {driver.last_name}
                        </p>
                        <p className="text-xs text-slate-500">{driver.cdl_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{driver.performance_score}</p>
                        <p className="text-xs text-slate-500">{driver.on_time_percentage}% on-time</p>
                      </div>
                      {driver.performance_tier && (
                        <DriverPerformanceBadge tier={driver.performance_tier} size="default" />
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {drivers?.filter(d => d.performance_score).length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No drivers scored yet. Automated scoring runs in background.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}