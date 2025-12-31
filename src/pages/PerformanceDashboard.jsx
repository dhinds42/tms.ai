import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Zap, AlertTriangle, Server, RefreshCw, CheckCircle } from "lucide-react";
import performanceMonitor from "../components/monitoring/PerformanceMonitor";

export default function PerformanceDashboard() {
  const [endpointStats, setEndpointStats] = useState([]);
  const [queryStats, setQueryStats] = useState([]);
  const [errorSummary, setErrorSummary] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    loadMetrics();
    
    // Simulate system metrics collection
    const systemInterval = setInterval(() => {
      const cpuUsage = 30 + Math.random() * 40; // Mock CPU 30-70%
      const memoryUsage = 50 + Math.random() * 30; // Mock Memory 50-80%
      performanceMonitor.trackSystemMetrics(cpuUsage, memoryUsage);
    }, 2000);

    const refreshInterval = setInterval(loadMetrics, 5000);

    return () => {
      clearInterval(systemInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  const loadMetrics = () => {
    setEndpointStats(performanceMonitor.getEndpointStats());
    setQueryStats(performanceMonitor.getQueryStats());
    setErrorSummary(performanceMonitor.getErrorSummary());
    setSystemHealth(performanceMonitor.getSystemHealth());
    setActiveAlerts(performanceMonitor.getActiveAlerts());
  };

  const handleClearAlerts = () => {
    performanceMonitor.clearAlerts();
    loadMetrics();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Performance Dashboard</h1>
            <p className="text-slate-600 mt-1">Real-time system monitoring and alerting</p>
          </div>
          <Button onClick={loadMetrics} className="bg-indigo-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <Card className="border-2 border-red-500 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-5 h-5" />
                Active Alerts ({activeAlerts.length})
                <Button onClick={handleClearAlerts} size="sm" variant="outline" className="ml-auto">
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-900">{alert.message}</span>
                    <Badge className="bg-red-600">{alert.type}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* System Health */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Server className="w-4 h-4 text-blue-600" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {systemHealth.current.cpuUsage.toFixed(1)}%
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={systemHealth.trend}>
                    <Line type="monotone" dataKey="cpuUsage" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-purple-600" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {systemHealth.current.memoryUsage.toFixed(1)}%
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={systemHealth.trend}>
                    <Line type="monotone" dataKey="memoryUsage" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Performance */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              API Endpoint Performance (Last 5 minutes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {endpointStats.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p>No API calls tracked yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {endpointStats.slice(0, 10).map((stat, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-slate-900">{stat.endpoint}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={stat.avgDuration > 1000 ? 'bg-red-600' : stat.avgDuration > 500 ? 'bg-amber-600' : 'bg-emerald-600'}>
                          {stat.avgDuration.toFixed(0)}ms
                        </Badge>
                        <Badge variant="outline">{stat.successRate.toFixed(0)}% success</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      {stat.count} calls • {stat.errors} errors
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Query Performance */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Database Query Performance
              <Badge className="ml-auto">Flagging queries &gt;500ms</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queryStats.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No queries tracked</p>
              </div>
            ) : (
              <div className="space-y-2">
                {queryStats.slice(0, 10).map((stat, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-slate-900">{stat.queryKey}</span>
                      <div className="flex items-center gap-2">
                        <Badge className={stat.avgDuration > 500 ? 'bg-red-600' : 'bg-emerald-600'}>
                          {stat.avgDuration.toFixed(0)}ms
                        </Badge>
                        <Badge variant="outline">{stat.cacheRate.toFixed(0)}% cached</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      {stat.count} executions
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Tracking */}
        {errorSummary && (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Error Tracking
                <Badge className={errorSummary.errorRate > 5 ? 'ml-auto bg-red-600' : 'ml-auto bg-emerald-600'}>
                  {errorSummary.errorRate.toFixed(2)}% error rate
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 mb-4">
                {errorSummary.totalErrors} errors in last 5 minutes
              </div>
              {errorSummary.recentErrors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Recent Errors:</p>
                  {errorSummary.recentErrors.slice(0, 5).map((error, i) => (
                    <div key={i} className="p-2 bg-red-50 rounded text-xs text-red-900 font-mono">
                      {error.message}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}