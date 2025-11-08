import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export default function RequestDocsModal({ load, onClose, onSend, driverName }) {
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [customMessage, setCustomMessage] = useState("");

  const docTypes = [
    { id: 'bol', label: 'Bill of Lading (BOL)' },
    { id: 'pod', label: 'Proof of Delivery (POD)' },
    { id: 'lumper_receipt', label: 'Lumper Receipt' },
    { id: 'scale_ticket', label: 'Scale Ticket' },
    { id: 'inspection', label: 'Inspection Report' },
    { id: 'photos', label: 'Load Photos' }
  ];

  const handleToggleDoc = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSend = () => {
    onSend({
      load_id: load.id,
      documents_requested: selectedDocs,
      custom_message: customMessage,
      driver_name: driverName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Request Documents from Driver</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-slate-600 mb-4">
              Load: <span className="font-semibold">{load.load_number || `LOAD-${load.id.slice(0, 8)}`}</span>
            </p>
            <p className="text-slate-600">
              Driver: <span className="font-semibold">{driverName || 'Driver'}</span>
            </p>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Select Documents to Request</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {docTypes.map(doc => (
                <label
                  key={doc.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedDocs.includes(doc.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => handleToggleDoc(doc.id)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="font-medium text-slate-900">{doc.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-message">Additional Message (Optional)</Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add any special instructions or notes..."
              rows={4}
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
            disabled={selectedDocs.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Send Request
          </Button>
        </div>
      </div>
    </div>
  );
}