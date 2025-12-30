import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Users, Radio, CheckCircle, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DriverCommunicationHub({ drivers, loads }) {
  const [activeTab, setActiveTab] = useState("broadcast");
  const [message, setMessage] = useState("");
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);

  const activeDrivers = drivers?.filter(d => ['active', 'available', 'on_load'].includes(d.status)) || [];

  const handleSendMessage = async (channel = 'sms') => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const recipients = selectedDrivers.length > 0 
        ? selectedDrivers 
        : activeDrivers.map(d => d.id);

      for (const driverId of recipients) {
        const driver = drivers.find(d => d.id === driverId);
        if (!driver) continue;

        if (channel === 'sms') {
          // Simulate SMS sending (in production, integrate with Twilio/etc)
          console.log(`SMS to ${driver.phone}: ${message}`);
        } else {
          // In-app notification
          await base44.entities.Notification.create({
            user_id: driver.linked_user_id,
            notification_type: 'message_received',
            title: 'New Message from Dispatch',
            message: message,
            channel: 'in_app'
          });
        }
      }

      setSentMessages([...sentMessages, {
        id: Date.now(),
        message,
        recipients: recipients.length,
        channel,
        timestamp: new Date().toISOString()
      }]);

      setMessage("");
      setSelectedDrivers([]);
      alert(`Message sent to ${recipients.length} driver${recipients.length > 1 ? 's' : ''}`);
    } catch (error) {
      console.error('Message send error:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleQuickMessage = (template) => {
    setMessage(template);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Driver Communication Hub
          <Badge className="ml-auto bg-indigo-600">{activeDrivers.length} online</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="broadcast">
              <Radio className="w-4 h-4 mr-2" />
              Broadcast
            </TabsTrigger>
            <TabsTrigger value="individual">
              <Users className="w-4 h-4 mr-2" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="history">
              History
            </TabsTrigger>
          </TabsList>

          {/* Broadcast Messages */}
          <TabsContent value="broadcast" className="space-y-4">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-900">
                Send message to all {activeDrivers.length} active drivers
              </p>
            </div>

            {/* Quick Templates */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Quick Templates</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickMessage("Please confirm your current location and ETA.")}
                >
                  Location Check
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickMessage("Urgent: Weather alert on your route. Please check for delays.")}
                >
                  Weather Alert
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickMessage("New load available in your area. Check your app for details.")}
                >
                  Load Available
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickMessage("Reminder: HOS clock reset needed. Plan your break accordingly.")}
                >
                  HOS Reminder
                </Button>
              </div>
            </div>

            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />

            <div className="flex gap-2">
              <Button
                onClick={() => handleSendMessage('sms')}
                disabled={sending || !message.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                <Phone className="w-4 h-4 mr-2" />
                Send SMS to All
              </Button>
              <Button
                onClick={() => handleSendMessage('in_app')}
                disabled={sending || !message.trim()}
                variant="outline"
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send In-App
              </Button>
            </div>
          </TabsContent>

          {/* Individual Messages */}
          <TabsContent value="individual" className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase">Select Drivers</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {activeDrivers.map(driver => (
                  <div
                    key={driver.id}
                    onClick={() => {
                      setSelectedDrivers(prev =>
                        prev.includes(driver.id)
                          ? prev.filter(id => id !== driver.id)
                          : [...prev, driver.id]
                      );
                    }}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedDrivers.includes(driver.id)
                        ? 'bg-indigo-100 border border-indigo-300'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">
                        {driver.first_name} {driver.last_name}
                      </span>
                      {selectedDrivers.includes(driver.id) && (
                        <CheckCircle className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{driver.phone}</p>
                  </div>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />

            <Button
              onClick={() => handleSendMessage('sms')}
              disabled={sending || !message.trim() || selectedDrivers.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to {selectedDrivers.length} Driver{selectedDrivers.length !== 1 ? 's' : ''}
            </Button>
          </TabsContent>

          {/* Message History */}
          <TabsContent value="history" className="space-y-2">
            {sentMessages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No messages sent yet</p>
              </div>
            ) : (
              sentMessages.slice().reverse().map(msg => (
                <div key={msg.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{msg.channel}</Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900">{msg.message}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Sent to {msg.recipients} driver{msg.recipients > 1 ? 's' : ''}
                  </p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

      </CardContent>
    </Card>
  );
}