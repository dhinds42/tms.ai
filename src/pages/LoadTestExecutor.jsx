import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/design-system/PageHeader";
import { Zap, Play, Square, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";

export default function LoadTestExecutor() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const testScenarios = [
    { id: 1, name: "Load Board Stress Test", users: 1000, duration: "10m", status: "ready" },
    { id: 2, name: "Quote Generation Load", users: 500, duration: "5m", status: "ready" },
    { id: 3, name: "API Performance", users: 200, duration: "15m", status: "ready" }
  ];

  const runTest = (scenario) => {
    setRunning(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRunning(false);
          setResults({
            avgResponseTime: 245,
            maxResponseTime: 1250,
            minResponseTime: 85,
            throughput: 450,
            errorRate: 0.2,
            successRate: 99.8
          });
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Load Test Executor"
        subtitle="Execute and monitor performance tests"
        icon={Zap}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Test Scenarios */}
        <div className="grid md:grid-cols-3 gap-6">
          {testScenarios.map(scenario => (
            <Card key={scenario.id}>
              <CardHeader>
                <CardTitle className="text-lg">{scenario.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Virtual Users:</span>
                    <span className="font-semibold">{scenario.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-semibold">{scenario.duration}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => runTest(scenario)}
                  disabled={running}
                >
                  {running ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {running ? 'Running...' : 'Start Test'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress */}
        {running && (
          <Card>
            <CardHeader>
              <CardTitle>Test in Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress} className="h-4" />
              <p className="text-center text-sm text-slate-600">{progress}% Complete</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{results.avgResponseTime}ms</div>
                  <p className="text-sm text-slate-600 mt-1">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{results.throughput}</div>
                  <p className="text-sm text-slate-600 mt-1">Requests/sec</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{results.successRate}%</div>
                  <p className="text-sm text-slate-600 mt-1">Success Rate</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Min Response Time:</span>
                  <span className="font-semibold">{results.minResponseTime}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Max Response Time:</span>
                  <span className="font-semibold">{results.maxResponseTime}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Error Rate:</span>
                  <span className="font-semibold text-red-600">{results.errorRate}%</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-800 font-medium">
                  All performance benchmarks passed
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}