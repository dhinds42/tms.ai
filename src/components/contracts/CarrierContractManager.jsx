import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, DollarSign, AlertCircle } from "lucide-react";

export default function CarrierContractManager({ carrierId }) {
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    carrier_id: carrierId,
    contract_type: 'volume',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    guaranteed_volume: 0,
    rate_locked: false,
    auto_renew: false
  });
  
  const queryClient = useQueryClient();
  
  const { data: contracts } = useQuery({
    queryKey: ['carrier-contracts', carrierId],
    queryFn: () => base44.entities.CarrierContract.filter({ carrier_id: carrierId }),
    initialData: []
  });
  
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CarrierContract.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrier-contracts'] });
      setShowCreate(false);
    }
  });
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Carrier Contracts
          </CardTitle>
          <Button onClick={() => setShowCreate(true)} size="sm">
            New Contract
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contracts.map(contract => (
          <div key={contract.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{contract.contract_type} Contract</p>
                <p className="text-sm text-slate-600">
                  {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                </p>
              </div>
              <Badge className={new Date(contract.end_date) > new Date() ? 'bg-green-500' : 'bg-slate-500'}>
                {new Date(contract.end_date) > new Date() ? 'Active' : 'Expired'}
              </Badge>
            </div>
          </div>
        ))}
        
        {showCreate && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
            <div>
              <Label>Contract Type</Label>
              <Select value={formData.contract_type} onValueChange={(v) => setFormData({...formData, contract_type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Volume Commitment</SelectItem>
                  <SelectItem value="dedicated">Dedicated Lane</SelectItem>
                  <SelectItem value="spot">Spot Rate Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => createMutation.mutate(formData)} size="sm">Save</Button>
              <Button onClick={() => setShowCreate(false)} variant="outline" size="sm">Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}