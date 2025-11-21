import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Award } from "lucide-react";

export default function RFPManager() {
  const [newRFP, setNewRFP] = useState({ name: '', lanes: 0 });
  
  const queryClient = useQueryClient();

  const { data: rfps } = useQuery({
    queryKey: ['rfps'],
    queryFn: async () => {
      // Try to fetch RfpEvent entities
      try {
        return await base44.entities.RfpEvent.list('-created_date', 50);
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const createRFPMutation = useMutation({
    mutationFn: (rfpData) => base44.entities.RfpEvent.create(rfpData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
      setNewRFP({ name: '', lanes: 0 });
    },
  });

  const handleCreateRFP = () => {
    if (!newRFP.name) return;
    createRFPMutation.mutate({
      event_name: newRFP.name,
      event_type: 'rfp',
      status: 'draft',
      total_lanes: Number(newRFP.lanes)
    });
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          RFP Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h4 className="font-semibold text-emerald-900 mb-3">Create New RFP</h4>
          <div className="space-y-2">
            <Input
              placeholder="RFP Name"
              value={newRFP.name}
              onChange={(e) => setNewRFP({...newRFP, name: e.target.value})}
            />
            <Input
              type="number"
              placeholder="Number of Lanes"
              value={newRFP.lanes}
              onChange={(e) => setNewRFP({...newRFP, lanes: e.target.value})}
            />
            <Button 
              onClick={handleCreateRFP}
              className="w-full bg-emerald-600"
              disabled={createRFPMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {createRFPMutation.isPending ? 'Creating...' : 'Create RFP'}
            </Button>
          </div>
        </div>

        {rfps.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No RFPs created yet</p>
          </div>
        ) : (
          rfps.map((rfp) => (
            <div key={rfp.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">{rfp.event_name}</span>
                </div>
                <Badge className={
                  rfp.status === 'active' ? 'bg-emerald-600' :
                  rfp.status === 'draft' ? 'bg-slate-600' :
                  'bg-blue-600'
                }>
                  {rfp.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                Lanes: {rfp.total_lanes || 0} | Bids: {rfp.bid_count || 0}
              </p>
            </div>
          ))
        )}

      </CardContent>
    </Card>
  );
}