import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock } from "lucide-react";

export default function ViewLoadLogModal({ load, loadLog, onClose }) {
  // Mock load log data - in production, this would come from the database
  const mockLog = [
    { id: 1, timestamp: new Date().toISOString(), action: 'Load Created', user: 'John Doe', details: 'Load created and assigned to broker' },
    { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Carrier Assigned', user: 'Jane Smith', details: 'Carrier ABC Transport assigned to load' },
    { id: 3, timestamp: new Date(Date.now() - 7200000).toISOString(), action: 'Status Updated', user: 'System', details: 'Status changed from Available to Assigned' },
    { id: 4, timestamp: new Date(Date.now() - 10800000).toISOString(), action: 'Check Call Logged', user: 'John Doe', details: 'Driver checked in from Denver, CO. ETA updated.' },
    { id: 5, timestamp: new Date(Date.now() - 14400000).toISOString(), action: 'Document Uploaded', user: 'Driver App', details: 'BOL uploaded by driver' }
  ];

  const logEntries = loadLog || mockLog;

  const getActionColor = (action) => {
    if (action.includes('Created')) return 'bg-blue-100 text-blue-800';
    if (action.includes('Assigned')) return 'bg-purple-100 text-purple-800';
    if (action.includes('Updated')) return 'bg-amber-100 text-amber-800';
    if (action.includes('Document')) return 'bg-emerald-100 text-emerald-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Load Activity Log</h2>
            <p className="text-slate-600 mt-1">
              {load.load_number || `LOAD-${load.id.slice(0, 8)}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {logEntries.map((entry, index) => (
              <div key={entry.id} className="relative">
                {/* Timeline connector */}
                {index < logEntries.length - 1 && (
                  <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-slate-200"></div>
                )}
                
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>

                  {/* Log entry content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getActionColor(entry.action)}>
                            {entry.action}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{entry.details}</p>
                      <p className="text-xs text-slate-500">By: {entry.user}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 p-6 flex justify-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}