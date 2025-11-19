import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MessageSquare, Volume2, Brain } from "lucide-react";

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [response, setResponse] = useState(null);

  const conversations = [
    { query: 'What is the status of load 12345?', answer: 'Load 12345 is in transit, ETA 2 hours', time: '10 min ago' },
    { query: 'How many loads picked up today?', answer: '15 loads picked up today', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">
            Voice Assistant Integration
          </h1>
          <p className="text-slate-600 mt-2">"Alexa, what's the status of load 12345?"</p>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardContent className="p-12 text-center">
            <Button
              onClick={() => setListening(!listening)}
              className={`w-32 h-32 rounded-full ${listening ? 'bg-red-600 animate-pulse' : 'bg-cyan-600'}`}
            >
              <Mic className="w-16 h-16 text-white" />
            </Button>
            <p className="text-lg font-semibold mt-6">
              {listening ? 'Listening...' : 'Tap to speak'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversations.map((conv, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">{conv.query}</p>
                      <p className="text-xs text-blue-600">{conv.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg ml-8">
                    <Volume2 className="w-5 h-5 text-emerald-600 mt-1" />
                    <p className="text-emerald-900">{conv.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}