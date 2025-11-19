import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, DollarSign, Zap, BarChart3 } from "lucide-react";

import DynamicPricingEngine from "../components/pricing/DynamicPricingEngine";

export default function DynamicPricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-yellow-900 to-orange-900 bg-clip-text text-transparent">
            Dynamic Pricing Engine
          </h1>
          <p className="text-slate-600 mt-2">AI-powered real-time rate optimization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Market Index</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">127.3</p>
                </div>
                <TrendingUp className="w-12 h-12 text-yellow-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg Margin</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">18.2%</p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Price Updates</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">1,247</p>
                </div>
                <Zap className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Algorithms</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">7</p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Pricing Engine */}
        <DynamicPricingEngine />

      </div>
    </div>
  );
}