import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function SendTrackingModal({ load, onClose, onSend }) {
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState(
    `Tracking update for Load ${load.load_number || load.id.slice(0, 8)}:\n\nCurrent Status: ${load.status}\nETA: ${load.eta || 'TBD'}\n\nPlease reply with your current location.`
  );

  const handleSend = () => {
    onSend({
      load_id: load.id,
      recipients: recipients.split(',').map(r => r.trim()).filter(r => r),
      message: message
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Send Tracking Message</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-slate-600">
              Load: <span className="font-semibold">{load.load_number || `LOAD-${load.id.slice(0, 8)}`}</span>
            </p>
            <p className="text-slate-600 mt-1">
              Route: <span className="font-semibold">
                {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
              </span>
            </p>
          </div>

          <div>
            <Label htmlFor="recipients">Recipients (Email or Phone, comma-separated)</Label>
            <Input
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="john@example.com, +1234567890, jane@example.com"
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter email addresses or phone numbers separated by commas
            </p>
          </div>

          <div>
            <Label htmlFor="message">Tracking Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="mt-2"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!recipients || !message}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
          >
            Send Tracking Message
          </Button>
        </div>
      </div>
    </div>
  );
}