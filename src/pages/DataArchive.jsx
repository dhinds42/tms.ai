import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScopedEntity } from "@/components/shared/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Archive, Search, TrendingUp, Clock, Database, RefreshCw } from "lucide-react";
import { archivalSystem } from "../components/archival/DataArchivalSystem";

export default function DataArchive() {
  const [searchQuery, setSearchQuery] = useState("");
  const [archiveResults, setArchiveResults] = useState([]);
  const [archivalProgress, setArchivalProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [optimization, setOptimization] = useState(null);

  const queryClient = useQueryClient();

  const { data: loads = [] } = useScopedEntity('Load', { limit: 2000 });

  useEffect(() => {
    if (loads.length > 0) {
      setStats(archivalSystem.getStats(loads));
      setOptimization(archivalSystem.calculateOptimization(loads));
    }
  }, [loads]);

  const handleSearch = () => {
    const results = archivalSystem.searchArchive(searchQuery);
    setArchiveResults(results);
  };

  const handleBatchArchive = async () => {
    setArchivalProgress({ current: 0, total: 0, percent: 0 });
    
    const archived = await archivalSystem.batchArchive(loads, (progress) => {
      setArchivalProgress(progress);
    });

    setTimeout(() => {
      setArchivalProgress(null);
      queryClient.invalidateQueries({ queryKey: ['loads'] });
      alert(`Successfully archived ${archived.length} loads`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Data Archival System</h1>
            <p className="text-slate-600 mt-1">Smart archival with 3-year retention policy</p>
          </div>
          <Button onClick={handleBatchArchive} className="bg-indigo-600" disabled={!stats || stats.eligibleForArchival === 0}>
            <Archive className="w-4 h-4 mr-2" />
            Auto-Archive Now
          </Button>
        </div>

        {/* Archival Progress */}
        {archivalProgress && (
          <Card className="border-0 shadow-xl bg-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-indigo-900">Archiving in progress...</span>
                <span className="text-sm text-indigo-700">
                  {archivalProgress.current} / {archivalProgress.total}
                </span>
              </div>
              <Progress value={archivalProgress.percent} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {stats && optimization && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Eligible for Archival</p>
                    <p className="text-3xl font-bold text-indigo-600">{stats.eligibleForArchival}</p>
                    <p className="text-xs text-slate-600">loads &gt;1 year old</p>
                  </div>
                  <Archive className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Already Archived</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.totalArchived}</p>
                    <p className="text-xs text-slate-600">in cold storage</p>
                  </div>
                  <Database className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Query Speedup</p>
                    <p className="text-3xl font-bold text-blue-600">{optimization.queryTimeImprovement}%</p>
                    <p className="text-xs text-slate-600">faster queries</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Retention Policy</p>
                    <p className="text-3xl font-bold text-purple-600">3</p>
                    <p className="text-xs text-slate-600">years max retention</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Impact */}
        {optimization && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Performance Optimization Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Active Loads (Current)</p>
                  <p className="text-2xl font-bold text-slate-900">{optimization.currentLoads.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">After Archival</p>
                  <p className="text-2xl font-bold text-emerald-600">{optimization.afterArchival.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">
                  Estimated query speedup: <span className="text-lg">{optimization.estimatedSpeedUp}</span>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  By moving {optimization.currentLoads - optimization.afterArchival} loads to cold storage
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Archive Search */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              Search Archive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by load number, location, commodity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} className="bg-purple-600">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {archiveResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  Found {archiveResults.length} archived loads
                </p>
                {archiveResults.slice(0, 20).map((load, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900">
                          {load.load_number || load.id.slice(0, 8)}
                        </span>
                        <span className="text-xs text-slate-600 ml-2">
                          {load.pickup_location?.city} → {load.dropoff_location?.city}
                        </span>
                      </div>
                      <Badge className="bg-slate-600">
                        Archived {new Date(load.archived_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}