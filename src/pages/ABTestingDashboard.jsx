import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/design-system/PageHeader";
import { Zap, Plus, Play, Pause, Trophy, TrendingUp } from "lucide-react";

export default function ABTestingDashboard() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['abTestCampaigns'],
    queryFn: () => base44.entities.ABTestCampaign.list('-created_date', 50),
    initialData: [],
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="A/B Testing Dashboard"
        subtitle="Experiment with features and optimize performance"
        icon={Zap}
        primaryAction={{
          label: 'Create Test',
          icon: Plus,
          onClick: () => setShowCreateModal(true)
        }}
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-900">{campaigns.length}</div>
              <p className="text-sm text-slate-600 mt-1">Total Tests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">{activeCampaigns.length}</div>
              <p className="text-sm text-slate-600 mt-1">Active Tests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{completedCampaigns.length}</div>
              <p className="text-sm text-slate-600 mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-600">
                {completedCampaigns.filter(c => c.winner === 'b').length}
              </div>
              <p className="text-sm text-slate-600 mt-1">Wins (Variant B)</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Active Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.map(campaign => (
              <TestCard key={campaign.id} campaign={campaign} />
            ))}
            {activeCampaigns.length === 0 && (
              <div className="py-12 text-center">
                <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No active tests</p>
                <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                  Create Your First Test
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Tests */}
        {completedCampaigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedCampaigns.map(campaign => (
                <TestCard key={campaign.id} campaign={campaign} completed />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function TestCard({ campaign, completed = false }) {
  const statusColors = {
    active: "bg-emerald-500",
    paused: "bg-amber-500",
    completed: "bg-blue-500",
    draft: "bg-slate-500"
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-slate-900">{campaign.campaign_name}</h3>
            <Badge className={`${statusColors[campaign.status]} text-white capitalize`}>
              {campaign.status}
            </Badge>
            {campaign.winner && (
              <Badge variant="outline" className="gap-1">
                <Trophy className="w-3 h-3" />
                Winner: {campaign.winner.toUpperCase()}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Testing: <span className="font-mono">{campaign.feature_key}</span>
          </p>

          {!completed && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Variant A (Control)</span>
                  <span className="text-sm text-slate-500">50%</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Variant B (Test)</span>
                  <span className="text-sm text-slate-500">50%</span>
                </div>
                <Progress value={50} className="h-2 bg-blue-200" />
              </div>
            </div>
          )}

          {completed && campaign.confidence_level && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">
                Confidence: <span className="font-semibold">{campaign.confidence_level}%</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!completed && (
            <>
              <Button variant="outline" size="sm">
                <Pause className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                View Results
              </Button>
            </>
          )}
          {completed && (
            <Button variant="outline" size="sm">
              View Report
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}