import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp } from "lucide-react";

export default function ABTestGrid({ campaigns, onView }) {
  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-slate-100 text-slate-800",
      active: "bg-blue-100 text-blue-800",
      paused: "bg-amber-100 text-amber-800",
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.draft;
  };

  const getWinnerBadge = (winner) => {
    if (!winner) return null;
    const colors = {
      a: "bg-purple-100 text-purple-800",
      b: "bg-cyan-100 text-cyan-800",
      inconclusive: "bg-slate-100 text-slate-800"
    };
    return (
      <Badge className={colors[winner]}>
        Winner: {winner.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{campaign.campaign_name}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">{campaign.feature_key}</p>
              </div>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Target Audience:</span>
              <span className="font-medium">{campaign.target_audience}</span>
            </div>
            
            {campaign.confidence_level && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Confidence:</span>
                <span className="font-medium">{campaign.confidence_level}%</span>
              </div>
            )}

            {campaign.winner && getWinnerBadge(campaign.winner)}

            <Button 
              onClick={() => onView(campaign)} 
              variant="outline" 
              className="w-full mt-4"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}