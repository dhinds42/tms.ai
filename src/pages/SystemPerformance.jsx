import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Zap, Database, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { queryOptimizer } from "../components/infrastructure/QueryOptimizer";
import { circuitBreaker, fmcsaCircuitBreaker, eldCircuitBreaker } from "../components/infrastructure/RateLimiter";
import eventBus, { EVENT_TYPES } from "../components/infrastructure/EventBus";

export default function SystemPerformance() {
  const [queryStats, setQueryStats] = useState(null);
  const [slowQueries, setSlowQueries] = useState([]);
  const [n1Problems, setN1Problems] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);
  const [circuitStates, setCircuitStates] = useState({});

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadStats = () => {
    setQueryStats(queryOptimizer.getStats());
    setSlowQueries(queryOptimizer.getSlowQueries(10));
    setN1Problems(queryOptimizer.detectN1Problems());
    setEventHistory(eventBus.getHistory({ limit: 20 }));
    setCircuitStates({
      main: circuitBreaker.getState(),
      fmcsa: fmcsaCircuitBreaker.getState(),
      eld: eldCircuitBreaker.getState()
    });
  };

  const handleClearCache = () => {
    queryOptimizer.invalidateCache();
    loadStats();
  };

  const handleResetCircuit = () => {
    circuitBreaker.reset();
    fmcsaCircuitBreaker.reset();
    eldCircuitBreaker.reset();
    loadStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Performance</h1>
            <p className="text-slate-600 mt-1">Query optimization, rate limiting, and event monitoring</p>
          </div>
          <Button onClick={loadStats} className="bg-indigo-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Query Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="w-4 h-4 text-blue-600" />
                Query Cache Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Cache Hit Rate:</span>
                <span className="font-bold text-emerald-600">{queryStats?.cacheHitRate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Queries:</span>
                <span className="font-semibold">{queryStats?.totalQueries}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Cache Size:</span>
                <span className="font-semibold">{queryStats?.cacheSize}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Avg Duration:</span>
                <span className="font-semibold">{queryStats?.avgQueryDuration}</span>
              </div>
              <Button onClick={handleClearCache} size="sm" variant="outline" className="w-full mt-3">
                Clear Cache
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Performance Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Slow Queries:</span>
                <Badge className={slowQueries.length > 5 ? 'bg-red-600' : 'bg-emerald-600'}>
                  {queryStats?.slowQueries || 0}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">N+1 Problems:</span>
                <Badge className={n1Problems.length > 0 ? 'bg-amber-600' : 'bg-emerald-600'}>
                  {n1Problems.length}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Query Errors:</span>
                <Badge className={queryStats?.errors > 0 ? 'bg-red-600' : 'bg-emerald-600'}>
                  {queryStats?.errors || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-purple-600" />
                Circuit Breakers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(circuitStates).map(([name, state]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="text-slate-600 capitalize">{name}:</span>
                  <Badge className={
                    state.state === 'CLOSED' ? 'bg-emerald-600' :
                    state.state === 'HALF_OPEN' ? 'bg-amber-600' :
                    'bg-red-600'
                  }>
                    {state.state}
                  </Badge>
                </div>
              ))}
              <Button onClick={handleResetCircuit} size="sm" variant="outline" className="w-full mt-3">
                Reset Circuits
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Slow Queries */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Slow Queries (&gt;500ms)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slowQueries.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p>No slow queries detected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {slowQueries.map((query, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-mono text-slate-900">{query.queryKey}</p>
                      <p className="text-xs text-slate-500">{query.timestamp}</p>
                    </div>
                    <Badge className="bg-amber-600">{query.duration.toFixed(0)}ms</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* N+1 Problems */}
        {n1Problems.length > 0 && (
          <Card className="border-0 shadow-xl border-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                N+1 Query Problems Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {n1Problems.map((problem, i) => (
                  <div key={i} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-amber-900">{problem.pattern}</span>
                      <Badge className={
                        problem.severity === 'critical' ? 'bg-red-600' :
                        problem.severity === 'high' ? 'bg-orange-600' : 'bg-amber-600'
                      }>
                        {problem.severity}
                      </Badge>
                    </div>
                    <div className="text-sm text-amber-800 space-y-1">
                      <p>• {problem.count} queries in 5 seconds</p>
                      <p>• Avg duration: {problem.avgDuration}ms</p>
                      <p>• Total time: {problem.totalDuration}ms</p>
                    </div>
                    <p className="text-xs text-amber-700 mt-2 italic">
                      Consider batching or using includes/joins to reduce queries
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event History */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Recent Events (Last 20)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {eventHistory.map((event, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded text-xs flex items-center justify-between">
                  <span className="font-mono text-indigo-600">{event.type}</span>
                  <span className="text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}