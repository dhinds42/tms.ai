import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Webhook, CheckCircle, XCircle, Clock, Key } from "lucide-react";
import { webhookSystem } from "../components/webhooks/CustomerWebhookSystem";

export default function WebhookManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [newSubscription, setNewSubscription] = useState({
    customerId: '',
    webhookUrl: '',
    events: ['load.picked_up', 'load.delivered', 'load.delayed']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSubscriptions(webhookSystem.getSubscriptions());
    setStats(webhookSystem.getDeliveryStats());
  };

  const handleSubscribe = () => {
    const sub = webhookSystem.subscribe(
      newSubscription.customerId,
      newSubscription.webhookUrl,
      newSubscription.events,
      null // Auto-generate secret
    );
    
    alert(`Subscribed! Secret Key: ${sub.secretKey}`);
    loadData();
    setNewSubscription({ customerId: '', webhookUrl: '', events: [] });
  };

  const handleTestWebhook = (customerId) => {
    webhookSystem.publishEvent('load.delivered', {
      customer_id: customerId,
      load_id: 'test_123',
      load_number: 'TEST-001',
      status: 'delivered',
      delivered_at: new Date().toISOString()
    });
    
    setTimeout(loadData, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Webhook Management</h1>
          <p className="text-slate-600 mt-1">Customer API webhooks for real-time updates</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Total Deliveries</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total_deliveries}</p>
                  </div>
                  <Webhook className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Success Rate</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats.success_rate.toFixed(1)}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Failed Deliveries</p>
                    <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Subscription */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Create Webhook Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Customer ID"
              value={newSubscription.customerId}
              onChange={(e) => setNewSubscription({...newSubscription, customerId: e.target.value})}
            />
            <Input
              placeholder="Webhook URL (https://...)"
              value={newSubscription.webhookUrl}
              onChange={(e) => setNewSubscription({...newSubscription, webhookUrl: e.target.value})}
            />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Events:</p>
              {['load.picked_up', 'load.delivered', 'load.delayed', 'load.cancelled'].map(event => (
                <label key={event} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSubscription.events.includes(event)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewSubscription({...newSubscription, events: [...newSubscription.events, event]});
                      } else {
                        setNewSubscription({...newSubscription, events: newSubscription.events.filter(ev => ev !== event)});
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{event}</span>
                </label>
              ))}
            </div>
            <Button onClick={handleSubscribe} className="w-full bg-indigo-600">
              Subscribe Customer
            </Button>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Active Subscriptions ({subscriptions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscriptions.map((sub, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-slate-900">{sub.customerId}</span>
                    <p className="text-xs text-slate-600 font-mono mt-1">{sub.webhookUrl}</p>
                  </div>
                  <Badge className="bg-emerald-600">Active</Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-slate-400" />
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">{sub.secretKey.slice(0, 16)}...</code>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {sub.events.map(event => (
                    <Badge key={event} variant="outline" className="text-xs">{event}</Badge>
                  ))}
                </div>
                <Button size="sm" onClick={() => handleTestWebhook(sub.customerId)}>
                  Test Webhook
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        {stats && stats.recent_deliveries.length > 0 && (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.recent_deliveries.map((delivery, i) => (
                <div key={i} className={`p-3 rounded-lg ${
                  delivery.status === 'success' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {delivery.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm font-semibold">{delivery.event}</span>
                      <Badge variant="outline" className="text-xs">Attempt {delivery.attempt}</Badge>
                    </div>
                    <span className="text-xs text-slate-600">{new Date(delivery.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}