import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Phone, Mail, Clock } from "lucide-react";

export default function MessageCenter() {
  const [message, setMessage] = useState('');
  
  const conversations = [
    { id: 1, contact: 'ABC Carriers', last_message: 'Load confirmed for pickup', time: '10m ago', unread: 2, type: 'carrier' },
    { id: 2, contact: 'XYZ Logistics', last_message: 'POD received, thank you', time: '1h ago', unread: 0, type: 'customer' },
    { id: 3, contact: 'Driver - Mike Johnson', last_message: 'ETA 2 hours', time: '2h ago', unread: 1, type: 'driver' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Unified Message Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Call
          </Button>
        </div>

        <div className="space-y-2">
          {conversations.map(conv => (
            <div key={conv.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-900">{conv.contact}</p>
                    {conv.unread > 0 && (
                      <Badge className="bg-red-600 text-xs">{conv.unread}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{conv.last_message}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {conv.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2">
            <Input placeholder="Attach file" type="file" className="flex-1" />
            <Button className="bg-indigo-600">
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}