import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, TrendingUp, Users } from "lucide-react";

export default function ABTestStats({ campaigns }) {
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
  const avgConfidence = campaigns.length > 0
    ? (campaigns.reduce((sum, c) => sum + (c.confidence_level || 0), 0) / campaigns.length).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Active Tests</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{activeCampaigns}</p>
            </div>
            <div className="p-4 bg-blue-100 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Completed</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{completedCampaigns}</p>
            </div>
            <div className="p-4 bg-emerald-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase">Avg Confidence</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{avgConfidence}%</p>
            </div>
            <div className="p-4 bg-indigo-100 rounded-xl">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}