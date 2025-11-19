import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown, TrendingUp } from "lucide-react";

export default function NPSTracker() {
  const [npsScore] = useState(67);
  const [promoters] = useState(45);
  const [passives] = useState(30);
  const [detractors] = useState(25);

  const getNPSColor = (score) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-blue-600";
    if (score >= 30) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-pink-600" />
          Net Promoter Score (NPS)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
          <p className="text-sm text-slate-600 mb-2">Current NPS Score</p>
          <p className={`text-5xl font-bold ${getNPSColor(npsScore)}`}>{npsScore}</p>
          <p className="text-xs text-slate-500 mt-2">Industry benchmark: 50</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">Promoters (9-10)</span>
            </div>
            <Badge className="bg-emerald-600">{promoters}%</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
            <div className="flex items-center gap-2">
              <Meh className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Passives (7-8)</span>
            </div>
            <Badge className="bg-blue-600">{passives}%</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 rounded">
            <div className="flex items-center gap-2">
              <Frown className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900">Detractors (0-6)</span>
            </div>
            <Badge className="bg-red-600">{detractors}%</Badge>
          </div>
        </div>

        <Button className="w-full bg-pink-600">
          Send NPS Survey
        </Button>

      </CardContent>
    </Card>
  );
}