import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Phone, Send } from "lucide-react";
import MessageCenter from "../components/communication/MessageCenter";

export default function UnifiedCommunicationHub() {
  const [messages] = useState([
    { id: 1, from: 'Driver John', message: 'ETA 2 hours', time: '10:30 AM', type: 'sms', unread: true },
    { id: 2, from: 'Carrier ABC', message: 'Rate confirmation signed', time: '9:15 AM', type: 'email', unread: false },
    { id: 3, from: 'Customer XYZ', message: 'Need POD for load 12345', time: 'Yesterday', type: 'app', unread: true },
  ]);

  const unreadCount = messages.filter(m => m.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Unified Communication Hub
          </h1>
          <p className="text-slate-600 mt-2">Centralized SMS/email/app messaging with all parties</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Unread</p>
                  <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
                </div>
                <MessageSquare className="w-12 h-12 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">SMS</p>
                  <p className="text-3xl font-bold text-indigo-600">45</p>
                </div>
                <Phone className="w-12 h-12 text-indigo-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Emails</p>
                  <p className="text-3xl font-bold text-blue-600">28</p>
                </div>
                <Mail className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">App Messages</p>
                  <p className="text-3xl font-bold text-purple-600">12</p>
                </div>
                <MessageSquare className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>All Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {messages.map(msg => (
                    <div key={msg.id} className={`p-4 rounded-lg border ${msg.unread ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{msg.from}</span>
                          {msg.unread && <Badge className="bg-red-600">New</Badge>}
                        </div>
                        <span className="text-xs text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-sm text-slate-700">{msg.message}</p>
                      <Badge variant="outline" className="mt-2 text-xs">{msg.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="To..." />
              <Input placeholder="Message..." />
              <Button className="w-full bg-indigo-600">
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </CardContent>
          </Card>
        </div>

        <MessageCenter />

      </div>
    </div>
  );
}