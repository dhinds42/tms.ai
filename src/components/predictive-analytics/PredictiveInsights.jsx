
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function PredictiveInsights({ predictions }) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
      <CardHeader className="border-b border-blue-200 pb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <div>
            <CardTitle className="text-xl text-blue-900">AI Analysis Summary</CardTitle>
            <p className="text-sm text-blue-700 mt-1">
              Key insights from predictive modeling
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-slate-700 leading-relaxed text-lg">
          {predictions.summary}
        </p>
      </CardContent>
    </Card>
  );
}
