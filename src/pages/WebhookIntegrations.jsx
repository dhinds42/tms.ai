import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Webhook,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Activity,
  Send,
  Link as LinkIcon,
  Code
} from "lucide-react";

export default function WebhookIntegrations() {
  const [activeTab, setActiveTab] = useState("sources");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);

  const queryClient = useQueryClient();

  // Mock webhook sources - in production, fetch from database
  const [webhookSources, setWebhookSources] = useState([
    {
      id: '1',
      source_description: 'Public API Webhooks - Main Company',
      source_type: 'public_api_webhooks',
      owner_org: 'Main Branch',
      username: 'api_user_main',
      password_hash: '***********',
      linked_organizations: ['Main Branch', 'East Coast'],
      source_settings: {
        authorization: 'Bearer token_abc123',
        do_not_mark_invoice_as_printed: true,
        version: '2'
      },
      webhook_url: 'https://api.example.com/webhooks/shipments',
      status: 'active',
      events_sent: 1247,
      last_sent: new Date().toISOString()
    }
  ]);

  const webhookTypes = [
    { value: 'public_api_webhooks', label: 'Public API Webhooks' },
    { value: 'custom_integration', label: 'Custom Integration' },
    { value: 'third_party_api', label: 'Third Party API' }
  ];

  const triggerEvents = [
    { id: 'shipment.created', name: 'Shipment Created' },
    { id: 'shipment.updated', name: 'Shipment Updated' },
    { id: 'shipment.delivered', name: 'Shipment Delivered' },
    { id: 'shipment.cancelled', name: 'Shipment Cancelled' },
    { id: 'invoice.created', name: 'Invoice Created' },
    { id: 'invoice.sent', name: 'Invoice Sent' },
    { id: 'invoice.paid', name: 'Invoice Paid' },
    { id: 'carrier.assigned', name: 'Carrier Assigned' },
    { id: 'document.uploaded', name: 'Document Uploaded' },
    { id: 'status.changed', name: 'Status Changed' }
  ];

  const CreateWebhookModal = () => {
    const [formData, setFormData] = useState(selectedSource || {
      source_description: '',
      source_type: 'public_api_webhooks',
      owner_org: 'Main Branch',
      username: '',
      password: '',
      webhook_url: '',
      linked_organizations: [],
      source_settings: {
        authorization: '',
        do_not_mark_invoice_as_printed: false,
        version: '2'
      },
      trigger_events: []
    });

    const handleSave = () => {
      if (selectedSource) {
        setWebhookSources(webhookSources.map(s => 
          s.id === selectedSource.id ? {...formData, id: selectedSource.id} : s
        ));
        alert('Webhook integration updated successfully');
      } else {
        const newSource = {
          id: Date.now().toString(),
          ...formData,
          password_hash: '***********',
          status: 'active',
          events_sent: 0,
          last_sent: null
        };
        setWebhookSources([...webhookSources, newSource]);
        alert('Webhook integration created successfully');
      }
      setShowCreateModal(false);
      setSelectedSource(null);
    };

    const toggleOrganization = (org) => {
      if (formData.linked_organizations.includes(org)) {
        setFormData({
          ...formData, 
          linked_organizations: formData.linked_organizations.filter(o => o !== org)
        });
      } else {
        setFormData({
          ...formData, 
          linked_organizations: [...formData.linked_organizations, org]
        });
      }
    };

    const toggleEvent = (eventId) => {
      if (formData.trigger_events?.includes(eventId)) {
        setFormData({
          ...formData, 
          trigger_events: formData.trigger_events.filter(e => e !== eventId)
        });
      } else {
        setFormData({
          ...formData, 
          trigger_events: [...(formData.trigger_events || []), eventId]
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between rounded-t-2xl z-10">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedSource ? 'Edit Integration Source' : 'Add New Integration Source'}
            </h2>
            <button 
              onClick={() => {
                setShowCreateModal(false);
                setSelectedSource(null);
              }} 
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Source Description */}
            <div>
              <Label>Source Description *</Label>
              <Input
                value={formData.source_description}
                onChange={(e) => setFormData({...formData, source_description: e.target.value})}
                placeholder='e.g., "Public API Webhooks - Your Company Name"'
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                Recommended: "Public API Webhooks - [Your Company Name]"
              </p>
            </div>

            {/* Source Type */}
            <div>
              <Label>Source Type *</Label>
              <select
                value={formData.source_type}
                onChange={(e) => setFormData({...formData, source_type: e.target.value})}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                {webhookTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Owner Organization */}
            <div>
              <Label>Owner Organization *</Label>
              <select
                value={formData.owner_org}
                onChange={(e) => setFormData({...formData, owner_org: e.target.value})}
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                <option value="Main Branch">Main Branch</option>
                <option value="East Coast">East Coast</option>
                <option value="West Coast">West Coast</option>
                <option value="Midwest">Midwest</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Ensure this is set to your Accounting Organization
              </p>
            </div>

            {/* Webhook URL */}
            <div>
              <Label>Webhook URL *</Label>
              <Input
                value={formData.webhook_url}
                onChange={(e) => setFormData({...formData, webhook_url: e.target.value})}
                placeholder="https://api.example.com/webhooks"
                className="mt-2"
              />
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Username *</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="API username"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="API password"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Source Settings */}
            <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
              <h3 className="font-bold text-slate-900 mb-4">Source Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Authorization Token</Label>
                  <Input
                    value={formData.source_settings?.authorization}
                    onChange={(e) => setFormData({
                      ...formData, 
                      source_settings: {...formData.source_settings, authorization: e.target.value}
                    })}
                    placeholder="Bearer token_xyz123"
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    If your webhook URL requires an authorization token, add it here
                  </p>
                </div>

                <div>
                  <Label>API Version</Label>
                  <select
                    value={formData.source_settings?.version}
                    onChange={(e) => setFormData({
                      ...formData, 
                      source_settings: {...formData.source_settings, version: e.target.value}
                    })}
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  >
                    <option value="1">Version 1</option>
                    <option value="2">Version 2 (Latest)</option>
                    <option value="3">Version 3 (Beta)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    System will use latest version by default
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded border border-indigo-200">
                  <input
                    type="checkbox"
                    checked={formData.source_settings?.do_not_mark_invoice_as_printed}
                    onChange={(e) => setFormData({
                      ...formData, 
                      source_settings: {
                        ...formData.source_settings, 
                        do_not_mark_invoice_as_printed: e.target.checked
                      }
                    })}
                    className="mt-1"
                  />
                  <div>
                    <Label className="font-semibold">DoNotMarkInvoiceAsPrinted</Label>
                    <p className="text-xs text-slate-600 mt-1">
                      When <strong>true</strong>, invoice will show up in Invoice Delivery screen. 
                      Otherwise, it will be marked as Printed on the day it was sent.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Organizations */}
            <div>
              <Label>Linked Organizations</Label>
              <p className="text-xs text-slate-500 mb-2">
                Determines which shipments will get sent over. If you add a Linked Organization for an Office, 
                all shipments where that Office is part of could trigger the Webhook.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['Main Branch', 'East Coast', 'West Coast', 'Midwest', 'South Region'].map(org => (
                  <label key={org} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.linked_organizations?.includes(org)}
                      onChange={() => toggleOrganization(org)}
                    />
                    <span className="text-sm">{org}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Trigger Events */}
            <div>
              <Label>Trigger Events</Label>
              <p className="text-xs text-slate-500 mb-2">
                Select which events should trigger this webhook
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {triggerEvents.map(event => (
                  <label key={event.id} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.trigger_events?.includes(event.id)}
                      onChange={() => toggleEvent(event.id)}
                    />
                    <span className="text-sm">{event.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 bg-indigo-600 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Save & View Details
              </Button>
              <Button 
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedSource(null);
                }} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  const handleTestWebhook = async (source) => {
    alert(`Testing webhook: ${source.source_description}\nSending test payload to: ${source.webhook_url}`);
    // In production: send test webhook
  };

  const handleDeleteSource = (sourceId) => {
    if (confirm('Delete this webhook integration? This cannot be undone.')) {
      setWebhookSources(webhookSources.filter(s => s.id !== sourceId));
      alert('Webhook integration deleted');
    }
  };

  const handleToggleStatus = (sourceId) => {
    setWebhookSources(webhookSources.map(s => 
      s.id === sourceId 
        ? {...s, status: s.status === 'active' ? 'inactive' : 'active'} 
        : s
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent">
              Webhook Integrations
            </h1>
            <p className="text-slate-600 mt-2">
              Real-time data integration with external systems via Public API Webhooks
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Integration Source
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Active Sources</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {webhookSources.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <Webhook className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Total Events Sent</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {webhookSources.reduce((sum, s) => sum + s.events_sent, 0).toLocaleString()}
                  </p>
                </div>
                <Send className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Linked Orgs</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {new Set(webhookSources.flatMap(s => s.linked_organizations)).size}
                  </p>
                </div>
                <LinkIcon className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600">API Version</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">v2</p>
                  <p className="text-xs text-slate-600 mt-1">Latest</p>
                </div>
                <Code className="w-12 h-12 text-amber-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="sources">Integration Sources</TabsTrigger>
            <TabsTrigger value="logs">Webhook Logs</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          {/* Integration Sources */}
          <TabsContent value="sources">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Integration Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhookSources.map((source) => (
                    <div key={source.id} className="p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{source.source_description}</h3>
                            <Badge className={
                              source.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-slate-100 text-slate-800'
                            }>
                              {source.status}
                            </Badge>
                            <Badge className="bg-indigo-100 text-indigo-800">
                              v{source.source_settings.version}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-slate-600">Type</p>
                              <p className="font-semibold">
                                {webhookTypes.find(t => t.value === source.source_type)?.label}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600">Owner Organization</p>
                              <p className="font-semibold">{source.owner_org}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Webhook URL</p>
                              <p className="font-semibold text-xs truncate">{source.webhook_url}</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Events Sent</p>
                              <p className="font-semibold text-emerald-600">
                                {source.events_sent.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <p className="text-xs text-slate-600 w-full mb-1">Linked Organizations:</p>
                            {source.linked_organizations.map(org => (
                              <Badge key={org} className="bg-blue-100 text-blue-800 text-xs">
                                {org}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <p className="text-xs text-slate-600 w-full mb-1">Settings:</p>
                            {source.source_settings.authorization && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                Authorization Enabled
                              </Badge>
                            )}
                            {source.source_settings.do_not_mark_invoice_as_printed && (
                              <Badge className="bg-amber-100 text-amber-800 text-xs">
                                DoNotMarkInvoiceAsPrinted
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => handleTestWebhook(source)}
                            size="sm"
                            className="bg-emerald-600 text-white"
                          >
                            <Activity className="w-3 h-3 mr-1" />
                            Test
                          </Button>
                          <Button 
                            onClick={() => handleToggleStatus(source.id)}
                            size="sm"
                            variant="outline"
                          >
                            {source.status === 'active' ? (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Disable
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Enable
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={() => {
                              setSelectedSource(source);
                              setShowCreateModal(true);
                            }}
                            size="sm" 
                            variant="outline"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            onClick={() => handleDeleteSource(source.id)}
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {webhookSources.length === 0 && (
                    <div className="text-center py-12">
                      <Webhook className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">No webhook integrations configured</p>
                      <Button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Integration
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhook Logs */}
          <TabsContent value="logs">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Webhook Event Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">shipment.delivered</p>
                        <p className="text-sm text-slate-600">
                          Load LOAD-{1000 + i} delivered - Sent to API endpoint
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(Date.now() - i * 3600000).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Success
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation */}
          <TabsContent value="documentation">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader>
                <CardTitle>Webhook Integration Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-2">📚 Setup Guide</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Navigate to Integration Sources</li>
                    <li>Click "Add New Integration Source"</li>
                    <li>Enter Source Description (recommended: "Public API Webhooks - [Your Company]")</li>
                    <li>Select Source Type: "Public API Webhooks"</li>
                    <li>Set Owner Organization to your Accounting Organization</li>
                    <li>Enter Username and Password for API authentication</li>
                    <li>Add Authorization token if required</li>
                    <li>Click "Save & View Details"</li>
                    <li>Add Linked Organizations to determine which shipments trigger webhooks</li>
                  </ol>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-bold text-purple-900 mb-2">⚙️ Source Settings</h3>
                  <ul className="text-sm text-purple-800 space-y-2">
                    <li><strong>Authorization:</strong> Add bearer token if webhook URL requires authorization</li>
                    <li><strong>DoNotMarkInvoiceAsPrinted:</strong> When true, invoice appears in Invoice Delivery screen. Otherwise, marked as Printed when sent</li>
                    <li><strong>Version:</strong> Specify API version (default: latest). Available: v1, v2, v3</li>
                  </ul>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h3 className="font-bold text-emerald-900 mb-2">🔗 Linked Organizations</h3>
                  <p className="text-sm text-emerald-800">
                    Linked Organizations determine which shipments trigger webhooks. If you add an Office as a Linked Organization, 
                    all shipments associated with that Office will potentially trigger the webhook based on configured events.
                  </p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-bold text-amber-900 mb-2">📡 Webhook Payload Example</h3>
                  <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded overflow-x-auto">
{`{
  "event": "shipment.delivered",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "load_id": "load_12345",
    "load_number": "LOAD-1001",
    "status": "delivered",
    "customer_rate": 1500.00,
    "carrier_pay": 1200.00,
    "pickup_location": {
      "city": "Los Angeles",
      "state": "CA"
    },
    "delivery_location": {
      "city": "Phoenix",
      "state": "AZ"
    }
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {showCreateModal && <CreateWebhookModal />}

      </div>
    </div>
  );
}