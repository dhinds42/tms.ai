import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle } from "lucide-react";

export default function AutoScoreUpdates() {
  const updateTriggers = [
    { event: "Load Completion", description: "Score updated after every load delivery", frequency: "Real-time" },
    { event: "Compliance Doc Expiration", description: "Score adjusted when documents expire", frequency: "Daily Check" },
    { event: "Safety Rating Change", description: "Immediate update on FMCSA rating changes", frequency: "API Sync" },
    { event: "Performance Milestone", description: "Bonus points for achieving milestones", frequency: "Event-based" },
    { event: "Customer Feedback", description: "Score reflects new ratings/reviews", frequency: "Immediate" },
    { event: "Financial Status Update", description: "Insurance/credit changes trigger rescore", frequency: "Weekly" }
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="border-b border-indigo-200 pb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-indigo-600" />
          <div>
            <CardTitle className="text-indigo-900">Automated Score Updates</CardTitle>
            <p className="text-sm text-indigo-700 mt-1">
              Scores automatically recalculate based on real-time events
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          {updateTriggers.map((trigger, idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl border border-indigo-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-semibold text-slate-900 text-sm">{trigger.event}</h4>
                </div>
                <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                  {trigger.frequency}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">{trigger.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border-2 border-indigo-300">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h4 className="font-semibold text-indigo-900">Smart Automation Benefits</h4>
          </div>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>✓ Always-current performance data without manual updates</li>
            <li>✓ Early warning system for declining performance</li>
            <li>✓ Recognition system for improving carriers</li>
            <li>✓ Data-driven decision making for load assignments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}