import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Webhook, 
  CheckCircle, 
  XCircle, 
  Clock,
  Bell,
  Copy,
  AlertTriangle
} from "lucide-react";

export default function WebhookManager() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState([]);
  const [webhookEnabled, setWebhookEnabled] = useState(
    localStorage.getItem('opendock_webhook_enabled') === 'true'
  );

  useEffect(() => {
    // Generate unique webhook URL for this TMS instance
    const appId = localStorage.getItem('tms_app_id') || generateAppId();
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/webhooks/opendock/${appId}`;
    setWebhookUrl(url);
    
    // Load recent webhook events from localStorage
    const events = JSON.parse(localStorage.getItem('opendock_webhook_events') || '[]');
    setWebhookEvents(events.slice(0, 20)); // Last 20 events
  }, []);

  const generateAppId = () => {
    const id = 'tms_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('tms_app_id', id);
    return id;
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    alert('✅ Webhook URL copied to clipboard!');
  };

  const toggleWebhook = () => {
    const newState = !webhookEnabled;
    setWebhookEnabled(newState);
    localStorage.setItem('opendock_webhook_enabled', newState.toString());
  };

  const clearEvents = () => {
    if (confirm('Clear all webhook event history?')) {
      localStorage.setItem('opendock_webhook_events', '[]');
      setWebhookEvents([]);
    }
  };

  // Simulated webhook event handler (in production, this would be server-side)
  const handleWebhookEvent = (event) => {
    const newEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: event.type,
      data: event.data,
      processed: false
    };
    
    const events = [newEvent, ...webhookEvents].slice(0, 20);
    setWebhookEvents(events);
    localStorage.setItem('opendock_webhook_events', JSON.stringify(events));
    
    // Process event based on type
    switch(event.type) {
      case 'load.offered':
        console.log('🔔 New load offered:', event.data);
        // Trigger browser notification
        if (Notification.permission === 'granted') {
          new Notification('New Opendock Load Available!', {
            body: `${event.data.pickup_location} → ${event.data.dropoff_location}`,
            icon: '/icon.png'
          });
        }
        break;
      case 'load.cancelled':
        console.log('❌ Load cancelled:', event.data);
        break;
      case 'load.rate_updated':
        console.log('💰 Rate updated:', event.data);
        break;
      case 'document.requested':
        console.log('📄 Document requested:', event.data);
        break;
      default:
        console.log('📨 Webhook event:', event);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Webhook className="w-5 h-5" />
            Opendock Webhook Configuration
          </CardTitle>
          <Badge className={webhookEnabled ? 'bg-emerald-600' : 'bg-slate-400'}>
            {webhookEnabled ? '🟢 Enabled' : '⚫ Disabled'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Webhook URL */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Your Webhook URL:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm font-mono"
            />
            <Button onClick={copyWebhookUrl} variant="outline" size="sm">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Configure this URL in your Opendock carrier settings to receive real-time events
          </p>
        </div>

        {/* Event Subscriptions */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Subscribed Events:</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Load Offered', event: 'load.offered', icon: Bell },
              { name: 'Load Cancelled', event: 'load.cancelled', icon: XCircle },
              { name: 'Rate Updated', event: 'load.rate_updated', icon: AlertTriangle },
              { name: 'Document Requested', event: 'document.requested', icon: CheckCircle },
              { name: 'Status Changed', event: 'load.status_changed', icon: Clock },
              { name: 'Payment Processed', event: 'payment.processed', icon: CheckCircle }
            ].map(({ name, event, icon: Icon }) => (
              <div
                key={event}
                className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <Icon className="w-4 h-4 text-indigo-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">{event}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div>
            <h4 className="font-semibold text-indigo-900">Webhook Status</h4>
            <p className="text-sm text-indigo-700">
              {webhookEnabled 
                ? 'Receiving real-time events from Opendock' 
                : 'Webhooks are disabled'}
            </p>
          </div>
          <Button
            onClick={toggleWebhook}
            className={webhookEnabled 
              ? 'bg-amber-600 hover:bg-amber-700' 
              : 'bg-emerald-600 hover:bg-emerald-700'}
          >
            {webhookEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-900">Recent Events:</h4>
            <Button onClick={clearEvents} variant="outline" size="sm">
              Clear History
            </Button>
          </div>
          
          {webhookEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Webhook className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No webhook events received yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {webhookEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.processed ? 'bg-emerald-600' : 'bg-blue-600'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                        {event.type}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 truncate">
                      {JSON.stringify(event.data)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">Setup Instructions</h4>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>Copy the webhook URL above</li>
                <li>Log in to your Opendock carrier portal</li>
                <li>Navigate to Settings → Integrations → Webhooks</li>
                <li>Add a new webhook endpoint with the copied URL</li>
                <li>Select the events you want to receive</li>
                <li>Save and verify the webhook is active</li>
              </ol>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}