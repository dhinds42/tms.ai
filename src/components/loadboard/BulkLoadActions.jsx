import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Send, XCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BulkLoadActions({ selectedLoads, loads, onClearSelection, onUpdate }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkStatusUpdate = async (status) => {
    setIsProcessing(true);
    try {
      const updatePromises = selectedLoads.map(loadId =>
        base44.entities.Load.update(loadId, { status })
      );
      await Promise.all(updatePromises);
      onUpdate();
      onClearSelection();
    } catch (error) {
      console.error('Bulk update error:', error);
      alert('Failed to update loads');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedLoads.length} loads? This cannot be undone.`)) return;
    
    setIsProcessing(true);
    try {
      const deletePromises = selectedLoads.map(loadId =>
        base44.entities.Load.delete(loadId)
      );
      await Promise.all(deletePromises);
      onUpdate();
      onClearSelection();
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Failed to delete loads');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-l-indigo-500">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-600 text-white text-lg px-4 py-2">
              {selectedLoads.length} loads selected
            </Badge>
            <span className="text-sm text-slate-600">Bulk Actions:</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleBulkStatusUpdate('available')}
              disabled={isProcessing}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Available
            </Button>
            <Button
              size="sm"
              onClick={() => handleBulkStatusUpdate('assigned')}
              disabled={isProcessing}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Mark Assigned
            </Button>
            <Button
              size="sm"
              onClick={handleBulkDelete}
              disabled={isProcessing}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              size="sm"
              onClick={onClearSelection}
              variant="outline"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}