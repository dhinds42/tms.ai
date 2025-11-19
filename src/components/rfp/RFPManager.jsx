import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Send, Award } from "lucide-react";

export default function RFPManager() {
  const [generating, setGenerating] = useState(false);

  const generateRFP = async () => {
    setGenerating(true);
    try {
      await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional RFP (Request for Proposal) for transportation services with the following sections:
        
1. Executive Summary
2. Scope of Work (100 lanes, $5M annual volume)
3. Requirements (equipment, capacity, geographic coverage)
4. Evaluation Criteria (pricing 40%, service 30%, technology 20%, financial 10%)
5. Submission Instructions
6. Timeline (RFP close in 30 days, award in 45 days)

Format as a professional document.`
      });
      alert('RFP generated successfully!');
    } catch (error) {
      alert('RFP generation failed: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          RFP / Bid Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-900 font-semibold">Active RFPs</p>
            <p className="text-2xl font-bold text-blue-600">3</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
            <p className="text-xs text-emerald-900 font-semibold">Bids Received</p>
            <p className="text-2xl font-bold text-emerald-600">27</p>
          </div>
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <p className="text-xs text-purple-900 font-semibold">Awarded</p>
            <p className="text-2xl font-bold text-purple-600">12</p>
          </div>
        </div>

        <Button 
          onClick={generateRFP}
          disabled={generating}
          className="w-full bg-purple-600 py-6"
        >
          <Send className={`w-5 h-5 mr-2 ${generating ? 'animate-pulse' : ''}`} />
          {generating ? 'Generating RFP...' : 'Generate New RFP'}
        </Button>

      </CardContent>
    </Card>
  );
}