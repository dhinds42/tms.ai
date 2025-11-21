import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

export default function FeedbackCollector() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const recentFeedback = [
    { id: 1, customer: 'ABC Corp', rating: 5, comment: 'Excellent service, on-time delivery', date: '2 days ago', sentiment: 'positive' },
    { id: 2, customer: 'XYZ Logistics', rating: 4, comment: 'Good communication, minor delay', date: '5 days ago', sentiment: 'positive' },
    { id: 3, customer: 'Quick Ship Inc', rating: 2, comment: 'Late delivery, poor tracking updates', date: '1 week ago', sentiment: 'negative' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Customer Feedback & NPS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg text-center">
            <p className="text-xs text-emerald-900 font-semibold mb-1">NPS Score</p>
            <p className="text-3xl font-bold text-emerald-600">72</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-xs text-blue-900 font-semibold mb-1">Avg Rating</p>
            <p className="text-3xl font-bold text-blue-600">4.2</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-xs text-purple-900 font-semibold mb-1">Response Rate</p>
            <p className="text-3xl font-bold text-purple-600">68%</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg">
          <h4 className="font-semibold text-slate-900 mb-3">Submit Feedback</h4>
          <div className="flex items-center justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer ${star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="mb-2"
          />
          <Button className="w-full bg-purple-600">Submit Feedback</Button>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Recent Feedback</h4>
          <div className="space-y-2">
            {recentFeedback.map(item => (
              <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{item.customer}</span>
                    <Badge className={item.sentiment === 'positive' ? 'bg-emerald-600' : 'bg-red-600'}>
                      {item.sentiment === 'positive' ? (
                        <ThumbsUp className="w-3 h-3" />
                      ) : (
                        <ThumbsDown className="w-3 h-3" />
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < item.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-1">{item.comment}</p>
                <p className="text-xs text-slate-500">{item.date}</p>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}