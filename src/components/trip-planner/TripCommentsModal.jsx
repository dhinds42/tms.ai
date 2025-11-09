import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, User, Clock } from "lucide-react";

export default function TripCommentsModal({ trip, driver, onClose }) {
  const [newComment, setNewComment] = useState("");
  
  // Mock comments - in production, fetch from database
  const [comments, setComments] = useState([
    {
      id: '1',
      user: 'John Dispatcher',
      text: 'Driver confirmed pickup appointment for 10:00 AM',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'note'
    },
    {
      id: '2',
      user: driver.full_name,
      text: 'Traffic delay on I-95, ETA pushed 30 minutes',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'alert'
    }
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      user: 'Current User',
      text: newComment,
      timestamp: new Date().toISOString(),
      type: 'note'
    };

    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Trip Comments & Notes
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {trip.load_number || `LOAD-${trip.id.slice(0, 8)}`} - {driver.full_name}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
          </div>
        </div>

        {/* Trip Info */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Pickup</p>
              <p className="font-semibold text-slate-900">
                {trip.pickup_location?.city}, {trip.pickup_location?.state}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Delivery</p>
              <p className="font-semibold text-slate-900">
                {trip.dropoff_location?.city}, {trip.dropoff_location?.state}
              </p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No comments yet. Add the first one!</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {comment.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{comment.user}</p>
                      <Badge className={
                        comment.type === 'alert' ? 'bg-amber-100 text-amber-800' : 
                        'bg-blue-100 text-blue-800'
                      }>
                        {comment.type}
                      </Badge>
                    </div>
                    <p className="text-slate-700 text-sm mb-2">{comment.text}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or note..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              className="flex-1"
            />
            <Button 
              onClick={handleAddComment}
              className="bg-indigo-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            💡 Comments are logged and visible to all team members
          </p>
        </div>

      </div>
    </div>
  );
}