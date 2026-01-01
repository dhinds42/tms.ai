import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

export default function CarrierPerformanceReview({ carrierId, carrierName, metrics }) {
  const [reviewForm, setReviewForm] = useState({
    rating: 'meets_expectations',
    strengths: '',
    improvements: '',
    action_items: '',
    next_review_days: 90
  });
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async (review) => {
      // Generate AI-assisted review summary
      const aiSummary = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional carrier performance review summary based on:

Carrier: ${carrierName}
Rating: ${review.rating}
Metrics: On-Time ${metrics.on_time_pct}%, Dispute Rate ${metrics.dispute_rate}%, Avg Margin ${metrics.avg_margin}%

Strengths noted: ${review.strengths}
Areas for improvement: ${review.improvements}
Action items: ${review.action_items}

Provide a 2-3 sentence executive summary and recommended follow-up actions.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            recommended_actions: { type: "array", items: { type: "string" } },
            tier_recommendation: { type: "string", enum: ["upgrade", "maintain", "monitor", "downgrade"] }
          }
        }
      });

      // Create audit log entry
      await base44.entities.AuditLog.create({
        entity_type: 'Carrier',
        entity_id: carrierId,
        action: 'PERFORMANCE_REVIEW',
        actor_email: (await base44.auth.me()).email,
        metadata: {
          ...review,
          ...aiSummary,
          metrics_snapshot: metrics,
          next_review_date: new Date(Date.now() + review.next_review_days * 24 * 60 * 60 * 1000).toISOString()
        }
      });

      return aiSummary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['carrier', carrierId]);
      setReviewForm({
        rating: 'meets_expectations',
        strengths: '',
        improvements: '',
        action_items: '',
        next_review_days: 90
      });
    }
  });

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'exceeds_expectations': return 'bg-green-500';
      case 'meets_expectations': return 'bg-blue-500';
      case 'needs_improvement': return 'bg-amber-500';
      case 'unsatisfactory': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Performance Review - {carrierName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current Metrics Summary */}
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Current Performance</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-slate-600">On-Time</p>
                <p className={`text-lg font-bold ${metrics.on_time_pct >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                  {metrics.on_time_pct}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-600">Disputes</p>
                <p className={`text-lg font-bold ${metrics.dispute_rate < 5 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.dispute_rate}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-600">Margin</p>
                <p className={`text-lg font-bold ${metrics.avg_margin >= 15 ? 'text-green-600' : 'text-amber-600'}`}>
                  {metrics.avg_margin}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <div>
          <label className="text-sm font-semibold text-slate-700">Overall Rating</label>
          <Select
            value={reviewForm.rating}
            onValueChange={(value) => setReviewForm({...reviewForm, rating: value})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exceeds_expectations">Exceeds Expectations</SelectItem>
              <SelectItem value="meets_expectations">Meets Expectations</SelectItem>
              <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
              <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Strengths</label>
          <Textarea
            value={reviewForm.strengths}
            onChange={(e) => setReviewForm({...reviewForm, strengths: e.target.value})}
            placeholder="What is this carrier doing well?"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Areas for Improvement</label>
          <Textarea
            value={reviewForm.improvements}
            onChange={(e) => setReviewForm({...reviewForm, improvements: e.target.value})}
            placeholder="What needs to improve?"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Action Items</label>
          <Textarea
            value={reviewForm.action_items}
            onChange={(e) => setReviewForm({...reviewForm, action_items: e.target.value})}
            placeholder="Specific actions or follow-ups required"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Next Review (days)</label>
          <Select
            value={reviewForm.next_review_days.toString()}
            onValueChange={(value) => setReviewForm({...reviewForm, next_review_days: Number(value)})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days (Standard)</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => createReviewMutation.mutate(reviewForm)}
          disabled={!reviewForm.strengths || !reviewForm.improvements || createReviewMutation.isPending}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {createReviewMutation.isPending ? 'Generating Review...' : 'Submit Review'}
        </Button>

        {createReviewMutation.isSuccess && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
              <p className="text-sm font-semibold text-green-900 mb-2">Review Submitted</p>
              <p className="text-xs text-green-800">
                {createReviewMutation.data.executive_summary}
              </p>
              {createReviewMutation.data.recommended_actions?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-green-900 mb-1">Recommended Actions:</p>
                  <ul className="text-xs text-green-800 space-y-1">
                    {createReviewMutation.data.recommended_actions.map((action, i) => (
                      <li key={i}>• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}