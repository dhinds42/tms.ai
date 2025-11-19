import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

export default function FeedbackCollector() {
  const [feedback, setFeedback] = useState('');
  const [sentiment, setSentiment] = useState(null);

  const recentFeedback = [
    { customer: 'ABC Corp', sentiment: 'positive', text: 'Excellent service, on-time delivery!' },
    { customer: 'XYZ Inc', sentiment: 'neutral', text: 'Service was okay, some delays.' },
    { customer: 'Tech Solutions', sentiment: 'positive', text: 'Great communication throughout!' }
  ];

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Customer Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <Textarea
            placeholder="Collect customer feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2">
            <Button 
              onClick={() => setSentiment('positive')}
              variant={sentiment === 'positive' ? 'default' : 'outline'}
              className="flex-1"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Positive
            </Button>
            <Button 
              onClick={() => setSentiment('negative')}
              variant={sentiment === 'negative' ? 'default' : 'outline'}
              className="flex-1"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Negative
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-slate-900">Recent Feedback</h4>
          {recentFeedback.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-xs">{item.customer}</p>
                <Badge className={
                  item.sentiment === 'positive' ? 'bg-emerald-600' :
                  item.sentiment === 'negative' ? 'bg-red-600' :
                  'bg-slate-600'
                }>
                  {item.sentiment}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}