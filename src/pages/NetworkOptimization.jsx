import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Network, TrendingUp, MapPin, Zap } from "lucide-react";

import LaneAnalysis from "../components/network/LaneAnalysis";
import NetworkOptimizer from "../components/network/NetworkOptimizer";
import ServicePointMap from "../components/network/ServicePointMap";

export default function NetworkOptimization() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Network Optimization
          </h1>
          <p className="text-slate-600 mt-2">Strategic network design and lane analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Lanes</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">247</p>
                </div>
                <Network className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Network Efficiency</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">87.4%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Service Points</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">142</p>
                </div>
                <MapPin className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Optimization Score</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">A+</p>
                </div>
                <Zap className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Network Optimizer */}
        <NetworkOptimizer />

        {/* Lane Analysis */}
        <LaneAnalysis />

        {/* Service Point Map */}
        <ServicePointMap />

      </div>
    </div>
  );
}