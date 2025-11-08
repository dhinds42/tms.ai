import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar,
  Users,
  MessageSquare,
  FileText,
  TrendingUp,
  Clock,
  Plus,
  Edit,
  Sparkles,
  Loader2,
  Target,
  Briefcase
} from "lucide-react";

export default function ShipperCRM({ shippers, loads, isLoading, operatingMode }) {
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [analyzingRelationship, setAnalyzingRelationship] = useState(null);
  const [relationshipInsights, setRelationshipInsights] = useState({});

  const [contactForm, setContactForm] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    is_primary: false
  });

  const [noteForm, setNoteForm] = useState({
    subject: '',
    content: '',
    type: 'general'
  });

  const [activityForm, setActivityForm] = useState({
    type: 'call',
    subject: '',
    notes: '',
    scheduled_date: ''
  });

  const queryClient = useQueryClient();

  const updateShipperMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Shipper.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippers'] });
      setShowAddContact(false);
      setShowAddNote(false);
      setShowAddActivity(false);
    },
  });

  const analyzeRelationship = async (shipper) => {
    setAnalyzingRelationship(shipper.id);

    const shipperLoads = loads.filter(l => l.shipper_id === shipper.id);
    const recentLoads = shipperLoads.slice(0, 10);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a CRM AI analyzing customer relationships for a ${operatingMode}.

SHIPPER PROFILE:
- Company: ${shipper.company_name}
- Contact: ${shipper.contact_name}
- Status: ${shipper.status}
- Total Loads: ${shipper.total_loads || 0}
- Total Revenue: $${shipper.total_revenue?.toLocaleString() || 0}
- Payment Terms: ${shipper.payment_terms}
- Rating: ${shipper.rating || 'Not rated'}/5
- Last Contact: ${shipper.last_contact_date || 'Unknown'}
- Industry: ${shipper.industry || 'Unknown'}
- Company Size: ${shipper.company_size || 'Unknown'}

RECENT ACTIVITY:
${recentLoads.length > 0 ? recentLoads.map(l => `
- Load ${l.load_number || l.id.slice(0, 8)}: $${l.customer_rate || 0} | Status: ${l.status}
  ${l.pickup_location?.city} → ${l.dropoff_location?.city}
`).join('\n') : '- No recent loads'}

PRIMARY LANES:
${shipper.primary_lanes?.map(lane => `${lane.origin} → ${lane.destination}`).join(', ') || 'Not specified'}

Provide comprehensive relationship analysis including:
1. Relationship Health Score (0-100) with explanation
2. Customer Lifetime Value estimate
3. Revenue Trend (growing/stable/declining)
4. Engagement Level (high/medium/low)
5. Risk Assessment (churn risk, payment risk)
6. Growth Opportunities (3-5 specific recommendations)
7. Next Best Actions (prioritized list)
8. Competitive Threats
9. Upsell/Cross-sell Opportunities
10. Recommended Follow-up Timeline
11. Key Relationship Strengths
12. Areas Needing Attention`,
        response_json_schema: {
          type: "object",
          properties: {
            health_score: { type: "number" },
            health_explanation: { type: "string" },
            lifetime_value: { type: "number" },
            revenue_trend: { type: "string" },
            engagement_level: { type: "string" },
            churn_risk: { type: "string" },
            payment_risk: { type: "string" },
            growth_opportunities: {
              type: "array",
              items: { type: "string" }
            },
            next_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" }
                }
              }
            },
            competitive_threats: { type: "string" },
            upsell_opportunities: {
              type: "array",
              items: { type: "string" }
            },
            follow_up_timeline: { type: "string" },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            attention_areas: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setRelationshipInsights(prev => ({
        ...prev,
        [shipper.id]: result
      }));

    } catch (error) {
      console.error('Relationship analysis error:', error);
      alert('Failed to analyze relationship');
    } finally {
      setAnalyzingRelationship(null);
    }
  };

  const addContact = () => {
    if (!selectedShipper) return;

    const existingContacts = selectedShipper.additional_contacts || [];
    const newContacts = [...existingContacts, {
      ...contactForm,
      id: Date.now().toString(),
      created_date: new Date().toISOString()
    }];

    updateShipperMutation.mutate({
      id: selectedShipper.id,
      data: { additional_contacts: newContacts }
    });

    setContactForm({ name: '', title: '', email: '', phone: '', is_primary: false });
  };

  const addNote = () => {
    if (!selectedShipper) return;

    const existingNotes = selectedShipper.notes_log || [];
    const newNotes = [{
      ...noteForm,
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
      created_by: 'current_user'
    }, ...existingNotes];

    updateShipperMutation.mutate({
      id: selectedShipper.id,
      data: { 
        notes_log: newNotes,
        last_contact_date: new Date().toISOString()
      }
    });

    setNoteForm({ subject: '', content: '', type: 'general' });
  };

  const addActivity = () => {
    if (!selectedShipper) return;

    const existingActivities = selectedShipper.activities || [];
    const newActivities = [{
      ...activityForm,
      id: Date.now().toString(),
      created_date: new Date().toISOString(),
      status: 'scheduled'
    }, ...existingActivities];

    updateShipperMutation.mutate({
      id: selectedShipper.id,
      data: { 
        activities: newActivities,
        next_follow_up: activityForm.scheduled_date
      }
    });

    setActivityForm({ type: 'call', subject: '', notes: '', scheduled_date: '' });
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading CRM data...</div>;
  }

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskBadge = (risk) => {
    const colors = {
      LOW: 'bg-emerald-600',
      MEDIUM: 'bg-amber-600',
      HIGH: 'bg-red-600',
      CRITICAL: 'bg-red-800'
    };
    return <Badge className={`${colors[risk] || 'bg-slate-600'} text-white text-xs`}>{risk}</Badge>;
  };

  return (
    <div className="space-y-6">
      
      {/* CRM Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <Badge className="bg-blue-600 text-white">CRM</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-900 mb-1">
              {shippers.filter(s => s.status === 'active').length}
            </p>
            <p className="text-sm text-blue-700">Active Relationships</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-8 h-8 text-purple-600" />
              <Badge className="bg-purple-600 text-white">Pipeline</Badge>
            </div>
            <p className="text-2xl font-bold text-purple-900 mb-1">
              ${shippers.reduce((sum, s) => sum + (s.annual_volume || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-purple-700">Total Annual Volume</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <Badge className="bg-emerald-600 text-white">Growth</Badge>
            </div>
            <p className="text-2xl font-bold text-emerald-900 mb-1">
              {shippers.filter(s => (s.total_loads || 0) > 10).length}
            </p>
            <p className="text-sm text-emerald-700">High-Volume Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipper Details */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="border-b border-slate-100 pb-6">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Customer Relationship Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Shipper List */}
            <div className="md:col-span-1 space-y-3">
              <h3 className="font-semibold text-slate-900 mb-4">Customer Directory</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {shippers.map(shipper => (
                  <button
                    key={shipper.id}
                    onClick={() => setSelectedShipper(shipper)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedShipper?.id === shipper.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{shipper.company_name}</h4>
                      <Badge className={shipper.status === 'active' ? 'bg-emerald-600' : 'bg-slate-600'}>
                        {shipper.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{shipper.contact_name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <DollarSign className="w-3 h-3" />
                      ${((shipper.total_revenue || 0) / 1000).toFixed(0)}K
                      <span className="mx-1">•</span>
                      <TrendingUp className="w-3 h-3" />
                      {shipper.total_loads || 0} loads
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            {selectedShipper ? (
              <div className="md:col-span-2 space-y-6">
                
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">
                          {selectedShipper.company_name}
                        </h2>
                        <p className="text-slate-600 mb-2">{selectedShipper.contact_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={selectedShipper.status === 'active' ? 'bg-emerald-600' : 'bg-slate-600'}>
                            {selectedShipper.status}
                          </Badge>
                          {selectedShipper.industry && (
                            <Badge variant="outline">{selectedShipper.industry}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => analyzeRelationship(selectedShipper)}
                      disabled={analyzingRelationship === selectedShipper.id}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                      {analyzingRelationship === selectedShipper.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Analysis
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Quick Info */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Total Revenue</p>
                      <p className="text-xl font-bold text-emerald-600">
                        ${((selectedShipper.total_revenue || 0) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Total Loads</p>
                      <p className="text-xl font-bold text-blue-600">
                        {selectedShipper.total_loads || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Avg Rating</p>
                      <p className="text-xl font-bold text-amber-600">
                        {selectedShipper.rating || 'N/A'}/5
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Relationship Insights */}
                {relationshipInsights[selectedShipper.id] && (
                  <Card className="border-2 border-purple-200 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="border-b border-purple-200 pb-4">
                      <CardTitle className="flex items-center gap-2 text-purple-900">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Relationship Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {(() => {
                        const insights = relationshipInsights[selectedShipper.id];
                        return (
                          <>
                            {/* Health Score */}
                            <div className="p-4 bg-white rounded-xl border border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-slate-900">Relationship Health</h4>
                                <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getHealthScoreColor(insights.health_score)}`}>
                                  {insights.health_score}
                                </div>
                              </div>
                              <p className="text-sm text-slate-700">{insights.health_explanation}</p>
                            </div>

                            {/* Key Metrics */}
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="p-4 bg-white rounded-xl border border-purple-200">
                                <p className="text-xs text-slate-600 mb-1">Lifetime Value</p>
                                <p className="text-xl font-bold text-emerald-600">
                                  ${insights.lifetime_value?.toLocaleString()}
                                </p>
                              </div>
                              <div className="p-4 bg-white rounded-xl border border-purple-200">
                                <p className="text-xs text-slate-600 mb-1">Revenue Trend</p>
                                <Badge className={
                                  insights.revenue_trend === 'growing' ? 'bg-emerald-600' :
                                  insights.revenue_trend === 'stable' ? 'bg-blue-600' : 'bg-amber-600'
                                }>
                                  {insights.revenue_trend}
                                </Badge>
                              </div>
                              <div className="p-4 bg-white rounded-xl border border-purple-200">
                                <p className="text-xs text-slate-600 mb-1">Engagement</p>
                                <Badge className={
                                  insights.engagement_level === 'high' ? 'bg-emerald-600' :
                                  insights.engagement_level === 'medium' ? 'bg-blue-600' : 'bg-amber-600'
                                }>
                                  {insights.engagement_level}
                                </Badge>
                              </div>
                            </div>

                            {/* Risk Assessment */}
                            <div className="p-4 bg-white rounded-xl border border-purple-200">
                              <h4 className="font-bold text-slate-900 mb-3">Risk Assessment</h4>
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="text-xs text-slate-600 mb-1">Churn Risk</p>
                                  {getRiskBadge(insights.churn_risk)}
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 mb-1">Payment Risk</p>
                                  {getRiskBadge(insights.payment_risk)}
                                </div>
                              </div>
                            </div>

                            {/* Next Actions */}
                            <div className="p-4 bg-white rounded-xl border border-purple-200">
                              <h4 className="font-bold text-slate-900 mb-3">Recommended Actions</h4>
                              <div className="space-y-2">
                                {insights.next_actions?.map((action, idx) => (
                                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Badge className={
                                      action.priority === 'high' ? 'bg-red-600' :
                                      action.priority === 'medium' ? 'bg-amber-600' : 'bg-blue-600'
                                    }>
                                      {action.priority}
                                    </Badge>
                                    <div className="flex-1">
                                      <p className="text-sm font-semibold text-slate-900">{action.action}</p>
                                      <p className="text-xs text-slate-600 mt-1">Timeline: {action.timeline}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Growth Opportunities */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white rounded-xl border border-purple-200">
                                <h4 className="font-bold text-slate-900 mb-3">Growth Opportunities</h4>
                                <ul className="space-y-2">
                                  {insights.growth_opportunities?.map((opp, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                      <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />
                                      {opp}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="p-4 bg-white rounded-xl border border-purple-200">
                                <h4 className="font-bold text-slate-900 mb-3">Upsell Opportunities</h4>
                                <ul className="space-y-2">
                                  {insights.upsell_opportunities?.map((opp, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                      <DollarSign className="w-4 h-4 text-blue-600 mt-0.5" />
                                      {opp}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Contact Information */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Contact Information</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddContact(!showAddContact)}
                        className="border-indigo-300 text-indigo-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Contact
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <span className="text-slate-700">{selectedShipper.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-indigo-600" />
                        <span className="text-slate-700">{selectedShipper.phone}</span>
                      </div>
                      {selectedShipper.address && (
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-indigo-600" />
                          <span className="text-slate-700">
                            {selectedShipper.address.city}, {selectedShipper.address.state}
                          </span>
                        </div>
                      )}

                      {/* Additional Contacts */}
                      {selectedShipper.additional_contacts?.map((contact, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg mt-3">
                          <p className="font-semibold text-slate-900">{contact.name}</p>
                          <p className="text-xs text-slate-600">{contact.title}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-700">
                            <span>{contact.email}</span>
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      ))}

                      {showAddContact && (
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 mt-4">
                          <div className="space-y-3">
                            <Input
                              placeholder="Name"
                              value={contactForm.name}
                              onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                            />
                            <Input
                              placeholder="Title/Position"
                              value={contactForm.title}
                              onChange={(e) => setContactForm({...contactForm, title: e.target.value})}
                            />
                            <Input
                              placeholder="Email"
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                            />
                            <Input
                              placeholder="Phone"
                              value={contactForm.phone}
                              onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                            />
                            <Button onClick={addContact} className="w-full bg-indigo-600">
                              Save Contact
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Timeline */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Activity Timeline</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddActivity(!showAddActivity)}
                        className="border-blue-300 text-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Activity
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {showAddActivity && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                        <div className="space-y-3">
                          <Select value={activityForm.type} onValueChange={(value) => setActivityForm({...activityForm, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="call">Phone Call</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="followup">Follow-up</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Subject"
                            value={activityForm.subject}
                            onChange={(e) => setActivityForm({...activityForm, subject: e.target.value})}
                          />
                          <Input
                            type="datetime-local"
                            value={activityForm.scheduled_date}
                            onChange={(e) => setActivityForm({...activityForm, scheduled_date: e.target.value})}
                          />
                          <Textarea
                            placeholder="Notes"
                            value={activityForm.notes}
                            onChange={(e) => setActivityForm({...activityForm, notes: e.target.value})}
                          />
                          <Button onClick={addActivity} className="w-full bg-blue-600">
                            Schedule Activity
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedShipper.activities?.map((activity, idx) => (
                        <div key={idx} className="flex gap-4 p-3 bg-slate-50 rounded-lg">
                          <div className="flex flex-col items-center">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="w-px h-full bg-slate-200 mt-2"></div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{activity.subject}</p>
                            <p className="text-xs text-slate-600 mb-2">{activity.type} - {new Date(activity.scheduled_date).toLocaleString()}</p>
                            {activity.notes && <p className="text-sm text-slate-700">{activity.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Notes & Communication Log</CardTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddNote(!showAddNote)}
                        className="border-emerald-300 text-emerald-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {showAddNote && (
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 mb-4">
                        <div className="space-y-3">
                          <Input
                            placeholder="Subject"
                            value={noteForm.subject}
                            onChange={(e) => setNoteForm({...noteForm, subject: e.target.value})}
                          />
                          <Select value={noteForm.type} onValueChange={(value) => setNoteForm({...noteForm, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General Note</SelectItem>
                              <SelectItem value="call">Call Summary</SelectItem>
                              <SelectItem value="meeting">Meeting Notes</SelectItem>
                              <SelectItem value="issue">Issue/Concern</SelectItem>
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="Note content..."
                            value={noteForm.content}
                            onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                            rows={4}
                          />
                          <Button onClick={addNote} className="w-full bg-emerald-600">
                            Save Note
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedShipper.notes_log?.map((note, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{note.subject}</p>
                              <p className="text-xs text-slate-600">
                                {new Date(note.created_date).toLocaleString()} • {note.type}
                              </p>
                            </div>
                            <Badge variant="outline">{note.type}</Badge>
                          </div>
                          <p className="text-sm text-slate-700">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>
            ) : (
              <div className="md:col-span-2 flex items-center justify-center py-20 text-center">
                <div>
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Select a Customer
                  </h3>
                  <p className="text-slate-600">
                    Choose a customer from the list to view detailed CRM information
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}