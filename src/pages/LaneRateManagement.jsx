import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, MapPin, Fuel, Plus, Edit, Eye, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, EmptyState, FormField } from "@/components/design-system";

export default function LaneRateManagement() {
  const [selectedLane, setSelectedLane] = useState(null);
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const queryClient = useQueryClient();

  const { data: lanes } = useQuery({
    queryKey: ['lanes'],
    queryFn: () => base44.entities.Lane.list('-created_date', 200),
    initialData: []
  });

  const { data: rates } = useQuery({
    queryKey: ['laneRates', selectedLane?.id],
    queryFn: () => base44.entities.LaneRate.filter({ lane_id: selectedLane.id }),
    initialData: [],
    enabled: !!selectedLane
  });

  const { data: fscTables } = useQuery({
    queryKey: ['fscTables'],
    queryFn: () => base44.entities.CustomerFSCTable.list('-created_date', 100),
    initialData: []
  });

  const createRateMutation = useMutation({
    mutationFn: (data) => base44.entities.LaneRate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laneRates'] });
      setShowRateForm(false);
      setEditingRate(null);
    }
  });

  const updateRateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LaneRate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laneRates'] });
      setEditingRate(null);
      setShowRateForm(false);
    }
  });

  const RateFormModal = ({ lane, rate }) => {
    const [formData, setFormData] = useState(rate || {
      lane_id: lane.id,
      origin_city: lane.origin_city,
      origin_state: lane.origin_state,
      destination_city: lane.dest_city,
      destination_state: lane.dest_state,
      lane_miles: 0,
      customer_rate: 0,
      status: 'active',
      effective_date: new Date().toISOString().split('T')[0],
      fsc_enabled: false,
      fsc_handling: 'SEPARATE',
      fsc_method: 'FLAT_PER_MILE',
      fsc_cpm_cents: 0,
      fsc_percent_bps: 0,
      fsc_table_id: null
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (rate) {
        updateRateMutation.mutate({ id: rate.id, data: formData });
      } else {
        createRateMutation.mutate(formData);
      }
    };

    return (
      <Dialog open={true} onOpenChange={() => { setShowRateForm(false); setEditingRate(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{rate ? 'Edit Lane Rate' : 'Create Lane Rate'}</DialogTitle>
            <p className="text-sm text-slate-600">
              {lane.origin_city}, {lane.origin_state} → {lane.dest_city}, {lane.dest_state}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Base Rate Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Base Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lane Miles</Label>
                    <Input 
                      type="number" 
                      value={formData.lane_miles} 
                      onChange={(e) => setFormData({...formData, lane_miles: Number(e.target.value)})}
                      required 
                    />
                  </div>
                  <div>
                    <Label>Customer Rate ($)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={formData.customer_rate} 
                      onChange={(e) => setFormData({...formData, customer_rate: Number(e.target.value)})}
                      required 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FSC Section */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-blue-600" />
                    Fuel Surcharge Configuration
                  </CardTitle>
                  <Switch 
                    checked={formData.fsc_enabled}
                    onCheckedChange={(val) => setFormData({...formData, fsc_enabled: val})}
                  />
                </div>
              </CardHeader>
              
              {formData.fsc_enabled && (
                <CardContent className="space-y-4">
                  <div>
                    <Label>FSC Handling</Label>
                    <Select 
                      value={formData.fsc_handling} 
                      onValueChange={(val) => setFormData({...formData, fsc_handling: val})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCLUDED">Included in Rate (Not Itemized)</SelectItem>
                        <SelectItem value="SEPARATE">Separate Line Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.fsc_handling === 'SEPARATE' && (
                    <>
                      <div>
                        <Label>FSC Calculation Method</Label>
                        <Select 
                          value={formData.fsc_method} 
                          onValueChange={(val) => setFormData({...formData, fsc_method: val})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FLAT_PER_MILE">Flat Per Mile</SelectItem>
                            <SelectItem value="PERCENT_OF_LINEHAUL">Percent of Linehaul</SelectItem>
                            <SelectItem value="TABLE_LOOKUP">Table Lookup</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.fsc_method === 'FLAT_PER_MILE' && (
                        <div>
                          <Label>FSC Cents Per Mile</Label>
                          <Input 
                            type="number"
                            value={formData.fsc_cpm_cents}
                            onChange={(e) => setFormData({...formData, fsc_cpm_cents: Number(e.target.value)})}
                            placeholder="e.g., 10 for $0.10/mile"
                          />
                        </div>
                      )}

                      {formData.fsc_method === 'PERCENT_OF_LINEHAUL' && (
                        <div>
                          <Label>FSC Percent (Basis Points)</Label>
                          <Input 
                            type="number"
                            value={formData.fsc_percent_bps}
                            onChange={(e) => setFormData({...formData, fsc_percent_bps: Number(e.target.value)})}
                            placeholder="e.g., 1500 for 15%"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            {formData.fsc_percent_bps ? `= ${(formData.fsc_percent_bps / 100).toFixed(2)}%` : ''}
                          </p>
                        </div>
                      )}

                      {formData.fsc_method === 'TABLE_LOOKUP' && (
                        <div>
                          <Label>FSC Table</Label>
                          <Select 
                            value={formData.fsc_table_id || ''} 
                            onValueChange={(val) => setFormData({...formData, fsc_table_id: val})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select FSC Table" />
                            </SelectTrigger>
                            <SelectContent>
                              {fscTables.map(table => (
                                <SelectItem key={table.id} value={table.id}>
                                  {table.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              )}
            </Card>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => { setShowRateForm(false); setEditingRate(null); }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {rate ? 'Update Rate' : 'Create Rate'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Lane Rate Management"
        subtitle="Configure customer rates with FSC options"
        icon={TrendingUp}
        primaryAction={selectedLane ? {
          label: 'Add Rate',
          icon: Plus,
          onClick: () => setShowRateForm(true)
        } : undefined}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Lane Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lanes ({lanes.filter(l => l.is_active).length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {lanes.filter(l => l.is_active).map(lane => (
                <Button
                  key={lane.id}
                  variant={selectedLane?.id === lane.id ? 'default' : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedLane(lane)}
                >
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-xs">{lane.origin_city} → {lane.dest_city}</div>
                    <div className="text-xs opacity-70">{lane.origin_state} to {lane.dest_state}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Rates List */}
          <div className="lg:col-span-2">
            {selectedLane ? (
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>
                      {selectedLane.origin_city}, {selectedLane.origin_state} → {selectedLane.dest_city}, {selectedLane.dest_state}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {rates.filter(r => r.is_active).length} active rate(s)
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rates.filter(r => r.is_active).map(rate => (
                    <Card key={rate.id} className="border-2 hover:border-indigo-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <span className="text-2xl font-bold text-slate-900">
                                ${rate.customer_rate.toFixed(2)}
                              </span>
                              <Badge>{rate.status}</Badge>
                              {rate.fsc_enabled && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                  <Fuel className="w-3 h-3 mr-1" />
                                  FSC {rate.fsc_handling}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="text-sm text-slate-600 space-y-1">
                              <p>Distance: {rate.lane_miles} miles</p>
                              {rate.effective_date && <p>Effective: {new Date(rate.effective_date).toLocaleDateString()}</p>}
                              
                              {rate.fsc_enabled && rate.fsc_handling === 'SEPARATE' && (
                                <div className="bg-blue-50 rounded p-2 mt-2">
                                  <p className="text-xs font-semibold text-blue-900">FSC Details:</p>
                                  <p className="text-xs text-blue-800">
                                    Method: {rate.fsc_method}
                                    {rate.fsc_method === 'FLAT_PER_MILE' && ` (${rate.fsc_cpm_cents}¢/mi)`}
                                    {rate.fsc_method === 'PERCENT_OF_LINEHAUL' && ` (${(rate.fsc_percent_bps / 100).toFixed(2)}%)`}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setEditingRate(rate);
                              setShowRateForm(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {rates.filter(r => r.is_active).length === 0 && (
                    <EmptyState
                      icon={DollarSign}
                      title="No rates configured"
                      description="Create your first rate for this lane"
                      action={{
                        label: 'Create Rate',
                        icon: Plus,
                        onClick: () => setShowRateForm(true)
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            ) : (
              <EmptyState
                icon={MapPin}
                title="Select a lane"
                description="Choose a lane from the list to manage rates"
              />
            )}
          </div>
        </div>

        {showRateForm && selectedLane && (
          <RateFormModal lane={selectedLane} rate={editingRate} />
        )}
      </div>
    </div>
  );
}