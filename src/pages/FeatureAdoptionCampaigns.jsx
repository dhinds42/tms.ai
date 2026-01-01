import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Users, TrendingUp, CheckCircle, Loader2, Mail, BookOpen } from "lucide-react";
import FeatureAdoptionAnalytics from "../components/analytics/FeatureAdoptionAnalytics";

export default function FeatureAdoptionCampaigns() {
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    feature_key: '',
    target_drivers: 'eligible_not_using',
    campaign_type: 'email',
    message: ''
  });
  const queryClient = useQueryClient();

  const { data: drivers } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => base44.entities.Driver.list('-created_date', 500),
    initialData: []
  });

  const { data: eligibility } = useQuery({
    queryKey: ['allEligibility'],
    queryFn: () => base44.entities.DriverFeatureEligibility.list('-created_date', 1000),
    initialData: []
  });

  const { data: accessorials } = useQuery({
    queryKey: ['accessorialRequests'],
    queryFn: () => base44.entities.AccessorialRequest.list('-created_date', 500),
    initialData: []
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaign) => {
      // Identify target drivers
      let targetDrivers = [];
      
      if (campaign.target_drivers === 'eligible_not_using') {
        const eligible = eligibility.filter(e => 
          e.feature_key === campaign.feature_key && e.eligible
        ).map(e => e.driver_id);
        
        // Filter out drivers actively using the feature
        const activeUsers = new Set(
          accessorials.map(a => a.requester_id)
        );
        
        targetDrivers = eligible.filter(id => !activeUsers.has(id));
      }

      // Send campaign communications
      const results = [];
      for (const driverId of targetDrivers.slice(0, 50)) { // Limit to 50 per campaign
        const driver = drivers.find(d => d.id === driverId);
        if (!driver?.email) continue;

        if (campaign.campaign_type === 'email') {
          await base44.integrations.Core.SendEmail({
            to: driver.email,
            subject: `New Feature Available: ${campaign.feature_key.replace(/_/g, ' ')}`,
            body: campaign.message
          });
        }

        results.push(driverId);
      }

      // Log campaign
      await base44.entities.AuditLog.create({
        entity_type: 'FeatureAdoptionCampaign',
        entity_id: campaign.name,
        action: 'CAMPAIGN_LAUNCHED',
        actor_email: (await base44.auth.me()).email,
        metadata: {
          campaign_name: campaign.name,
          feature_key: campaign.feature_key,
          target_count: targetDrivers.length,
          sent_count: results.length,
          campaign_type: campaign.campaign_type
        }
      });

      return {
        campaign_name: campaign.name,
        targeted: targetDrivers.length,
        reached: results.length
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setCampaignForm({
        name: '',
        feature_key: '',
        target_drivers: 'eligible_not_using',
        campaign_type: 'email',
        message: ''
      });
    }
  });

  const features = [
    { key: 'profit_explain', label: 'Profit Breakdown' },
    { key: 'detention_timer', label: 'Detention Timer' },
    { key: 'accessorial_requests', label: 'Accessorial Requests' },
    { key: 'counteroffers', label: 'Rate Counteroffers' },
    { key: 'what_if_pricing', label: 'What-If Pricing' },
    { key: 'instant_pay', label: 'Instant Pay' },
    { key: 'facility_intel', label: 'Facility Intel' }
  ];

  // Calculate adoption gaps
  const adoptionGaps = features.map(feature => {
    const eligible = eligibility.filter(e => e.feature_key === feature.key && e.eligible);
    const activeUsers = new Set(accessorials.map(a => a.requester_id));
    const gap = eligible.filter(e => !activeUsers.has(e.driver_id)).length;
    
    return {
      ...feature,
      eligible: eligible.length,
      gap,
      gapPct: eligible.length > 0 ? Math.round((gap / eligible.length) * 100) : 0
    };
  }).filter(f => f.gap > 3).sort((a, b) => b.gap - a.gap);

  const templates = {
    profit_explain: `Hi {driver_name},

Great news! You now have access to Profit Breakdown on your loads.

This feature shows you exactly how your pay is calculated, including:
- Line haul breakdown
- Fuel surcharge details
- Accessorial charges
- Total pay transparency

Check it out on your next load in the driver portal.

Keep up the great work!`,
    
    detention_timer: `Hi {driver_name},

You've unlocked the Detention Timer feature!

Now you can:
- Auto-track detention time at pickup/delivery
- See real-time detention charges
- Submit detention claims instantly

The timer starts automatically when you mark "Arrived at Stop".

Questions? Contact dispatch anytime.`,

    accessorial_requests: `Hi {driver_name},

Congrats! You can now submit accessorial requests directly through the app.

Eligible charges:
- Detention
- Layover
- Lumper fees
- TONU

Just upload your receipt and we'll process it within 24 hours.

Thank you for your excellent performance!`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-green-900 bg-clip-text text-transparent mb-2">
            Feature Adoption Campaigns
          </h1>
          <p className="text-slate-600 text-lg">Drive feature usage through targeted communication</p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="campaigns">
              Campaigns
              {adoptionGaps.length > 0 && (
                <Badge className="ml-2 bg-amber-500">{adoptionGaps.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <FeatureAdoptionAnalytics carrierId={null} />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            
            {/* Adoption Gaps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  Adoption Gaps (Top Opportunities)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {adoptionGaps.map(feature => (
                  <div key={feature.key} className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-slate-900 capitalize">{feature.label}</p>
                      <Badge className="bg-red-500">{feature.gap} drivers</Badge>
                    </div>
                    <p className="text-sm text-amber-800 mb-3">
                      {feature.gap} eligible drivers not using ({feature.gapPct}% gap)
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setCampaignForm({
                        ...campaignForm,
                        feature_key: feature.key,
                        name: `${feature.label} Adoption Q1 2026`,
                        message: templates[feature.key] || ''
                      })}
                      className="bg-green-600"
                    >
                      <Megaphone className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </div>
                ))}

                {adoptionGaps.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-slate-600">Excellent! No significant adoption gaps detected.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campaign Creator */}
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle>Create Adoption Campaign</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div>
                  <label className="text-sm font-semibold text-slate-700">Campaign Name</label>
                  <Input
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                    placeholder="e.g., Detention Timer Launch Q1 2026"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Feature</label>
                  <Select
                    value={campaignForm.feature_key}
                    onValueChange={(value) => setCampaignForm({...campaignForm, feature_key: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select feature..." />
                    </SelectTrigger>
                    <SelectContent>
                      {features.map(f => (
                        <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Campaign Type</label>
                  <Select
                    value={campaignForm.campaign_type}
                    onValueChange={(value) => setCampaignForm({...campaignForm, campaign_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="in_app_notification">In-App Notification</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Message</label>
                  <Textarea
                    value={campaignForm.message}
                    onChange={(e) => setCampaignForm({...campaignForm, message: e.target.value})}
                    placeholder="Write your message... Use {driver_name} for personalization."
                    rows={6}
                  />
                </div>

                <Button
                  onClick={() => createCampaignMutation.mutate(campaignForm)}
                  disabled={!campaignForm.name || !campaignForm.feature_key || createCampaignMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {createCampaignMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-4 h-4 mr-2" />
                      Launch Campaign
                    </>
                  )}
                </Button>

                {createCampaignMutation.isSuccess && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                      <p className="text-sm text-green-900">
                        Campaign sent to {createCampaignMutation.data?.reached} drivers!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Email Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(templates).map(([key, template]) => (
                  <Card key={key} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-slate-900 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCampaignForm({
                            ...campaignForm,
                            feature_key: key,
                            message: template
                          })}
                        >
                          Use Template
                        </Button>
                      </div>
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded">
                        {template}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}