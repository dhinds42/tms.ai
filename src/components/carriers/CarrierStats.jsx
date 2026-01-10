import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, TrendingUp } from "lucide-react";

export default function CarrierStats({ carriers }) {
  const activeCarriers = carriers.filter(c => c.status === 'active');
  
  const avgOnTime = carriers.length > 0 
    ? (carriers.reduce((sum, c) => sum + (c.on_time_percentage || 0), 0) / carriers.length).toFixed(1)
    : 0;
    
  const avgCompliance = carriers.length > 0
    ? (carriers.reduce((sum, c) => sum + (c.compliance_score || 0), 0) / carriers.length).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Carriers</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{activeCarriers.length}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg On-Time %</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{avgOnTime}%</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg Compliance</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{avgCompliance}%</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}