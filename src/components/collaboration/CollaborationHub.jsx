import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Send } from "lucide-react";

export default function CollaborationHub({ entityType, entityId }) {
  const [messages, setMessages] = useState([
    { id: 1, user: 'John Broker', message: 'Carrier confirmed pickup', timestamp: new Date(), role: 'broker' },
    { id: 2, user: 'Driver Mike', message: 'ETA updated to 3 PM', timestamp: new Date(), role: 'driver' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        user: 'You',
        message: newMessage,
        timestamp: new Date(),
        role: 'current'
      }]);
      setNewMessage('');
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Team Collaboration
          <Badge className="ml-auto bg-emerald-500 text-xs">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-60 overflow-y-auto space-y-2">
          {messages.map(msg => (
            <div key={msg.id} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-semibold text-slate-900">{msg.user}</span>
                <span className="text-xs text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-slate-700">{msg.message}</p>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Type message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}