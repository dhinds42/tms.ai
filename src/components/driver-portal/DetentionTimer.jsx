import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, DollarSign, Edit, CheckCircle } from "lucide-react";

export default function DetentionTimer({ session, onEditSubmit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (session?.arrived_at && !session.departed_at) {
      // Live timer
      const interval = setInterval(() => {
        const now = new Date();
        const arrived = new Date(session.arrived_at);
        const minutes = Math.floor((now - arrived) / (1000 * 60));
        setElapsedMinutes(minutes);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [session]);

  const handleEditSubmit = () => {
    if (!editNotes.trim()) {
      alert('Please provide notes explaining the edit');
      return;
    }

    onEditSubmit({
      session_id: session.id,
      driver_edited_amount_cents: parseFloat(editAmount) * 100,
      edit_notes: editNotes
    });
    setIsEditing(false);
    setEditAmount('');
    setEditNotes('');
  };

  const formatCents = (cents) => {
    return cents ? `$${(cents / 100).toFixed(2)}` : '$0.00';
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!session) return null;

  const isActive = session.status === 'open';
  const totalMinutes = session.total_minutes || elapsedMinutes;
  const billableMinutes = session.billable_minutes || Math.max(0, totalMinutes - (session.free_minutes || 120));

  return (
    <Card className="border-2 border-amber-200">
      <CardHeader className="bg-amber-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-amber-600" />
            Detention Timer - {session.stop_type === 'pickup' ? 'Pickup' : 'Delivery'}
          </CardTitle>
          <Badge className={isActive ? 'bg-emerald-500' : 'bg-slate-500'}>
            {isActive ? 'Active' : session.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {/* Timer Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-600 mb-1">Arrived</p>
            <p className="text-sm font-semibold">
              {new Date(session.arrived_at).toLocaleString()}
            </p>
          </div>
          {session.departed_at && (
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1">Departed</p>
              <p className="text-sm font-semibold">
                {new Date(session.departed_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Time Breakdown */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-700">Total Time:</span>
            <span className="font-bold text-blue-900">{formatMinutes(totalMinutes)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-700">Free Time:</span>
            <span className="font-semibold text-slate-600">{formatMinutes(session.free_minutes || 120)}</span>
          </div>
          <div className="border-t border-blue-200 pt-2 flex justify-between">
            <span className="text-sm font-bold text-slate-900">Billable Time:</span>
            <span className="font-bold text-amber-600">{formatMinutes(billableMinutes)}</span>
          </div>
        </div>

        {/* Computed Amount */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 mb-1">Computed Detention Pay</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCents(session.computed_amount_cents)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {formatCents(session.detention_rate_per_hour_cents || 5000)}/hour
              </p>
            </div>
            {!isActive && session.status === 'closed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4 mr-1" />
                {isEditing ? 'Cancel' : 'Dispute'}
              </Button>
            )}
          </div>
        </div>

        {/* Driver Edit Form */}
        {isEditing && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-900">Dispute Detention Amount</p>
            <div>
              <label className="text-xs text-slate-600">Corrected Amount ($)</label>
              <Input
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder={(session.computed_amount_cents / 100).toFixed(2)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-600">Explanation (Required) *</label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Explain why you believe the amount is incorrect..."
                rows={3}
              />
            </div>
            <Button
              onClick={handleEditSubmit}
              disabled={!editNotes.trim() || !editAmount}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Dispute
            </Button>
          </div>
        )}

        {/* Driver Edit Display */}
        {session.edited_by_driver && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-purple-900 mb-1">Driver Disputed Amount</p>
            <p className="text-lg font-bold text-purple-700">
              {formatCents(session.driver_edited_amount_cents)}
            </p>
            {session.edit_notes && (
              <p className="text-xs text-slate-600 mt-2">
                <strong>Notes:</strong> {session.edit_notes}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}